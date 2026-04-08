<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Bottom, Top } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { fetchMiddleCarbonEmission, fetchUpCarbonEmission } from '@/service/api/carbonemission';

defineOptions({ name: 'CarbonEmissionCalculate' });

const loading = ref(false);
const queryParams = ref<Api.CarbonEmission.QueryParams>({
  nodeId: 1,
  timeType: 'MONTH',
  dataTime: new Date().toISOString().split('T')[0]
});

const timeTypes = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 顶部汇总数据
const upData = ref<Api.CarbonEmission.Summary | null>(null);
// 排名数据
const rankData = ref<Api.CarbonEmission.Rank[]>([]);
// 趋势数据
const trendData = ref<Api.CarbonEmission.Trend[]>([]);
// 表格数据
const tableData = ref<Api.CarbonEmission.Trend[]>([]);

// 图标配置
const iconColors = ['#3371eb', '#f52528', '#ff6200', '#ffce0c', '#78e801'];

// 获取数据
async function getData() {
  loading.value = true;
  try {
    // 获取顶部汇总
    const upRes = await fetchUpCarbonEmission(queryParams.value);
    if (upRes.data) {
      upData.value = upRes.data.upData[0] || null;
      rankData.value = upRes.data.down || [];
    }

    // 获取趋势数据
    const midRes = await fetchMiddleCarbonEmission(queryParams.value);
    if (midRes.data) {
      trendData.value = midRes.data.data || [];
      tableData.value = midRes.data.data || [];
      renderChart();
    }
  } finally {
    loading.value = false;
  }
}

// 渲染图表
function renderChart() {
  const chartDom = document.getElementById('carbonChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  const xData = trendData.value.map((item: Api.CarbonEmission.Trend) => item.timeLabel);
  const valueData = trendData.value.map((item: Api.CarbonEmission.Trend) => item.value);
  const yoyData = trendData.value.map((item: Api.CarbonEmission.Trend) => item.yoy);
  const qoqData = trendData.value.map((item: Api.CarbonEmission.Trend) => item.qoq);

  myChart.setOption({
    color: ['#2979ff', '#19be6b', '#ff9900'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 45,
      left: '7%',
      right: '5%',
      bottom: 10,
      containLabel: true
    },
    legend: {
      data: ['碳排放量', '同比', '环比']
    },
    xAxis: {
      type: 'category',
      data: xData
    },
    yAxis: [
      {
        type: 'value',
        name: 'tCO2e'
      },
      {
        type: 'value',
        name: '%'
      }
    ],
    series: [
      {
        name: '碳排放量',
        type: 'bar',
        barWidth: 12,
        itemStyle: { borderRadius: [15, 15, 0, 0] },
        data: valueData
      },
      {
        name: '同比',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        data: yoyData
      },
      {
        name: '环比',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'none',
        data: qoqData
      }
    ]
  });

  window.addEventListener('resize', () => myChart.resize());
}

function handleQuery() {
  getData();
}

function handleReset() {
  queryParams.value.timeType = 'MONTH';
  queryParams.value.dataTime = new Date().toISOString().split('T')[0];
  getData();
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
        <ElFormItem label="期间" class="w-280px">
          <ElSelect v-model="queryParams.timeType" placeholder="选择期间">
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间" class="w-280px">
          <ElDatePicker
            v-model="queryParams.dataTime"
            :type="queryParams.timeType === 'YEAR' ? 'year' : queryParams.timeType === 'MONTH' ? 'month' : 'date'"
            value-format="YYYY-MM-DD"
            placeholder="选择时间"
          />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="handleQuery">搜索</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 顶部汇总卡片 -->
    <ElCard v-loading="loading" class="card-wrapper">
      <div class="flex flex-wrap gap-16px">
        <template v-for="(item, index) in upData?.details" :key="item.mediumCode">
          <div class="min-w-200px w-19% border-1px border-gray-200 rd-8px border-solid p-16px">
            <div class="flex items-center gap-16px">
              <div class="text-16px font-bold">{{ item.mediumName }}</div>
            </div>
            <div class="mt-18px flex justify-between">
              <div class="text-gray-500">碳排放量/tCO2e</div>
              <div :style="{ color: iconColors[index % 5] }" class="font-bold">{{ item.value.toFixed(2) }}</div>
            </div>
            <div class="mt-8px flex justify-between">
              <div class="text-gray-500">同比</div>
              <div :style="{ color: iconColors[index % 5] }" class="flex items-center gap-4px font-bold">
                {{ Math.abs(item.yoy).toFixed(2) }}%
                <ElIcon v-if="item.yoy > 0" color="green"><Top /></ElIcon>
                <ElIcon v-else-if="item.yoy < 0" color="red"><Bottom /></ElIcon>
              </div>
            </div>
          </div>
        </template>
      </div>
    </ElCard>

    <!-- 趋势图表 -->
    <ElCard class="card-wrapper" title="碳排放量同环比">
      <div id="carbonChart" class="h-400px w-full"></div>
    </ElCard>

    <!-- 表格 -->
    <ElCard class="card-wrapper" title="碳排放量统计分析表">
      <ElTable v-loading="loading" :data="tableData" border>
        <ElTableColumn prop="timeLabel" label="时间" align="center" />
        <ElTableColumn prop="value" label="碳排放量(tCO2e)" align="center">
          <template #default="{ row }">{{ row.value?.toFixed(2) || 0 }}</template>
        </ElTableColumn>
        <ElTableColumn prop="yoy" label="同比(%)" align="center">
          <template #default="{ row }">{{ row.yoy?.toFixed(2) || 0 }}</template>
        </ElTableColumn>
        <ElTableColumn prop="qoq" label="环比(%)" align="center">
          <template #default="{ row }">{{ row.qoq?.toFixed(2) || 0 }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped></style>
