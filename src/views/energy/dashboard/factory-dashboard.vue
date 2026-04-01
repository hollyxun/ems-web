<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchFactoryDashboard } from '@/service/api/dashboard';
import { useDashboardRefresh } from '@/hooks/business/use-dashboard-refresh';
import TotalConsumptionCard from './modules/total-consumption-card.vue';
import WorkshopBreakdownChart from './modules/workshop-breakdown-chart.vue';
import RealtimeIndicator from './modules/realtime-indicator.vue';
import DashboardBreadcrumb from './modules/dashboard-breadcrumb.vue';
import TrendChart from './modules/trend-chart.vue';
import PeakValleyDistribution from './modules/peak-valley-distribution.vue';
import AlertPanel from './modules/alert-panel.vue';

defineOptions({ name: 'FactoryDashboard' });

interface Props {
  factoryId: string;
  breadcrumbItems?: Api.Dashboard.BreadcrumbItem[];
}

const props = defineProps<Props>();
const router = useRouter();

const { data, loading, error, lastUpdate, sseConnected } = useDashboardRefresh<Api.Dashboard.FactoryDashboardData>({
  scope: 'factory',
  orgId: props.factoryId,
  fetchInitial: () => fetchFactoryDashboard(props.factoryId)
});

const factoryName = computed(() => data.value?.factoryName || '');
const totalConsumption = computed(() => data.value?.totalConsumption);
const workshopBreakdown = computed(() => data.value?.workshopBreakdown || []);
const alertCount = computed(() => data.value?.alertCount || 0);
</script>

<template>
  <div class="factory-dashboard h-full flex flex-col gap-4 p-4">
    <!-- Header with Breadcrumb -->
    <div class="flex items-center justify-between">
      <div>
        <DashboardBreadcrumb v-if="breadcrumbItems" :items="breadcrumbItems" />
        <h2 class="text-xl font-bold">{{ factoryName || 'Factory Dashboard' }}</h2>
      </div>
      <RealtimeIndicator :connected="sseConnected" :last-update="lastUpdate" />
    </div>

    <!-- Error State -->
    <ElAlert v-if="error" type="error" :title="error.message" show-icon closable />

    <!-- Alert Banner -->
    <ElAlert v-if="alertCount > 0" type="warning" :closable="false">
      <template #title>
        <span class="flex items-center gap-2">
          <Icon icon="mdi:alert" />
          {{ alertCount }} alerts pending
        </span>
      </template>
    </ElAlert>

    <!-- Main Content -->
    <div class="grid flex-1 gap-4 lg:grid-cols-3">
      <!-- Left: Total Consumption -->
      <div class="lg:col-span-1">
        <TotalConsumptionCard
          v-if="totalConsumption"
          :metric="totalConsumption"
          title="Factory Total Consumption"
          icon="mdi:factory"
          :loading="loading"
        />
      </div>

      <!-- Right: Workshop Breakdown -->
      <div class="lg:col-span-2">
        <WorkshopBreakdownChart :data="workshopBreakdown" :factory-id="factoryId" :loading="loading" />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid gap-4 md:grid-cols-3">
      <ElCard class="card-wrapper text-center">
        <div class="text-2xl text-primary font-bold">{{ workshopBreakdown.length }}</div>
        <div class="text-sm text-gray-500">Workshops</div>
      </ElCard>
      <ElCard class="card-wrapper text-center">
        <div class="text-2xl text-green-500 font-bold">
          {{ workshopBreakdown.reduce((sum: number, w) => sum + w.teams.length, 0) }}
        </div>
        <div class="text-sm text-gray-500">Teams</div>
      </ElCard>
      <ElCard
        class="cursor-pointer card-wrapper text-center transition-shadow hover:shadow-md"
        @click="router.push({ query: { level: 'alerts', orgId: factoryId } })"
      >
        <div class="text-2xl font-bold" :class="alertCount > 0 ? 'text-red-500' : 'text-gray-400'">
          {{ alertCount }}
        </div>
        <div class="text-sm text-gray-500">Alerts</div>
      </ElCard>
    </div>

    <!-- Trend Chart -->
    <TrendChart :org-id="factoryId" scope="factory" :time-range="24" title="Factory Energy Trend" />

    <!-- Bottom Row -->
    <div class="grid gap-4 lg:grid-cols-2">
      <PeakValleyDistribution :org-id="factoryId" />
      <AlertPanel :org-id="factoryId" :max-items="5" />
    </div>
  </div>
</template>
