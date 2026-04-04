<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, ElDatePicker, ElButton, ElTable, ElTableColumn, ElTag, ElTabs, ElTabPane, ElRow, ElCol, ElStatistic } from 'element-plus';
import { fetchElectricYoY, fetchElectricMoM, fetchWaterYoY, fetchWaterMoM } from '@/service/api/statistical';
import type { Api } from '@/typings/api';

defineOptions({ name: 'StatisticalYoyMom' });

// 时间类型选项
const timeTypeOptions = [
  { label: '小时', value: 'HOUR' },
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 能源类型选项
const energyTypeOptions = [
  { label: '电', value: 'electric' },
  { label: '水', value: 'water' }
];

// 当前激活的分析类型
const activeTab = ref<'yoy' | 'mom'>('yoy');

// 查询参数
const queryParams = ref<Api.Statistical.Comparison.CompareParams>({
  beginTime: '',
  endTime: '',
  timeType: 'DAY',
  nodeId: '1'
});

// 能源类型选择
const selectedEnergyType = ref<'electric' | 'water'>('electric');

// 时间范围
const dateRange = ref<[Date, Date] | null>(null);

// 加载状态
const loading = ref(false);

// 数据列表
const dataList = ref<Api.Statistical.Comparison.YoYResponse[]>([]);

// 统计摘要
const summary = computed(() => {
  if (dataList.value.length === 0) return null;

  const totalCurrent = dataList.value.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const totalOld = dataList.value.reduce((sum, item) => sum + (item.oldValue || 0), 0);
  const avgRatio = totalOld > 0 ? ((totalCurrent - totalOld) / totalOld * 100) : 0;

  return {
    totalCurrent: totalCurrent.toFixed(2),
    totalOld: totalOld.toFixed(2),
    avgRatio: avgRatio.toFixed(2),
    trend: avgRatio > 0 ? 'up' : avgRatio < 0 ? 'down' : 'flat'
  };
});

// 初始化时间范围
function initDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  dateRange.value = [start, end];
  updateQueryTime();
}

// 更新查询时间
function updateQueryTime() {
  if (dateRange.value) {
    queryParams.value.beginTime = formatDate(dateRange.value[0]);
    queryParams.value.endTime = formatDate(dateRange.value[1]);
  }
}

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 加载数据
async function loadData() {
  if (!queryParams.value.beginTime || !queryParams.value.endTime) {
    return;
  }

  loading.value = true;
  try {
    const isYoy = activeTab.value === 'yoy';
    const isElectric = selectedEnergyType.value === 'electric';

    let result: Api.Statistical.Comparison.YoYResponse[] = [];

    if (isElectric) {
      result = isYoy
        ? await fetchElectricYoY(queryParams.value)
        : await fetchElectricMoM(queryParams.value);
    } else {
      result = isYoy
        ? await fetchWaterYoY(queryParams.value)
        : await fetchWaterMoM(queryParams.value);
    }

    dataList.value = result;
  } catch {
    dataList.value = [];
  } finally {
    loading.value = false;
  }
}

// 获取比率标签类型
function getRatioTagType(ratio: number): 'success' | 'danger' | 'info' {
  if (ratio < 0) return 'success'; // 下降是好事
  if (ratio > 0) return 'danger';  // 上升需要关注
  return 'info';
}

// 格式化比率
function formatRatio(ratio: number): string {
  const prefix = ratio > 0 ? '+' : '';
  return `${prefix}${ratio.toFixed(2)}%`;
}

// 监听参数变化
watch([activeTab, selectedEnergyType, () => queryParams.value.timeType], () => {
  loadData();
});

// 处理日期范围变化
function handleDateChange() {
  updateQueryTime();
  loadData();
}

// 初始化
onMounted(() => {
  initDateRange();
  loadData();
});
</script>

<template>
  <div class="yoy-mom-page">
    <ElCard class="filter-card" shadow="hover">
      <ElForm inline>
        <ElFormItem label="时间范围">
          <ElDatePicker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateChange"
          />
        </ElFormItem>
        <ElFormItem label="时间类型">
          <ElSelect v-model="queryParams.timeType" style="width: 100px">
            <ElOption
              v-for="item in timeTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="能源类型">
          <ElSelect v-model="selectedEnergyType" style="width: 100px">
            <ElOption
              v-for="item in energyTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 统计摘要 -->
    <ElRow v-if="summary" :gutter="16" class="summary-row">
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="本期总能耗" :value="summary.totalCurrent" suffix="kWh" />
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="对比期总能耗" :value="summary.totalOld" suffix="kWh" />
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic
            title="变化率"
            :value="summary.avgRatio"
            suffix="%"
            :value-style="{ color: summary.trend === 'down' ? '#67c23a' : summary.trend === 'up' ? '#f56c6c' : '#909399' }"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 数据表格 -->
    <ElCard class="table-card" shadow="hover">
      <ElTabs v-model="activeTab">
        <ElTabPane label="同比分析" name="yoy" />
        <ElTabPane label="环比分析" name="mom" />
      </ElTabs>

      <ElTable :data="dataList" :loading="loading" stripe border>
        <ElTableColumn prop="energyUnitName" label="用能单元" min-width="150" />
        <ElTableColumn prop="unit" label="单位" width="80" align="center" />
        <ElTableColumn prop="currentValue" label="本期值" width="120" align="right">
          <template #default="{ row }">
            {{ row.currentValue?.toFixed(2) || '0.00' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="oldValue" :label="activeTab === 'yoy' ? '同期值' : '上期值'" width="120" align="right">
          <template #default="{ row }">
            {{ row.oldValue?.toFixed(2) || '0.00' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="ratio" :label="activeTab === 'yoy' ? '同比' : '环比'" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getRatioTagType(row.ratio)" size="small">
              {{ formatRatio(row.ratio) }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.yoy-mom-page {
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

.table-card {
  flex: 1;
}
</style>