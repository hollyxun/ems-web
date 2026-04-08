<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElCard, ElEmpty, ElStatistic } from 'element-plus';
import { use } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

defineOptions({ name: 'EnergyOverviewCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const totalEnergy = ref(0);
const energyTrend = ref<{ dates: string[]; values: number[] }>({ dates: [], values: [] });
const energyByType = ref<{ name: string; value: number }[]>([]);

// 模拟数据加载
async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchEnergyOverview(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 500));
  totalEnergy.value = 125680;
  energyTrend.value = {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    values: [1800, 2100, 1950, 2200, 2050, 1500, 1200]
  };
  energyByType.value = [
    { name: '电能', value: 85000 },
    { name: '水耗', value: 25000 },
    { name: '天然气', value: 12680 },
    { name: '蒸汽', value: 3000 }
  ];
  loading.value = false;
}

const trendOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: [] as string[] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '能耗',
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      data: [] as number[]
    }
  ]
});

const pieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { bottom: '5%', left: 'center' },
  series: [
    {
      name: '能源类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [] as { name: string; value: number }[]
    }
  ]
});

onMounted(async () => {
  await loadData();
  trendOption.value.xAxis.data = energyTrend.value.dates;
  trendOption.value.series[0].data = energyTrend.value.values;
  pieOption.value.series[0].data = energyByType.value;
});

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">能源概览</span>
        <span class="text-xs text-gray-400">{{ props.config?.title || '默认' }}</span>
      </div>
    </template>
    <div v-if="!loading" class="flex flex-col gap-4">
      <!-- 总能耗统计 -->
      <ElStatistic title="本周总能耗" :value="totalEnergy" suffix="kWh" />

      <!-- 能耗趋势 -->
      <div class="h-180px">
        <VChart :option="trendOption" autoresize />
      </div>

      <!-- 能源占比 -->
      <div class="h-180px">
        <VChart :option="pieOption" autoresize />
      </div>
    </div>
    <ElEmpty v-else description="加载中..." />
  </ElCard>
</template>
