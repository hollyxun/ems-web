<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  ElCard,
  ElCol,
  ElDatePicker,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElOption,
  ElPagination,
  ElRow,
  ElSelect,
  ElStatistic,
  ElTable,
  ElTableColumn
} from 'element-plus';
import { fetchEnergyCostTrendDetail, fetchEnergyCostTrendList } from '@/service/api/statistical';
import type { Api } from '@/typings/api';

defineOptions({ name: 'StatisticalCost' });

// 时间类型选项
const timeTypeOptions = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 能源类型选项
const energyTypeOptions = [
  { label: '全部', value: '' },
  { label: '电', value: 'electric' },
  { label: '水', value: 'water' },
  { label: '气', value: 'gas' },
  { label: '热', value: 'heat' }
];

// 查询参数
const queryParams = ref<Api.Statistical.CostTrend.CostTrendParams>({
  pageNo: 1,
  pageSize: 10,
  timeType: 'DAY',
  modelCode: 'default'
});

// 查询日期
const queryDate = ref<Date>(new Date());

// 加载状态
const loading = ref(false);

// 数据列表
const dataList = ref<Api.Statistical.CostTrend.CostTrendItem[]>([]);

// 总数
const total = ref(0);

// 格式化日期为时间编码
function formatDateCode(date: Date, timeType: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (timeType) {
    case 'YEAR':
      return String(year);
    case 'MONTH':
      return `${year}-${month}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

// 统计摘要
const summary = computed(() => {
  if (dataList.value.length === 0) return null;

  const totalCost = dataList.value.reduce((sum, item) => sum + (item.total || 0), 0);
  const avgCost = totalCost / dataList.value.length;

  return {
    totalCost: totalCost.toFixed(2),
    avgCost: avgCost.toFixed(2),
    itemCount: dataList.value.length
  };
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const result = await fetchEnergyCostTrendList({
      ...queryParams.value,
      timeCode: formatDateCode(queryDate.value, queryParams.value.timeType || 'DAY')
    });
    dataList.value = result.list || [];
    total.value = result.total || 0;
  } catch {
    dataList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 处理日期变化
function handleDateChange() {
  queryParams.value.pageNo = 1;
  loadData();
}

// 处理分页变化
function handlePageChange(page: number) {
  queryParams.value.pageNo = page;
  loadData();
}

// 处理每页数量变化
function handleSizeChange(size: number) {
  queryParams.value.pageSize = size;
  queryParams.value.pageNo = 1;
  loadData();
}

// 监听时间类型变化
watch(
  () => queryParams.value.timeType,
  () => {
    queryParams.value.pageNo = 1;
    loadData();
  }
);

// 格式化金额
function formatMoney(value: number): string {
  return value?.toFixed(2) || '0.00';
}

// 初始化
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="cost-page">
    <ElCard class="filter-card" shadow="hover">
      <ElForm inline>
        <ElFormItem label="查询日期">
          <ElDatePicker
            v-model="queryDate"
            :type="queryParams.timeType === 'YEAR' ? 'year' : queryParams.timeType === 'MONTH' ? 'month' : 'date'"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </ElFormItem>
        <ElFormItem label="时间类型">
          <ElSelect v-model="queryParams.timeType" style="width: 100px" @change="handleDateChange">
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

    <!-- 统计摘要 -->
    <ElRow v-if="summary" :gutter="16" class="summary-row">
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="总费用" :value="summary.totalCost" prefix="¥" />
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="平均费用" :value="summary.avgCost" prefix="¥" />
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <ElStatistic title="用能单元数" :value="summary.itemCount" />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 数据表格 -->
    <ElCard class="table-card" shadow="hover">
      <template #header>
        <span class="card-title">成本趋势分析</span>
      </template>

      <ElTable :data="dataList" :loading="loading" stripe border>
        <ElTableColumn prop="energyUnitName" label="用能单元" min-width="150" />
        <ElTableColumn prop="dateCode" label="时间" width="120" align="center" />
        <ElTableColumn prop="total" label="总费用" width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.total) }}</template>
        </ElTableColumn>
        <ElTableColumn label="能源类型明细" min-width="300">
          <template #default="{ row }">
            <div v-if="row.itemList && row.itemList.length > 0" class="energy-type-list">
              <span v-for="item in row.itemList" :key="item.energyType" class="energy-type-item">
                {{ item.energyTypeName }}: ¥{{ formatMoney(item.cost) }} ({{ item.percentage.toFixed(1) }}%)
              </span>
            </div>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.cost-page {
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

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.energy-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.energy-type-item {
  padding: 4px 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
