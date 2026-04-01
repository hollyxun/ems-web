<script setup lang="ts">
import { computed } from 'vue';
import { Clock } from '@element-plus/icons-vue';
import StatusCard from './StatusCard.vue';

const OverviewIcon = 'mdi:chart-box-outline';

interface Props {
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
}

const props = defineProps<Props>();

const cpuColor = computed(() => {
  if (props.cpuUsage > 90) return '#ef4444';
  if (props.cpuUsage > 70) return '#f59e0b';
  return '#10b981';
});

const memoryColor = computed(() => {
  if (props.memoryUsage > 90) return '#ef4444';
  if (props.memoryUsage > 70) return '#f59e0b';
  return '#a855f7';
});
</script>

<template>
  <StatusCard title="系统概览" :icon="OverviewIcon">
    <div class="space-y-4">
      <ElRow :gutter="12">
        <ElCol :span="12">
          <div class="overview-item">
            <div class="mb-1 text-xs text-gray-500">CPU 使用率</div>
            <div class="text-2xl font-medium" :style="{ color: cpuColor }">{{ cpuUsage.toFixed(1) }}%</div>
            <ElProgress :percentage="cpuUsage" :color="cpuColor" :stroke-width="4" :show-text="false" class="mt-2" />
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="overview-item">
            <div class="mb-1 text-xs text-gray-500">内存使用率</div>
            <div class="text-2xl font-medium" :style="{ color: memoryColor }">{{ memoryUsage.toFixed(1) }}%</div>
            <ElProgress
              :percentage="memoryUsage"
              :color="memoryColor"
              :stroke-width="4"
              :show-text="false"
              class="mt-2"
            />
          </div>
        </ElCol>
      </ElRow>

      <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        <ElIcon :size="20" class="text-gray-500">
          <Clock />
        </ElIcon>
        <div>
          <div class="text-xs text-gray-500">运行时间</div>
          <div class="font-medium">{{ uptime }}</div>
        </div>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped>
.overview-item {
  text-align: center;
  padding: 16px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}
</style>
