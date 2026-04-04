<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import {
  fetchGetComprehensiveList,
  fetchGetYoY,
  fetchGetEnergyRanking,
  fetchExportComprehensive
} from '@/service/api/comprehensive';
import { useThemeStore } from '@/store/modules/theme';
import dayjs from 'dayjs';

defineOptions({ name: 'ComprehensiveStatistics' });

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

// 查询参数
const queryParams = ref({
  nodeId: '',
  nodeName: '',
  timeType: 'MONTH',
  dataTime: dayjs().format('YYYY-MM-DD')
});

// 时间类型选项
const timeTypeOptions = [
  { label: '年', value: 'YEAR' },
  { label: '月', value: 'MONTH' },
  { label: '日', value: 'DAY' }
];

// 加载状态
const loading = ref(false);

// 图表实例
let chart1: echarts.ECharts | null = null;
let chart2: echarts.ECharts | null = null;
let chart3: echarts.ECharts | null = null;

// 数据
const comprehensiveList = ref<Api.Comprehensive.ComprehensiveListItem[]>([]);
const comprehensiveTable = ref([
  {
    icon: 0,
    title: '同比',
    data: [
      { label: '', value: 0 },
      { label: '', value: 0 }
    ]
  },
  {
    icon: 0,
    title: '环比',
    data: [
      { label: '', value: 0 },
      { label: '', value: 0 }
    ]
  }
]);

// 处理时间类型变更
function handleTimeTypeChange() {
  queryParams.value.dataTime = dayjs().format('YYYY-MM-DD');
}

// 获取日期选择器类型
const datePickerType = computed(() => {
  switch (queryParams.value.timeType) {
    case 'YEAR':
      return 'year';
    case 'MONTH':
      return 'month';
    default:
      return 'date';
  }
});

// 获取日期格式
const dateFormat = computed(() => {
  switch (queryParams.value.timeType) {
    case 'YEAR':
      return 'YYYY';
    case 'MONTH':
      return 'YYYY-MM';
    default:
      return 'YYYY-MM-DD';
  }
});

// 初始化图表
function initCharts() {
  const chartDom1 = document.getElementById('Chart1');
  const chartDom2 = document.getElementById('Chart2');
  const chartDom3 = document.getElementById('Chart3');

  if (chartDom1) {
    if (chart1) echarts.dispose(chartDom1);
    chart1 = echarts.init(chartDom1);
  }
  if (chartDom2) {
    if (chart2) echarts.dispose(chartDom2);
    chart2 = echarts.init(chartDom2);
  }
  if (chartDom3) {
    if (chart3) echarts.dispose(chartDom3);
    chart3 = echarts.init(chartDom3);
  }
}

// 获取数据
async function getList() {
  if (!queryParams.value.nodeId) {
    ElMessage.warning('请选择节点');
    return;
  }

  loading.value = true;
  initCharts();

  try {
    // 获取综合能耗数据
    const { data: comprehensiveData } = await fetchGetComprehensiveList({
      nodeId: queryParams.value.nodeId,
      timeType: queryParams.value.timeType,
      dataTime: queryParams.value.dataTime
    });

    if (comprehensiveData) {
      // 更新图表1 - 综合能耗趋势
      updateChart1(comprehensiveData.chartDataList || []);

      // 更新图表2 - 各介质能耗占比
      updateChart2(comprehensiveData.energyProportion || []);

      // 更新列表数据
      comprehensiveList.value = comprehensiveData.dataList || [];
    }

    // 获取同比环比数据
    const { data: yoyData } = await fetchGetYoY({
      nodeId: queryParams.value.nodeId,
      timeType: queryParams.value.timeType,
      dataTime: queryParams.value.dataTime
    });

    if (yoyData) {
      // 更新同比数据
      if (yoyData.tongbi) {
        comprehensiveTable.value[0].icon = yoyData.tongbi.ratio || 0;
        comprehensiveTable.value[0].data[0].label = yoyData.tongbi.currentTime || '';
        comprehensiveTable.value[0].data[0].value = yoyData.tongbi.currentValue || 0;
        comprehensiveTable.value[0].data[1].label = yoyData.tongbi.compareTime || '';
        comprehensiveTable.value[0].data[1].value = yoyData.tongbi.compareValue || 0;
      }
      // 更新环比数据
      if (yoyData.huanbi) {
        comprehensiveTable.value[1].icon = yoyData.huanbi.ratio || 0;
        comprehensiveTable.value[1].data[0].label = yoyData.huanbi.currentTime || '';
        comprehensiveTable.value[1].data[0].value = yoyData.huanbi.currentValue || 0;
        comprehensiveTable.value[1].data[1].label = yoyData.huanbi.compareTime || '';
        comprehensiveTable.value[1].data[1].value = yoyData.huanbi.compareValue || 0;
      }
    }

    // 获取能耗排名数据
    const { data: rankingData } = await fetchGetEnergyRanking({
      nodeId: queryParams.value.nodeId,
      timeType: queryParams.value.timeType,
      dataTime: queryParams.value.dataTime
    });

    if (rankingData) {
      updateChart3(rankingData);
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
}

// 更新图表1 - 综合能耗趋势
function updateChart1(data: Api.Comprehensive.ChartDataItem[]) {
  if (!chart1) return;

  const xData = data.map(item => item.xdata);
  const yValue = data.map(item => item.yvalue || 0);
  const yCompareValue = data.map(item => item.ycompareValue || 0);

  chart1.setOption({
    color: ['#2979ff', '#19be6b', '#ff9900', '#fa3534'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 10,
      textStyle: { color: isDark.value ? '#fff' : '#222' }
    },
    grid: {
      top: '60',
      left: '5%',
      right: '5%',
      bottom: '10',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      axisPointer: { type: 'shadow' },
      axisLine: {
        show: true,
        lineStyle: { color: isDark.value ? '#fff' : '#222' }
      },
      axisTick: { show: false },
      axisLabel: { color: isDark.value ? '#fff' : '#222', fontSize: 12 },
      data: xData
    },
    yAxis: [
      {
        type: 'value',
        name: 'tce',
        nameTextStyle: { color: isDark.value ? '#fff' : '#222', fontSize: 12 },
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: isDark.value ? '#fff' : '#222' }
        },
        axisTick: { show: false },
        axisLabel: { color: isDark.value ? '#fff' : '#222', fontSize: 12 }
      }
    ],
    series: [
      {
        name: '本期值',
        type: 'bar',
        barWidth: '16',
        itemStyle: { borderRadius: [15, 15, 0, 0] },
        data: yValue,
        markPoint: {
          data: [{ type: 'max', name: 'Max' }, { type: 'min', name: 'Min' }]
        }
      },
      {
        name: '同期值',
        type: 'bar',
        barWidth: '16',
        itemStyle: { borderRadius: [15, 15, 0, 0] },
        data: yCompareValue,
        markPoint: {
          data: [{ type: 'max', name: 'Max' }, { type: 'min', name: 'Min' }]
        }
      }
    ]
  });
}

