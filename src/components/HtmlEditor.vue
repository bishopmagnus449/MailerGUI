<script lang="ts">
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import {createLowlight} from 'lowlight'
import CodeBlockComponent from '~/src/components/CodeBlockComponent.vue'

const lowlight = createLowlight()
lowlight.register({html})
lowlight.register({css})
lowlight.register({js})
lowlight.register({ts})

export default {
  name: "HtmlEditor",
  props: {
    modelValue: {type: String, default: ""}
  },
  emits: ['attachedImage', 'update:modelValue'],
  data() {
    let isHtml = false;
    if (this.modelValue.length > 0) {
      isHtml = true;
    }
    return {
      isHtml: isHtml,

      isDraggingImageSelect: false,
      isDraggingHtmlSelect: false,

      addImageModal: false,
      newImage: {} as {
        cid: string,
        file: File,
        isInline: boolean,
        url: string,
        filename: string,
        width: number,
        filetype: string
      },

      editor: useEditor({
        content: isHtml ? `<pre><code class="language-html">${encodeDecodeHTML(this.modelValue)}</code></pre>` : this.modelValue,
        extensions: [
          TiptapStarterKit.configure(
              {codeBlock: false}
          ),
          TiptapHighlight,
          TiptapTextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          TiptapCodeBlockLowlight.extend({
            addNodeView() {
              return TiptapVueNodeViewRenderer(CodeBlockComponent)
            },
          }).configure({lowlight}),
          TiptapPlaceholder.configure({
            placeholder: 'Type your message or drag-and-drop your html file here!',
          }),
          TiptapImage.configure({
            allowBase64: true,
          }),
        ],
        onUpdate: ({editor}) => {
          let content = editor.getHTML();
          let matches = content.match(/^<pre><code class="language-html">(.*)<\/code><\/pre>$/s)
          if (matches) {
            content = encodeDecodeHTML(matches[1], false);
          }
          this.$emit('update:modelValue', content)
        },
      }),
    }
  },
  beforeUnmount() {
    this.editor?.destroy();
  },

  computed: {
    imagePreviewUrl() {
      let blob = URL.createObjectURL(this.newImage.file);
      let image = new Image();
      image.onload = () => {
        this.newImage.width = image.width;
        this.newImage.filename = this.newImage.file.name;
        this.newImage.filetype = this.newImage.file.type;
      };
      image.src = blob;

      return blob;
    },
  },

  methods: {
    log(event: any) {
      console.log(event)
    },
    handleDragLeave(event: DragEvent, draggingVariable: string) {
      // @ts-ignore
      if (event.target === event.currentTarget || !event.target.contains(event.currentTarget)) {
        // @ts-ignore
        this[draggingVariable] = false;
      }
    },
    handleHtmlFileDrop(file: File) {
      const reader = new FileReader;
      reader.onload = (e: ProgressEvent<FileReader>) => {
        let content: any = e.target?.result || '';
        this.$emit('update:modelValue', content)
        if (this.isHtml) {
          content = `<pre><code class="language-html">${encodeDecodeHTML(content)}</code></pre>`;
        }
        this.editor?.commands.setContent(content);
      }
      reader.readAsText(file)
    },
    toggleHtml() {
      let content;

      if (this.isHtml) {
        content = this.editor?.getHTML() || '';
        let matches = content.match(/^<pre><code class="language-html">(.*)<\/code><\/pre>$/s)
        if (matches) {
          content = encodeDecodeHTML(matches[1], false);
        }
      } else {
        content = `<pre><code class="language-html">${encodeDecodeHTML(this.editor?.getHTML() || '')}</code></pre>`;
      }
      this.editor?.commands.setContent(content);

      this.isHtml = !this.isHtml;
    },
    attachImage() {
      this.$emit('attachedImage', this.newImage)
      this.$buefy.toast.open('Image Attached')
      return true
    },
    resetImage() {
      // @ts-ignore
      this.newImage = {};
      return true
    }
  },
}
</script>

