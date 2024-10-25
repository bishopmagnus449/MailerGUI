<script lang="ts">
import {defineComponent} from 'vue'
import HtmlEditor from "~/src/components/HtmlEditor.vue";
import AttachImage from '~/src/components/AttachImageModal.vue'
import HeadersModal from "~/src/components/HeadersModal.vue";
import {type Attachment, type HTMLImage, type Message} from "../types/types";
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  Base64UploadAdapter,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Markdown,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo,
  type EditorConfig
} from 'ckeditor5';


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
    this.currentMessage.headers = this.currentMessage.headers || {};

    this.editorConfig = {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'sourceEditing',
          'showBlocks',
          'findAndReplace',
          '|',
          'heading',
          '|',
          {
            items: [
              'fontSize',
              'fontFamily',
              'fontColor',
              'fontBackgroundColor'
            ],
            icon: 'text',
            label: 'Font Options'
          },
          '|',
          'bold',
          'italic',
          'code',
          'removeFormat',
          {
            items: [
              'underline',
              'strikethrough',
              'subscript',
              'superscript'
            ],
            label: 'More Text Options'
          },
          '|',
          'specialCharacters',
          'horizontalLine',
          'link',
          'insertImage',
          'insertImageViaUrl',
          'insertTable',
          'highlight',
          'codeBlock',
          'htmlEmbed',
          '|',
          'alignment',
          '|',
          'bulletedList',
          'numberedList',
          'outdent',
          'indent'
        ],
        shouldNotGroupWhenFull: true,
      },

      plugins: [
        AccessibilityHelp,
        Alignment,
        Autoformat,
        AutoImage,
        AutoLink,
        Autosave,
        BalloonToolbar,
        Base64UploadAdapter,
        Bold,
        Code,
        CodeBlock,
        Essentials,
        FindAndReplace,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        FullPage,
        GeneralHtmlSupport,
        Heading,
        Highlight,
        HorizontalLine,
        HtmlComment,
        HtmlEmbed,
        ImageBlock,
        ImageCaption,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUpload,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        Markdown,
        Paragraph,
        PasteFromMarkdownExperimental,
        PasteFromOffice,
        RemoveFormat,
        SelectAll,
        ShowBlocks,
        SourceEditing,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Style,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        TextTransformation,
        Underline,
        Undo
      ],
      balloonToolbar: ['bold', 'italic', 'link', '|', {
        items: ['fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',],
        icon: 'text',
        label: 'Font Options'
      }, '|', 'bulletedList', 'numberedList'],
      fontFamily: {
        supportAllValues: true
      },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
      },
      heading: {
        options: [
          {
            model: 'paragraph',
            title: 'Paragraph',
            class: 'ck-heading_paragraph'
          },
          {
            model: 'heading1',
            view: 'h1',
            title: 'Heading 1',
            class: 'ck-heading_heading1'
          },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 2',
            class: 'ck-heading_heading2'
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 3',
            class: 'ck-heading_heading3'
          },
          {
            model: 'heading4',
            view: 'h4',
            title: 'Heading 4',
            class: 'ck-heading_heading4'
          },
          {
            model: 'heading5',
            view: 'h5',
            title: 'Heading 5',
            class: 'ck-heading_heading5'
          },
          {
            model: 'heading6',
            view: 'h6',
            title: 'Heading 6',
            class: 'ck-heading_heading6'
          }
        ]
      },
      htmlSupport: {
        allow: [
          {
            name: /^.*$/,
            styles: true,
            attributes: true,
            classes: true
          }
        ]
      },
      image: {
        toolbar: [
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'imageStyle:inline',
          'imageStyle:wrapText',
          'imageStyle:breakText',
          '|',
          'resizeImage'
        ]
      },
      initialData: 'Editor initialized...',
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: `${location.protocol}//`,
        decorators: {
          toggleDownloadable: {
            mode: 'manual',
            label: 'Downloadable',
            attributes: {
              download: 'file'
            }
          }
        }
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true
        }
      },
      menuBar: {
        isVisible: true
      },
      placeholder: 'Type or paste your message body here!',
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
      },
    };
    this.isLayoutReady = true;
  },
  data() {
    return {
      currentMessage: {...this.message} as Message,
      attachments: [] as File[],
      editor: ClassicEditor,
      editorContent: `<div class="test">hello world</div>`,
      editorConfig: {} as EditorConfig,
      isLayoutReady: false,

    }
  },
  watch: {
    'currentMessage.messageType'(newType, oldType) {
      if (oldType == 'html' && !this.currentMessage.bodyHTMLFile) return;
      if (oldType == 'editor' && (!this.currentMessage.bodyHTMLEditor || this.currentMessage.bodyHTMLEditor == '<p>&nbsp;</p>')) return;
      if (oldType == 'raw' && !this.currentMessage.bodyRawContent) return;

      this.$buefy.dialog.confirm({
        message: 'Reset the current message?',
        onConfirm: this.resetMessage,
        onCancel: () => {
          this.currentMessage.messageType = oldType;
        },
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
      else if (this.currentMessage.messageType == 'editor' && (!this.currentMessage.bodyHTMLEditor || this.currentMessage.bodyHTMLEditor == '<p>&nbsp;</p>')) {
        return false
      }
      return true
    },
  },
  methods: {
    attachImage(oldImage: HTMLImage, newImage: HTMLImage) {
      oldImage.isProcessed = true;
      oldImage.filename = newImage.filename;
      oldImage.file = newImage.file;
      oldImage.width = newImage.width
      oldImage.alt = newImage.alt
      oldImage.isInline = newImage.isInline
      oldImage.content = newImage.content
    },
    onReady(editor: any) {
      // Insert the toolbar before the editable area.
      editor.ui.getEditableElement().parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
      );
    },
    checkRawMessage(rawFile: File) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.currentMessage.bodyRawContent = e.target?.result as string
      }
      reader.readAsText(rawFile)
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
    editHeaders() {
      this.$buefy.modal.open({
        parent: this,
        component: HeadersModal,
        hasModalCard: true,
        trapFocus: true,
        props: {
          currentHeaders: this.currentMessage.headers
        },
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
      this.currentMessage.bodyHTMLEditor = undefined;
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

          <b-radio-button v-model="currentMessage.messageType" expanded
                          native-value="editor"
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

        <b-field label="Local Images"
                 :message="`Click to set images, ${currentMessage.bodyHTMLImages.filter(image => image.isProcessed).length}/${currentMessage.bodyHTMLImages.length}`"
                 v-if="currentMessage.bodyHTMLImages && currentMessage.bodyHTMLImages.length">
          <ul v-auto-animate>
            <li v-for="(image, index) in currentMessage.bodyHTMLImages" :key="index" :title="image.alt"
                @click="editImage(image)" :class="{'is-success': image.isProcessed, 'is-warning': !image.isProcessed}"
                class="tag button is-block mb-1 py-0 is-flex is-justify-content-space-between">
              <span>{{ image.filename || image.src }}</span>
              <span><template v-if="image.width">Size: {{ image.width }}</template></span>
            </li>
          </ul>
        </b-field>

        <b-field label="Body">

          <div v-if="currentMessage.messageType == 'editor'">
            <!--          <html-editor v-model="currentMessage.body" @attached-image="attachImage"></html-editor>-->
            <ckeditor v-if="isLayoutReady" :editor="editor" v-model="currentMessage.bodyHTMLEditor" :config="editorConfig"></ckeditor>
          </div>

          <div v-else-if="currentMessage.messageType == 'html'">
            <b-upload v-model="currentMessage.bodyHTMLFile" @update:modelValue="checkHTMLBody" drag-drop
                      accept="text/html"
                      expanded>
              <section class="section py-5">
                <div class="content has-text-centered">
                  <p>
                    <b-icon :icon="currentMessage.bodyHTMLFile == null ? 'upload' : 'language-html5'"
                            size="is-large"></b-icon>
                  </p>
                  <p v-if="currentMessage.bodyHTMLFile">Selected File: {{ currentMessage.bodyHTMLFile.name }}</p>
                  <p v-else>Drop your HTML file here or click to upload</p>
                </div>
              </section>
            </b-upload>
          </div>

          <div v-else-if="currentMessage.messageType == 'raw'">
            <b-upload v-model="currentMessage.bodyRawFile"
                      @update:modelValue="checkRawMessage"
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
      <footer class="modal-card-foot is-justify-content-space-between">
        <b-field grouped>
          <b-button
              label="Close"
              @click="$emit('close')"/>
          <b-button :disabled="!isValidMessage"
                    @click="saveMessage"
                    :label="isEdited ? 'Save Changes' : 'Add'"
                    type="is-primary"/>
        </b-field>

        <b-field>
          <b-button label="Headers" @click.prevent="editHeaders"/>
        </b-field>
      </footer>
    </div>
  </form>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');

@media print {
  body {
    margin: 0 !important;
  }
}

.main-container {
  font-family: 'Lato';
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.ck-content {
  font-family: 'Lato';
  line-height: 1.6;
  word-break: break-word;
}

.editor-container_classic-editor .editor-container__editor {
  min-width: 795px;
  max-width: 795px;
}

.ck-content h3.category {
  font-family: 'Oswald';
  font-size: 20px;
  font-weight: bold;
  color: #555;
  letter-spacing: 10px;
  margin: 0;
  padding: 0;
}

.ck-content h2.document-title {
  font-family: 'Oswald';
  font-size: 50px;
  font-weight: bold;
  margin: 0;
  padding: 0;
  border: 0;
}

.ck-content h3.document-subtitle {
  font-family: 'Oswald';
  font-size: 20px;
  color: #555;
  margin: 0 0 1em;
  font-weight: bold;
  padding: 0;
}

.ck-content p.info-box {
  --background-size: 30px;
  --background-color: #e91e63;
  padding: 1.2em 2em;
  border: 1px solid var(--background-color);
  background: linear-gradient(
      135deg,
      var(--background-color) 0%,
      var(--background-color) var(--background-size),
      transparent var(--background-size)
  ),
  linear-gradient(
      135deg,
      transparent calc(100% - var(--background-size)),
      var(--background-color) calc(100% - var(--background-size)),
      var(--background-color)
  );
  border-radius: 10px;
  margin: 1.5em 2em;
  box-shadow: 5px 5px 0 #ffe6ef;
}

.ck-content blockquote.side-quote {
  font-family: 'Oswald';
  font-style: normal;
  float: right;
  width: 35%;
  position: relative;
  border: 0;
  overflow: visible;
  z-index: 1;
  margin-left: 1em;
}

.ck-content blockquote.side-quote::before {
  content: '“';
  position: absolute;
  top: -37px;
  left: -10px;
  display: block;
  font-size: 200px;
  color: #e7e7e7;
  z-index: -1;
  line-height: 1;
}

.ck-content blockquote.side-quote p {
  font-size: 2em;
  line-height: 1;
}

.ck-content blockquote.side-quote p:last-child:not(:first-child) {
  font-size: 1.3em;
  text-align: right;
  color: #555;
}

.ck-content span.marker {
  background: yellow;
}

.ck-content span.spoiler {
  background: #000;
  color: #000;
}

.ck-content span.spoiler:hover {
  background: #000;
  color: #fff;
}

.ck-content pre.fancy-code {
  border: 0;
  margin-left: 2em;
  margin-right: 2em;
  border-radius: 10px;
}

.ck-content pre.fancy-code::before {
  content: '';
  display: block;
  height: 13px;
  background: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NCAxMyI+CiAgPGNpcmNsZSBjeD0iNi41IiBjeT0iNi41IiByPSI2LjUiIGZpbGw9IiNGMzZCNUMiLz4KICA8Y2lyY2xlIGN4PSIyNi41IiBjeT0iNi41IiByPSI2LjUiIGZpbGw9IiNGOUJFNEQiLz4KICA8Y2lyY2xlIGN4PSI0Ny41IiBjeT0iNi41IiByPSI2LjUiIGZpbGw9IiM1NkM0NTMiLz4KPC9zdmc+Cg==);
  margin-bottom: 8px;
  background-repeat: no-repeat;
}

.ck-content pre.fancy-code-dark {
  background: #272822;
  color: #fff;
  box-shadow: 5px 5px 0 #0000001f;
}

.ck-content pre.fancy-code-bright {
  background: #dddfe0;
  color: #000;
  box-shadow: 5px 5px 0 #b3b3b3;
}
</style>