// 更新图表2 - 各介质能耗占比
function updateChart2(data: Api.Comprehensive.EnergyProportion[]) {
  if (!chart2) return;

  const seriesData = data.map(item => ({
    name: item.energyName,
    value: item.count
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  chart2.setOption({
    color: ['#2979ff', '#19be6b', '#ff9900', '#fa3534'],
    grid: {
      top: '20%',
      left: '1%',
      right: '1%',
      bottom: '0%',
      containLabel: true
    },
    tooltip: { trigger: 'item' },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: 'center',
      icon: 'circle',
      right: '5%',
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20,
      textStyle: {
        color: isDark.value ? '#fff' : '#222',
        fontSize: 12
      },
      data: seriesData.map(item => item.name),
      formatter: (name: string) => {
        const item = seriesData.find(d => d.name === name);
        if (!item) return name;
        const percent = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0';
        return `${name}(tce) ${item.value} ${percent}%`;
      }
    },
    series: [
      {
        name: '各介质能耗占比',
        type: 'pie',
        radius: ['25%', '50%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: seriesData
      }
    ]
  });
}

// 更新图表3 - 用能单元综合能耗排名
function updateChart3(data: Api.Comprehensive.EnergyRanking[]) {
  if (!chart3) return;

  const nodeName = data.map(item => item.nodeName);
  const energyConsumption = data.map(item => item.energyConsumption || 0);

  chart3.setOption({
    grid: {
      left: '2%',
      right: '2%',
      top: '4%',
      bottom: 0,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' },
      formatter: (params: any) => `${params[0].name} : ${params[0].value}`
    },
    xAxis: { show: false, type: 'value' },
    yAxis: [
      {
        type: 'category',
        inverse: true,
        axisLabel: {
          interval: 0,
          color: isDark.value ? '#fff' : '#000',
          fontSize: 12,
          formatter: (value: string, index: number) => {
            const rank = index + 1;
            return `{idx${rank <= 3 ? index : ''}|${rank}}{title|${value}}`;
          },
          rich: {
            idx0: { color: '#FF0004', backgroundColor: '#FF000426', borderRadius: 100, padding: [5, 8] },
            idx1: { color: '#FF8400', backgroundColor: '#FF84001F', borderRadius: 100, padding: [5, 8] },
            idx2: { color: '#FFDD00', backgroundColor: '#FFDD001F', borderRadius: 100, padding: [5, 8] },
            idx: { color: '#3371EB', backgroundColor: '#3371EB26', borderRadius: 100, padding: [5, 8] },
            title: { padding: [5, 8] }
          }
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        data: nodeName
      },
      {
        type: 'category',
        inverse: true,
        axisTick: 'none' as const,
        axisLine: 'none' as const,
        show: true,
        axisLabel: {
          color: isDark.value ? '#fff' : '#000',
          fontSize: 12
        },
        data: energyConsumption
      }
    ],
    series: [
      {
        type: 'bar',
        showBackground: true,
        backgroundStyle: { color: '#DCDEE2' },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0437FF' },
            { offset: 1, color: '#55C6FF' }
          ])
        },
        barWidth: '10',
        data: energyConsumption
      },
      {
        type: 'pictorialBar',
        symbol: 'rect',
        symbolSize: [4, 14],
        symbolPosition: 'end',
        itemStyle: { color: '#488BFF' },
        data: energyConsumption
      }
    ]
  });
}

// 导出
async function handleExport() {
  try {
    await fetchExportComprehensive({
      nodeId: queryParams.value.nodeId,
      timeType: queryParams.value.timeType,
      dataTime: queryParams.value.dataTime
    });
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  }
}

// 搜索
function handleQuery() {
  getList();
}

// 监听主题变化
watch(
  () => themeStore.darkMode,
  () => {
    getList();
  }
);

// 窗口大小变化时重新渲染图表
function handleResize() {
  chart1?.resize();
  chart2?.resize();
  chart3?.resize();
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart1?.dispose();
  chart2?.dispose();
  chart3?.dispose();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <!-- 搜索区域 -->
    <ElCard class="card-wrapper">
      <ElForm :model="queryParams" inline>
        <ElFormItem label="期间">
          <ElSelect
            v-model="queryParams.timeType"
            placeholder="请选择期间"
            style="width: 120px"
            @change="handleTimeTypeChange"
          >
            <ElOption
              v-for="item in timeTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间">
          <ElDatePicker
            v-model="queryParams.dataTime"
            :type="datePickerType"
            :format="dateFormat"
            value-format="YYYY-MM-DD"
            placeholder="请选择时间"
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
    <div class="flex-1 overflow-auto">
      <!-- 综合能耗趋势图 -->
      <ElCard class="card-wrapper mb-16px">
        <template #header>
          <span>{{ queryParams.nodeName || '全厂' }} - 综合能耗趋势</span>
        </template>
        <div id="Chart1" style="height: 300px" v-loading="loading" />
      </ElCard>

      <!-- 同比环比 + 占比 + 排名 -->
      <ElRow :gutter="16" class="mb-16px">
        <!-- 同比环比卡片 -->
        <ElCol :span="7">
          <ElCard class="card-wrapper h-full">
            <template #header>
              <span>{{ queryParams.nodeName || '全厂' }} - 综合能耗同比环比</span>
            </template>
            <div class="card-list" v-loading="loading">
              <div
                v-for="(item, index) in comprehensiveTable"
                :key="index"
                class="card-item"
                :class="{ 'mt-16px': index > 0 }"
              >
                <div class="card-item-left">
                  <span>{{ Math.abs(item.icon) }}%</span>
                  <ElIcon :color="item.icon > 0 ? 'green' : item.icon < 0 ? 'red' : ''">
                    <ElIconCaretTop v-if="item.icon > 0" />
                    <ElIconCaretBottom v-if="item.icon < 0" />
                  </ElIcon>
                </div>
                <div class="card-item-right">
                  <div class="card-item-title">{{ item.title }}</div>
                  <div v-for="(node, nodeIndex) in item.data" :key="nodeIndex" class="card-item-row">
                    <span class="card-item-label">{{ node.label }}</span>
                    <span class="card-item-value">{{ Number(node.value.toFixed(2)) }} tce</span>
                  </div>
                </div>
              </div>
            </div>
          </ElCard>
        </ElCol>

        <!-- 各介质能耗占比图 -->
        <ElCol :span="8">
          <ElCard class="card-wrapper h-full">
            <template #header>
              <span>{{ queryParams.nodeName || '全厂' }} - 各介质综合能耗占比</span>
            </template>
            <div id="Chart2" style="height: 250px" v-loading="loading" />
          </ElCard>
        </ElCol>

        <!-- 用能单元能耗排名图 -->
        <ElCol :span="9">
          <ElCard class="card-wrapper h-full">
            <template #header>
              <span>{{ queryParams.nodeName || '全厂' }} - 用能单元综合能耗排名</span>
            </template>
            <div id="Chart3" style="height: 250px" v-loading="loading" />
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 数据表格 -->
      <ElCard class="card-wrapper">
        <template #header>
          <span>{{ queryParams.nodeName || '全厂' }} - 综合能耗统计分析表</span>
        </template>
        <ElTable :data="comprehensiveList" v-loading="loading" border show-summary>
          <ElTableColumn prop="currentTime" label="日期" align="center" min-width="120" />
          <ElTableColumn prop="currentValue" label="综合能耗量(tce)" align="center" min-width="150" />
        </ElTable>
      </ElCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-list {
  padding: 16px;
}

.card-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
}

.card-item-left {
  width: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.card-item-right {
  width: 70%;
  padding-left: 16px;
}

.card-item-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.card-item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-item-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.card-item-value {
  font-weight: 600;
  font-size: 14px;
}
</style>