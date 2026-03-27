<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardRefresh } from '@/hooks/business/use-dashboard-refresh';
import { fetchTeamDashboard } from '@/service/api/dashboard';
import TotalConsumptionCard from './modules/total-consumption-card.vue';
import ShiftProgressBar from './modules/shift-progress-bar.vue';
import RealtimeIndicator from './modules/realtime-indicator.vue';
import DashboardBreadcrumb from './modules/dashboard-breadcrumb.vue';
import TrendChart from './modules/trend-chart.vue';

defineOptions({ name: 'TeamDashboard' });

interface Props {
  teamId: string;
  breadcrumbItems?: Api.Dashboard.BreadcrumbItem[];
}

const props = defineProps<Props>();

const { data, loading, error, lastUpdate, sseConnected } = useDashboardRefresh<Api.Dashboard.TeamDashboardData>({
  scope: 'team',
  orgId: props.teamId,
  fetchInitial: () => fetchTeamDashboard(props.teamId)
});

const teamName = computed(() => data.value?.teamName || '');
const consumption = computed(() => data.value?.consumption);
const currentShift = computed(() => data.value?.currentShift);
const shiftProgress = computed(() => data.value?.shiftProgress);
const target = computed(() => data.value?.target);

const targetPercentage = computed(() => {
  if (!target.value || !consumption.value) return null;
  return (consumption.value.value / target.value.value) * 100;
});
</script>

<template>
  <div class="team-dashboard flex h-full flex-col gap-4 p-4">
    <!-- Header with Breadcrumb -->
    <div class="flex items-center justify-between">
      <div>
        <DashboardBreadcrumb v-if="breadcrumbItems" :items="breadcrumbItems" />
        <h2 class="text-xl font-bold">{{ teamName || 'Team Dashboard' }}</h2>
      </div>
      <RealtimeIndicator :connected="sseConnected" :last-update="lastUpdate" />
    </div>

    <!-- Error State -->
    <ElAlert v-if="error" type="error" :title="error.message" show-icon closable />

    <!-- Shift Progress -->
    <ElCard v-if="currentShift && shiftProgress" class="card-wrapper">
      <ShiftProgressBar :shift="currentShift" :progress="shiftProgress" />
    </ElCard>

    <!-- Main Content -->
    <div class="grid flex-1 gap-4 md:grid-cols-2">
      <!-- Current Consumption -->
      <TotalConsumptionCard
        v-if="consumption"
        :metric="consumption"
        title="Current Shift Consumption"
        icon="mdi:flash"
        :loading="loading"
      />

      <!-- Target Progress -->
      <ElCard v-if="target" class="card-wrapper">
        <div class="mb-4 flex items-center justify-between">
          <span class="font-medium">Target Completion</span>
          <span class="text-sm text-gray-500">Target: {{ target.displayValue }}</span>
        </div>
        <ElProgress
          :percentage="Math.min(targetPercentage || 0, 100)"
          :color="targetPercentage && targetPercentage > 100 ? '#ef4444' : '#10b981'"
          :stroke-width="12"
        />
        <div class="mt-2 text-center text-xs text-gray-400">{{ targetPercentage?.toFixed(1) }}% completed</div>
      </ElCard>
    </div>

    <!-- Trend Chart -->
    <TrendChart :org-id="teamId" scope="team" :time-range="24" title="Team Energy Trend" />
  </div>
</template>