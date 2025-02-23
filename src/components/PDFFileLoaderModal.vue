<script lang="ts">
import {defineComponent, type PropType} from 'vue';
import {type HTMLImage, type PDFFile} from "~/src/types/types";
import PDFImageModal from "./PDFImageModal.vue";

export default defineComponent({
  name: "PDFFileLoaderModal",
  props: {
    currentPDFFile: {type: Object as PropType<PDFFile>},
    currentPDFFiles: {type: Array<PDFFile>, required: true},
    isEdited: {type: Boolean, default: false},
  },
  data() {
    return {
      pdfFile: {
        filename: '',
        htmlContent: '',
        bodyHTMLImages: undefined,
        htmlFile: undefined,
        usePassword: false,
        password: '#LETNUM-MIX-4#',
      } as PDFFile,
    }
  },
  mounted() {
    if (this.currentPDFFile) {
      this.pdfFile = {...this.currentPDFFile}
    }
  },
  methods: {
    savePDFFile() {
      if (this.htmlImageFiles.filter(image => image.isProcessed === false).length) {
        this.$buefy.dialog.confirm({
          'message': `You haven't set all the images that are used in selected html file, are you sure to add the PDF?`,
          onConfirm: () => {
            if (this.isEdited) {
              this.currentPDFFiles[this.currentPDFFiles.indexOf(this.currentPDFFile)] = this.pdfFile;
            } else {
              this.currentPDFFiles.push(this.pdfFile)
            }
            this.$emit('close')
          },
        })
      } else {
        if (this.isEdited) {
          this.currentPDFFiles[this.currentPDFFiles.indexOf(this.currentPDFFile)] = this.pdfFile;
        } else {
          this.currentPDFFiles.push(this.pdfFile)
        }
        this.$emit('close')
      }
    },
    attachImage(oldImage: HTMLImage, newImage: HTMLImage) {
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
        component: PDFImageModal,
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
    checkHTMLBody(file: File) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.pdfFile.htmlContent = (e.target?.result as string);
        this.pdfFile.filename = file.name.split('.')[0] + '.pdf';
        const images = this.pdfFile.htmlContent.match(/(<img\s+(?:[^>]*\n)*[^>]*src=["'](?:#local_image#|http)(?:[^>]*\n)*[^>]*>)/g)
        if (images) {
          this.pdfFile.bodyHTMLImages = images.map((img: string) => this.parseImgTag(img))
        } else {
          this.pdfFile.bodyHTMLImages = undefined;
        }
      };
      reader.readAsText(file)
    },
    parseImgTag(img: string): Partial<HTMLImage> {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = img;

      const imgElement = tempDiv.querySelector('img');
      if (!imgElement) throw new Error('Internal Bug');

      let src = imgElement.getAttribute('src') || '';
      const alt = imgElement.getAttribute('alt') || '';
      const width = Number(imgElement.getAttribute('width')) || undefined;

      return {
        isInline: false,
        src,
        alt,
        width,
        imgTag: img,
        isProcessed: /^https?:\/\//i.test(src)
      };
    },
  },
  watch: {},
  computed: {
    htmlImageFiles() {
      return this.pdfFile.bodyHTMLImages?.filter(image => !image.src?.startsWith('http')) || [];
    },
    htmlImageUrls() {
      return this.pdfFile.bodyHTMLImages?.filter(image => image.src?.startsWith('http')) || [];
    },
  },
})
</script>

<template>
  <form @submit.prevent="savePDFFile">
    <div class="modal-card is-large">
      <header class="modal-card-head">
        <p class="modal-card-title">{{isEdited?'Edit':'New'}} PDF</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">
        <b-upload v-if="!pdfFile.htmlFile" v-model="pdfFile.htmlFile" @update:modelValue="checkHTMLBody" drag-drop
                  accept="text/html"
                  expanded>
          <section class="section py-5">
            <div class="content has-text-centered">
              <p>
                <b-icon :icon="pdfFile.htmlFile == null ? 'upload' : 'language-html5'"
                        size="is-large"></b-icon>
              </p>
              <p>Drop your HTML file here or click to upload</p>
            </div>
          </section>
        </b-upload>

        <div v-else>
          <b-field grouped label="Attachment Name" label-position="on-border">
            <b-input v-model="pdfFile.filename" expanded/>
            <b-field class="is-align-content-center">
              <button class="delete" @click="pdfFile.htmlFile = undefined;"/>
            </b-field>
          </b-field>
          <b-field v-if="htmlImageFiles.length" label="Html Image Files">
            <ul v-auto-animate>
              <li v-for="(image, index) in htmlImageFiles" :key="index" :title="image.alt"
                  @click="editImage(image)" :class="{'is-success': image.isProcessed, 'is-warning': !image.isProcessed}"
                  class="tag button is-block mb-1 py-0 is-flex is-justify-content-space-between">
                <span>{{ image.filename || image.src }}</span>
                <span><template v-if="image.width">Size: {{ image.width }}</template></span>
              </li>
            </ul>
          </b-field>
          <b-field v-if="htmlImageUrls.length" label="Html Image URLs">
            <ul v-auto-animate>
              <li v-for="(image, index) in htmlImageUrls" :key="index" :title="image.alt"
                  @click="editImage(image)" :class="{'is-success': image.isProcessed, 'is-warning': !image.isProcessed}"
                  class="tag button is-block mb-1 py-0 is-flex is-justify-content-space-between">
                <span>{{ image.filename || image.src }}</span>
                <span><template v-if="image.width">Size: {{ image.width }}</template></span>
              </li>
            </ul>
          </b-field>
          <b-field>
            <template #label>
              <div class="is-flex is-flex-grow-1 is-justify-content-space-between cursor-pointer" :class="{'has-text-grey': !pdfFile.usePassword}">
                Use Password
                <b-switch v-model="pdfFile.usePassword"></b-switch>
              </div>
            </template>
            <b-collapse animation="slide" v-model="pdfFile.usePassword">
              <b-input v-model="pdfFile.password" />
            </b-collapse>
          </b-field>
        </div>

      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')"/>
        <b-button :disabled="!pdfFile.htmlFile" label="Save" @click.prevent="savePDFFile" class="is-primary"/>
      </footer>
    </div>
  </form>
</template>
