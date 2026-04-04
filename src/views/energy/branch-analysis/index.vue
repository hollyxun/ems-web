<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { fetchBranchAnalysis } from '@/service/api/branch-analysis';
import BranchAnalysisChart from './components/branch-analysis-chart.vue';
import BranchAnalysisFilter from './components/branch-analysis-filter.vue';

defineOptions({ name: 'EnergyBranchAnalysis' });

const loading = ref(false);
const analysisData = ref<Api.BranchAnalysis.BranchAnalysisVO | null>(null);

// 查询参数
const queryParams = reactive<Api.BranchAnalysis.BranchAnalysisQuery>({
  nodeId: '',
  dataTime: dayjs().format('YYYY-MM-DD'),
  timeType: 'day',
  energyType: 'electric'
});

// 节点选项（示例数据）
const nodeOptions = ref([
  { value: 'factory-1', label: '工厂A' },
  { value: 'factory-2', label: '工厂B' },
  { value: 'workshop-1', label: '车间1' },
  { value: 'workshop-2', label: '车间2' }
]);

// 能源类型选项
const energyTypeOptions = ref<Api.BranchAnalysis.EnergyTypeOption[]>([
  { value: 'electric', label: '电' },
  { value: 'water', label: '水' },
  { value: 'gas', label: '气' },
  { value: 'heat', label: '热' }
]);

// 时间类型选项
const timeTypeOptions = ref<Api.BranchAnalysis.TimeTypeOption[]>([
  { value: 'day', label: '日' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' }
]);

// 时间标签（根据时间类型）
const timeLabels = computed(() => {
  const labels: string[] = [];
  const { timeType, dataTime } = queryParams;

  if (timeType === 'day') {
    // 日：24小时
    for (let i = 1; i <= 24; i++) {
      labels.push(`${i}时`);
    }
  } else if (timeType === 'month') {
    // 月：当月天数
    const daysInMonth = dayjs(dataTime).daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      labels.push(`${i}日`);
    }
  } else {
    // 年：12个月
    for (let i = 1; i <= 12; i++) {
      labels.push(`${i}月`);
    }
  }

  return labels;
});

// 加载分析数据
async function loadAnalysisData() {
  if (!queryParams.nodeId) {
    ElMessage.warning('请选择节点');
    return;
  }

  loading.value = true;
  try {
    const result = await fetchBranchAnalysis(queryParams);
    analysisData.value = result.data || null;
  } catch {
    ElMessage.error('加载分析数据失败');
    analysisData.value = null;
  } finally {
    loading.value = false;
  }
}

// 处理查询
function handleSearch() {
  loadAnalysisData();
}

// 处理重置
function handleReset() {
  queryParams.nodeId = '';
  queryParams.dataTime = dayjs().format('YYYY-MM-DD');
  queryParams.timeType = 'day';
  queryParams.energyType = 'electric';
  analysisData.value = null;
}

// 处理导出
async function handleExport(format: 'excel' | 'pdf') {
  if (!queryParams.nodeId) {
    ElMessage.warning('请选择节点后再导出');
    return;
  }
  ElMessage.info(`正在导出${format === 'excel' ? 'Excel' : 'PDF'}文件...`);
  // TODO: 实现实际的导出功能
}

// 监听时间类型变化，更新时间格式
watch(
  () => queryParams.timeType,
  (newType) => {
    const now = dayjs();
    if (newType === 'day') {
      queryParams.dataTime = now.format('YYYY-MM-DD');
    } else if (newType === 'month') {
      queryParams.dataTime = now.format('YYYY-MM');
    } else {
      queryParams.dataTime = now.format('YYYY');
    }
  }
);

onMounted(() => {
  // 初始化时不自动加载，等待用户选择节点
});
</script>

<template>
  <div class="branch-analysis-page p-4">
    <!-- 筛选条件 -->
    <ElCard class="mb-4">
      <BranchAnalysisFilter
        :node-options="nodeOptions"
        :energy-type-options="energyTypeOptions"
        :time-type-options="timeTypeOptions"
        :query-params="queryParams"
        @search="handleSearch"
        @reset="handleReset"
        @export="handleExport"
      />
    </ElCard>

    <!-- 分析结果 -->
    <ElCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="text-lg font-medium">
            支路用能分析结果
            <span v-if="analysisData" class="ml-2 text-gray-500">
              {{ analysisData.nodeName }} - 总能耗: {{ analysisData.total.toFixed(2) }} {{ analysisData.unit }}
            </span>
          </div>
          <ElTag v-if="analysisData" :type="queryParams.timeType === 'day' ? 'success' : queryParams.timeType === 'month' ? 'warning' : 'info'">
            {{ timeTypeOptions.find(t => t.value === queryParams.timeType)?.label }}维度分析
          </ElTag>
        </div>
      </template>

      <!-- 图表展示 -->
      <div v-if="analysisData" class="chart-container">
        <BranchAnalysisChart
          :data="analysisData.values"
          :labels="timeLabels"
          :unit="analysisData.unit"
          :loading="loading"
        />
      </div>

      <!-- 无数据提示 -->
      <div v-else class="flex items-center justify-center h-400px text-gray-400">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 3v18h18" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7 16l4-4 4 4 5-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p>请选择节点后点击查询按钮查看分析结果</p>
        </div>
      </div>
    </ElCard>

    <!-- 数据表格 -->
    <ElCard v-if="analysisData" class="mt-4">
      <template #header>
        <span class="text-lg font-medium">详细数据</span>
      </template>
      <ElTable :data="analysisData.values.map((v, i) => ({ time: timeLabels[i], value: v }))" stripe border>
        <ElTableColumn prop="time" label="时间" width="100" />
        <ElTableColumn prop="value" label="能耗值">
          <template #default="{ row }">
            {{ row.value?.toFixed(2) || '-' }} {{ analysisData.unit }}
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.chart-container {
  min-height: 350px;
}
</style>