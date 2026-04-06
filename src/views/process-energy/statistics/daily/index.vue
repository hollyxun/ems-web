<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { fetchDailyProcessEnergyChart, fetchDailyProcessEnergyList } from '@/service/api/process-energy';

defineOptions({ name: 'DailyProcessEnergy' });

const loading = ref(false);
const chartLoading = ref(false);
const tableData = ref<Api.ProcessEnergy.DailyList[]>([]);
const chartData = ref<Api.ProcessEnergy.ChartData[]>([]);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const selectedIndexId = ref('');
const energyType = ref('');

// ECharts 实例
let chartInstance: echarts.ECharts | null = null;
const chartRef = ref<HTMLElement | null>(null);

// 表格列定义
const tableColumns = computed(() => {
  const baseColumns = [
    { prop: 'indexName', label: '指标名称', width: 150, fixed: 'left' as const },
    { prop: 'unitId', label: '单位', width: 80 }
  ];

  const hourColumns = [];
  for (let i = 0; i < 24; i++) {
    hourColumns.push({
      prop: `value${i}`,
      label: `${i}时`,
      width: 80,
      align: 'center' as const,
      formatter: (row: Api.ProcessEnergy.DailyList) =>
        formatValue(row[`value${i}` as keyof Api.ProcessEnergy.DailyList])
    });
  }

  return [...baseColumns, ...hourColumns];
});

// 格式化数值
const formatValue = (value: number | undefined) => {
  if (value === undefined || value === null) return '-';
  return value.toFixed(2);
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  try {
    const params: Api.ProcessEnergy.DailyQuery = {
      indexCode: 'default', // TODO: 从模型节点选择器获取
      dataTime: selectedDate.value,
      timeType: 'hour',
      energyType: energyType.value || undefined
    };
    tableData.value = await fetchDailyProcessEnergyList(params);

    // 默认选中第一个指标显示图表
    if (tableData.value.length > 0 && !selectedIndexId.value) {
      selectedIndexId.value = tableData.value[0].indexId;
    }
  } catch {
    ElMessage.error('获取日工序能耗数据失败');
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
      dataTime: selectedDate.value,
      timeType: 'hour',
      energyType: energyType.value || undefined
    };
    chartData.value = await fetchDailyProcessEnergyChart(params);
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
    xData.push(dayjs(item.dataTime).format('HH:mm'));
    yData.push(item.value);
  });

  const option: echarts.EChartsOption = {
    title: {
      text: '24小时能耗趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>能耗: ${data.value?.toFixed(2) || '-'}`;
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
      axisLabel: {
        interval: 2
      }
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
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// 行点击事件
const handleRowClick = (row: Api.ProcessEnergy.DailyList) => {
  selectedIndexId.value = row.indexId;
  loadChartData();
};

// 监听日期和能源类型变化
watch([selectedDate, energyType], () => {
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
  <div class="daily-process-energy p-4">
    <!-- 筛选条件 -->
    <ElCard class="mb-4" shadow="hover">
      <div class="flex items-center gap-4">
        <ElDatePicker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
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
          <span class="font-bold">日工序能耗统计（24小时维度）</span>
          <span class="text-sm text-gray-500">点击行查看趋势图</span>
        </div>
      </template>
      <ElTable v-loading="loading" :data="tableData" border stripe highlight-current-row @row-click="handleRowClick">
        <ElTableColumn
          v-for="col in tableColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :fixed="col.fixed"
          :align="col.align || 'left'"
        >
          <template #default="{ row }">
            {{ col.formatter ? col.formatter(row) : row[col.prop as keyof typeof row] }}
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 趋势图表 -->
    <ElCard shadow="hover">
      <template #header>
        <span class="font-bold">能耗趋势图</span>
      </template>
      <div v-loading="chartLoading" class="chart-container" style="height: 400px">
        <div ref="chartRef" class="h-full w-full" />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.daily-process-energy {
  min-height: 100%;
}

.chart-container {
  min-height: 400px;
}
</style>
