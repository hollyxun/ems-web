<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElCard, ElEmpty } from 'element-plus';
import { fetchFactoryFlow, fetchWorkshopFlow } from '@/service/api/energy';
import SankeyChart from './components/sankey-chart.vue';
import FlowToolbar from './components/flow-toolbar.vue';
import BalanceIndicator from './components/balance-indicator.vue';
import LossDetailCard from './components/loss-detail-card.vue';

defineOptions({ name: 'EnergyFlow' });

// Type definitions
interface SankeyNode {
  id: string;
  name: string;
  depth: number;
  value: number;
  nodeType: 'input' | 'workshop' | 'team' | 'loss';
  orgId: number;
  metadata?: string;
}

// State
const currentLevel = ref<'factory' | 'workshop'>('factory');
const currentOrgId = ref<number>(1); // Default factory ID
const currentOrgName = ref<string>('总厂');
const factoryId = ref<number>(1); // For drill-down context
const factoryName = ref<string>('总厂');
const timeRange = ref<[Date, Date] | null>(null);
const selectedMedium = ref<string>('');
const loading = ref(false);

// Flow data
const flowData = ref<Api.Energy.EnergyFlow.EnergyFlowResponse | null>(null);

// Loss nodes computed
const lossNodes = computed<SankeyNode[]>(() => {
  return flowData.value?.nodes.filter(n => n.nodeType === 'loss') ?? [];
});

// Initialize time range to current month
function initTimeRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  timeRange.value = [start, end];
}

// Format date to RFC3339
function formatRFC3339(date: Date): string {
  return date.toISOString();
}

// Load factory flow data
async function loadFactoryFlow() {
  if (!timeRange.value) return;

  loading.value = true;
  try {
    const [start, end] = timeRange.value;
    const response = await fetchFactoryFlow({
      factoryId: currentOrgId.value,
      startTime: formatRFC3339(start),
      endTime: formatRFC3339(end),
      energyMedium: selectedMedium.value || undefined
    });
    // Handle FlatResponseData wrapper
    flowData.value = response as unknown as Api.Energy.EnergyFlow.EnergyFlowResponse;
  } catch {
    flowData.value = null;
  } finally {
    loading.value = false;
  }
}

// Load workshop flow data
async function loadWorkshopFlow(workshopId: number, workshopName: string) {
  if (!timeRange.value) return;

  loading.value = true;
  currentLevel.value = 'workshop';
  currentOrgId.value = workshopId;
  currentOrgName.value = workshopName;

  try {
    const [start, end] = timeRange.value;
    const response = await fetchWorkshopFlow({
      workshopId,
      startTime: formatRFC3339(start),
      endTime: formatRFC3339(end),
      energyMedium: selectedMedium.value || undefined
    });
    // Handle FlatResponseData wrapper
    flowData.value = response as unknown as Api.Energy.EnergyFlow.EnergyFlowResponse;
  } catch {
    flowData.value = null;
  } finally {
    loading.value = false;
  }
}

// Handle node click (drill down to workshop)
function handleNodeClick(node: SankeyNode) {
  if (node.nodeType === 'workshop') {
    loadWorkshopFlow(node.orgId, node.name);
  }
}

// Handle back to factory
function handleBack() {
  currentLevel.value = 'factory';
  currentOrgId.value = factoryId.value;
  currentOrgName.value = factoryName.value;
  loadFactoryFlow();
}

// Handle time range change
function handleTimeChange(range: [Date, Date]) {
  timeRange.value = range;
  if (currentLevel.value === 'factory') {
    loadFactoryFlow();
  } else {
    loadWorkshopFlow(currentOrgId.value, currentOrgName.value);
  }
}

// Handle medium change
function handleMediumChange(medium: string) {
  selectedMedium.value = medium;
  if (currentLevel.value === 'factory') {
    loadFactoryFlow();
  } else {
    loadWorkshopFlow(currentOrgId.value, currentOrgName.value);
  }
}

// Watch time range
watch(timeRange, () => {
  if (currentLevel.value === 'factory') {
    loadFactoryFlow();
  }
});

// Initialize
onMounted(() => {
  initTimeRange();
  loadFactoryFlow();
});
</script>

<template>
  <div class="energy-flow-page">
    <FlowToolbar
      v-model:time-range="timeRange"
      v-model:selected-medium="selectedMedium"
      :current-level="currentLevel"
      :current-org-name="currentOrgName"
      :factory-name="factoryName"
      @back="handleBack"
      @time-change="handleTimeChange"
      @medium-change="handleMediumChange"
    />

    <!-- Balance Indicator -->
    <BalanceIndicator
      v-if="flowData"
      :balance-rate="flowData.balanceRate"
      :is-balanced="flowData.isBalanced"
      :loss-percent="flowData.lossPercent"
    />

    <!-- Main Content Area -->
    <div class="main-content">
      <ElCard class="flow-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">能量流向图</span>
          </div>
        </template>

        <div v-if="flowData && flowData.nodes.length > 0" class="chart-wrapper">
          <div class="flex gap-16px">
            <div class="flex-1">
              <SankeyChart
                :nodes="flowData.nodes"
                :links="flowData.links"
                :loading="loading"
                height="500px"
                @node-click="handleNodeClick"
              />
            </div>

            <LossDetailCard
              v-if="lossNodes.length > 0"
              :loss-total="flowData.lossTotal"
              :loss-percent="flowData.lossPercent"
              :loss-nodes="lossNodes"
            />
          </div>
        </div>

        <ElEmpty v-else-if="!loading" description="暂无能量流数据" />
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.energy-flow-page {
  padding: 16px;
  height: 100%;
  overflow: auto;
  background-color: var(--el-bg-color-page);
}

.main-content {
  display: flex;
  flex-direction: column;
}

.flow-card {
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-wrapper {
  position: relative;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.gap-16px {
  gap: 16px;
}
</style>