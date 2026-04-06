<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { fetchCostTrend } from '@/service/api/costmanagement';
import type { CostManagement } from '@/service/api/costmanagement';

defineOptions({ name: 'CostTrendAnalysis' });

const loading = ref(false);
const queryParams = ref({
  organizationId: 1 as number,
  timeType: 'YEAR' as string,
  dataTime: new Date().toISOString().split('T')[0]
});

const trendData = ref<CostManagement.TrendData[]>([]);

async function getData() {
  loading.value = true;
  try {
    const res = await fetchCostTrend(queryParams.value);
    if (res.data) {
      trendData.value = res.data;
      renderCharts();
    }
  } finally {
    loading.value = false;
  }
}

function renderCharts() {
  renderCostChart();
  renderAmountChart();
}

function renderCostChart() {
  const chartDom = document.getElementById('costChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);
  const xData = trendData.value.map(item => item.timeLabel);

  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总费用', '电费', '水费', '气费', '热费'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value', name: '元' },
    series: [
      { name: '总费用', type: 'line', data: trendData.value.map(item => item.totalFee) },
      { name: '电费', type: 'line', data: trendData.value.map(item => item.electricFee) },
      { name: '水费', type: 'line', data: trendData.value.map(item => item.waterFee) },
      { name: '气费', type: 'line', data: trendData.value.map(item => item.gasFee) },
      { name: '热费', type: 'line', data: trendData.value.map(item => item.heatFee) }
    ]
  });
}

function renderAmountChart() {
  const chartDom = document.getElementById('amountChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);
  const xData = trendData.value.map(item => item.timeLabel);

  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['电量(kWh)', '水量(m³)', '气量(m³)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [
      { name: '电量(kWh)', type: 'bar', data: trendData.value.map(item => item.electricAmount) },
      { name: '水量(m³)', type: 'bar', data: trendData.value.map(item => item.waterAmount) },
      { name: '气量(m³)', type: 'bar', data: trendData.value.map(item => item.gasAmount) }
    ]
  });
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <!-- 搜索表单 -->
    <ElCard class="card-wrapper">
      <ElForm :model="queryParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="时间" class="w-280px">
          <ElDatePicker v-model="queryParams.dataTime" type="year" value-format="YYYY-MM-DD" placeholder="选择年份" />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getData">搜索</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 成本趋势图 -->
    <ElCard v-loading="loading" class="card-wrapper" title="成本趋势（元）">
      <div id="costChart" class="h-400px w-full"></div>
    </ElCard>

    <!-- 能耗趋势图 -->
    <ElCard v-loading="loading" class="card-wrapper" title="能耗趋势">
      <div id="amountChart" class="h-400px w-full"></div>
    </ElCard>

    <!-- 数据表格 -->
    <ElCard class="card-wrapper" title="成本明细">
      <ElTable v-loading="loading" :data="trendData" border>
        <ElTableColumn prop="timeLabel" label="时间" align="center" width="100" />
        <ElTableColumn label="费用（元）" align="center">
          <ElTableColumn prop="totalFee" label="总费用" align="center">
            <template #default="{ row }">{{ row.totalFee?.toFixed(2) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="electricFee" label="电费" align="center">
            <template #default="{ row }">{{ row.electricFee?.toFixed(2) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="waterFee" label="水费" align="center">
            <template #default="{ row }">{{ row.waterFee?.toFixed(2) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="gasFee" label="气费" align="center">
            <template #default="{ row }">{{ row.gasFee?.toFixed(2) }}</template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="能耗量" align="center">
          <ElTableColumn prop="electricAmount" label="电量(kWh)" align="center">
            <template #default="{ row }">{{ row.electricAmount?.toFixed(2) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="waterAmount" label="水量(m³)" align="center">
            <template #default="{ row }">{{ row.waterAmount?.toFixed(2) }}</template>
          </ElTableColumn>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>
