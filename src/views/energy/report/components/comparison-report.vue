<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { exportComparisonExcel, fetchComparisonReportData } from '@/service/api/energy';

defineOptions({ name: 'ComparisonReport' });

const loading = ref(false);
const exportLoading = ref(false);
const reportData = ref<Api.Energy.Report.ComparisonReportData | null>(null);

// Comparison type
const compareType = ref<'team' | 'shift' | 'time'>('team');
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));

// Team comparison
const teamAId = ref<number | undefined>();
const teamBId = ref<number | undefined>();

// Shift comparison
const teamId = ref<number | undefined>();
const shiftTypeA = ref<string>('早班');
const shiftTypeB = ref<string>('中班');

// Time comparison
const timeAStart = ref<string>();
const timeAEnd = ref<string>();
const timeBStart = ref<string>();
const timeBEnd = ref<string>();

// Common
const energyType = ref<string | undefined>();
const dimensions = ref<string[]>(['能耗', '单耗', '成本']);

// Team options (TODO: load from API)
const teamOptions = [
  { id: 1, name: '甲班' },
  { id: 2, name: '乙班' },
  { id: 3, name: '丙班' }
];

const shiftOptions = [
  { value: '早班', label: '早班' },
  { value: '中班', label: '中班' },
  { value: '晚班', label: '晚班' }
];

// Build request params
const buildParams = (): Api.Energy.Report.ComparisonReportParams => {
  const params: Api.Energy.Report.ComparisonReportParams = {
    compareType: compareType.value,
    date: selectedDate.value,
    energyType: energyType.value,
    dimensions: dimensions.value
  };

  if (compareType.value === 'team') {
    params.teamAId = teamAId.value;
    params.teamBId = teamBId.value;
  } else if (compareType.value === 'shift') {
    params.teamId = teamId.value;
    params.shiftTypeA = shiftTypeA.value;
    params.shiftTypeB = shiftTypeB.value;
  } else if (compareType.value === 'time') {
    params.timeAStart = timeAStart.value;
    params.timeAEnd = timeAEnd.value;
    params.timeBStart = timeBStart.value;
    params.timeBEnd = timeBEnd.value;
  }

  return params;
};

// Fetch comparison data
const loadData = async () => {
  loading.value = true;
  try {
    const params = buildParams();
    reportData.value = await fetchComparisonReportData(params);
  } catch {
    ElMessage.error('获取对比数据失败');
  } finally {
    loading.value = false;
  }
};

// Export to Excel
const handleExportExcel = async () => {
  exportLoading.value = true;
  try {
    await exportComparisonExcel(buildParams());
    ElMessage.success('导出成功');
  } catch {
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// Dimension value formatting
const formatValue = (value: number): string => {
  return value.toFixed(2);
};

const formatDiffRatio = (ratio: number): string => {
  return `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%`;
};
</script>

<template>
  <div class="comparison-report">
    <!-- Comparison Type Selector -->
    <div class="mb-4">
      <ElRadioGroup v-model="compareType" @change="reportData = null">
        <ElRadioButton value="team">班组对比</ElRadioButton>
        <ElRadioButton value="shift">班次对比</ElRadioButton>
        <ElRadioButton value="time">时间对比</ElRadioButton>
      </ElRadioGroup>
    </div>

    <!-- Team Comparison Filters -->
    <div v-if="compareType === 'team'" class="mb-4 flex items-center gap-4">
      <ElSelect v-model="teamAId" placeholder="选择班组A" clearable>
        <ElOption v-for="team in teamOptions" :key="team.id" :label="team.name" :value="team.id" />
      </ElSelect>
      <span class="text-gray-500">vs</span>
      <ElSelect v-model="teamBId" placeholder="选择班组B" clearable>
        <ElOption v-for="team in teamOptions" :key="team.id" :label="team.name" :value="team.id" />
      </ElSelect>
    </div>

    <!-- Shift Comparison Filters -->
    <div v-if="compareType === 'shift'" class="mb-4 flex items-center gap-4">
      <ElSelect v-model="teamId" placeholder="选择班组" clearable>
        <ElOption v-for="team in teamOptions" :key="team.id" :label="team.name" :value="team.id" />
      </ElSelect>
      <ElSelect v-model="shiftTypeA" placeholder="选择班次A">
        <ElOption v-for="shift in shiftOptions" :key="shift.value" :label="shift.label" :value="shift.value" />
      </ElSelect>
      <span class="text-gray-500">vs</span>
      <ElSelect v-model="shiftTypeB" placeholder="选择班次B">
        <ElOption v-for="shift in shiftOptions" :key="shift.value" :label="shift.label" :value="shift.value" />
      </ElSelect>
    </div>

    <!-- Time Comparison Filters -->
    <div v-if="compareType === 'time'" class="mb-4 flex items-center gap-4">
      <ElDatePicker v-model="timeAStart" type="datetime" placeholder="时间A开始" />
      <ElDatePicker v-model="timeAEnd" type="datetime" placeholder="时间A结束" />
      <span class="text-gray-500">vs</span>
      <ElDatePicker v-model="timeBStart" type="datetime" placeholder="时间B开始" />
      <ElDatePicker v-model="timeBEnd" type="datetime" placeholder="时间B结束" />
    </div>

    <!-- Common Filters -->
    <div class="mb-4 flex items-center gap-4">
      <ElDatePicker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
      <ElCheckboxGroup v-model="dimensions">
        <ElCheckbox value="能耗">能耗</ElCheckbox>
        <ElCheckbox value="单耗">单耗</ElCheckbox>
        <ElCheckbox value="峰平谷">峰平谷</ElCheckbox>
        <ElCheckbox value="成本">成本</ElCheckbox>
      </ElCheckboxGroup>
      <ElButton type="primary" @click="loadData">对比分析</ElButton>
      <ElButton type="success" :loading="exportLoading" @click="handleExportExcel">
        <template #icon>
          <icon-mdi-file-excel />
        </template>
        导出Excel
      </ElButton>
    </div>

    <!-- Comparison Result -->
    <div v-if="reportData" class="comparison-result">
      <!-- Header -->
      <div class="mb-4 text-center">
        <h3 class="text-lg font-bold">{{ reportData.reportTitle }}</h3>
        <p class="text-sm text-gray-500">生成时间: {{ reportData.generatedAt }}</p>
      </div>

      <!-- Comparison Table -->
      <ElTable :data="reportData.dimensions" stripe border>
        <ElTableColumn prop="name" label="对比维度" width="150" align="center" fixed />
        <ElTableColumn :label="reportData.itemA.name" width="180" align="center">
          <template #default="{ row }">
            {{ formatValue(row.valueA) }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="reportData.itemB.name" width="180" align="center">
          <template #default="{ row }">
            {{ formatValue(row.valueB) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="差值" width="150" align="center">
          <template #default="{ row }">
            <span :class="row.diff > 0 ? 'text-red-500' : 'text-green-500'">
              {{ row.diff > 0 ? '+' : '' }}{{ formatValue(row.diff) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="差率" width="150" align="center">
          <template #default="{ row }">
            <span :class="row.diffRatio > 0 ? 'text-red-500' : 'text-green-500'">
              {{ formatDiffRatio(row.diffRatio) }}
            </span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <!-- Empty State -->
    <ElEmpty v-else description="请选择对比项并点击对比分析" />
  </div>
</template>

<style scoped>
.comparison-report {
  padding: 16px;
}
</style>
