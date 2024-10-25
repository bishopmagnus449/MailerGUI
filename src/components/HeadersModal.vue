<script lang="ts">
import {defineComponent} from 'vue';
import {camelToNormal, dashToNormal} from "~/utils/strings";

export default defineComponent({
  name: "HeadersModal",
  props: {
    currentHeaders: {type: Object, required: true},
  },
  data() {
    return {
      emailHeaders: {
        'Date': 'date',
        'Reply-To': 'text',
        'In-Reply-To': 'text',
        'References': 'text',
        'Comments': 'text',
        'Keywords': 'text',
        'Priority': 'select',
        'Content-Language': 'text',
        'MIME-Version': 'text',
        'dkim': 'object',
      } as { [key: string]: string },
      headerOptions: {
        'Priority': ['high', 'normal', 'low'],
        'dkim': ['domainName', 'keySelector', 'privateKey'],
      } as { [key: string]: string[] },
      headersFields: {} as { [key: string]: string },
      alwaysUndefined: -1,
      newHeaders: {headers: {}} as any,
    }
  },
  mounted() {
    for (const header in this.currentHeaders) {
      if (header == 'headers') {
        for (const key in this.currentHeaders.headers) {
          this.headersFields[key] = this.emailHeaders[key];
        }
      } else {
        this.headersFields[header] = this.emailHeaders[header];
      }
    }
    this.newHeaders = {...this.currentHeaders};
    this.newHeaders.headers = {...(this.newHeaders.headers || {})};
  },
  computed: {
    availableHeaders() {
      const headers = {} as any;
      for (const header in this.emailHeaders) {
        if (!this.headersFields[header]) {
          headers[header] = this.emailHeaders[header];
        }
      }
      return headers
    },
  },
  methods: {
    dashToNormal,
    camelToNormal,
    deleteHeader(header: any) {
      if (this.emailHeaders[header] == 'object'){
        delete this.newHeaders[header];
      }
      else {
        delete this.newHeaders.headers[header];
      }
      delete this.headersFields[header];
    },
    addHeader(header: any) {
      this.headersFields[header.name] = header.type;
      if (header.type == 'object') {
        this.newHeaders[header.name] = {}
      }
      setTimeout(() => this.alwaysUndefined = -1, 1);
    },
    saveHeaders() {
      const form: HTMLFormElement = this.$el;
      if (form.checkValidity()) {
        for (const header in this.newHeaders) {
          console.log(header)
          this.currentHeaders[header] = this.newHeaders[header]
          console.log(this.currentHeaders)
        }
        this.$emit('close');
      } else {
        form.reportValidity();
      }
    },
  },
  watch: {},
})
</script>

<template>
  <form @submit.prevent="saveHeaders">
    <div class="modal-card is-large">
      <header class="modal-card-head">
        <p class="modal-card-title">Headers</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">
        <b-select :disabled="Object.keys(availableHeaders).length == 0" expanded v-model="alwaysUndefined"
                  class="mb-6 is-sticky-top"
                  placeholder="Add new header"
                  @update:modelValue="addHeader">
          <option value="-1" disabled class="is-hidden">
            {{ Object.keys(availableHeaders).length == 0 ? 'All headers added' : 'Add new header' }}
          </option>
          <option :key="index"
                  :value="{name:header, type}"
                  v-for="(type, header, index) in availableHeaders">{{ dashToNormal(header.toString()) }}
          </option>
        </b-select>
        <template v-for="(type, header) in headersFields">
          <b-field :label="dashToNormal(header.toString())" label-position="on-border" class="is-capitalized">
            <b-field v-if="type == 'object'" class="is-flex-grow-1" grouped group-multiline>
              <template v-for="option in headerOptions[header]">
                <b-input :placeholder="camelToNormal(option)" required expanded v-model="newHeaders[header][option]"/>
                <br>
              </template>
            </b-field>

            <b-field v-else class="is-flex-grow-1 mr-3">
              <b-input required expanded v-if="type == 'text'" v-model="newHeaders.headers[header]"/>
              <b-datepicker required expanded inline v-if="type == 'date'" v-model="newHeaders.headers[header]"/>
              <b-select required expanded v-if="type == 'select'" v-model="newHeaders.headers[header]">
                <option v-for="option in headerOptions[header]">{{ option }}</option>
              </b-select>
            </b-field>


            <b-button
                icon-left="close"
                @click="deleteHeader(header)"/>
          </b-field>
        </template>
      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')"/>
        <b-button label="Save" @click.prevent="saveHeaders" class="is-primary"/>
      </footer>
    </div>
  </form>
</template>

<style scoped lang="scss">

</style>