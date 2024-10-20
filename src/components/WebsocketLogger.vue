<script setup lang="ts">
import {useWebSocket} from "@vueuse/core";
import {type WebsocketLog} from "@/src/types/types";

const history = ref<WebsocketLog[]>([])
history.value.push({type: 'info', message: 'Connecting to websocket...'})

const {data} = useWebSocket(`ws://${location.host}/api/websocket`)
const progress = ref<number>(undefined);


watch(data, (newValue: string) => {
  const log: WebsocketLog = JSON.parse(newValue);
  if (log.type == 'progress') {
    progress.value = log.message;
    return;
  }
  else if (log.type == 'reset') {
    progress.value = undefined;
    history.value = [];
    return;
  }
  history.value.push(log);
  const logger = document.querySelector('.logger');
  if (logger) {
    logger.scrollTop = logger.scrollHeight;
  }
})

</script>

<template>
  <div class="is-flex-grow-1 is-flex is-flex-direction-column mb-6">
    <div class="logger mb-2 is-flex-grow-1 has-background-black has-text-white is-family-monospace px-5 py-3">
      <p :class="`has-text-${log.type}`" :key="index" v-for="(log, index) in history"><span class="has-text-white user-select-none">> </span>{{ log.message }}</p>
    </div>
    <b-progress type="is-primary" :value="progress"  show-value format="percent" />
  </div>

</template>

<style scoped lang="scss">

</style>