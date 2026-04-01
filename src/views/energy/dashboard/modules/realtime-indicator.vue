<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

interface Props {
  connected: boolean;
  lastUpdate?: Date | null;
}

const props = defineProps<Props>();

const statusText = computed(() => (props.connected ? 'realtime' : 'offline'));
const statusColor = computed(() => (props.connected ? 'bg-green-500' : 'bg-red-500'));

const timeSinceUpdate = computed(() => {
  if (!props.lastUpdate) return '';
  const seconds = Math.floor((Date.now() - props.lastUpdate.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
});
</script>

<template>
  <div class="realtime-indicator flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
    <span :class="statusColor" class="h-2 w-2 animate-pulse rounded-full" />
    <span>{{ statusText }}</span>
    <span v-if="timeSinceUpdate" class="text-gray-400">{{ timeSinceUpdate }}</span>
  </div>
</template>

<style scoped>
.realtime-indicator {
  font-size: 12px;
}
</style>
