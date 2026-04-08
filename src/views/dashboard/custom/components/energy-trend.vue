<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElCard, ElEmpty, ElRadioButton, ElRadioGroup } from 'element-plus';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

defineOptions({ name: 'EnergyTrendCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const timeRange = ref<'hour' | 'day' | 'week' | 'month'>('day');
const trendData = ref<{ times: string[]; values: number[] }>({ times: [], values: [] });

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchEnergyTrend({ range: timeRange.value, dataSource: props.config?.dataSource })
  await new Promise(r => setTimeout(r, 400));

  // 模拟不同时间范围的数据
  if (timeRange.value === 'hour') {
    trendData.value = {
      times: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      values: Array.from({ length: 24 }, () => 50 + Math.random() * 30)
    };
  } else if (timeRange.value === 'day') {
    trendData.value = {
      times: Array.from({ length: 7 }, (_, i) => `第${i + 1}天`),
      values: Array.from({ length: 7 }, () => 800 + Math.random() * 400)
    };
  } else if (timeRange.value === 'week') {
    trendData.value = {
      times: Array.from({ length: 4 }, (_, i) => `第${i + 1}周`),
      values: Array.from({ length: 4 }, () => 5000 + Math.random() * 2000)
    };
  } else {
    trendData.value = {
      times: ['1月', '2月', '3月', '4月', '5月', '6月'],
      values: Array.from({ length: 6 }, () => 20000 + Math.random() * 8000)
    };
  }
  loading.value = false;
}

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: trendData.value.times,
    boundaryGap: false
  },
  yAxis: { type: 'value', name: '能耗 (kWh)' },
  dataZoom: [
    { type: 'inside', start: 0, end: 100 },
    { type: 'slider', start: 0, end: 100, height: 20, bottom: 5 }
  ],
  series: [
    {
      name: '能耗',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: { opacity: 0.3 },
      lineStyle: { width: 2 },
      data: trendData.value.values
    }
  ]
}));

function handleRangeChange() {
  loadData();
}

onMounted(loadData);

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">能耗趋势</span>
        <ElRadioGroup v-model="timeRange" size="small" @change="handleRangeChange">
          <ElRadioButton value="hour">时</ElRadioButton>
          <ElRadioButton value="day">日</ElRadioButton>
          <ElRadioButton value="week">周</ElRadioButton>
          <ElRadioButton value="month">月</ElRadioButton>
        </ElRadioGroup>
      </div>
    </template>
    <div v-if="!loading" class="h-280px">
      <VChart :option="chartOption" autoresize />
    </div>
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>
