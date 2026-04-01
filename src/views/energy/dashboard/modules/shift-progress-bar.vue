<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import { Icon } from '@iconify/vue';

interface Props {
  shift: Api.Dashboard.ShiftInfo;
  progress: Api.Dashboard.ShiftProgress;
}

const props = defineProps<Props>();

const shiftTypeLabels: Record<string, string> = {
  morning: 'Morning Shift',
  afternoon: 'Afternoon Shift',
  night: 'Night Shift'
};

const statusColors = computed(() => {
  switch (props.progress.status) {
    case 'ahead':
      return { bg: 'bg-green-100', text: 'text-green-600', bar: '#10b981' };
    case 'behind':
      return { bg: 'bg-red-100', text: 'text-red-600', bar: '#ef4444' };
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-600', bar: '#3b82f6' };
  }
});

const statusLabels = computed(() => {
  switch (props.progress.status) {
    case 'ahead':
      return 'Ahead of Schedule';
    case 'behind':
      return 'Behind Schedule';
    default:
      return 'On Track';
  }
});

const formattedEndTime = computed(() => {
  return dayjs(props.shift.endTime).format('HH:mm');
});

const estimatedCompletionTime = computed(() => {
  return dayjs(props.progress.estimatedCompletion).format('HH:mm');
});

const progressText = computed(() => {
  const elapsed = props.progress.elapsedTime;
  const remaining = props.progress.remainingTime;
  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  return `Elapsed: ${formatTime(elapsed)}, Remaining: ${formatTime(remaining)}`;
});
</script>

<template>
  <div class="shift-progress-bar">
    <!-- Shift Header -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:clock-outline" class="text-lg text-primary" />
        <span class="font-medium">{{ shiftTypeLabels[shift.shiftType] }} - {{ shift.shiftName }}</span>
      </div>
      <div :class="[statusColors.bg, statusColors.text]" class="rounded-full px-3 py-1 text-xs font-medium">
        {{ statusLabels }}
      </div>
    </div>

    <!-- Time Range -->
    <div class="mb-2 flex justify-between text-sm text-gray-500">
      <span>{{ dayjs(shift.startTime).format('HH:mm') }}</span>
      <span>{{ formattedEndTime }}</span>
    </div>

    <!-- Progress Bar -->
    <div class="relative">
      <ElProgress
        :percentage="progress.percentage"
        :stroke-width="20"
        :color="statusColors.bar"
        :show-text="false"
        class="shift-progress"
      />
      <div class="absolute left-0 right-0 top-0 h-5 flex items-center justify-center text-xs text-white">
        <span>{{ progress.percentage.toFixed(0) }}%</span>
      </div>
    </div>

    <!-- Time Details -->
    <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
      <span>{{ progressText }}</span>
      <span>Est. Completion: {{ estimatedCompletionTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.shift-progress-bar {
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
}
</style>