<template>
  <div>
    <b-button v-if="isHtml && !isDraggingHtmlSelect" label="HTML" @click="toggleHtml" type="is-primary"></b-button>
    <div v-if="editor && !isHtml && !isDraggingHtmlSelect" class="tiptap-toolbar has-background-white py-2">
      <b-field>
        <b-button label="HTML" @click="toggleHtml"></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field>
        <b-button icon-left="format-bold" title="Bold"
                  @click="editor.chain().focus().toggleBold().run()"
                  :disabled="!editor.can().chain().focus().toggleBold().run()"
                  :class="{ 'is-primary': editor.isActive('bold') }"
        ></b-button>
        <b-button icon-left="format-italic" title="Italic"
                  @click="editor.chain().focus().toggleItalic().run()"
                  :disabled="!editor.can().chain().focus().toggleItalic().run()"
                  :class="{ 'is-primary': editor.isActive('italic') }"
        ></b-button>
        <b-button icon-left="format-strikethrough" title="Strike Through"
                  @click="editor.chain().focus().toggleStrike().run()"
                  :disabled="!editor.can().chain().focus().toggleStrike().run()"
                  :class="{ 'is-primary': editor.isActive('strike') }"
        ></b-button>
        <b-button icon-left="code-tags" title="Code"
                  @click="editor.chain().focus().toggleCode().run()"
                  :disabled="!editor.can().chain().focus().toggleCode().run()"
                  :class="{ 'is-primary': editor.isActive('code') }"
        ></b-button>
        <b-button icon-left="format-paragraph" title="Paragraph"
                  @click="editor.chain().focus().setParagraph().run()"
                  :class="{ 'is-primary': editor.isActive('paragraph') }"
        ></b-button>
        <b-button icon-left="code-block-tags" title="Code Block"
                  @click="editor.chain().focus().toggleCodeBlock().run()"
                  :class="{ 'is-primary': editor.isActive('codeBlock') }"
        ></b-button>
        <b-button icon-left="comment-quote-outline" title="Blockquote"
                  @click="editor.chain().focus().toggleBlockquote().run()"
                  :class="{ 'is-primary': editor.isActive('blockquote') }"
        ></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field>
        <b-button icon-left="image-plus" title="Add Image"
                  @click="addImageModal = true"></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field>
        <b-button icon-left="format-header-1" title="H1"
                  @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                  :class="{ 'is-primary': editor.isActive('heading', { level: 1 }) }"
        ></b-button>
        <b-button icon-left="format-header-2" title="H2"
                  @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                  :class="{ 'is-primary': editor.isActive('heading', { level: 2 }) }"
        ></b-button>
        <b-button icon-left="format-header-3" title="H3"
                  @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                  :class="{ 'is-primary': editor.isActive('heading', { level: 3 }) }"
        ></b-button>
        <b-button icon-left="format-header-4" title="H4"
                  @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
                  :class="{ 'is-primary': editor.isActive('heading', { level: 4 }) }"
        ></b-button>
        <b-button icon-left="format-header-5" title="H5"
                  @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
                  :class="{ 'is-primary': editor.isActive('heading', { level: 5 }) }"
        ></b-button>
        <b-button icon-left="format-header-6" title="H6"
                  @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
                  :class="{ 'is-primary': editor.isActive('heading', { level: 6 }) }"
        ></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field>
        <b-button icon-left="format-list-bulleted" title="Bullet List"
                  @click="editor.chain().focus().toggleBulletList().run()"
                  :class="{ 'is-primary': editor.isActive('bulletList') }"
        ></b-button>
        <b-button icon-left="format-list-numbered" title="Ordered List"
                  @click="editor.chain().focus().toggleOrderedList().run()"
                  :class="{ 'is-primary': editor.isActive('orderedList') }"
        ></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field>
        <b-button icon-left="format-align-left" title="Left"
                  @click="editor.chain().focus().setTextAlign('left').run()"
                  :class="{ 'is-primary': editor.isActive({ textAlign: 'left' }) }"></b-button>
        <b-button icon-left="format-align-left" title="Left"
                  @click="editor.chain().focus().setTextAlign('center').run()"
                  :class="{ 'is-primary': editor.isActive({ textAlign: 'center' }) }"></b-button>
        <b-button icon-left="format-align-right" title="Right"
                  @click="editor.chain().focus().setTextAlign('right').run()"
                  :class="{ 'is-primary': editor.isActive({ textAlign: 'right' }) }"></b-button>
        <b-button icon-left="format-align-justify" title="Justify"
                  @click="editor.chain().focus().setTextAlign('justify').run()"
                  :class="{ 'is-primary': editor.isActive({ textAlign: 'justify' }) }"></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field grouped>
        <b-button icon-left="format-text" title="Clear Marks"
                  @click="editor.chain().focus().unsetAllMarks().run()"></b-button>
        <b-button icon-left="text-box-remove-outline" title="Clear Nodes"
                  @click="editor.chain().focus().clearNodes().run()"></b-button>
        <b-button icon-left="minus" title="Horizontal Line"
                  @click="editor.chain().focus().setHorizontalRule().run()"></b-button>
        <b-button icon-left="arrow-down-right" title="Break"
                  @click="editor.chain().focus().setHardBreak().run()"></b-button>
      </b-field>

      <i class="vertical"></i>

      <b-field>
        <b-button icon-left="undo" title="Undo"
                  @click="editor.chain().focus().undo().run()"
                  :disabled="!editor.can().chain().focus().undo().run()"
        ></b-button>
        <b-button icon-left="redo" title="Redo"
                  @click="editor.chain().focus().redo().run()"
                  :disabled="!editor.can().chain().focus().redo().run()"
        ></b-button>
      </b-field>
    </div>

    <b-field grouped @dragenter="isDraggingHtmlSelect = true"
             @drop="isDraggingHtmlSelect = false"
             @dragleave="(event: DragEvent) => handleDragLeave(event, 'isDraggingHtmlSelect')">
      <b-field v-if="isDraggingHtmlSelect" expanded>
        <b-upload accept="text/plain, text/html, text/htm" @update:modelValue="handleHtmlFileDrop"
                  expanded
                  drag-drop>
          <section class="section" >
            <div class="content has-text-centered">
              <p>
                <b-icon
                    icon="upload"
                    size="is-large">
                </b-icon>
              </p>
              <p>Drop your html file here</p>
            </div>
          </section>
        </b-upload>
      </b-field>
      <b-field v-else expanded>
        <TiptapEditorContent :editor="editor"/>
      </b-field>
    </b-field>


    <b-modal v-model="addImageModal"
             has-modal-card
             destroy-on-hide
             aria-role="dialog"
             aria-label="Example Modal"
             close-button-aria-label="Cancel"
             aria-modal>
      <template #default="props">
        <form action="">
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Attach Image</p>
              <button
                  type="button"
                  class="delete"
                  @click="props.close"/>
            </header>
            <section class="modal-card-body" @dragenter="isDraggingImageSelect = true"
                     @drop="isDraggingImageSelect = false"
                     @dragleave="(event: DragEvent) => handleDragLeave(event, 'isDraggingImageSelect')">
              <b-field v-if="isDraggingImageSelect">
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
                            <button type="button" class="delete" @click.prevent="resetImage"></button>
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

              <b-field grouped v-if="newImage.file">
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

              <b-field v-if="newImage.file" label="Preview">
                <img :alt="newImage.filename" :src="imagePreviewUrl" :width="newImage.width"></img>
              </b-field>


            </section>
            <footer class="modal-card-foot">
              <b-button
                  label="Cancel"
                  @click="resetImage() && props.close()"/>
              <b-button
                  label="Add"
                  type="is-primary"
                  @click="attachImage() && props.close()"/>
            </footer>
          </div>
        </form>
      </template>
    </b-modal>
  </div>

