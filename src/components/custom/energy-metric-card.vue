<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { convertEnergyUnit, formatPercentageChange, calculatePercentageChange } from '@/utils/unit-conversion';

interface MetricProps {
  /** Raw value in base unit */
  value: number;
  /** Base unit (e.g., 'kWh', 'kW') */
  unit: string;
  /** Display title */
  title: string;
  /** Icon name */
  icon?: string;
  /** Previous value for comparison (optional) */
  previousValue?: number;
  /** Target value for progress (optional) */
  targetValue?: number;
  /** Loading state */
  loading?: boolean;
  /** Override auto unit conversion */
  displayUnit?: string;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Custom color theme */
  theme?: 'primary' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<MetricProps>(), {
  icon: 'mdi:flash',
  loading: false,
  showTrend: true,
  theme: 'primary',
  previousValue: undefined,
  targetValue: undefined,
  displayUnit: undefined
});

// Auto-convert to optimal unit
const converted = computed(() => {
  return convertEnergyUnit(props.value, props.unit, props.displayUnit);
});

// Calculate trend
const trend = computed(() => {
  if (props.previousValue === undefined || props.previousValue === 0) {
    return { value: 0, direction: 'stable' as const };
  }
  const change = calculatePercentageChange(props.value, props.previousValue);
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (change > 1) {
    direction = 'up';
  } else if (change < -1) {
    direction = 'down';
  }
  return {
    value: change,
    direction
  };
});

// Target progress
const targetProgress = computed(() => {
  if (props.targetValue === undefined || props.targetValue === 0) return null;
  return Math.min((props.value / props.targetValue) * 100, 100);
});

// Theme colors
const themeColors = {
  primary: { bg: 'bg-primary-50', text: 'text-primary', icon: 'text-primary' },
  success: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' }
};

const colors = computed(() => themeColors[props.theme]);

const trendColors = {
  up: 'text-red-500',
  down: 'text-green-500',
  stable: 'text-gray-400'
};

const trendIcons = {
  up: 'mdi:arrow-up',
  down: 'mdi:arrow-down',
  stable: 'mdi:minus'
};
</script>

<template>
  <ElCard class="energy-metric-card card-wrapper transition-shadow hover:shadow-md">
    <div class="flex items-start justify-between">
      <!-- Icon -->
      <div :class="colors.bg" class="rounded-xl p-3">
        <Icon :icon="icon" :class="colors.icon" class="text-2xl" />
      </div>

      <!-- Trend Badge -->
      <div v-if="showTrend && previousValue !== undefined" :class="trendColors[trend.direction]" class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
        <Icon :icon="trendIcons[trend.direction]" class="text-sm" />
        <span>{{ formatPercentageChange(trend.value) }}</span>
      </div>
    </div>

    <!-- Value -->
    <div class="mt-4">
      <div v-if="loading" class="space-y-2">
        <div class="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div class="h-8 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <template v-else>
        <div class="text-sm text-gray-500">{{ title }}</div>
        <div class="mt-1 flex items-baseline gap-1">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ converted.displayValue }}</span>
          <span class="text-sm text-gray-500">{{ converted.unit }}</span>
        </div>
      </template>
    </div>

    <!-- Target Progress -->
    <div v-if="targetProgress !== null && !loading" class="mt-4">
      <ElProgress :percentage="targetProgress" :stroke-width="6" :color="targetProgress >= 100 ? '#ef4444' : '#10b981'" :show-text="false" />
      <div class="mt-1 text-xs text-gray-400">Target completion: {{ targetProgress.toFixed(1) }}%</div>
    </div>
  </ElCard>
</template>

<style scoped>
.energy-metric-card {
  min-height: 120px;
}
</style>