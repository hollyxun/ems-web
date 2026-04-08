<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElCard, ElEmpty, ElTable, ElTableColumn, ElTag } from 'element-plus';
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

defineOptions({ name: 'TeamRankingCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const rankingData = ref<{ team: string; energy: number; rank: number; trend: string }[]>([]);
const topTeams = ref<{ name: string; value: number }[]>([]);

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchTeamRanking(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 500));
  rankingData.value = [
    { team: '班组A', energy: 850, rank: 1, trend: 'down' },
    { team: '班组B', energy: 920, rank: 2, trend: 'down' },
    { team: '班组C', energy: 1100, rank: 3, trend: 'up' },
    { team: '班组D', energy: 1250, rank: 4, trend: 'up' },
    { team: '班组E', energy: 1380, rank: 5, trend: 'up' }
  ];
  topTeams.value = rankingData.value.slice(0, 5).map(t => ({
    name: t.team,
    value: t.energy
  }));
  loading.value = false;
}

const chartOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: [] as string[] },
  series: [
    {
      name: '能耗',
      type: 'bar',
      data: [] as number[],
      itemStyle: {
        color: (params: any) => {
          const colors = ['#10B981', '#34D399', '#FBBF24', '#F59E0B', '#EF4444'];
          return colors[params.dataIndex] || '#6B7280';
        }
      }
    }
  ]
});

onMounted(async () => {
  await loadData();
  chartOption.value.yAxis.data = topTeams.value.map(t => t.name).reverse();
  chartOption.value.series[0].data = topTeams.value.map(t => t.value).reverse();
});

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">班组能效排名</span>
        <ElTag size="small" type="success">本周</ElTag>
      </div>
    </template>
    <div v-if="!loading" class="flex flex-col gap-4">
      <!-- 排名图表 -->
      <div class="h-200px">
        <VChart :option="chartOption" autoresize />
      </div>

      <!-- 详细列表 -->
      <ElTable :data="rankingData" size="small" stripe>
        <ElTableColumn prop="rank" label="排名" width="60" align="center">
          <template #default="{ row }">
            <ElTag :type="row.rank <= 2 ? 'success' : row.rank <= 4 ? 'warning' : 'danger'" size="small">
              {{ row.rank }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="team" label="班组" min-width="100" />
        <ElTableColumn prop="energy" label="能耗(kWh)" width="100" align="right" />
        <ElTableColumn prop="trend" label="趋势" width="60" align="center">
          <template #default="{ row }">
            <icon-mdi:arrow-down v-if="row.trend === 'down'" class="text-green-500" />
            <icon-mdi:arrow-up v-else class="text-red-500" />
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <ElEmpty v-else description="加载中..." />
  </ElCard>
</template>