</template>

<style scoped lang="scss">
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 10;

  i.vertical {
    border-right: 1px dotted rgb(0 0 0 / 60%);
    height: 34px;
    margin: 3px;
  }

  button {
    .icon {
      font-size: 1.2rem;
    }
  }
}

</style>

<style lang="scss">
:root {
  --white: #FFF;
  --black: #2E2B29;
  --black-contrast: #110F0E;
  --gray-1: rgba(61, 37, 20, .05);
  --gray-2: rgba(61, 37, 20, .08);
  --gray-3: rgba(61, 37, 20, .12);
  --gray-4: rgba(53, 38, 28, .3);
  --gray-5: rgba(28, 25, 23, .6);
  --green: #22C55E;
  --purple: #6A00F5;
  --purple-contrast: #5800CC;
  --purple-light: rgba(88, 5, 255, .05);
  --yellow-contrast: #FACC15;
  --yellow: rgba(250, 204, 21, .4);
  --yellow-light: #FFFAE5;
  --red: #FF5C33;
  --red-light: #FFEBE5;
  --shadow: 0px 12px 33px 0px rgba(0, 0, 0, .06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, .04);
}

/* Basic editor styles */
.tiptap {
  min-height: 300px;
  margin-top: 2px;

  &:focus-within {
    outline: 1px solid #cdcdcd;
  }

  :first-child {
    margin-top: 0;
  }

  p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  mark {
    background-color: #FAF594;
    border-radius: 0.4rem;
    box-decoration-break: clone;
    padding: 0.1rem 0.3rem;
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }

    /* Code styling */
    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #f98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #fbbc88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #b9f18d;
    }

    .hljs-title,
    .hljs-section {
      color: #faf594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70cff8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }
}
</style>