<script setup lang="ts">
import {useWebSocket} from "@vueuse/core";
import {type WebsocketLog} from "@/src/types/types";

const history = ref<WebsocketLog[]>([])

function addToHistory(log: WebsocketLog) {
  history.value.push(log);
  if (history.value.length > 300) {
    history.value.shift();
  }
}

addToHistory({type: 'info', message: 'Connecting to websocket...'})

const {data} = useWebSocket(`ws://${location.host}/api/websocket`, {
  autoReconnect: true,
  onDisconnected() {
    addToHistory({type: 'warning', message: 'Disconnected from WebSocket, reconnecting...'})
  },
  onConnected() {
    addToHistory({type: 'success', message: 'Connected to WebSocket'})
  }})
const progress = ref<number>(undefined);
const remaining = ref<number>(undefined);


watch(data, async (newValue: string) => {
  const log: WebsocketLog = JSON.parse(newValue);
  if (log.type == 'progress') {
    progress.value = log.message;
    remaining.value = Math.max(log.options.remainingCount - 1, 0);
    return;
  }
  else if (log.type == 'reset') {
    progress.value = undefined;
    history.value = [];
    remaining.value = 0;
    return;
  }
  addToHistory(log);
  const logger = document.querySelector('.logger');
  if (logger) {
    setTimeout(async () => logger.scrollTop = logger.scrollHeight, 1)
  }
})

</script>

<template>
  <div class="is-flex-grow-1 is-flex is-flex-direction-column mb-6">
    <div class="logger mb-2 is-flex-grow-1 has-background-black has-text-white is-family-monospace px-5 py-3">
      <p :class="`has-text-${log.type}`" :key="index" v-for="(log, index) in history"><span class="has-text-white user-select-none">> </span>{{ log.message }}</p>
    </div>
    <b-progress type="is-primary" :value="progress"  show-value format="percent">{{ !progress ? '' : `${progress}% | Remaining: ${remaining}`}}</b-progress>
  </div>

</template>
