<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { fetchGetDailyList, fetchGetDailyListChart } from '@/service/api/comprehensive';

defineOptions({ name: 'DailyComprehensive' });

// 查询参数
const queryParams = ref({
  indexCode: '',
  indexId: '',
  timeType: 'DAY',
  dataTime: dayjs().format('YYYY-MM-DD'),
  energyType: ''
});

// 加载状态
const loading = ref(false);

// 数据
const dataList = ref<Api.Comprehensive.DailyComprehensive[]>([]);
const chartData = ref<Api.Comprehensive.DailyComprehensive[]>([]);

// 图表实例
let chart: echarts.ECharts | null = null;

// 获取数据
async function getList() {
  loading.value = true;
  try {
    const params: Api.Comprehensive.DailyComprehensiveQuery = {
      indexCode: queryParams.value.indexCode,
      indexId: queryParams.value.indexId,
      timeType: queryParams.value.timeType,
      dataTime: queryParams.value.dataTime,
      energyType: queryParams.value.energyType
    };

    // 获取列表数据
    const { data: listResult } = await fetchGetDailyList(params);
    if (listResult) {
      dataList.value = listResult;
    }

    // 获取图表数据
    const { data: chartResult } = await fetchGetDailyListChart(params);
    if (chartResult) {
      chartData.value = chartResult;
      updateChart();
    }
  } catch {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
}

// 初始化图表
function initChart() {
  const chartDom = document.getElementById('dailyChart');
  if (chartDom) {
    if (chart) echarts.dispose(chartDom);
    chart = echarts.init(chartDom);
  }
}

// 更新图表
function updateChart() {
  if (!chart) {
    initChart();
  }
  if (!chart) return;

  const xData = chartData.value.map(item => dayjs(item.dataTime).format('HH:mm'));
  const yData = chartData.value.map(item => item.value || 0);

  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '能耗值'
    },
    series: [
      {
        name: '能耗值',
        type: 'line',
        data: yData,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  });
}

// 搜索
function handleQuery() {
  getList();
}

// 导出
function handleExport() {
  ElMessage.info('导出功能开发中');
}

onMounted(() => {
  initChart();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <!-- 搜索区域 -->
    <ElCard class="card-wrapper">
      <ElForm :model="queryParams" inline>
        <ElFormItem label="指标编码">
          <ElInput v-model="queryParams.indexCode" placeholder="请输入指标编码" style="width: 150px" />
        </ElFormItem>
        <ElFormItem label="时间">
          <ElDatePicker
            v-model="queryParams.dataTime"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 160px"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleQuery">搜索</ElButton>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="warning" @click="handleExport">导出</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 图表区域 -->
    <ElCard class="card-wrapper">
      <template #header>
        <span>日综合指标分析图表</span>
      </template>
      <div id="dailyChart" v-loading="loading" style="height: 350px" />
    </ElCard>

    <!-- 数据表格 -->
    <ElCard class="flex-1 card-wrapper">
      <template #header>
        <span>日综合指标分析列表</span>
      </template>
      <ElTable v-loading="loading" :data="dataList" border height="100%">
        <ElTableColumn prop="dataTime" label="时间" align="center" min-width="150">
          <template #default="{ row }">
            {{ dayjs(row.dataTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="energyType" label="能源类型" align="center" min-width="100" />
        <ElTableColumn prop="value" label="能耗值" align="center" min-width="120" />
        <ElTableColumn prop="compareValue" label="同期值" align="center" min-width="120" />
        <ElTableColumn prop="qoqValue" label="环比值" align="center" min-width="120" />
      </ElTable>
    </ElCard>
  </div>
</template>
