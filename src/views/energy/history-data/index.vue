<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { exportHistoricalData, fetchHistoricalData } from '@/service/api/electric-analysis';
import { fetchGetMeterList } from '@/service/api/energy-meter';
import type { HistoricalData } from '@/service/api/electric-analysis';

// 查询参数
const queryParams = ref({
  indexId: '',
  dataTime: dayjs().format('YYYY-MM-DD'),
  timeType: 'DAY' as 'DAY' | 'HOUR'
});

// 计量点选项
const meterOptions = ref<{ id: string; name: string }[]>([]);

// 数据
const loading = ref(false);
const exportLoading = ref(false);
const tableData = ref<HistoricalData.Item[]>([]);
const indexName = ref('');

// 时间类型选项
const timeTypeOptions = [
  { label: '按日', value: 'DAY' },
  { label: '按小时', value: 'HOUR' }
];

// 获取计量点列表
const getMeterList = async () => {
  try {
    const res = await fetchGetMeterList({ page: 1, pageSize: 1000 });
    meterOptions.value = (res.list || []).map((item: any) => ({
      id: String(item.id || item.meterId),
      name: item.meterName || item.name
    }));
    if (meterOptions.value.length > 0 && !queryParams.value.indexId) {
      queryParams.value.indexId = meterOptions.value[0].id;
    }
  } catch {
    // 忽略错误
  }
};

// 查询数据
const fetchData = async () => {
  if (!queryParams.value.indexId) {
    ElMessage.warning('请选择计量点');
    return;
  }

  loading.value = true;
  try {
    const res = await fetchHistoricalData(queryParams.value);
    tableData.value = res.data || [];
    indexName.value = res.indexName || '';
  } catch (error) {
    ElMessage.error('查询失败');
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 导出数据
const handleExport = async () => {
  if (!queryParams.value.indexId) {
    ElMessage.warning('请选择计量点');
    return;
  }

  exportLoading.value = true;
  try {
    const blob = await exportHistoricalData(queryParams.value);
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `历史数据_${queryParams.value.dataTime}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 表格列定义
const columns = [
  { prop: 'dataTime', label: '时间', minWidth: 180 },
  { prop: 'indexName', label: '计量点名称', minWidth: 150 },
  { prop: 'value', label: '数值', minWidth: 120 }
];

onMounted(() => {
  getMeterList();
  fetchData();
});
</script>

<template>
  <div class="h-full flex flex-col p-4">
    <!-- 查询条件 -->
    <ElCard class="mb-4 flex-shrink-0">
      <ElForm :model="queryParams" inline>
        <ElFormItem label="计量点">
          <ElSelect v-model="queryParams.indexId" placeholder="请选择计量点" filterable style="width: 200px">
            <ElOption v-for="item in meterOptions" :key="item.id" :label="item.name" :value="item.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间类型">
          <ElSelect v-model="queryParams.timeType" style="width: 100px">
            <ElOption v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间">
          <ElDatePicker
            v-model="queryParams.dataTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 150px"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="fetchData">查询</ElButton>
          <ElButton :loading="exportLoading" @click="handleExport">导出Excel</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 数据表格 -->
    <ElCard class="flex-1 overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <span>历史数据列表</span>
          <span v-if="indexName" class="text-sm text-gray-500">计量点: {{ indexName }}</span>
        </div>
      </template>
      <ElTable v-loading="loading" :data="tableData" border stripe height="100%" style="height: calc(100% - 10px)">
        <ElTableColumn
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.minWidth"
          show-overflow-tooltip
        />
        <template #empty>
          <ElEmpty description="暂无数据" />
        </template>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.text-gray-500 {
  color: #909399;
}
</style>
