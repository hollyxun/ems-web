<script setup lang="ts">
import { computed } from 'vue';
import { Cpu, Folder, InfoFilled, Link, Monitor, Timer } from '@element-plus/icons-vue';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | null;

interface Props {
  title: string;
  icon: string;
  healthStatus?: HealthStatus;
}

const props = withDefaults(defineProps<Props>(), {
  healthStatus: null
});

// 图标映射 - 只使用 Element Plus 存在的图标
const iconMap: Record<string, typeof Cpu> = {
  'mdi:cpu-64-bit': Cpu,
  'mdi:memory': Cpu,
  'mdi:desktop-classic': Monitor,
  'mdi:timer-sand': Timer,
  'mdi:lan-connect': Link,
  'mdi:chip': Cpu,
  'mdi:chart-box-outline': Folder
};

const iconComponent = computed(() => iconMap[props.icon] || InfoFilled);

const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    healthy: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    critical: 'bg-danger-light text-danger',
    null: 'bg-primary-light text-primary'
  };
  return classes[props.healthStatus ?? 'null'];
});

const healthTagType = computed(() => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    healthy: 'success',
    warning: 'warning',
    critical: 'danger'
  };
  return types[props.healthStatus ?? 'healthy'];
});

const healthText = computed(() => {
  const texts: Record<string, string> = {
    healthy: '正常',
    warning: '警告',
    critical: '严重'
  };
  return texts[props.healthStatus ?? 'healthy'];
});
</script>

<template>
  <ElCard class="status-card" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="icon-wrapper" :class="iconBgClass">
            <ElIcon :size="20">
              <component :is="iconComponent" />
            </ElIcon>
          </div>
          <span class="font-medium">{{ title }}</span>
        </div>
        <ElTag v-if="healthStatus" :type="healthTagType" size="small">
          {{ healthText }}
        </ElTag>
      </div>
    </template>

    <slot></slot>
  </ElCard>
</template>

<style scoped>
.status-card {
  height: 100%;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-success-light {
  background-color: var(--el-color-success-light-9);
}

.bg-warning-light {
  background-color: var(--el-color-warning-light-9);
}

.bg-danger-light {
  background-color: var(--el-color-danger-light-9);
}

.bg-primary-light {
  background-color: var(--el-color-primary-light-9);
}

.text-success {
  color: var(--el-color-success);
}

.text-warning {
  color: var(--el-color-warning);
}

.text-danger {
  color: var(--el-color-danger);
}

.text-primary {
  color: var(--el-color-primary);
}
</style>
