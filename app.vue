<template>
  <NuxtRouteAnnouncer/>
  <div class="container is-flex-grow-1 m-3 p-3 is-flex">
    <span v-if="debugMode" class="is-family-code is-info tag" style="position: absolute;z-index: 10;">DEBUG MODE</span>
    <b-steps ref="stepsContainer" v-model="activeStep" mobile-mode="compact"
             class="is-flex is-flex-direction-column is-flex-grow-1 is-relative">
      <b-step-item label="Config"
                   value="config"
                   tabindex="1"
                   icon="cog"
                   :clickable="true"
                   :type="isConfigDone ? 'is-success' : 'is-primary'"
                   :class="{'is-active': activeStep == 'config'}">
        <h1 class="title has-text-centered">Mailer Configuration</h1>
        <form>
          <b-field label="Sender Configuration">
            <b-field expanded label="Concurrent Workers" label-position="on-border">
              <b-input type="number" v-model="globalConfig.workers" min="1" required />
            </b-field>
          </b-field>

          <b-field label="Short Configuration" expanded>
            <b-field expanded label="Short URL" label-position="on-border" grouped>
              <b-taginput v-model="globalConfig.shorts" style="overflow-y: auto; overflow-x: hidden; max-height: 100px; max-width: 47vw;"
                          :before-adding="validateUrl" expanded :on-paste-separators="[',', '\r\n', '\n', ' ']" />
              <b-switch left-label v-model="globalConfig.useShortener" >Use Shortener</b-switch>
            </b-field>

          </b-field>

          <b-field>
            <b-collapse animation="slide" v-model="globalConfig.useShortener">
              <b-field expanded label="Shortener API Key" message="URL Shortener: https://www.silverlining.cloud/products/url-shortener" label-position="on-border">
                <b-input expanded v-model="globalConfig.shortenerAPIKey" :required="globalConfig.useShortener" />
              </b-field>
            </b-collapse>
          </b-field>


          <b-field label="Qrcode Generation">
            <b-field expanded label="Insert Mode" label-position="on-border">
              <b-select expanded v-model="globalConfig.inlineQrcode">
                <option :value="true">Inline</option>
                <option :value="false">Base64</option>
              </b-select>
            </b-field>
          </b-field>

          <b-field expanded label="Unicode Qrcode" grouped>
            <b-field expanded label="Font Size" label-position="on-border">
              <b-input expanded type="string" v-model="globalConfig.unicodeQrcode.fontSize" />
            </b-field>

            <b-field expanded label="Foreground Color" label-position="on-border">
              <b-input type="text" expanded v-model="globalConfig.unicodeQrcode.foregroundColor" ></b-input>
            </b-field>

            <b-field expanded label="Background Color" label-position="on-border">
              <b-input type="text" expanded v-model="globalConfig.unicodeQrcode.backgroundColor" ></b-input>
            </b-field>

          </b-field>

          <b-field expanded>
            <template #label>
              <b-switch left-label v-model="globalConfig.proxy.useProxy">Use Proxy</b-switch>
            </template>

            <b-collapse class="is-flex-grow-1" v-model="globalConfig.proxy.useProxy" animation="slide">
              <b-field grouped expanded class="is-flex">
                <b-select v-model="globalConfig.proxy.protocol" :required="globalConfig.proxy.useProxy" placeholder="Protocol">
                  <option value="http">HTTP</option>
                  <option value="socks5">Socks</option>
                </b-select>

                <b-field expanded message="e.g. user:pass@host:port or host:port">
                  <b-taginput v-model="globalConfig.proxy.list" style="overflow-y: auto; overflow-x: hidden; max-height: 100px; max-width: 59vw;"
                              placeholder="Enter [user:pass@]host:port proxy" expanded
                              :on-paste-separators="[',', '\r\n', '\n', ' ']"
                              :before-adding="validateProxy"
                  />
                </b-field>
              </b-field>
            </b-collapse>
          </b-field>

          <b-field expanded>
            <template #label>
              <b-switch left-label v-model="globalConfig.headers.useHeaders">Edit Global Headers</b-switch>
            </template>

            <b-collapse class="is-flex-grow-1" animation="slide" v-model="globalConfig.headers.useHeaders">
              <b-field expanded label="Text Encoding" label-position="on-border">
                <b-select v-model="globalConfig.headers.textEncoding" >
                  <option class="is-capitalized" v-for="option in ['quoted-printable', 'base64']" :value="option">{{option}}</option>
                </b-select>
              </b-field>

              <b-field expanded>
                <b-input v-model="globalConfig.headers.unsubscribe" placeholder="List Unsubscribe e.g. http://example.com/unsubscribe"/>
              </b-field>

              <b-field expanded>
                <b-input v-model="globalConfig.headers.subscribe" placeholder="List Subscribe e.g. http://example.com/subscribe"/>
              </b-field>

              <b-field expanded>
                <b-input v-model="globalConfig.headers.post" placeholder="List Post e.g. http://example.com/post"/>
              </b-field>

              <b-field expanded>
                <b-input v-model="globalConfig.headers.help" placeholder="List Help e.g. http://example.com/help"/>
              </b-field>
            </b-collapse>
          </b-field>

        </form>


      </b-step-item>
      <b-step-item icon="at"
                   value="smtp"
                   label="SMTP"
                   :clickable="isConfigDone"
                   tabindex="1"
                   :type="isSMTPDone ? 'is-success' : 'is-primary'"
                   @dragenter="isDraggingConfigSelect = true"
                   @drop="isDraggingConfigSelect = false"
                   @dragleave="(event: DragEvent) => handleDragLeave(event, 'ConfigSelect', 'isDraggingConfigSelect')">
        <h1 class="title has-text-centered">SMTP Configuration</h1>

        <div class="mb-4">
          <b-field grouped group-multiline>
            <b-field>
              <b-button @click="newSMTPConfig" icon-left="card-plus" type="is-info" title="New Config"/>
            </b-field>
            <b-field class="file is-primary">
              <b-upload @change="handleSMTPSelect" class="file-label">
                <span class="file-cta p-2" title="Import from file">
                    <b-icon icon="link-plus"></b-icon>
                </span>
              </b-upload>
            </b-field>
          </b-field>
        </div>

        <b-field ref="ConfigSelect" v-if="isDraggingConfigSelect">
          <b-upload @change="handleSMTPSelect" @update:modelValue="handleSMTPSelect"
                    drag-drop expanded rounded>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon
                      icon="upload"
                      size="is-large">
                  </b-icon>
                </p>
                <p>Drop your SMTP config file here</p>
              </div>
            </section>
          </b-upload>
        </b-field>

        <b-field>
          <b-table
              :data="SMTPConfigs"
              striped height="500"
              sticky-header
              @dragstart="tableDragstart"
              @drop="(payload: any) => tableDrop(payload, SMTPConfigs)"
              @dragover="tableDragover"
              @dragleave="tableDragleave"
              hoverable>

            <b-table-column field="host" label="Host" searchable v-slot="props">
              {{ formatSubstringText(props.row.host) }}
            </b-table-column>

            <b-table-column field="port" label="Port" numeric v-slot="props">
              {{ props.row.port }}
            </b-table-column>

            <b-table-column field="host" label="Options" v-slot="props" width="100">
              <b-field >
                <b-button class="mr-1" @click="editSMTPConfig(props.row)" icon-left="pencil"></b-button>
                <b-button @click="deleteSMTPConfig(props.row)" icon-left="delete" type="is-danger"></b-button>
              </b-field>
            </b-table-column>

            <template #empty>
              <div class="is-align-items-center is-flex is-justify-content-center">
                No configs added yet, Click
                <b-button @click="newSMTPConfig" class="mx-2" icon-left="card-plus" type="is-info" title="New Config"/>
                or drop your file here to start.
              </div>
            </template>
          </b-table>
        </b-field>
      </b-step-item>

      <b-step-item
          icon="email-edit"
          value="message"
          label="Message"
          :clickable="isSMTPDone"
          :type="isMessagesDone ? 'is-success' : 'is-primary'"

          tabindex="2">
        <h1 class="title has-text-centered">Message(s)</h1>

        <div class="mb-4">
          <b-field grouped group-multiline>
            <b-field>
              <b-button @click="newMessage" icon-left="email-plus" type="is-info" title="New Message"></b-button>
            </b-field>
            <b-field>
              <b-button v-if="false" icon-left="select-group" @click="tableCheckable = !tableCheckable"
                        title="Select Message(s)"></b-button>
            </b-field>
            <b-field v-if="false">
              <b-button :disabled="tableCheckedRows.length == 0" icon-left="delete-alert"
                        title="Delete Selected"></b-button>
            </b-field>
          </b-field>
        </div>
        <b-table
            :data="messages"
            striped
            draggable
            @dragstart="tableDragstart"
            @drop="(payload: any) => tableDrop(payload, messages)"
            @dragover="tableDragover"
            @dragleave="tableDragleave"
            hoverable>

          <b-table-column field="subject" label="Subject" v-slot="props">
            {{ props.row.subject.substring(0, 100) + (props.row.subject.length > 100 ? '...' : '') }}
          </b-table-column>

          <b-table-column field="body" label="Body" v-slot="props">
            {{ extractTextFromHtml(props.row) }}
          </b-table-column>

          <b-table-column field="attachments" label="Attachments" numeric v-slot="props">
            {{ props.row.attachments.length }}
          </b-table-column>

          <b-table-column field="pdfFiles" label="PDF Files" numeric v-slot="props">
            {{ props.row.pdfFiles.length }}
          </b-table-column>



          <b-table-column field="subject" label="Options" v-slot="props">

            <b-field>
              <b-button class="mr-1" @click="editMessage(props.row)" icon-left="pencil"></b-button>
              <b-button @click="deleteMessage(props.row)" icon-left="delete" type="is-danger"></b-button>
            </b-field>

          </b-table-column>

          <template #empty>
            <div class="is-align-items-center is-flex is-justify-content-center">
              No message added yet, Click
              <b-button @click="newMessage" class="mx-2" icon-left="email-plus" type="is-info" title="New Message"/>
              to start.
            </div>
          </template>

        </b-table>
      </b-step-item>

      <b-step-item icon="account-multiple" label="Receivers" :type="receiversList.length ? 'is-success' : 'is-primary'"
                   :clickable="isMessagesDone" tabindex="3" value="receivers">
        <h1 class="title has-text-centered">Choose Receivers</h1>

        <b-field>
          <b-upload v-model="receiversFile"
                    @update:modelValue="handleFileUpload"
                    drag-drop expanded :type="receiversFile ? 'is-success' : 'is-primary'" rounded>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon
                      :icon="receiversList.length ? 'attachment-check' : 'upload'"
                      size="is-large">
                  </b-icon>
                </p>
                <p v-if="receiversList.length">
                  <b-icon title="Empty list" @click.prevent="receiversList.splice(0, receiversList.length)" icon="close"></b-icon>
                </p>
                <p v-else>Drop your files here or click to upload</p>
                <p v-if="receiversList.length">Receivers count: {{ receiversList.length }}</p>
              </div>
            </section>
          </b-upload>
        </b-field>

      </b-step-item>

      <b-step-item class="is-flex-grow-1" :class="{'is-flex': activeStep=='progress'}" value="progress" icon="progress-clock" label="Progress" clickable tabindex="4">
        <WebsocketLogger />
      </b-step-item>

      <template #navigation="{previous, next}">
        <div class="steps-navigations m-4" v-if="activeStep !== 'progress'">
          <b-button @click.prevent="previous.action" icon-left="chevron-left" v-show="!previous.disabled">
            Previous
          </b-button>
          <b-button v-if="activeStep !== 'receivers'"
                    @click.prevent="next.action"
                    icon-right="chevron-right"
                    v-show="!(next.disabled && activeStep !== 'message')"
                    :disabled="isNextDisabled">Next</b-button>

          <b-button v-else :type="{'is-success': !isNextDisabled}" :disabled="isNextDisabled" @click="startProcess(next)">Start Mailing!</b-button>
        </div>
        <div v-else class="steps-navigations m-4">
          <b-button @click.prevent="manageQueue('pause')">Pause</b-button>
          <b-button @click.prevent="manageQueue('resume')">Resume</b-button>
          <b-button @click.prevent="manageQueue('stop')">Stop</b-button>
        </div>
      </template>
    </b-steps>

  </div>
