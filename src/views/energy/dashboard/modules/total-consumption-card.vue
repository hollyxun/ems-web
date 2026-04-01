<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

interface Props {
  metric: Api.Dashboard.ConsumptionMetric;
  trend?: 'up' | 'down' | 'stable';
  title?: string;
  icon?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Total Consumption',
  icon: 'mdi:flash',
  trend: 'stable',
  loading: false
});

const trendColor = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'text-red-500';
    case 'down':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
});

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'mdi:arrow-up';
    case 'down':
      return 'mdi:arrow-down';
    default:
      return 'mdi:minus';
  }
});

const periodLabel = computed(() => {
  switch (props.metric.period) {
    case 'realtime':
      return 'Real-time';
    case 'hourly':
      return 'Hourly';
    case 'daily':
      return 'Daily';
    case 'monthly':
      return 'Monthly';
    default:
      return props.metric.period;
  }
});
</script>

<template>
  <ElCard class="total-consumption-card card-wrapper">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
          <Icon :icon="icon" class="text-2xl text-primary" />
        </div>
        <div>
          <div class="text-sm text-gray-500">{{ title }}</div>
          <div v-if="loading" class="h-8 w-24 animate-pulse rounded bg-gray-200" />
          <div v-else class="flex items-baseline gap-2">
            <span class="text-2xl text-gray-900 font-bold dark:text-white">
              {{ metric.displayValue }}
            </span>
            <span class="text-sm text-gray-500">{{ metric.unit }}</span>
          </div>
        </div>
      </div>
      <div :class="trendColor" class="flex items-center gap-1">
        <Icon :icon="trendIcon" class="text-lg" />
      </div>
    </div>
    <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
      <Icon icon="mdi:clock-outline" />
      <span>{{ periodLabel }}</span>
    </div>
  </ElCard>
</template>

<style scoped>
.total-consumption-card {
  transition: box-shadow 0.3s ease;
}
.total-consumption-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
