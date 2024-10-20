<script lang="ts">
import {defineComponent} from 'vue'
import HtmlEditor from "~/src/components/HtmlEditor.vue";
import AttachImage from '~/src/components/AttachImageModal.vue'
import {type Attachment, type HTMLImage, type Message} from "../types/types";

export default defineComponent({
  name: "MessageEditorModal",
  components: {HtmlEditor},
  props: {
    message: {type: Object, required: true},
    messages: {type: Array<any>, required: true},
    isEdited: {type: Boolean, default: false},
  },
  mounted() {
      this.currentMessage.messageType = this.currentMessage.messageType || 'html';
  },
  data() {
    return {
      currentMessage: {...this.message} as Message,
      attachments: [] as File[],
    }
  },
  watch: {
    'currentMessage.messageType'(newType, oldType) {
      if (oldType == 'html' && !this.currentMessage.bodyHTMLFile) return;

      this.$buefy.dialog.confirm({
        message: 'Reset the current message?',
        onConfirm: this.resetMessage
      })
    },
  },
  computed: {
    isValidMessage() {
      if (!this.currentMessage.subject) {
        return false
      }
      if (this.currentMessage.messageType == 'html' && !this.currentMessage.bodyHTMLFile) {
        return false
      }
      return true
    },
  },
  methods: {
    attachImage(oldImage: HTMLImage, newImage: HTMLImage){
      oldImage.isProcessed = true;
      oldImage.filename = newImage.filename;
      oldImage.file = newImage.file;
      oldImage.width = newImage.width
      oldImage.alt = newImage.alt
      oldImage.isInline = newImage.isInline
      oldImage.content = newImage.content
    },

    editImage(oldImage: HTMLImage) {
      this.$buefy.modal.open({
        parent: this,
        component: AttachImage,
        hasModalCard: true,
        trapFocus: true,
        props: {
          alt: oldImage.alt,
          width: Number(oldImage.width),
          file: oldImage.file || null,
          isInline: oldImage.isInline,
          comment: oldImage.src,
          isProcessed: oldImage.isProcessed
        },
        events: {newImage: (newImage: any) => this.attachImage(oldImage, newImage)},

      })
    },
    checkAttachments() {
      this.attachments.forEach((file: File, index: number) => {
        if (file.type == "") {
          this.$buefy.toast.open(`Attachment "${file.name}" ignored, invalid file type.`)
        } else {
          const attachment: Attachment = {
            content: "", file,
            filename: file.name,
            filetype: file.type
          }
          const reader = new FileReader()
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const arrayBuffer = e.target?.result as ArrayBuffer
            const binary = new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            attachment.content = btoa(binary)
            this.currentMessage.attachments.push(attachment)
          }
          reader.readAsArrayBuffer(file)
        }
      })

      this.attachments.splice(0, this.attachments.length);
    },
    parseImgTag(img: string): HTMLImage {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = img;

      const imgElement = tempDiv.querySelector('img');
      if (!imgElement) throw new Error('Internal Bug');

      const src = imgElement.getAttribute('src') || '';
      const alt = imgElement.getAttribute('alt') || '';
      const width = Number(imgElement.getAttribute('width')) || undefined;

      // @ts-ignore
      return {
        isInline: false,
        src,
        alt,
        width,
        imgTag: img,
        isProcessed: false
      };
    },
    checkHTMLBody(file: File) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.currentMessage.bodyHTMLContent = (e.target?.result as string);
        const images = this.currentMessage.bodyHTMLContent.match(/(<img\s+(?:[^>]*\n)*[^>]*src=["']#local_image#(?:[^>]*\n)*[^>]*>)/g)
        if (images) {
          this.currentMessage.bodyHTMLImages = images.map((img: string) => this.parseImgTag(img))
        } else {
          this.currentMessage.bodyHTMLImages = undefined;
        }
      };
      reader.readAsText(file)
    },
    deleteAttachment(index: number) {
      this.currentMessage.attachments.splice(index, 1);
    },
    saveMessage() {
      if (this.isEdited) {
        this.messages[this.messages.indexOf(this.message)] = this.currentMessage
      } else {
        this.messages.push(this.currentMessage)
      }
      if (this.isValidMessage) {
        if (this.currentMessage.messageType == 'html' && this.currentMessage.bodyHTMLImages?.filter(image => !image.isProcessed).length) {
          this.$buefy.dialog.confirm({
            'message': `You haven't set all the images that are used in selected html file, are you sure to add the message?`,
            onConfirm: () => {
              this.$emit('close')
            },
          })
        } else {
          this.$emit('close')
        }
      }
    },
    resetMessage() {
      this.currentMessage.bodyHTMLFile = undefined;
      this.currentMessage.attachments.splice(0, this.currentMessage.attachments.length)
      this.currentMessage.bodyHTMLImages = undefined;
      this.currentMessage.bodyHTMLContent = undefined;
    }
  },
})
</script>

