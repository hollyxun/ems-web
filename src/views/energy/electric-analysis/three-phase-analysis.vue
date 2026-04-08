<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as ECharts from 'echarts';
import { fetchElectricityMeterList, fetchThreePhaseAnalysis } from '@/service/api/electric-analysis';

// 查询参数
const queryParams = ref<Api.ThreePhase.Request>({
  nodeId: '',
  meterId: '',
  timeType: 'DAY',
  timeCode: dayjs().format('YYYY-MM-DD'),
  requestType: '0'
});

// 电表选项
const meterOptions = ref<Api.ElectricLoad.MeterOption[]>([]);

// 数据
const loading = ref(false);
const chartData = ref<Api.ThreePhase.Response | null>(null);

// 时间类型选项
const timeTypeOptions = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 请求类型选项
const requestTypeOptions = [
  { label: '电压', value: '0' },
  { label: '电流', value: '1' }
];

// 图表实例
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts.ECharts | null = null;

// 获取电表列表
const getMeterList = async () => {
  if (!queryParams.value.nodeId) return;
  try {
    const { data: res } = await fetchElectricityMeterList(queryParams.value.nodeId);
    meterOptions.value = res || [];
    if (res && res.length > 0 && !queryParams.value.meterId) {
      queryParams.value.meterId = res[0].code;
    }
  } catch {
    // 忽略错误
  }
};

// 查询数据
const fetchData = async () => {
  if (!queryParams.value.nodeId) {
    ElMessage.warning('请选择节点');
    return;
  }
  if (!queryParams.value.meterId) {
    ElMessage.warning('请选择电表');
    return;
  }

  loading.value = true;
  try {
    const { data: res } = await fetchThreePhaseAnalysis(queryParams.value);
    chartData.value = res || null;
    updateChart();
  } catch {
    ElMessage.error('查询失败');
  } finally {
    loading.value = false;
  }
};

// 更新图表
const updateChart = () => {
  if (!chartRef.value || !chartData.value) return;

  if (!chartInstance) {
    chartInstance = ECharts.init(chartRef.value);
  }

  const data = chartData.value;
  const xData = data.itemList.map((item: Api.ThreePhase.Item) => item.timeCodeChart);
  const phaseA = data.itemList.map((item: Api.ThreePhase.Item) => Number.parseFloat(item.phaseA) || 0);
  const phaseB = data.itemList.map((item: Api.ThreePhase.Item) => Number.parseFloat(item.phaseB) || 0);
  const phaseC = data.itemList.map((item: Api.ThreePhase.Item) => Number.parseFloat(item.phaseC) || 0);

  const unit = queryParams.value.requestType === '0' ? 'V' : 'A';

  const option: ECharts.EChartsOption = {
    title: {
      text: queryParams.value.requestType === '0' ? '三相电压曲线' : '三相电流曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['A相', 'B相', 'C相'],
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
      data: xData
    },
    yAxis: {
      type: 'value',
      name: unit
    },
    series: [
      {
        name: 'A相',
        type: 'line',
        data: phaseA,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: 'B相',
        type: 'line',
        data: phaseB,
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: 'C相',
        type: 'line',
        data: phaseC,
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  };

  chartInstance.setOption(option);
};

// 汇总数据
const summaryData = computed(() => {
  if (!chartData.value) return null;
  const detail = chartData.value.detail;
  return {
    maxUnbalance: Number.parseFloat(detail.maxUnbalance) || 0,
    maxUnbalanceTime: detail.maxUnbalanceTime,
    avgUnbalance: Number.parseFloat(detail.avgUnbalance) || 0
  };
});

// 处理时间类型变化
const handleTimeTypeChange = () => {
  const { timeType } = queryParams.value;
  const now = dayjs();
  switch (timeType) {
    case 'DAY':
      queryParams.value.timeCode = now.format('YYYY-MM-DD');
      break;
    case 'MONTH':
      queryParams.value.timeCode = now.format('YYYY-MM');
      break;
    case 'YEAR':
      queryParams.value.timeCode = now.format('YYYY');
      break;
  }
};

// 窗口大小变化
const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  queryParams.value.nodeId = 'factory-001';
  getMeterList();
  fetchData();

  window.addEventListener('resize', handleResize);
});
</script>

<template>
  <div class="p-4">
    <!-- 查询条件 -->
    <ElCard class="mb-4">
      <ElForm :model="queryParams" inline>
        <ElFormItem label="类型">
          <ElSelect v-model="queryParams.requestType" style="width: 100px">
            <ElOption v-for="item in requestTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间类型">
          <ElSelect v-model="queryParams.timeType" style="width: 100px" @change="handleTimeTypeChange">
            <ElOption v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间">
          <ElDatePicker
            v-if="queryParams.timeType === 'DAY'"
            v-model="queryParams.timeCode"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
          <ElDatePicker
            v-else-if="queryParams.timeType === 'MONTH'"
            v-model="queryParams.timeCode"
            type="month"
            value-format="YYYY-MM"
            style="width: 150px"
          />
          <ElDatePicker v-else v-model="queryParams.timeCode" type="year" value-format="YYYY" style="width: 150px" />
        </ElFormItem>
        <ElFormItem label="电表">
          <ElSelect v-model="queryParams.meterId" placeholder="请选择电表" style="width: 180px">
            <ElOption v-for="item in meterOptions" :key="item.code" :label="item.label" :value="item.code" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="fetchData">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 汇总卡片 -->
    <ElRow v-if="summaryData" :gutter="16" class="mb-4">
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="最大不平衡率" :value="summaryData.maxUnbalance" />
          <div class="mt-2 text-sm text-gray-500">{{ summaryData.maxUnbalanceTime }}</div>
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="平均不平衡率" :value="summaryData.avgUnbalance" />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 图表 -->
    <ElCard>
      <div ref="chartRef" v-loading="loading" style="height: 400px"></div>
    </ElCard>
  </div>
</template>

<style scoped>
.text-gray-500 {
  color: #909399;
}
</style>
