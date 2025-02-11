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
const estimated = ref<string>('');
const elapsed = ref<string>('');


watch(data, async (newValue: string) => {
  const log: WebsocketLog = JSON.parse(newValue);
  if (log.type == 'progress') {
    progress.value = log.message;
    remaining.value = log.options ? Math.max(log.options.remainingCount - 1, 0) : 0;
    estimated.value = log.options?.estimated;
    elapsed.value = log.options?.elapsedTime;
    if (progress.value == '100') {
      remaining.value = 0;
    }
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
    <b-progress type="is-primary" :value="progress"  show-value format="percent">{{ typeof progress !== "number" ? '' : `${progress}% | Remaining: ${remaining}`}}</b-progress>
    <div class="is-flex">
      <p v-if="elapsed" class="is-capitalized has-text-dark has-text-weight-bold user-select-none mr-2">Elapsed: <span class="has-text-grey has-text-weight-normal">{{elapsed}}</span></p>
      <p v-if="estimated" class="is-capitalized has-text-dark has-text-weight-bold user-select-none">Estimated: <span class="has-text-grey has-text-weight-normal">{{estimated}}</span></p>
    </div>
  </div>

</template>
