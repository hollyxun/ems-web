<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { fetchExportYear, fetchGetYearList, fetchGetYearListChart } from '@/service/api/comprehensive';

defineOptions({ name: 'YearComprehensive' });

// 查询参数
const queryParams = ref({
  indexCode: '',
  indexId: '',
  dataTime: dayjs().format('YYYY-MM-DD'),
  energyType: ''
});

// 加载状态
const loading = ref(false);

// 数据
const dataList = ref<Api.Comprehensive.YearComprehensive[]>([]);
const chartData = ref<Api.Comprehensive.YearComprehensive[]>([]);

// 图表实例
let chart: echarts.ECharts | null = null;

// 获取数据
async function getList() {
  loading.value = true;
  try {
    const params: Api.Comprehensive.YearComprehensiveQuery = {
      indexCode: queryParams.value.indexCode,
      indexId: queryParams.value.indexId,
      dataTime: queryParams.value.dataTime,
      energyType: queryParams.value.energyType
    };

    // 获取列表数据
    const { data: listResult } = await fetchGetYearList(params);
    if (listResult) {
      dataList.value = listResult.list || [];
    }

    // 获取图表数据
    const { data: chartResult } = await fetchGetYearListChart(params);
    if (chartResult) {
      chartData.value = chartResult;
      updateChart();
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
}

// 初始化图表
function initChart() {
  const chartDom = document.getElementById('yearChart');
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

  const xData = chartData.value.map(item => dayjs(item.dataTime).format('MM月'));
  const yData = chartData.value.map(item => item.value || 0);

  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: xData
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
async function handleExport() {
  try {
    await fetchExportYear({
      indexCode: queryParams.value.indexCode,
      dataTime: queryParams.value.dataTime
    });
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  }
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
        <ElFormItem label="年份">
          <ElDatePicker
            v-model="queryParams.dataTime"
            type="year"
            format="YYYY"
            value-format="YYYY-MM-DD"
            placeholder="请选择年份"
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
        <span>年综合指标分析图表</span>
      </template>
      <div id="yearChart" v-loading="loading" style="height: 350px" />
    </ElCard>

    <!-- 数据表格 -->
    <ElCard class="flex-1 card-wrapper">
      <template #header>
        <span>年综合指标分析列表</span>
      </template>
      <ElTable v-loading="loading" :data="dataList" border height="100%">
        <ElTableColumn prop="dataTime" label="月份" align="center" min-width="100">
          <template #default="{ row }">
            {{ dayjs(row.dataTime).format('YYYY-MM') }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="energyType" label="能源类型" align="center" min-width="100" />
        <ElTableColumn prop="value" label="能耗值" align="center" min-width="120" />
        <ElTableColumn prop="compareValue" label="同期值" align="center" min-width="120" />
      </ElTable>
    </ElCard>
  </div>
</template>
