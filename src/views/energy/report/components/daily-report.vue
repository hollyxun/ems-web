<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { exportDailyPdf, fetchDailyReport } from '@/service/api/energy';

defineOptions({ name: 'DailyReport' });

const loading = ref(false);
const exportLoading = ref(false);
const reportData = ref<Api.Energy.Report.DailyReportData | null>(null);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const energyType = ref('all');

// Fetch report data
const loadData = async () => {
  loading.value = true;
  try {
    const params: Api.Energy.Report.DailyReportParams = {
      date: selectedDate.value,
      energyType: energyType.value === 'all' ? undefined : energyType.value
    };
    const { data: res } = await fetchDailyReport(params);
    reportData.value = res || null;
  } catch {
    ElMessage.error('获取日报数据失败');
  } finally {
    loading.value = false;
  }
};

// Export to PDF
const handleExportPdf = async () => {
  if (!reportData.value) return;

  exportLoading.value = true;
  try {
    await exportDailyPdf({
      date: selectedDate.value,
      energyType: energyType.value === 'all' ? undefined : energyType.value
    });
    ElMessage.success('导出成功');
  } catch {
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// Pie chart data for peak/valley/flat
const pieChartData = ref<{ type: string; value: number; ratio: number }[]>([]);

watch(reportData, data => {
  if (data && data.totalEnergy > 0) {
    pieChartData.value = [
      { type: '峰时', value: data.peakTotal, ratio: data.peakTotal / data.totalEnergy },
      { type: '平时', value: data.flatTotal, ratio: data.flatTotal / data.totalEnergy },
      { type: '谷时', value: data.valleyTotal, ratio: data.valleyTotal / data.totalEnergy }
    ];
  }
});

onMounted(() => {
  loadData();
});

// Table columns
const tableColumns = [
  { prop: 'shiftName', label: '班次', width: 100 },
  { prop: 'startTime', label: '开始时间', width: 100 },
  { prop: 'endTime', label: '结束时间', width: 100 },
  { prop: 'energyValue', label: '能耗(kWh)', width: 120 },
  { prop: 'cost', label: '成本(元)', width: 120 },
  { prop: 'production', label: '产量', width: 100 },
  { prop: 'specificUsage', label: '单耗', width: 100 },
  { prop: 'peakRatio', label: '峰占比(%)', width: 100 },
  { prop: 'valleyRatio', label: '谷占比(%)', width: 100 }
];
</script>

<template>
  <div class="daily-report">
    <!-- Filters -->
    <div class="mb-4 flex items-center gap-4">
      <ElDatePicker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
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
    <div v-if="reportData" class="grid grid-cols-4 mb-4 gap-4">
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">总能耗</div>
        <div class="text-2xl font-bold">{{ reportData.totalEnergy.toFixed(2) }} kWh</div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">总成本</div>
        <div class="text-2xl font-bold">{{ reportData.totalCost.toFixed(2) }} 元</div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">平均单耗</div>
        <div class="text-2xl font-bold">{{ reportData.avgSpecificUsage.toFixed(4) }}</div>
      </ElCard>
      <ElCard shadow="hover">
        <div class="text-sm text-gray-500">环比变化</div>
        <div :class="reportData.dayOverDay > 0 ? 'text-red-500' : 'text-green-500'" class="text-2xl font-bold">
          {{ reportData.dayOverDay > 0 ? '+' : '' }}{{ reportData.dayOverDay.toFixed(2) }}%
        </div>
      </ElCard>
    </div>

    <!-- Shift Table -->
    <ElCard class="mb-4" shadow="hover">
      <template #header>
        <div class="font-bold">班次能耗明细</div>
      </template>
      <ElTable v-loading="loading" :data="reportData?.shiftData || []" stripe border>
        <ElTableColumn
          v-for="col in tableColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          align="center"
        />
      </ElTable>
    </ElCard>

    <!-- Peak/Valley/Flat Distribution -->
    <ElCard shadow="hover">
      <template #header>
        <div class="font-bold">峰平谷分布</div>
      </template>
      <div v-if="reportData && reportData.totalEnergy > 0" class="grid grid-cols-3 gap-4">
        <div class="rounded bg-orange-50 p-4 text-center">
          <div class="text-sm text-gray-500">峰时能耗</div>
          <div class="text-xl text-orange-500 font-bold">{{ reportData.peakTotal.toFixed(2) }} kWh</div>
          <div class="text-sm text-gray-400">
            {{ ((reportData.peakTotal / reportData.totalEnergy) * 100).toFixed(1) }}%
          </div>
        </div>
        <div class="rounded bg-green-50 p-4 text-center">
          <div class="text-sm text-gray-500">平时能耗</div>
          <div class="text-xl text-green-500 font-bold">{{ reportData.flatTotal.toFixed(2) }} kWh</div>
          <div class="text-sm text-gray-400">
            {{ ((reportData.flatTotal / reportData.totalEnergy) * 100).toFixed(1) }}%
          </div>
        </div>
        <div class="rounded bg-blue-50 p-4 text-center">
          <div class="text-sm text-gray-500">谷时能耗</div>
          <div class="text-xl text-blue-500 font-bold">{{ reportData.valleyTotal.toFixed(2) }} kWh</div>
          <div class="text-sm text-gray-400">
            {{ ((reportData.valleyTotal / reportData.totalEnergy) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
      <ElEmpty v-else description="暂无数据" />
    </ElCard>
  </div>
</template>

<style scoped>
.daily-report {
  padding: 16px;
}

.summary-cards :deep(.el-card__body) {
  text-align: center;
}
</style>
