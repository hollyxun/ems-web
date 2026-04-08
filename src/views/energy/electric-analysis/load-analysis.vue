<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as ECharts from 'echarts';
import { fetchElectricLoadAnalysis, fetchElectricityMeterList } from '@/service/api/electric-analysis';

// 查询参数
const queryParams = ref<Api.ElectricLoad.Request>({
  nodeId: '',
  meterId: '',
  timeType: 'DAY',
  timeCode: dayjs().format('YYYY-MM-DD')
});

// 电表选项
const meterOptions = ref<Api.ElectricLoad.MeterOption[]>([]);

// 数据
const loading = ref(false);
const chartData = ref<Api.ElectricLoad.Response | null>(null);

// 时间类型选项
const timeTypeOptions = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
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

  loading.value = true;
  try {
    const { data: res } = await fetchElectricLoadAnalysis(queryParams.value);
    chartData.value = res || null;
    updateChart();
  } catch (_error) {
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
  const xData = data.itemList.map((item: Api.ElectricLoad.Item) => item.timeCodeChart);
  const avgData = data.itemList.map((item: Api.ElectricLoad.Item) => Number.parseFloat(item.avg) || 0);
  const maxData = data.itemList.map((item: Api.ElectricLoad.Item) => Number.parseFloat(item.max) || 0);
  const minData = data.itemList.map((item: Api.ElectricLoad.Item) => Number.parseFloat(item.min) || 0);

  const option: ECharts.EChartsOption = {
    title: {
      text: '负荷分析曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['平均值', '最大值', '最小值'],
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
      boundaryGap: false,
      data: xData
    },
    yAxis: {
      type: 'value',
      name: '负荷 (kW)'
    },
    series: [
      {
        name: '平均值',
        type: 'line',
        data: avgData,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '最大值',
        type: 'line',
        data: maxData,
        smooth: true,
        lineStyle: { width: 2, type: 'dashed' },
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '最小值',
        type: 'line',
        data: minData,
        smooth: true,
        lineStyle: { width: 2, type: 'dashed' },
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
    max: Number.parseFloat(detail.max) || 0,
    maxTime: detail.maxTime,
    min: Number.parseFloat(detail.min) || 0,
    minTime: detail.minTime,
    avg: Number.parseFloat(detail.avg) || 0,
    rate: Number.parseFloat(detail.rate) || 0
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
  // 初始化模拟数据
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
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="最大负荷" :value="summaryData.max">
            <template #suffix>kW</template>
          </ElStatistic>
          <div class="mt-2 text-sm text-gray-500">{{ summaryData.maxTime }}</div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="最小负荷" :value="summaryData.min">
            <template #suffix>kW</template>
          </ElStatistic>
          <div class="mt-2 text-sm text-gray-500">{{ summaryData.minTime }}</div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="平均负荷" :value="summaryData.avg">
            <template #suffix>kW</template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="负荷率" :value="summaryData.rate" />
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
