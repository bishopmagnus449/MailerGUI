<script lang="ts">
import {defineComponent} from 'vue';
import {type PDFFile} from "~/src/types/types";
import PDFFileLoaderModal from "./PDFFileLoaderModal.vue";

export default defineComponent({
  name: "PDFFilesModal",
  props: {
    currentPDFFiles: {type: Array<PDFFile>, required: true},
  },
  data() {
    return {}
  },
  mounted() {

  },
  computed: {},
  methods: {
    savePDFFiles() {},
    newPDFFile() {
      this.$buefy.modal.open({
        parent: this,
        component: PDFFileLoaderModal,
        hasModalCard: true,
        trapFocus: true,
        props: {
          currentPDFFiles: this.currentPDFFiles,
        }
      })
    },
    editPDFFile(currentPDFFile: PDFFile) {
      this.$buefy.modal.open({
        parent: this,
        component: PDFFileLoaderModal,
        hasModalCard: true,
        trapFocus: true,
        props: {
          currentPDFFile,
          currentPDFFiles: this.currentPDFFiles,
          isEdited: true,
        }
      })
    },
    deletePDFFile(pdfFile: PDFFile) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure to delete the PDF from the list?',
        onConfirm: () => {
          this.currentPDFFiles.splice(this.currentPDFFiles.indexOf(pdfFile), 1)
          this.$buefy.snackbar.open('PDF deleted!')
        },
        confirmText: 'Delete',
        type: 'is-danger',
      })
    }
  },
  watch: {},
})
</script>

<template>
  <form @submit.prevent="savePDFFiles">
    <div class="modal-card is-large">
      <header class="modal-card-head">
        <p class="modal-card-title">Html to PDF</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">
        <b-field>
          <b-button @click="newPDFFile" icon-left="book-plus" type="is-info" title="New PDF File"/>
        </b-field>

        <b-table
            :data="currentPDFFiles"
            striped
            draggable
            hoverable>

          <b-table-column field="filename" label="File Name" v-slot="props">
            {{ props.row.filename }}
          </b-table-column>

          <b-table-column field="filename" label="Options" v-slot="props">

            <b-field>
              <b-button class="mr-1" @click="editPDFFile(props.row)" icon-left="pencil"></b-button>
              <b-button @click="deletePDFFile(props.row)" icon-left="delete" type="is-danger"></b-button>
            </b-field>

          </b-table-column>

          <template #empty>
            <div class="is-align-items-center is-flex is-justify-content-center">
              No PDF files added yet, Click
              <b-button class="mx-2" @click="newPDFFile" icon-left="book-plus" type="is-info" title="New PDF File"/>
              to start.
            </div>
          </template>
        </b-table>

      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')"/>
      </footer>
    </div>
  </form>
</template>
