<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { exportMonthlyPdf, fetchMonthlyReport } from '@/service/api/energy';

defineOptions({ name: 'MonthlyReport' });

const loading = ref(false);
const exportLoading = ref(false);
const reportData = ref<Api.Energy.Report.MonthlyReportData | null>(null);
const selectedMonth = ref(dayjs().format('YYYY-MM'));
const energyType = ref('all');

// Fetch report data
const loadData = async () => {
  loading.value = true;
  try {
    const params: Api.Energy.Report.MonthlyReportParams = {
      month: selectedMonth.value,
      energyType: energyType.value === 'all' ? undefined : energyType.value
    };
    const { data: res } = await fetchMonthlyReport(params);
    reportData.value = res || null;
  } catch {
    ElMessage.error('获取月报数据失败');
  } finally {
    loading.value = false;
  }
};

// Export to PDF
const handleExportPdf = async () => {
  if (!reportData.value) return;

  exportLoading.value = true;
  try {
    await exportMonthlyPdf({
      month: selectedMonth.value,
      energyType: energyType.value === 'all' ? undefined : energyType.value
    });
    ElMessage.success('导出成功');
  } catch {
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// Trend chart data
const trendChartData = computed(() => {
  if (!reportData.value) return [];
  return reportData.value.trendData.map(item => ({
    date: item.date,
    value: item.value
  }));
});

// Energy type distribution
const energyTypeData = computed(() => {
  if (!reportData.value) return [];
  return reportData.value.energyByType.map(item => ({
    type: item.energyType,
    value: item.value,
    percentage: item.percentage
  }));
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="monthly-report">
    <!-- Filters -->
    <div class="mb-4 flex items-center gap-4">
      <ElDatePicker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        format="YYYY-MM"
        value-format="YYYY-MM"
        @change="loadData"
      />
      <ElSelect v-model="energyType" placeholder="能源类型" @change="loadData">
        <ElOption label="全部" value="all" />
        <ElOption label="电" value="electricity" />
        <ElOption label="水" value="water" />
        <ElOption label="气" value="gas" />
        <ElOption label="热" value="heat" />
      </ElSelect>
      <ElButton type="primary" :loading="exportLoading" @click="handleExportPdf">
        <template #icon>
          <icon-mdi-file-pdf-box />
        </template>
        导出PDF
      </ElButton>
    </div>

    <!-- Summary Cards -->
    <div v-if="reportData" class="grid grid-cols-5 mb-4 gap-4">
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">月总能耗</div>
        <div class="text-xl font-bold">{{ reportData.totalEnergy.toFixed(2) }} kWh</div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">月总成本</div>
        <div class="text-xl font-bold">{{ reportData.totalCost.toFixed(2) }} 元</div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">日均能耗</div>
        <div class="text-xl font-bold">{{ reportData.avgDailyEnergy.toFixed(2) }} kWh</div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">环比变化</div>
        <div :class="reportData.monthOverMonth > 0 ? 'text-red-500' : 'text-green-500'" class="text-xl font-bold">
          {{ reportData.monthOverMonth > 0 ? '+' : '' }}{{ reportData.monthOverMonth.toFixed(2) }}%
        </div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">同比变化</div>
        <div :class="reportData.yoYEnergy > 0 ? 'text-red-500' : 'text-green-500'" class="text-xl font-bold">
          {{ reportData.yoYEnergy > 0 ? '+' : '' }}{{ reportData.yoYEnergy.toFixed(2) }}%
        </div>
      </ElCard>
    </div>

    <!-- Trend Chart Placeholder -->
    <ElCard class="mb-4" shadow="hover">
      <template #header>
        <div class="font-bold">日均能耗趋势</div>
      </template>
      <div v-if="trendChartData.length > 0" class="h-64">
        <div class="h-full overflow-auto">
          <ElTable v-loading="loading" :data="trendChartData" max-height="250" stripe border>
            <ElTableColumn prop="date" label="日期" width="120" align="center" />
            <ElTableColumn prop="value" label="能耗(kWh)" width="140" align="center">
              <template #default="{ row }">
                {{ row.value.toFixed(2) }}
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
      <ElEmpty v-else description="暂无趋势数据" />
    </ElCard>

    <!-- Energy Type Distribution & Daily Data -->
    <div class="grid grid-cols-2 gap-4">
      <ElCard shadow="hover">
        <template #header>
          <div class="font-bold">能源类型分布</div>
        </template>
        <div v-if="energyTypeData.length > 0" class="space-y-3">
          <div
            v-for="item in energyTypeData"
            :key="item.type"
            class="flex items-center justify-between rounded bg-gray-50 p-3"
          >
            <span>{{ item.type }}</span>
            <div class="text-right">
              <div class="font-bold">{{ item.value.toFixed(2) }}</div>
              <div class="text-sm text-gray-400">{{ (item.percentage * 100).toFixed(1) }}%</div>
            </div>
          </div>
        </div>
        <ElEmpty v-else description="暂无数据" />
      </ElCard>

      <!-- Daily Data Table -->
      <ElCard shadow="hover">
        <template #header>
          <div class="font-bold">日均能耗明细</div>
        </template>
        <ElTable v-loading="loading" :data="reportData?.dailyData || []" max-height="250" stripe border>
          <ElTableColumn prop="date" label="日期" width="120" align="center" />
          <ElTableColumn prop="energyValue" label="能耗(kWh)" width="120" align="center">
            <template #default="{ row }">
              {{ row.energyValue.toFixed(2) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="cost" label="成本(元)" width="120" align="center">
            <template #default="{ row }">
              {{ row.cost.toFixed(2) }}
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.monthly-report {
  padding: 16px;
}
</style>
