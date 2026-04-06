<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { fetchCostTrend } from '@/service/api/costmanagement';

defineOptions({ name: 'CostTrend' });

const queryParams = ref({
  organizationId: 1,
  timeType: 'MONTH' as 'DAY' | 'MONTH' | 'YEAR',
  dataTime: new Date().toISOString().slice(0, 7)
});

const timeTypes = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

const loading = ref(false);
const trendData = ref<any[]>([]);

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

async function getData() {
  loading.value = true;
  try {
    const { data, error } = await fetchCostTrend(queryParams.value);
    if (!error && data) {
      trendData.value = data;
      updateChart();
    }
  } finally {
    loading.value = false;
  }
}

function updateChart() {
  if (!chartRef.value || !trendData.value.length) return;

  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  const option: echarts.EChartsOption = {
    title: { text: '成本趋势分析', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['总费用', '电费', '水费', '气费', '热费'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map(d => d.timeLabel)
    },
    yAxis: {
      type: 'value',
      name: '费用(元)'
    },
    series: [
      {
        name: '总费用',
        type: 'line',
        data: trendData.value.map(d => d.totalFee),
        smooth: true,
        lineStyle: { width: 3 }
      },
      {
        name: '电费',
        type: 'bar',
        data: trendData.value.map(d => d.electricFee)
      },
      {
        name: '水费',
        type: 'bar',
        data: trendData.value.map(d => d.waterFee)
      },
      {
        name: '气费',
        type: 'bar',
        data: trendData.value.map(d => d.gasFee)
      },
      {
        name: '热费',
        type: 'bar',
        data: trendData.value.map(d => d.heatFee)
      }
    ]
  };

  chart.setOption(option);
}

watch(
  () => queryParams.value.timeType,
  () => {
    if (queryParams.value.timeType === 'DAY') {
      queryParams.value.dataTime = new Date().toISOString().slice(0, 10);
    } else if (queryParams.value.timeType === 'MONTH') {
      queryParams.value.dataTime = new Date().toISOString().slice(0, 7);
    } else {
      queryParams.value.dataTime = new Date().toISOString().slice(0, 4);
    }
  }
);

onMounted(() => {
  getData();
  window.addEventListener('resize', () => chart?.resize());
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="queryParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="时间类型" class="w-280px">
          <ElSelect v-model="queryParams.timeType" placeholder="选择时间类型">
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="数据时间" class="w-280px">
          <ElDatePicker
            v-model="queryParams.dataTime"
            :type="queryParams.timeType === 'DAY' ? 'date' : queryParams.timeType === 'MONTH' ? 'month' : 'year'"
            placeholder="选择数据时间"
            :value-format="
              queryParams.timeType === 'DAY' ? 'YYYY-MM-DD' : queryParams.timeType === 'MONTH' ? 'YYYY-MM' : 'YYYY'
            "
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" :loading="loading" @click="getData">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <div ref="chartRef" v-loading="loading" class="h-500px" />
    </ElCard>
  </div>
</template>
