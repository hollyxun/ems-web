<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as ECharts from 'echarts';
import { fetchElectricityMeterList, fetchPowerFactorAnalysis } from '@/service/api/electric-analysis';

// 查询参数
const queryParams = ref<Api.PowerFactor.Request>({
  nodeId: '',
  meterId: '',
  timeCode: dayjs().format('YYYY-MM-DD')
});

// 电表选项
const meterOptions = ref<Api.ElectricLoad.MeterOption[]>([]);

// 数据
const loading = ref(false);
const chartData = ref<Api.PowerFactor.Response | null>(null);

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
    const { data: res } = await fetchPowerFactorAnalysis(queryParams.value);
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
  const xData = data.itemList.map((item: Api.PowerFactor.Item) => item.timeCodeChart);
  const values = data.itemList.map((item: Api.PowerFactor.Item) => Number.parseFloat(item.value) || 0);

  const option: ECharts.EChartsOption = {
    title: {
      text: '功率因数曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
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
      name: '功率因数',
      min: 0.8,
      max: 1
    },
    series: [
      {
        name: '功率因数',
        type: 'line',
        data: values,
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ]
          }
        },
        lineStyle: { width: 2 },
        itemStyle: { color: '#67C23A' }
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
    avg: Number.parseFloat(detail.avg) || 0
  };
});

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
        <ElFormItem label="时间">
          <ElDatePicker v-model="queryParams.timeCode" type="date" value-format="YYYY-MM-DD" style="width: 150px" />
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
          <ElStatistic title="最大功率因数" :value="summaryData.max" />
          <div class="mt-2 text-sm text-gray-500">{{ summaryData.maxTime }}</div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="最小功率因数" :value="summaryData.min" />
          <div class="mt-2 text-sm text-gray-500">{{ summaryData.minTime }}</div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="平均功率因数" :value="summaryData.avg" />
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
