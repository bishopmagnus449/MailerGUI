<script lang="ts">

import {type HTMLImage} from "../types/types";

export default {
  name: "AttachImage",
  emits: ['newImage', 'close'],

  props: {
    alt: {type: String, default: ""},
    comment: {type: String, default: undefined},
    width: {type: Number, default: null},
    file: {type: File, default: null},
    isInline: {type: Boolean, default: false},
    isProcessed: {type: Boolean, default: false},
  },

  mounted() {
    if (this.file instanceof File) {
      this.newImage.file = this.file
    }
  },

  data() {
    return {
      isDraggingImageSelect: false,

      newImage: {
        isInline: this.isInline,
        alt: this.alt,
        isProcessed: this.isProcessed,
      } as HTMLImage,
    }
  },

  methods: {
    attachImage() {
      this.$emit('newImage', this.newImage);
      this.$buefy.toast.open('Image Attached');
      this.$emit('close');
      return true
    },
    resetImage(close = false) {
      this.newImage = {
        isInline: false,
      };
      if (close) {
        this.$emit('close');
      }
      return true
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
  },
  computed: {
    imagePreviewUrl() {
      let blob = URL.createObjectURL(this.newImage.file);
      let image = new Image();
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const binary = new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        this.newImage.content = btoa(binary)
      }

      image.onload = (event) => {
        console.log(event)
        this.newImage.width = this.width || image.width;
        this.newImage.filename = this.newImage.file?.name;
        this.newImage.filetype = this.newImage.file?.type;
      };
      reader.readAsDataURL(this.newImage.file);
      image.src = blob;

      return blob;
    },
  },
}

</script>

<template>
  <form @submit.prevent="attachImage">
    <div class="modal-card">
      <header class="modal-card-head">
        <div class="modal-card-title">
          <p>Attach Image</p>
          <span class="is-size-7 mt-1 p-0" v-if="comment">{{comment}}</span>
        </div>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body" @dragenter="isDraggingImageSelect = true"
               @drop="isDraggingImageSelect = false"
               @dragleave="(event: DragEvent) => handleDragLeave(event, 'uploadContainer', 'isDraggingImageSelect')">
        <b-field ref="uploadContainer" v-if="isDraggingImageSelect">
          <b-upload accept="image/*" v-model="newImage.file"
                    expanded
                    drag-drop>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon
                      icon="upload"
                      size="is-large">
                  </b-icon>
                </p>
                <p>Drop your files here</p>
              </div>
            </section>
          </b-upload>
        </b-field>
        <b-field v-else class="file is-primary" :class="{'has-name': !!newImage.file}">
          <b-upload v-model="newImage.file" class="file-label" accept="image/*">
            <span class="file-cta">
                <b-icon class="file-icon" icon="upload"></b-icon>
                <span class="file-label">Choose Image</span>
            </span>
            <span class="file-name" v-if="newImage.file">
                {{ newImage.file.name }}
            </span>
          </b-upload>
        </b-field>

        <b-field v-if="newImage.file" label="Attach Type">
          <b-radio-button v-model="newImage.isInline"
                          :native-value="false"
                          type="is-primary is-light is-outlined">
            <b-icon icon="code-json"></b-icon>
            <span>Base64</span>
          </b-radio-button>

          <b-radio-button v-model="newImage.isInline"
                          :native-value="true"
                          type="is-primary is-light is-outlined">
            <b-icon icon="image-frame"></b-icon>
            <span>Inline</span>
          </b-radio-button>
        </b-field>

        <div v-if="newImage.file">
          <b-field grouped>
            <b-field style="width: 80px" label="Width" label-position="on-border">
              <b-input type="number" v-model="newImage.width"/>
            </b-field>

            <b-field style="width: 160px" label="Mime Type" label-position="on-border">
              <b-input v-model="newImage.filetype"/>
            </b-field>


            <b-field v-if="newImage.isInline" label="Attachment Name" label-position="on-border" expanded>
              <b-input v-model="newImage.filename"/>
            </b-field>
          </b-field>

          <b-field label="Alt" label-position="on-border" expanded>
            <b-input v-model="newImage.alt"/>
          </b-field>

          <b-field label="Preview">
            <img :alt="newImage.filename" :src="imagePreviewUrl" :width="newImage.width"></img>
          </b-field>
        </div>


      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Cancel"
            @click="resetImage(true)"/>
        <b-button
            v-if="newImage.file"
            :label="newImage.isProcessed ? 'Save' : 'Add'"
            type="is-primary"
            @click="attachImage"/>
      </footer>
    </div>
  </form>
</template>

<style scoped lang="scss">

</style>