</template>

<script lang="ts">
import MessageEditorModal from "~/src/components/MessageEditorModal.vue";
import {getRandomMember} from "~/utils/arrays";
import SMTPConfigEditorModal from "~/src/components/SMTPConfigEditorModal.vue";
import {type MailerConfig, type SMTPConfig, type Message, type Step} from "~/src/types/types";
import WebsocketLogger from "./src/components/WebsocketLogger.vue";

export default {
  components: {WebsocketLogger},

  data() {
    return {
      isDraggingConfigSelect: false,
      debugMode: false,

      activeStep: 'config' as Step,
      receiversFile: null as File | null,
      receiversList: [] as string[],
      messages: [] as Message[],
      SMTPConfigs: [] as SMTPConfig[],
      globalConfig: {
        shorts: [] as string[],
        workers: 10,
        useShortener: false,
        shortenerAPIKey: '',
        inlineQrcode: true,
        unicodeQrcode: {
          fontSize: '3.75px',
          foregroundColor: 'black',
          backgroundColor: 'transparent',
        },
        proxy: {
          useProxy: false,
          list: [] as string[],
          protocol: 'http',
        },
        headers: {
          useHeaders: false,
        },
      } as MailerConfig,
      tableDraggingRow: null as string | null,
      tableDraggingRowIndex: null as number | null,
      tableCheckable: false,
      tableCheckedRows: [] as any[],
      backgroundImage: 'none',
    }
  },
  methods: {
    log: (a: any) => console.log(a),
    removeFiles(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(this.removeFiles); // Recursively clean arrays
      } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, value]) => !(value instanceof File)) // Remove File objects
                .map(([key, value]) => [key, this.removeFiles(value)]) // Recursively process objects
        );
      }
      return obj; // Return primitives as is
    },
    validateProxy(tag: string) {
      return /^(.+:.+@)?([a-zA-Z0-9.-]+):(\d+)$/.test(tag);
    },
    validateUrl(url: string) {
      try {
        if (!url.startsWith('http')) {
          url = 'http://' + url
        }
        new URL(url);
        return true;
      } catch (error) {
        return false;
      }
    },
    async startProcess(next: any) {
      next.action()
      await fetch('/api/email/send', {
        method: 'post',
        body: JSON.stringify({
          smtp_list: this.SMTPConfigs,
          receivers: this.receiversList,
          messages: this.removeFiles(this.messages),
          config: this.globalConfig,
        }),
        headers: {'content-type': 'application/json'},
      });
    },

    async checkQueues() {
      const data = await $fetch('/api/email/ping');
      this.debugMode = data.debugMode;
      if (data.queueRunning) {
        if (this.activeStep !== 'progress' && data.remainingCount > 0) {
          this.$buefy.toast.open({message: 'Another sending process is running...'});
          this.activeStep = 'progress';
        }
      }
    },

    async manageQueue(method: string) {
      await fetch('/api/email/manage', {
        method: 'post',
        body: JSON.stringify({method}),
        headers: {'content-type': 'application/json'},
      });
    },

    handleDragLeave(event: DragEvent, el: string, draggingVariable: string) {
      if (!this.$refs[el]) return

      const rect = this.$refs[el].$el.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      const isWithin = (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

      if (!isWithin) {
        // @ts-ignore
        this[draggingVariable] = false
      }
    },

    formatSubstringText(text: string): string {
      return text.substring(0, 100) + (text.length > 100 ? '...' : '');
    },

    tableDragstart(payload: any) {

      this.tableDraggingRow = payload.row
      this.tableDraggingRowIndex = payload.index
      payload.event.dataTransfer.effectAllowed = 'copy'
    },
    tableDragover(payload: any) {
      payload.event.dataTransfer.dropEffect = 'copy'
      payload.event.target.closest('tr').classList.add('is-selected')
      payload.event.preventDefault()
    },
    tableDragleave(payload: any) {
      payload.event.target.closest('tr').classList.remove('is-selected')
      payload.event.preventDefault()
    },
    tableDrop(payload: any, list: any[]) {
      payload.event.target.closest('tr').classList.remove('is-selected')
      const droppedOnRowIndex = payload.index
      moveItem(list, this.tableDraggingRow, droppedOnRowIndex)
    },

    extractTextFromHtml(payload: string|Message, substring: number = 100, trailing: string = '...') {
      if (typeof payload !== 'string') {
        switch (payload.messageType) {
          case "editor":
            payload = payload.bodyHTMLEditor || '';
            break;
          case "html":
            payload = payload.bodyHTMLContent || '';
            break;
          case "raw":
            payload = '[RAW MESSAGE]';
            break;
          default:
            payload = '[EMPTY BODY]';
        }
      }
      const tempElement = document.createElement('div');
      tempElement.innerHTML = payload;
      const extracted = tempElement.innerText.substring(0, substring);
      return extracted + (extracted.length > 100 ? trailing : '')
    },

    handleFileUpload(event: any) {
      const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .trim()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
      };

      const file = event instanceof File ? event : event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        let receivers = (e.target?.result as string).split('\n');
        let counter = 0;
        for (let receiver of receivers) {
          if (validateEmail(receiver)) {
            this.receiversList.push(receiver);
            counter++;
          }
        }

        this.$buefy.snackbar.open({message: `${counter} receiver(s) added!`});
        this.receiversFile = null;
      };

      if (this.receiversList.length) {
        this.$buefy.dialog.confirm({
          message: 'Overwrite current receiver(s)?',
          confirmText: 'Overwrite',
          cancelText: 'Append',
          onConfirm: () => {
            this.receiversList.splice(0, this.receiversList.length);
            reader.readAsText(file);
          },
          onCancel: () => {
            reader.readAsText(file);
          },
          type: 'is-danger',
        });
      } else {
        reader.readAsText(file);
      }
    },

    handleSMTPSelect(event: any) {
      const processSMTPString = (smtp_line: string) => {
        let smtp_info = smtp_line.trim().split('|')
        if (smtp_info.length < 3) {
          return false;
        }
        let require_login = smtp_info.length > 4;
        let [address, name] = (smtp_info.at(-1) || '').split('@')
        return {
          'host': smtp_info[0],
          'port': Number(smtp_info[1]),
          'user': require_login ? smtp_info[2] : undefined,
          'pass': require_login ? smtp_info[3] : undefined,

          'from': {address, name},
        }
      }

      const file = event instanceof File ? event : event.target.files[0];
      const reader = new FileReader();
      let counter = 0;
      reader.onload = (e: ProgressEvent<FileReader>) => {
        (e.target?.result as string).split('\n').forEach(smtp_line => {
          const smtp_config = processSMTPString(smtp_line);
          if (smtp_config) {
            this.SMTPConfigs.push(smtp_config);
            counter++;
          }
        })
        this.$buefy.snackbar.open({message: `${counter} config(s) loaded`});
      };

      if (this.SMTPConfigs.length) {
        this.$buefy.dialog.confirm({
          message: 'Overwrite current SMTP configuration(s)?',
          confirmText: 'Overwrite',
          cancelText: 'Append',
          onConfirm: () => {
            this.SMTPConfigs.splice(0, this.SMTPConfigs.length);
            reader.readAsText(file);
          },
          onCancel: () => {
            reader.readAsText(file);
          },
          type: 'is-danger',
        });
      } else {
        reader.readAsText(file);
      }
    },

    newSMTPConfig() {
      const config = {host: "", port: 587, user: undefined, pass: undefined, from: {}};
      this.$buefy.modal.open({
        parent: this,
        component: SMTPConfigEditorModal,
        hasModalCard: true,
        trapFocus: true,
        props: {configs: this.SMTPConfigs, config},
      })
    },
    editSMTPConfig(config: Object) {
      this.$buefy.modal.open({
        parent: this,
        component: SMTPConfigEditorModal,
        hasModalCard: true,
        trapFocus: true,
        props: {configs: this.SMTPConfigs, config, isEdited: true},
      })
    },
    deleteSMTPConfig(config: any) {
      this.$buefy?.dialog.confirm({
        message: 'Are you sure to delete the SMTP config from the list?',
        onConfirm: () => {
          this.SMTPConfigs.splice(this.SMTPConfigs.indexOf(config), 1)
          this.$buefy.snackbar.open('Config deleted!')
        },
        confirmText: 'Delete',
        type: 'is-danger',
      })
    },

    newMessage() {
      const message = {subject: "", body: "", attachments: [], options: "", messageType: "html", useTextAlt: false, text: ""};
      this.$buefy.modal.open({
        parent: this,
        component: MessageEditorModal,
        hasModalCard: true,
        trapFocus: true,
        props: {messages: this.messages, message},
      })
    },
    editMessage(message: object) {
      this.$buefy.modal.open({
        parent: this,
        component: MessageEditorModal,
        hasModalCard: true,
        trapFocus: true,
        props: {messages: this.messages, message, isEdited: true},
      })
    },
    deleteMessage(message: Message) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure to delete the message from the list?',
        onConfirm: () => {
          this.messages.splice(this.messages.indexOf(message), 1)
          this.$buefy.snackbar.open('Message deleted!')
        },
        confirmText: 'Delete',
        type: 'is-danger',
      })
    },
    loadBackgroundImage() {
      fetch('/api/backgrounds?theme=spring').then(r => r.json()).then(images => {
        const backgroundImage = `url("${getRandomMember(images)}")`;
        document.documentElement.style.setProperty('--background-image', backgroundImage);
      })
    },
  },
  computed: {
    isNextDisabled() {
      let condition: boolean = false;
      if (this.activeStep == 'config') {
        condition = !this.isConfigDone;
      } else if (this.activeStep == 'smtp') {
        condition = this.SMTPConfigs.length === 0
      } else if (this.activeStep == 'message') {
        condition = this.messages.length === 0
      } else if (this.activeStep == 'receivers') {
        condition = this.receiversList.length == 0
      }
      return condition;
    },

    isConfigDone() {
      let condition: boolean = true;
      if (!this.globalConfig.shorts.length) {
        condition = false;
      }
      if (condition) {}
      return condition;
    },

    isSMTPDone() {
      let condition: boolean = true;
      if (this.SMTPConfigs.length === 0) {
        condition = false;
      }
      return condition;
    },

    isMessagesDone() {
      let condition: boolean = true;
      if (this.messages.length === 0) {
        condition = false;
      }
      return condition;
    }


  },
  async mounted() {
    useSeoMeta({
      title: 'Mailer GUI',
      description: 'Another mass mailer script but with gui!',
      ogTitle: 'Mailer GUI',
      ogImage: '/logo.svg',
      ogDescription: 'Another mass mailer script but with gui!',
      twitterTitle: 'Mailer GUI',
      twitterDescription: 'Another mass mailer script but with gui!',
      twitterCard: 'summary'
    });

    useHead({
      htmlAttrs: {
        lang: 'en'
      },
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/logo.svg'
        }
      ]
    });

    await this.checkQueues();
    this.globalConfig.headers.textEncoding = 'quoted-printable';

    this.loadBackgroundImage()
  },

}

</script>

<style>
html, body {
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
  flex: 1 1;
}

/*noinspection All*/
body div#__nuxt {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  background-image: var(--background-image);
  background-attachment: fixed;
  background-size: cover;

}
</style>

<style lang="scss">
.is-sticky-top {
  position: sticky;
  top: 0;
  z-index: 10000;
}

.container {
  border-radius: 4px;
  box-shadow: 0 0 35px 0 rgb(0 0 0 / 25%);
  backdrop-filter: blur(30px);
  background-color: rgb(255 255 255 / 80%);
}

.cursor-pointer {
  cursor: pointer;
}

.steps-navigations {
  position: absolute;
  bottom: 0;
  right: 0;
}

.step-content {
  overflow: hidden auto!important;
  flex: 1 auto;

  .step-item {
    contain: content;

    .logger {
      contain: size;
      overflow: hidden;
      overflow-y: auto;
    }
  }

  &:not(.is-transitioning) {
    .is-active {
      display: initial !important;
    }
  }
}

.user-select-none {
  user-select: none !important;
}

@media screen and (min-width: 768px) {
  .container {
    max-width: 800px !important;
  }
}
</style>
