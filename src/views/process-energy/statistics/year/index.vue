<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { fetchYearProcessEnergyList, fetchYearProcessEnergyChart } from '@/service/api/process-energy';

defineOptions({ name: 'YearProcessEnergy' });

const loading = ref(false);
const chartLoading = ref(false);
const tableData = ref<Api.ProcessEnergy.YearList[]>([]);
const chartData = ref<Api.ProcessEnergy.ChartData[]>([]);
const selectedYear = ref(dayjs().format('YYYY'));
const selectedIndexId = ref('');
const energyType = ref('');

// ECharts 实例
let chartInstance: echarts.ECharts | null = null;
const chartRef = ref<HTMLElement | null>(null);

// 月份名称
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  try {
    const params: Api.ProcessEnergy.YearQuery = {
      indexCode: 'default',
      dataTime: selectedYear.value,
      timeType: 'month',
      energyType: energyType.value || undefined
    };
    tableData.value = await fetchYearProcessEnergyList(params);

    if (tableData.value.length > 0 && !selectedIndexId.value) {
      selectedIndexId.value = tableData.value[0].indexId;
    }
  } catch {
    ElMessage.error('获取年工序能耗数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载图表数据
const loadChartData = async () => {
  if (!selectedIndexId.value) return;

  chartLoading.value = true;
  try {
    const params: Api.ProcessEnergy.ChartQuery = {
      indexId: selectedIndexId.value,
      dataTime: selectedYear.value,
      timeType: 'month',
      energyType: energyType.value || undefined
    };
    chartData.value = await fetchYearProcessEnergyChart(params);
    updateChart();
  } catch {
    ElMessage.error('获取图表数据失败');
  } finally {
    chartLoading.value = false;
  }
};

// 更新图表
const updateChart = () => {
  if (!chartRef.value) return;

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  const xData: string[] = [];
  const yData: number[] = [];

  chartData.value.forEach(item => {
    xData.push(monthNames[dayjs(item.dataTime).month()]);
    yData.push(item.value);
  });

  const option: echarts.EChartsOption = {
    title: {
      text: '年度能耗趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${selectedYear.value}年${data.name}<br/>能耗: ${data.value?.toFixed(2) || '-'}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      name: '月份'
    },
    yAxis: {
      type: 'value',
      name: '能耗值'
    },
    series: [
      {
        name: '能耗',
        type: 'line',
        data: yData,
        smooth: true,
        itemStyle: {
          color: '#E6A23C'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// 行点击事件
const handleRowClick = (row: Api.ProcessEnergy.YearList) => {
  selectedIndexId.value = row.indexId;
  loadChartData();
};

// 监听年份和能源类型变化
watch([selectedYear, energyType], () => {
  loadTableData();
});

// 监听选中指标变化
watch(selectedIndexId, () => {
  loadChartData();
});

// 窗口大小变化时重绘图表
const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  loadTableData();
  window.addEventListener('resize', handleResize);
});
</script>

<template>
  <div class="year-process-energy p-4">
    <!-- 筛选条件 -->
    <ElCard class="mb-4" shadow="hover">
      <div class="flex items-center gap-4">
        <ElDatePicker
          v-model="selectedYear"
          type="year"
          placeholder="选择年份"
          format="YYYY"
          value-format="YYYY"
        />
        <ElSelect v-model="energyType" placeholder="能源类型" clearable>
          <ElOption label="全部" value="" />
          <ElOption label="电" value="electricity" />
          <ElOption label="水" value="water" />
          <ElOption label="气" value="gas" />
          <ElOption label="热" value="heat" />
        </ElSelect>
      </div>
    </ElCard>

    <!-- 数据表格 -->
    <ElCard class="mb-4" shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-bold">年工序能耗统计（12月维度）</span>
          <span class="text-sm text-gray-500">点击行查看趋势图</span>
        </div>
      </template>
      <ElTable
        v-loading="loading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        @row-click="handleRowClick"
      >
        <ElTableColumn prop="indexName" label="指标名称" width="150" fixed="left" />
        <ElTableColumn prop="unitId" label="单位" width="80" />
        <ElTableColumn
          v-for="i in 12"
          :key="`value${i}`"
          :prop="`value${i}`"
          :label="`${i}月`"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            {{ row[`value${i}` as keyof Api.ProcessEnergy.YearList]?.toFixed(2) || '-' }}
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 趋势图表 -->
    <ElCard shadow="hover">
      <template #header>
        <span class="font-bold">年度能耗趋势图</span>
      </template>
      <div v-loading="chartLoading" class="chart-container" style="height: 400px">
        <div ref="chartRef" class="w-full h-full" />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.year-process-energy {
  min-height: 100%;
}

.chart-container {
  min-height: 400px;
}
</style>