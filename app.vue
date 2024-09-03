<template>
  <NuxtRouteAnnouncer/>
  <div class="container is-flex-grow-1 m-3 p-3 is-flex">
    <b-steps ref="stepsContainer" v-model="activeStep" mobile-mode="compact"
             class="is-flex is-flex-direction-column is-flex-grow-1 is-relative">
      <b-step-item icon="at"
                   label="SMTP"
                   :clickable="true"
                   tabindex="0"
                   :type="smtpStore.isReady() ? 'is-success' : 'is-primary'"
                   @dragenter="isDraggingConfigSelect = true"
                   @drop="isDraggingConfigSelect = false"
                   @dragleave="(event: DragEvent) => handleDragLeave(event, 'ConfigSelect', 'isDraggingConfigSelect')"
                   :class="{'is-active': activeStep == 0}">
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

        <b-field ref="ConfigSelect" v-if="isDraggingConfigSelect" >
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

      <b-step-item icon="account-multiple" label="Receivers" :type="!isNextDisabled ? 'is-success' : 'is-primary'"
                   :clickable="!isNextDisabled" tabindex="1">
        <h1 class="title has-text-centered">Choose Receivers</h1>

        <b-field>
          <b-upload v-model="receiversFile"
                    @change="handleFileUpload"
                    drag-drop expanded :type="receiversFile ? 'is-success' : 'is-primary'" rounded>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon
                      :icon="receiversFile ? 'attachment-check' : 'upload'"
                      size="is-large">
                  </b-icon>
                </p>
                <p v-if="receiversFile">
                  Selected file: {{ receiversFile.name }}
                  <b-icon title="Remove selected file" @click.prevent="receiversFile = null" icon="close"></b-icon>
                </p>
                <p v-else>Drop your files here or click to upload</p>
                <p v-if="receiversFile">Receivers count: {{ receiversCount }}</p>
              </div>
            </section>
          </b-upload>
        </b-field>

      </b-step-item>

      <b-step-item icon="email-edit" label="Message" :clickable="true" tabindex="2">
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
            {{ extractTextFromHtml(props.row.body) }}
          </b-table-column>

          <b-table-column field="attachments" label="Attachments" numeric v-slot="props">
            {{ props.row.attachments.length }}
          </b-table-column>

          <b-table-column field="options" label="Options" v-slot="props">

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

      <template #navigation="{previous, next}">
        <div class="steps-navigations m-4">
          <b-button @click.prevent="previous.action" icon-left="chevron-left" v-show="!previous.disabled">Previous
          </b-button>
          <b-button @click.prevent="next.action" icon-right="chevron-right" v-show="!next.disabled"
                    :disabled="isNextDisabled">Next
          </b-button>
        </div>
      </template>

    </b-steps>

  </div>
</template>

<script lang="ts">
import {useSMTPStore} from "~/src/stores/smtpStore";
import MessageEditorModal from "~/src/components/MessageEditorModal.vue";
import {getRandomMember} from "~/utils/arrays";
import SMTPConfigEditorModal from "~/src/components/SMTPConfigEditorModal.vue";

export default {

  data() {
    return {
      isDraggingConfigSelect: false,

      smtpStore: useSMTPStore(),
      activeStep: 0,
      receiversFile: null as File | null,
      receiversCount: null as number | null,
      messages: [] as object[],
      SMTPConfigs: [] as {host: string, port: number, user: string | null, pass: string | null, from: string | undefined}[],
      messagesColumns: [
        {
          field: "subject",
          label: "Subject",
        },
        {
          field: "body",
          label: "Body",
        },
        {
          field: "attachments",
          label: "Attachments",
        },
      ],
      tableDraggingRow: null as string | null,
      tableDraggingRowIndex: null as number | null,
      tableCheckable: false,
      tableCheckedRows: [] as any[],
      backgroundImage: 'none',
    }
  },
  methods: {
    log: (a: any) => console.log(a),

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

    extractTextFromHtml(payload: string, substring: number = 100, trailing: string = '...') {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = payload;
      const extracted = tempElement.innerText.substring(0, substring);
      return extracted + (extracted.length > 100 ? trailing : '')
    },

    handleFileUpload(event: any) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.receiversCount = (e.target?.result as string).split('\n').length;
      };
      reader.readAsText(file);
    },

    handleSMTPSelect(event: any) {
      const processSMTPString = (smtp_line: string) => {
        let smtp_info = smtp_line.trim().split('|')
        if (smtp_info.length < 3) {
          return false;
        }
        let require_login = smtp_info.length > 4;
        return {
          'host': smtp_info[0],
          'port': Number(smtp_info[1]),
          'user': require_login ? smtp_info[2] : null,
          'pass': require_login ? smtp_info[3] : null,

          'from': smtp_info.at(-1),
        }
      }

      const file = event instanceof File ? event : event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        (e.target?.result as string).split('\n').forEach(smtp_line => {
          const smtp_config = processSMTPString(smtp_line);
          if (smtp_config) {
            this.SMTPConfigs.push(smtp_config);
          }
        })
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
      const config = {host: "", port: 587, user: "", pass: "", from: ""};
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
    deleteSMTPConfig(config: Object) {
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
      const message = {subject: "", body: "", attachments: [], options: ""};
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
    deleteMessage(message: object) {
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
      if (this.activeStep == 0) {
        condition = this.SMTPConfigs.length === 0
      } else if (this.activeStep == 1) {
        condition = this.receiversFile == null
      }
      return condition;
    },
  },
  mounted() {
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
.container {
  border-radius: 4px;
  box-shadow: 0 0 35px 0 rgb(0 0 0 / 25%);
  backdrop-filter: blur(30px);
  background-color: rgb(255 255 255 / 80%);
}

.steps-navigations {
  position: absolute;
  bottom: 0;
  right: 0;
}

.step-content {
  overflow: hidden;
}

.step-content {
  &:not(.is-transitioning) {
    .is-active {
      display: initial !important;
    }
  }
}


@media screen and (min-width: 768px) {
  .container {
    max-width: 800px !important;
  }
}
</style>
