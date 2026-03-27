<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { fetchTeamRanking, fetchRankingTrend } from '@/service/api/energy';
import type { Api } from '@/typings/api';

defineOptions({ name: 'EnergyRanking' });

import RankingFilter from './components/ranking-filter.vue';
import RankingTable from './components/ranking-table.vue';
import RankingTrendChart from './components/ranking-trend-chart.vue';
import TeamDetailDialog from './components/team-detail-dialog.vue';

const loading = ref(false);
const trendLoading = ref(false);
const rankingData = ref<Api.Energy.Ranking.TeamRankingItem[]>([]);
const total = ref(0);

const queryParams = reactive<Api.Energy.Ranking.TeamRankingQuery>({
  page: 1,
  pageSize: 20,
  timeDimension: 'daily',
  metric: 'specific_consumption',
  periodStart: new Date().toISOString().split('T')[0],
  periodEnd: new Date().toISOString().split('T')[0],
  sortBy: 'rank',
  sortOrder: 'asc'
});

const trendDialogVisible = ref(false);
const trendData = ref<Api.Energy.Ranking.RankingTrendPoint[]>([]);
const selectedTeam = ref<Api.Energy.Ranking.TeamRankingItem | null>(null);

const detailDialogVisible = ref(false);
const detailData = ref<Api.Energy.Ranking.TeamRankingItem | null>(null);

const factoryOptions = ref([
  { value: 1, label: '工厂A' },
  { value: 2, label: '工厂B' }
]);
const workshopOptions = ref([
  { value: 1, label: '车间1' },
  { value: 2, label: '车间2' }
]);
const energyMediumOptions = ref([
  { value: 'electric', label: '电' },
  { value: 'water', label: '水' },
  { value: 'gas', label: '气' },
  { value: 'heat', label: '热' }
]);

const metricLabel = computed(() => {
  const labels: Record<string, string> = {
    total_energy: '总能耗',
    specific_consumption: '单耗',
    cost: '成本'
  };
  return labels[queryParams.metric || 'specific_consumption'] || '数值';
});

async function loadRankingData() {
  loading.value = true;
  try {
    const result = await fetchTeamRanking(queryParams);
    rankingData.value = result.data?.items || [];
    total.value = result.data?.total || 0;
  } catch {
    ElMessage.error('加载排名数据失败');
  } finally {
    loading.value = false;
  }
}

async function loadTrendData(team: Api.Energy.Ranking.TeamRankingItem) {
  trendLoading.value = true;
  trendDialogVisible.value = true;
  selectedTeam.value = team;

  try {
    const result = await fetchRankingTrend({
      teamId: team.teamId,
      days: 30,
      metric: queryParams.metric
    });
    trendData.value = result.data || [];
  } catch {
    ElMessage.error('加载趋势数据失败');
    trendData.value = [];
  } finally {
    trendLoading.value = false;
  }
}

function handleSearch() {
  queryParams.page = 1;
  loadRankingData();
}

function handleReset() {
  queryParams.page = 1;
  loadRankingData();
}

function handlePageChange(page: number) {
  queryParams.page = page;
  loadRankingData();
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size;
  queryParams.page = 1;
  loadRankingData();
}

function handleRowClick(row: Api.Energy.Ranking.TeamRankingItem) {
  detailData.value = row;
  detailDialogVisible.value = true;
}

function handleTrendClick(row: Api.Energy.Ranking.TeamRankingItem) {
  loadTrendData(row);
}

function handleSortChange(prop: string, order: 'ascending' | 'descending') {
  queryParams.sortBy = prop;
  queryParams.sortOrder = order === 'ascending' ? 'asc' : 'desc';
  loadRankingData();
}

onMounted(() => {
  loadRankingData();
});
</script>

<template>
  <div class="energy-ranking-page p-4">
    <div class="mb-4">
      <RankingFilter
        :factory-options="factoryOptions"
        :workshop-options="workshopOptions"
        :energy-medium-options="energyMediumOptions"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <ElCard>
      <RankingTable
        :data="rankingData"
        :loading="loading"
        :metric="queryParams.metric || 'specific_consumption'"
        @row-click="handleRowClick"
        @trend-click="handleTrendClick"
        @sort-change="handleSortChange"
      />

      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>

    <ElDialog v-model="trendDialogVisible" title="排名趋势" width="800px">
      <RankingTrendChart
        :data="trendData"
        :team-name="selectedTeam?.teamName || ''"
        :metric-label="metricLabel"
        :loading="trendLoading"
      />
    </ElDialog>

    <TeamDetailDialog
      v-model:visible="detailDialogVisible"
      :data="detailData"
    />
  </div>
</template>