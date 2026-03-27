<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardRefresh } from '@/hooks/business/use-dashboard-refresh';
import { fetchGroupDashboard } from '@/service/api/dashboard';
import TotalConsumptionCard from './modules/total-consumption-card.vue';
import FactoryComparisonChart from './modules/factory-comparison-chart.vue';
import RealtimeIndicator from './modules/realtime-indicator.vue';
import TrendChart from './modules/trend-chart.vue';
import PeakValleyDistribution from './modules/peak-valley-distribution.vue';
import AlertPanel from './modules/alert-panel.vue';

defineOptions({ name: 'GroupDashboard' });

interface Props {
  orgId: string;
}

const props = defineProps<Props>();

const { data, loading, error, lastUpdate, sseConnected } = useDashboardRefresh<Api.Dashboard.GroupDashboardData>({
  scope: 'group',
  orgId: props.orgId,
  fetchInitial: () => fetchGroupDashboard(props.orgId),
  refreshInterval: 5000
});

const totalConsumption = computed(() => data.value?.totalConsumption);
const factoryComparison = computed(() => data.value?.factoryComparison || []);
const trendDirection = computed(() => data.value?.trendDirection || 'stable');
</script>

<template>
  <div class="group-dashboard flex h-full flex-col gap-4 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Group Energy Dashboard</h2>
      <RealtimeIndicator :connected="sseConnected" :last-update="lastUpdate" />
    </div>

    <!-- Error State -->
    <ElAlert v-if="error" type="error" :title="error.message" show-icon closable />

    <!-- Main Content -->
    <div class="grid flex-1 gap-4 lg:grid-cols-3">
      <!-- Left: Total Consumption -->
      <div class="lg:col-span-1">
        <TotalConsumptionCard
          v-if="totalConsumption"
          :metric="totalConsumption"
          :trend="trendDirection"
          :loading="loading"
        />
        <ElCard v-else class="card-wrapper">
          <ElSkeleton :rows="3" animated />
        </ElCard>
      </div>

      <!-- Right: Factory Comparison -->
      <div class="lg:col-span-2">
        <FactoryComparisonChart :data="factoryComparison" :loading="loading" />
      </div>
    </div>

    <!-- Trend Chart -->
    <TrendChart :org-id="orgId" scope="group" :time-range="24" title="Group Energy Trend" />

    <!-- Bottom Row: Peak/Valley Distribution and Alerts -->
    <div class="grid gap-4 lg:grid-cols-2">
      <PeakValleyDistribution :org-id="orgId" />
      <AlertPanel :org-id="orgId" :max-items="5" />
    </div>
  </div>
</template>

<style scoped>
.group-dashboard {
  min-height: 100%;
}
</style>