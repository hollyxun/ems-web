<script setup lang="ts">
import dayjs from 'dayjs';

defineOptions({ name: 'BranchAnalysisFilter' });

interface Props {
  nodeOptions: { value: string; label: string }[];
  energyTypeOptions: Api.BranchAnalysis.EnergyTypeOption[];
  timeTypeOptions: Api.BranchAnalysis.TimeTypeOption[];
  queryParams: Api.BranchAnalysis.BranchAnalysisQuery;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  search: [];
  reset: [];
  export: [format: 'excel' | 'pdf'];
}>();

// 时间选择器类型
const datePickerType = computed(() => {
  switch (props.queryParams.timeType) {
    case 'day':
      return 'date';
    case 'month':
      return 'month';
    case 'year':
      return 'year';
    default:
      return 'date';
  }
});

// 时间格式
const dateFormat = computed(() => {
  switch (props.queryParams.timeType) {
    case 'day':
      return 'YYYY-MM-DD';
    case 'month':
      return 'YYYY-MM';
    case 'year':
      return 'YYYY';
    default:
      return 'YYYY-MM-DD';
  }
});

import { computed } from 'vue';
</script>

<template>
  <div class="branch-analysis-filter">
    <ElForm :model="queryParams" inline label-width="auto">
      <!-- 节点选择 -->
      <ElFormItem label="节点" required>
        <ElSelect v-model="queryParams.nodeId" placeholder="请选择节点" clearable filterable class="w-180px">
          <ElOption v-for="item in nodeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>

      <!-- 时间类型 -->
      <ElFormItem label="时间类型" required>
        <ElSelect v-model="queryParams.timeType" placeholder="请选择时间类型" class="w-120px">
          <ElOption v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>

      <!-- 时间选择 -->
      <ElFormItem label="时间" required>
        <ElDatePicker
          v-model="queryParams.dataTime"
          :type="datePickerType"
          :format="dateFormat"
          :value-format="dateFormat"
          placeholder="请选择时间"
          class="w-150px"
        />
      </ElFormItem>

      <!-- 能源类型 -->
      <ElFormItem label="能源类型">
        <ElSelect v-model="queryParams.energyType" placeholder="请选择能源类型" clearable class="w-120px">
          <ElOption v-for="item in energyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>

      <!-- 操作按钮 -->
      <ElFormItem>
        <ElButton type="primary" @click="emit('search')">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </template>
          查询
        </ElButton>
        <ElButton @click="emit('reset')">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </template>
          重置
        </ElButton>
        <ElDropdown trigger="click" @command="(cmd: 'excel' | 'pdf') => emit('export', cmd)">
          <ElButton>
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </template>
            导出
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 ml-1">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="excel">导出 Excel</ElDropdownItem>
              <ElDropdownItem command="pdf">导出 PDF</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped>
.branch-analysis-filter {
  width: 100%;
}
</style>