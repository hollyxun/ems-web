<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { exportRankingExcel, fetchRankingReportData } from '@/service/api/energy';

defineOptions({ name: 'RankingReport' });

const loading = ref(false);
const exportLoading = ref(false);
const reportData = ref<Api.Energy.Report.RankingReportData | null>(null);

// Filters
const dateRange = ref<[string, string]>([
  dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
]);
const dimension = ref<'energy' | 'specific' | 'cost'>('energy');
const factoryId = ref<number | undefined>();
const workshopId = ref<number | undefined>();
const energyType = ref<string | undefined>();
const topN = ref(10);

// Fetch ranking data
const loadData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请选择日期范围');
    return;
  }

  loading.value = true;
  try {
    const params: Api.Energy.Report.RankingReportParams = {
      dateStart: dateRange.value[0],
      dateEnd: dateRange.value[1],
      dimension: dimension.value,
      factoryId: factoryId.value,
      workshopId: workshopId.value,
      energyType: energyType.value,
      topN: topN.value
    };
    reportData.value = await fetchRankingReportData(params);
  } catch {
    ElMessage.error('获取排名数据失败');
  } finally {
    loading.value = false;
  }
};

// Export to Excel
const handleExportExcel = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) return;

  exportLoading.value = true;
  try {
    await exportRankingExcel({
      dateStart: dateRange.value[0],
      dateEnd: dateRange.value[1],
      dimension: dimension.value,
      factoryId: factoryId.value,
      workshopId: workshopId.value,
      energyType: energyType.value,
      topN: topN.value
    });
    ElMessage.success('导出成功');
  } catch {
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// Table row class for conditional formatting
const getRowClass = ({ row }: { row: Api.Energy.Report.RankingRow }) => {
  if (!reportData.value) return '';
  if (row.rank <= 3) return 'row-top';
  if (row.rank >= reportData.value.rankings.length - 2) return 'row-bottom';
  return '';
};

// Dimension label
const dimensionLabel = () => {
  const labels: Record<string, string> = {
    energy: '能耗(kWh)',
    specific: '单耗',
    cost: '成本(元)'
  };
  return labels[dimension.value];
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="ranking-report">
    <!-- Filters -->
    <div class="mb-4 flex flex-wrap items-center gap-4">
      <ElDatePicker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
      <ElSelect v-model="dimension" placeholder="排名维度" @change="loadData">
        <ElOption label="能耗" value="energy" />
        <ElOption label="单耗" value="specific" />
        <ElOption label="成本" value="cost" />
      </ElSelect>
      <ElSelect v-model="factoryId" placeholder="工厂" clearable @change="loadData">
        <ElOption label="工厂A" :value="1" />
        <ElOption label="工厂B" :value="2" />
      </ElSelect>
      <ElSelect v-model="energyType" placeholder="能源类型" clearable @change="loadData">
        <ElOption label="电" value="electricity" />
        <ElOption label="水" value="water" />
        <ElOption label="气" value="gas" />
        <ElOption label="热" value="heat" />
      </ElSelect>
      <ElInputNumber v-model="topN" :min="5" :max="50" placeholder="Top N" @change="loadData" />
      <ElButton type="primary" @click="loadData">查询</ElButton>
      <ElButton type="success" :loading="exportLoading" @click="handleExportExcel">
        <template #icon>
          <icon-mdi-file-excel />
        </template>
        导出Excel
      </ElButton>
    </div>

    <!-- Report Info -->
    <div v-if="reportData" class="mb-4 text-sm text-gray-500">
      报告日期: {{ reportData.reportDate }} | 筛选条件: {{ reportData.filterInfo }} | 生成时间:
      {{ reportData.generatedAt }}
    </div>

    <!-- Ranking Table -->
    <ElTable
      v-loading="loading"
      :data="reportData?.rankings || []"
      :row-class-name="getRowClass"
      stripe
      border
      highlight-current-row
    >
      <ElTableColumn prop="rank" label="排名" width="80" align="center" fixed>
        <template #default="{ row }">
          <span
            :class="[row.rank <= 3 ? 'font-bold text-green-600' : '', row.rank >= 8 ? 'font-bold text-red-600' : '']"
          >
            {{ row.rank }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="teamName" label="班组" width="120" align="center" />
      <ElTableColumn prop="workshopName" label="车间" width="120" align="center" />
      <ElTableColumn prop="factoryName" label="工厂" width="120" align="center" />
      <ElTableColumn prop="energyValue" :label="dimensionLabel()" width="140" align="center">
        <template #default="{ row }">
          {{ row.energyValue.toFixed(2) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="production" label="产量" width="100" align="center">
        <template #default="{ row }">
          {{ row.production.toFixed(2) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="specificUsage" label="单耗" width="100" align="center">
        <template #default="{ row }">
          {{ row.specificUsage.toFixed(4) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="cost" label="成本(元)" width="120" align="center">
        <template #default="{ row }">
          {{ row.cost.toFixed(2) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="change" label="排名变化" width="100" align="center">
        <template #default="{ row }">
          <span :class="row.change > 0 ? 'text-green-500' : row.change < 0 ? 'text-red-500' : ''">
            {{ row.change > 0 ? '+' + row.change : row.change < 0 ? row.change : '-' }}
          </span>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<style scoped>
.ranking-report {
  padding: 16px;
}

:deep(.row-top) {
  background-color: #c6efce !important;
}

:deep(.row-bottom) {
  background-color: #ffc7ce !important;
}
</style>
