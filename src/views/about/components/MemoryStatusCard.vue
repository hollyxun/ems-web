<script setup lang="ts">
import { computed } from 'vue';
import { Cpu } from '@element-plus/icons-vue';
import type { MemoryInfo } from '@/typings/api/devtools';
import StatusCard from './StatusCard.vue';

const MemoryIcon = 'mdi:memory';

interface Props {
  memory: MemoryInfo | null;
}

const props = withDefaults(defineProps<Props>(), {
  memory: null
});

const usagePercent = computed(() => {
  if (!props.memory) return '0.0';
  return props.memory.usedPercent.toFixed(1);
});

const healthStatus = computed(() => {
  const usage = Number.parseFloat(usagePercent.value);
  if (usage > 90) return 'critical';
  if (usage > 70) return 'warning';
  return 'healthy';
});

const usageTextClass = computed(() => {
  const classes: Record<string, string> = {
    healthy: 'text-purple-600',
    warning: 'text-orange-500',
    critical: 'text-red-500'
  };
  return classes[healthStatus.value];
});

const progressColor = computed(() => {
  const colors: Record<string, string> = {
    healthy: '#a855f7',
    warning: '#f59e0b',
    critical: '#ef4444'
  };
  return colors[healthStatus.value];
});

const formatMemory = (mb: number): string => {
  if (mb >= 1024 * 1024) {
    return `${(mb / 1024 / 1024).toFixed(2)} TB`;
  }
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${Math.round(mb)} MB`;
};

const totalFormatted = computed(() => formatMemory(props.memory?.total ?? 0));
const usedFormatted = computed(() => formatMemory(props.memory?.used ?? 0));
const availableFormatted = computed(() => formatMemory(props.memory?.available ?? 0));

const usedItemClass = computed(() => {
  const classes: Record<string, string> = {
    warning: 'bg-orange-50 text-orange-600',
    critical: 'bg-red-50 text-red-600',
    healthy: 'bg-purple-50 text-purple-600'
  };
  return classes[healthStatus.value];
});
</script>

<template>
  <StatusCard title="内存状态" :icon="MemoryIcon" :health-status="healthStatus">
    <div class="space-y-8">
      <!-- 使用率展示 -->
      <div class="flex items-center justify-between">
        <div>
          <div class="mb-1 text-xs text-gray-500">使用率</div>
          <div class="text-4xl font-medium" :class="usageTextClass">
            {{ usagePercent }}
            <span class="text-lg text-gray-500">%</span>
          </div>
        </div>

        <!-- 环形进度 -->
        <div class="grid h-20 w-20 place-items-center">
          <div class="col-start-1 row-start-1">
            <ElProgress
              type="circle"
              :percentage="parseFloat(usagePercent)"
              :color="progressColor"
              :width="80"
              :stroke-width="6"
              :show-text="false"
            />
          </div>
          <div class="z-10 col-start-1 row-start-1">
            <ElIcon :size="24" :class="usageTextClass">
              <Cpu />
            </ElIcon>
          </div>
        </div>
      </div>

      <!-- 内存详情 -->
      <div class="space-y-2">
        <ElRow :gutter="8">
          <ElCol :span="8">
            <div class="memory-item">
              <div class="text-xs text-gray-500">总容量</div>
              <div class="font-medium">{{ totalFormatted }}</div>
            </div>
          </ElCol>
          <ElCol :span="8">
            <div class="memory-item" :class="usedItemClass">
              <div class="text-xs">已使用</div>
              <div class="font-medium">{{ usedFormatted }}</div>
            </div>
          </ElCol>
          <ElCol :span="8">
            <div class="memory-item bg-green-50">
              <div class="text-xs text-green-600">可用</div>
              <div class="text-green-700 font-medium">{{ availableFormatted }}</div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped>
.memory-item {
  padding: 12px 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  text-align: center;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.text-green-600 {
  color: #16a34a;
}

.text-green-700 {
  color: #15803d;
}

.space-y-4 > * + * {
  margin-top: 16px;
}
</style>
