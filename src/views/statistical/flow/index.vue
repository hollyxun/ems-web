<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
  ElCard,
  ElCol,
  ElDatePicker,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElOption,
  ElRow,
  ElSelect,
  ElStatistic
} from 'element-plus';
import { fetchFlowCharts } from '@/service/api/statistical';
import type { Api } from '@/typings/api';

defineOptions({ name: 'StatisticalFlow' });

// 时间类型选项
const timeTypeOptions = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 能源类型选项
const energyTypeOptions = [
  { label: '电', value: 'electric' },
  { label: '水', value: 'water' },
  { label: '气', value: 'gas' },
  { label: '热', value: 'heat' }
];

// 查询参数
const queryParams = ref<Api.Statistical.FlowCharts.FlowChartsParams>({
  timeType: 'DAY',
  queryTime: '',
  energyType: 'electric',
  modelCode: 'default'
});

// 查询日期
const queryDate = ref<Date>(new Date());

// 加载状态
const loading = ref(false);

// 能流图数据
const flowData = ref<Api.Statistical.FlowCharts.FlowChartsResponse | null>(null);

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const result = await fetchFlowCharts({
      ...queryParams.value,
      queryTime: formatDate(queryDate.value)
    });
    flowData.value = result;
  } catch {
    flowData.value = null;
  } finally {
    loading.value = false;
  }
}

// 处理日期变化
function handleDateChange() {
  queryParams.value.queryTime = formatDate(queryDate.value);
  loadData();
}

// 计算桑基图节点
const sankeyNodes = ref<{ name: string }[]>([]);
const sankeyLinks = ref<{ source: string; target: string; value: number }[]>([]);

// 转换数据为桑基图格式
function transformToSankey(data: Api.Statistical.FlowCharts.FlowChartsResponse) {
  const nodeSet = new Set<string>();
  const links: { source: string; target: string; value: number }[] = [];

  data.itemVOList.forEach(item => {
    nodeSet.add(item.source);
    nodeSet.add(item.target);
    links.push({
      source: item.source,
      target: item.target,
      value: item.value
    });
  });

  sankeyNodes.value = Array.from(nodeSet).map(name => ({ name }));
  sankeyLinks.value = links;
}

// 监听数据变化
watch(flowData, newData => {
  if (newData) {
    transformToSankey(newData);
  }
});

// 初始化
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="flow-page">
    <ElCard class="filter-card" shadow="hover">
      <ElForm inline>
        <ElFormItem label="查询日期">
          <ElDatePicker
            v-model="queryDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </ElFormItem>
        <ElFormItem label="时间类型">
          <ElSelect v-model="queryParams.timeType" style="width: 100px" @change="loadData">
            <ElOption v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="能源类型">
          <ElSelect v-model="queryParams.energyType" style="width: 100px" @change="loadData">
            <ElOption v-for="item in energyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 统计指标 -->
    <ElRow v-if="flowData" :gutter="16" class="summary-row">
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="总累积量" :value="flowData.totalAccumulatedAmount" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="子节点累积量" :value="flowData.childNodeAccumulatedAmount" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="差值" :value="flowData.difference" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <ElStatistic title="损耗比例" :value="flowData.energyLossRatio" suffix="%" />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 能流图展示区域 -->
    <ElCard class="chart-card" shadow="hover">
      <template #header>
        <span class="card-title">能量流向图</span>
      </template>

      <div v-if="flowData && flowData.itemVOList.length > 0" class="chart-container">
        <!-- 简化的能流图展示（实际项目中可使用 ECharts Sankey 图） -->
        <div class="flow-diagram">
          <div v-for="(link, index) in sankeyLinks" :key="index" class="flow-item">
            <div class="flow-source">{{ link.source }}</div>
            <div class="flow-arrow">
              <span class="flow-value">{{ link.value.toFixed(2) }}</span>
              <span class="arrow-icon">→</span>
            </div>
            <div class="flow-target">{{ link.target }}</div>
          </div>
        </div>
      </div>

      <ElEmpty v-else-if="!loading" description="暂无能流数据" />
    </ElCard>
  </div>
</template>

<style scoped>
.flow-page {
  padding: 16px;
  height: 100%;
  overflow: auto;
  background-color: var(--el-bg-color-page);
}

.filter-card {
  margin-bottom: 16px;
}

.summary-row {
  margin-bottom: 16px;
}

.chart-card {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  min-height: 400px;
}

.flow-diagram {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.flow-source {
  min-width: 120px;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-8);
  border-radius: 4px;
  font-weight: 500;
}

.flow-arrow {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
}

.flow-value {
  padding: 4px 8px;
  background-color: var(--el-color-success-light-8);
  border-radius: 4px;
  font-size: 14px;
}

.arrow-icon {
  color: var(--el-text-color-secondary);
  font-size: 20px;
}

.flow-target {
  min-width: 120px;
  padding: 8px 12px;
  background-color: var(--el-color-warning-light-8);
  border-radius: 4px;
  font-weight: 500;
}
</style>
