<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'RankingTable' });

interface Props {
  data: Api.Energy.Ranking.TeamRankingItem[];
  loading: boolean;
  metric: Api.Energy.Ranking.Metric;
}

interface Emits {
  (e: 'rowClick', row: Api.Energy.Ranking.TeamRankingItem): void;
  (e: 'trendClick', row: Api.Energy.Ranking.TeamRankingItem): void;
  (e: 'sortChange', prop: string, order: 'ascending' | 'descending'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const metricLabel = computed(() => {
  const labels: Record<string, string> = {
    total_energy: '总能耗',
    specific_consumption: '单耗',
    cost: '成本'
  };
  return labels[props.metric] || '数值';
});

function getRowClass({ row }: { row: Api.Energy.Ranking.TeamRankingItem }) {
  const totalItems = props.data.length;
  if (row.rank <= 3) return 'row-top-3';
  if (row.rank > totalItems - 3) return 'row-bottom-3';
  return '';
}

function formatRankChange(change: number) {
  if (change > 0) return { text: `+${change}`, color: '#67C23A' };
  if (change < 0) return { text: change.toString(), color: '#F56C6C' };
  return { text: '-', color: '#909399' };
}

function handleRowClick(row: Api.Energy.Ranking.TeamRankingItem) {
  emit('row-click', row);
}

function handleTrendClick(row: Api.Energy.Ranking.TeamRankingItem) {
  emit('trend-click', row);
}

function handleSortChange({ prop, order }: { prop: string; order: string }) {
  emit('sort-change', prop, order as 'ascending' | 'descending');
}
</script>

<template>
  <ElTable
    :data="data"
    :loading="loading"
    :row-class-name="getRowClass"
    stripe
    highlight-current-row
    @row-click="handleRowClick"
    @sort-change="handleSortChange"
  >
    <ElTableColumn prop="rank" label="排名" width="80" sortable fixed>
      <template #default="{ row }">
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ row.rank }}</span>
          <span v-if="row.rankChange !== 0" :style="{ color: formatRankChange(row.rankChange).color }" class="text-xs">
            {{ formatRankChange(row.rankChange).text }}
          </span>
        </div>
      </template>
    </ElTableColumn>

    <ElTableColumn prop="teamName" label="班组" min-width="120">
      <template #default="{ row }">
        <div>
          <div class="font-medium">{{ row.teamName }}</div>
          <div class="text-xs text-gray-500">{{ row.teamCode }}</div>
        </div>
      </template>
    </ElTableColumn>

    <ElTableColumn prop="factoryName" label="工厂" width="120" />
    <ElTableColumn prop="workshopName" label="车间" width="120" />

    <ElTableColumn prop="totalEnergy" label="总能耗" width="120" sortable>
      <template #default="{ row }">{{ row.totalEnergy.toFixed(2) }} kWh</template>
    </ElTableColumn>

    <ElTableColumn prop="productionOutput" label="产量" width="100">
      <template #default="{ row }">
        {{ row.productionOutput.toFixed(0) }}
      </template>
    </ElTableColumn>

    <ElTableColumn prop="specificConsumption" :label="metricLabel" width="120" sortable>
      <template #default="{ row }">
        <span class="font-medium">{{ row.specificConsumption.toFixed(4) }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn prop="cost" label="成本" width="100" sortable>
      <template #default="{ row }">
        {{ row.cost.toFixed(2) }}
      </template>
    </ElTableColumn>

    <ElTableColumn prop="dataPoints" label="数据点" width="80">
      <template #default="{ row }">
        {{ row.dataPoints }}
      </template>
    </ElTableColumn>

    <ElTableColumn label="操作" width="100" fixed="right">
      <template #default="{ row }">
        <ElButton type="primary" link @click.stop="handleTrendClick(row)">趋势</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<style scoped>
:deep(.row-top-3) {
  background-color: rgba(103, 194, 58, 0.1) !important;
}
:deep(.row-top-3 td) {
  color: #67c23a !important;
  font-weight: 600;
}
:deep(.row-bottom-3) {
  background-color: rgba(245, 108, 108, 0.1) !important;
}
:deep(.row-bottom-3 td) {
  color: #f56c6c !important;
}
</style>
