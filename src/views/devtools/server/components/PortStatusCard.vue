<script setup lang="ts">
import { computed } from 'vue';
import type { PortInfo } from '@/typings/api/devtools';
import StatusCard from './StatusCard.vue';

const PortIcon = 'mdi:lan-connect';

interface Props {
  ports: PortInfo[];
}

const props = withDefaults(defineProps<Props>(), {
  ports: () => []
});

const listeningCount = computed(() => {
  return props.ports.filter(p => p.status === 'listening').length;
});
</script>

<template>
  <StatusCard title="服务端口" :icon="PortIcon">
    <div class="space-y-3">
      <div class="flex items-center justify-between border-b border-gray-100 pb-2">
        <span class="text-sm text-gray-600 font-medium">端口监控</span>
        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1">
            <div class="h-2 w-2 rounded-full bg-green-500"></div>
            <span class="text-gray-500">正常</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="h-2 w-2 rounded-full bg-gray-300"></div>
            <span class="text-gray-500">未监听</span>
          </div>
        </div>
      </div>

      <div class="max-h-40 overflow-y-auto space-y-2">
        <div
          v-for="port in ports"
          :key="port.port"
          class="flex items-center justify-between rounded-lg p-3 transition-colors"
          :class="
            port.status === 'listening' ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
          "
        >
          <div class="flex items-center gap-3">
            <ElTag :type="port.status === 'listening' ? 'success' : 'info'" size="small">
              {{ port.port }}
            </ElTag>
            <span class="text-sm text-gray-600">{{ port.service }}</span>
          </div>
          <ElTag :type="port.status === 'listening' ? 'success' : 'info'" size="small" effect="dark">
            {{ port.status === 'listening' ? '监听中' : '未监听' }}
          </ElTag>
        </div>
      </div>

      <!-- 端口统计 -->
      <div v-if="ports.length > 0" class="border-t border-gray-100 pt-2">
        <div class="flex justify-between text-xs text-gray-500">
          <span>总端口: {{ ports.length }}</span>
          <span>监听中: {{ listeningCount }}</span>
        </div>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped>
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.max-h-40 {
  max-height: 160px;
  overflow-y: auto;
}
</style>
