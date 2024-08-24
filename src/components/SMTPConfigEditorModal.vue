<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "SMTPConfigEditorModal",
  props: {
    config: {type: Object, required: true},
    configs: {type: Array<any>, required: true},
    isEdited: {type: Boolean, default: false},
  },

  data() {
    return {
      currentConfig: {...this.config} as {host: string, port: number, user: string, pass: string, from: string}
    }
  },

  methods: {
    saveConfig() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity()
        return false
      }
      if (this.isEdited) {
        this.configs[this.configs.indexOf(this.config)] = this.currentConfig
      } else {
        this.configs.push(this.currentConfig)
      }
      this.$emit('close')
    },
  },

})
</script>

<template>
  <form action="" ref="form">
    <div class="modal-card is-large">
      <header class="modal-card-head">
        <p class="modal-card-title">SMTP Config</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
      </header>
      <section class="modal-card-body">

        <b-field grouped>
          <b-field label="Host" label-position="on-border" expanded>
            <b-input icon="server" v-model="currentConfig.host" required></b-input>
          </b-field>

          <b-field label="Port" label-position="on-border" class="port-field is-flex-shrink-4">
            <b-input icon="numeric" v-model="currentConfig.port" type="number" required></b-input>
          </b-field>
        </b-field>

        <b-field label="Username" label-position="on-border">
          <b-input icon="account" v-model="currentConfig.user" required></b-input>
        </b-field>

        <b-field label="Password" label-position="on-border">
          <b-input icon="lock" v-model="currentConfig.pass" type="password" required password-reveal></b-input>
        </b-field>

        <b-field label="From Address" label-position="on-border">
          <b-input icon="email" v-model="currentConfig.from" type="email" required></b-input>
        </b-field>

      </section>
      <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')"/>
        <b-button
            @click="saveConfig"
            :label="isEdited ? 'Save Changes' : 'Add'"
            type="is-primary"/>
      </footer>
    </div>
  </form>
</template>

<style scoped lang="scss">
.port-field {
  width: 120px;
}
</style>