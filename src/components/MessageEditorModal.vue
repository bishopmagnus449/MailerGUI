<script lang="ts">
import {defineComponent} from 'vue'
import HtmlEditor from "~/src/components/HtmlEditor.vue";

export default defineComponent({
  name: "MessageEditorModal",
  components: {HtmlEditor},
  props: {
    message: {type: Object, required: true},
    messages: {type: Array<any>, required: true},
    isEdited: {type: Boolean, default: false},
  },
  data() {
    return {
      currentMessage: {...this.message} as { subject: string, body: string, attachments: any[], fileBody: boolean, },
    }
  },
  methods: {
    attachImage(image: any){
      console.log(image)
    },
    checkAttachments() {
      this.currentMessage.attachments.forEach((file: File, index: number) => {
        if (file.type == "") {
          this.$buefy.toast.open(`Attachment "${file.name}" ignored, invalid file type.`)
          this.deleteAttachment(index)
        }
      })
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
      this.$emit('close')
    },
  },
})
</script>

<template>
  <form action="">
    <div class="modal-card is-large">
      <header class="modal-card-head">
        <p class="modal-card-title">Message</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">
        <b-field label="Subject">
          <b-input v-model="currentMessage.subject"/>
        </b-field>
        <b-field label="Attachments" expanded>
          <b-upload v-model="currentMessage.attachments" @update:modelValue="checkAttachments()" multiple drag-drop
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

        <ul class="tags" v-auto-animate>
          <li v-for="(file, index) in currentMessage.attachments" :key="index" class="tag is-primary">
            {{ file.name }}
            <button class="delete is-small" type="button" @click="deleteAttachment(index)"></button>
          </li>
        </ul>
        <html-editor v-model="currentMessage.body" @attached-image="attachImage"></html-editor>
      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')"/>
        <b-button
            @click="saveMessage"
            :label="isEdited ? 'Save Changes' : 'Add'"
            type="is-primary"/>
      </footer>
    </div>
  </form>
</template>