<template>
  <form @submit.prevent="saveMessage">
    <div class="modal-card is-large">
      <header class="modal-card-head">
        <p class="modal-card-title">Message</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">
        <b-field label="Message Type">

          <b-radio-button v-model="currentMessage.messageType" expanded disabled @click="() => $buefy.toast.open({type: 'is-primary', message: 'Not implemented yet!'})"
                          native-value="_editor"
                          type="is-primary is-light is-outlined">
            <b-icon icon="code-block-tags"></b-icon>
            <span>Editor</span>
          </b-radio-button>

          <b-radio-button v-model="currentMessage.messageType" expanded
                          native-value="html"
                          type="is-primary is-light is-outlined">
            <b-icon icon="file-code"></b-icon>
            <span>HTML</span>
          </b-radio-button>

          <b-radio-button v-model="currentMessage.messageType" expanded
                          native-value="raw"
                          type="is-primary is-light is-outlined">
            <b-icon icon="file-edit"></b-icon>
            <span>Raw</span>
          </b-radio-button>

        </b-field>

        <b-field label="Subject">
          <b-input v-model="currentMessage.subject" required/>
        </b-field>
        <b-field v-if="currentMessage.messageType !== 'raw'" label="Attachments" expanded>
          <b-upload v-model="attachments" @update:modelValue="checkAttachments()" multiple drag-drop
                    expanded>
            <section class="section py-5">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large"></b-icon>
                </p>
                <p>Drop your files here or click to upload</p>
              </div>
            </section>
          </b-upload>
        </b-field>

        <ul v-if="currentMessage.messageType !== 'raw'" class="tags" v-auto-animate>
          <li v-for="(file, index) in currentMessage.attachments" :key="index" class="tag is-primary">
            <span v-if="file.filename">
              {{ file.filename }}
            </span>
            <span v-else>[INLINE IMAGE]: {{ file.filename }}</span>
            <button class="delete is-small" type="button" @click="deleteAttachment(index)"></button>
          </li>
        </ul>

        <b-field label="Local Images" :message="`Click to set images, ${currentMessage.bodyHTMLImages.filter(image => image.isProcessed).length}/${currentMessage.bodyHTMLImages.length}`" v-if="currentMessage.bodyHTMLImages && currentMessage.bodyHTMLImages.length">
          <ul v-auto-animate>
            <li v-for="(image, index) in currentMessage.bodyHTMLImages" :key="index" :title="image.alt"
                @click="editImage(image)" :class="{'is-success': image.isProcessed, 'is-warning': !image.isProcessed}"
                class="tag button is-block mb-1 py-0 is-flex is-justify-content-space-between" >
              <span>{{ image.filename || image.src }}</span>
              <span><template v-if="image.width">Size: {{ image.width }}</template></span>
            </li>
          </ul>
        </b-field>

        <b-field label="Body">

        <div v-if="currentMessage.messageType == 'editor'">
          <html-editor v-model="currentMessage.body" @attached-image="attachImage"></html-editor>
        </div>

        <div v-else-if="currentMessage.messageType == 'html'">
          <b-upload v-model="currentMessage.bodyHTMLFile" @update:modelValue="checkHTMLBody" drag-drop accept="text/html"
                    expanded>
            <section class="section py-5">
              <div class="content has-text-centered">
                <p>
                  <b-icon :icon="currentMessage.bodyHTMLFile == null ? 'upload' : 'language-html5'" size="is-large"></b-icon>
                </p>
                <p v-if="currentMessage.bodyHTMLFile">Selected File: {{currentMessage.bodyHTMLFile.name}}</p>
                <p v-else>Drop your HTML file here or click to upload</p>
              </div>
            </section>
          </b-upload>
        </div>

        <div v-else-if="currentMessage.messageType == 'raw'">
          <b-upload v-model="currentMessage.attachments"
                    @update:modelValue="checkAttachments()"
                    drag-drop accept="text/plain,message/rfc822" expanded>
            <section class="section py-5">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large"></b-icon>
                </p>
                <p>Drop your raw message file here or click to upload</p>
              </div>
            </section>
          </b-upload>
        </div>

        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')"/>
        <b-button :disabled="!isValidMessage"
            @click="saveMessage"
            :label="isEdited ? 'Save Changes' : 'Add'"
            type="is-primary"/>
      </footer>
    </div>
  </form>
</template>
