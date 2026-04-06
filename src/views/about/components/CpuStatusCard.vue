<script setup lang="ts">
import { computed } from 'vue';
import { Cpu } from '@element-plus/icons-vue';
import type { CPUInfo } from '@/typings/api/devtools';
import StatusCard from './StatusCard.vue';

const CpuIcon = 'mdi:cpu-64-bit';

interface Props {
  cpu?: CPUInfo | null;
}

const props = withDefaults(defineProps<Props>(), {
  cpu: null
});

const coreCount = computed(() => props.cpu?.coreCount ?? 0);

const usagePercent = computed(() => {
  if (!props.cpu) return '0.0';
  return (100 - props.cpu.idle).toFixed(1);
});

const userPercent = computed(() => props.cpu?.user?.toFixed(1) ?? '0.0');
const systemPercent = computed(() => props.cpu?.system?.toFixed(1) ?? '0.0');
const idlePercent = computed(() => props.cpu?.idle?.toFixed(1) ?? '0.0');

const healthStatus = computed(() => {
  const usage = Number.parseFloat(usagePercent.value);
  if (usage > 90) return 'critical';
  if (usage > 70) return 'warning';
  return 'healthy';
});

const usageTextClass = computed(() => {
  const classes: Record<string, string> = {
    healthy: 'text-green-600',
    warning: 'text-orange-500',
    critical: 'text-red-500'
  };
  return classes[healthStatus.value];
});

const progressColor = computed(() => {
  const colors: Record<string, string> = {
    healthy: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444'
  };
  return colors[healthStatus.value];
});
</script>

<template>
  <StatusCard title="CPU 状态" :icon="CpuIcon" :health-status="healthStatus">
    <div class="space-y-4">
      <!-- 核心数和总体使用率 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary-light h-12 w-12 flex items-center justify-center rounded-lg">
            <ElIcon :size="24" class="text-primary">
              <Cpu />
            </ElIcon>
          </div>
          <div>
            <div class="text-xs text-gray-500">处理器核心</div>
            <div class="text-2xl font-medium">
              {{ coreCount }}
              <span class="text-sm text-gray-500">核</span>
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="text-3xl font-medium" :class="usageTextClass">{{ usagePercent }}%</div>
          <div class="text-xs text-gray-500">总体使用率</div>
        </div>
      </div>

      <!-- 使用率进度条 -->
      <div>
        <div class="mb-1 flex justify-between text-sm">
          <span class="text-gray-600">使用率</span>
          <span :class="usageTextClass">{{ usagePercent }}%</span>
        </div>
        <ElProgress
          :percentage="parseFloat(usagePercent)"
          :color="progressColor"
          :stroke-width="8"
          :show-text="false"
        />
      </div>

      <!-- 详细指标 -->
      <ElRow :gutter="12">
        <ElCol :span="8">
          <div class="metric-item">
            <div class="mb-1 text-xs text-gray-500">用户态</div>
            <div class="text-xl text-blue-600 font-medium">{{ userPercent }}%</div>
          </div>
        </ElCol>
        <ElCol :span="8">
          <div class="metric-item">
            <div class="mb-1 text-xs text-gray-500">系统态</div>
            <div class="text-xl text-orange-600 font-medium">{{ systemPercent }}%</div>
          </div>
        </ElCol>
        <ElCol :span="8">
          <div class="metric-item">
            <div class="mb-1 text-xs text-gray-500">空闲</div>
            <div class="text-xl text-green-600 font-medium">{{ idlePercent }}%</div>
          </div>
        </ElCol>
      </ElRow>
    </div>
  </StatusCard>
</template>

<style scoped>
.bg-primary-light {
  background-color: var(--el-color-primary-light-9);
}

.text-primary {
  color: var(--el-color-primary);
}

.metric-item {
  text-align: center;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.space-y-4 > * + * {
  margin-top: 16px;
}
</style>
