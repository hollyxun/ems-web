<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import {
  fetchDailyKeyEquipmentList,
  fetchDailyKeyEquipmentChart,
  fetchPointFacility
} from '@/service/api/keyequipment';
import type { KeyEquipment } from '@/service/api/keyequipment';
import { useECharts } from '@sa/hooks';
import { $t } from '@/locales';

defineOptions({ name: 'KeyEquipmentDaily' });

// 设备列表
const deviceList = ref<KeyEquipment.Device[]>([]);
const selectedDevice = ref<string>();

// 时间选择
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));

// 数据列表
const dataList = ref<KeyEquipment.DailyData[]>([]);
const loading = ref(false);

// 图表数据
const chartData = ref<KeyEquipment.DailyData[]>([]);
const selectedRowIndex = ref<number>();

// 图表
const { domRef: chartDomRef, updateOptions: updateChart } = useECharts(() => ({
  title: { text: '24小时能耗曲线', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['能耗值'], bottom: 0 },
  xAxis: {
    type: 'category',
    data: Array.from({ length: 24 }, (_, i) => `${i}时`)
  },
  yAxis: { type: 'value', name: '能耗' },
  series: [{
    name: '能耗值',
    type: 'line',
    smooth: true,
    data: []
  }]
}));

// 表格列 - 24小时
const hourColumns = computed(() => {
  return Array.from({ length: 24 }, (_, i) => ({
    prop: `value${i}`,
    label: `${i}时`,
    width: 80
  }));
});

// 加载设备列表
async function loadDevices() {
  const { data, error } = await fetchPointFacility();
  if (!error && data) {
    deviceList.value = data;
    if (data.length > 0) {
      selectedDevice.value = data[0].pointId;
    }
  }
}

// 加载数据列表
async function loadData() {
  if (!selectedDevice.value) return;

  loading.value = true;
  try {
    const params = {
      indexId: selectedDevice.value,
      dataTime: selectedDate.value
    };
    const { data, error } = await fetchDailyKeyEquipmentList(params);
    if (!error && data) {
      dataList.value = data;
      // 默认选中第一行显示图表
      if (data.length > 0) {
        selectRow(0);
      }
    }
  } finally {
    loading.value = false;
  }
}

// 选择行，更新图表
async function selectRow(index: number) {
  selectedRowIndex.value = index;
  const row = dataList.value[index];
  if (!row) return;

  const params = {
    indexId: row.indexId,
    dataTime: selectedDate.value
  };
  const { data, error } = await fetchDailyKeyEquipmentChart(params);
  if (!error && data && data.length > 0) {
    chartData.value = data;
    updateChartData();
  }
}

// 更新图表数据
function updateChartData() {
  const row = dataList.value[selectedRowIndex.value ?? 0];
  if (!row) return;

  const values = Array.from({ length: 24 }, (_, i) => {
    const key = `value${i}` as keyof KeyEquipment.DailyData;
    return row[key] as number || 0;
  });

  updateChart({
    title: { text: `${row.indexName || '设备'} - 24小时能耗曲线` },
    xAxis: {
      data: Array.from({ length: 24 }, (_, i) => `${i}时`)
    },
    series: [{
      data: values
    }]
  });
}

// 监听设备变化
watch(selectedDevice, () => {
  loadData();
});

// 监听日期变化
watch(selectedDate, () => {
  loadData();
});

onMounted(() => {
  loadDevices();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="选择设备" class="w-280px">
          <ElSelect v-model="selectedDevice" placeholder="请选择设备" clearable class="w-full">
            <ElOption v-for="d in deviceList" :key="d.pointId" :label="d.name" :value="d.pointId" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="选择日期" class="w-280px">
          <ElDatePicker v-model="selectedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="w-full" />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="loadData">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="card-wrapper">
      <template #header>
        <p>重点设备日能耗分析</p>
      </template>
      <div ref="chartDomRef" class="h-300px mb-16px" />
      <ElTable v-loading="loading" :data="dataList" border stripe highlight-current-row
        @current-change="(row: any) => selectRow(dataList.indexOf(row))">
        <ElTableColumn type="index" label="序号" width="60" />
        <ElTableColumn prop="indexName" label="指标名称" min-width="120" />
        <ElTableColumn v-for="col in hourColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width">
          <template #default="{ row }">
            {{ (row[col.prop as keyof KeyEquipment.DailyData] as number)?.toFixed(2) || '-' }}
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>