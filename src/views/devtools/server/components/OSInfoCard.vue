<script setup lang="ts">
import { computed } from 'vue';
import { Cpu, InfoFilled, Monitor } from '@element-plus/icons-vue';
import type { OSInfo } from '@/typings/api/devtools';
import StatusCard from './StatusCard.vue';

const OsIcon = 'mdi:desktop-classic';

interface Props {
  os: OSInfo | null;
}

const props = withDefaults(defineProps<Props>(), {
  os: null
});

const type = computed(() => props.os?.type ?? '-');
const platform = computed(() => props.os?.platform ?? '-');
const version = computed(() => props.os?.version ?? '-');
const arch = computed(() => props.os?.arch ?? '-');

const osIconColorClass = computed(() => {
  const classes: Record<string, string> = {
    windows: 'text-blue-600',
    linux: 'text-orange-600',
    darwin: 'text-gray-700',
    freebsd: 'text-red-600',
    openbsd: 'text-amber-600'
  };
  return classes[type.value.toLowerCase()] || 'text-gray-600';
});
</script>

<template>
  <StatusCard title="操作系统" :icon="OsIcon">
    <div class="space-y-4">
      <!-- 系统主要信息 -->
      <div class="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
        <div class="h-14 w-14 flex items-center justify-center rounded-lg bg-white shadow-sm">
          <ElIcon :size="32" :class="osIconColorClass">
            <Monitor />
          </ElIcon>
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-lg font-medium">{{ platform }}</div>
          <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <ElTag size="small">{{ arch }}</ElTag>
            <span>{{ type }}</span>
          </div>
        </div>
      </div>

      <!-- 详细信息列表 -->
      <ElDescriptions :column="1" size="small" border>
        <ElDescriptionsItem label="系统类型">
          <div class="flex items-center gap-2">
            <ElIcon>
              <Monitor />
            </ElIcon>
            {{ type }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="系统架构">
          <div class="flex items-center gap-2">
            <ElIcon>
              <Cpu />
            </ElIcon>
            {{ arch }}
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="系统版本">
          <div class="flex items-center gap-2">
            <ElIcon>
              <InfoFilled />
            </ElIcon>
            <span class="truncate" :title="version">{{ version }}</span>
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </StatusCard>
</template>

<style scoped>
.space-y-4 > * + * {
  margin-top: 16px;
}
</style>
