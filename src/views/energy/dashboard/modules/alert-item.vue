<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import { Icon } from '@iconify/vue';

interface Props {
  alert: Api.Dashboard.AlertItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  confirm: [id: string];
  ignore: [id: string];
}>();

const severityConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  critical: { color: 'text-red-500', bg: 'bg-red-50', icon: 'mdi:alert-circle', label: 'Critical' },
  warning: { color: 'text-amber-500', bg: 'bg-amber-50', icon: 'mdi:alert', label: 'Warning' },
  info: { color: 'text-blue-500', bg: 'bg-blue-50', icon: 'mdi:information', label: 'Info' }
};

const typeConfig: Record<string, { label: string; icon: string }> = {
  over_limit: { label: 'Over Limit', icon: 'mdi:arrow-up-bold' },
  offline: { label: 'Offline', icon: 'mdi:wifi-off' },
  fluctuation: { label: 'Fluctuation', icon: 'mdi:chart-line-variant' }
};

const config = computed(() => severityConfig[props.alert.severity] || severityConfig.info);
const typeConf = computed(() => typeConfig[props.alert.type] || { label: props.alert.type, icon: 'mdi:alert' });

const formattedTime = computed(() => {
  return dayjs(props.alert.timestamp).format('MM-DD HH:mm:ss');
});

const isActionable = computed(() => props.alert.status === 'active');
</script>

<template>
  <div :class="config.bg" class="alert-item rounded-lg p-4 transition-all hover:shadow-md">
    <div class="flex items-start gap-3">
      <!-- Severity Icon -->
      <Icon :icon="config.icon" :class="config.color" class="mt-0.5 text-2xl" />

      <!-- Content -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span :class="config.color" class="text-sm font-medium">[{{ config.label }}]</span>
          <span class="text-sm text-gray-500">
            {{ typeConf.label }}
          </span>
        </div>

        <div class="mt-1 text-gray-900 font-medium dark:text-white">
          {{ alert.meterName }}
        </div>

        <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {{ alert.message }}
        </div>

        <div class="mt-2 flex items-center gap-4 text-xs text-gray-400">
          <span>{{ alert.orgName }}</span>
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="isActionable" class="flex gap-2">
        <ElButton type="primary" size="small" @click="emit('confirm', alert.id)">Confirm</ElButton>
        <ElButton type="info" size="small" plain @click="emit('ignore', alert.id)">Ignore</ElButton>
      </div>

      <!-- Status Badge -->
      <div v-else class="flex items-center">
        <ElTag :type="alert.status === 'confirmed' ? 'success' : 'info'" size="small">
          {{ alert.status === 'confirmed' ? 'Confirmed' : 'Ignored' }}
        </ElTag>
      </div>
    </div>
  </div>
</template>
