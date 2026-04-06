<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElMessage, ElPopconfirm } from 'element-plus';
import { fetchElectricityCostList, fetchCreateElectricityCost, fetchUpdateElectricityCost, fetchDeleteElectricityCost } from '@/service/api/costmanagement';
import type { CostManagement } from '@/service/api/costmanagement';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'ElectricityCostManage' });

const searchParams = ref({ page: 1, pageSize: 10, organizationId: undefined as number | undefined, timeType: undefined as string | undefined });

const timeTypes = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchElectricityCostList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'dataTime', label: '数据时间', minWidth: 120 },
    { prop: 'timeType', label: '时间类型', minWidth: 100 },
    { prop: 'totalElectricity', label: '总电量(kWh)', minWidth: 120 },
    { prop: 'totalFee', label: '总电费(元)', minWidth: 120 },
    { prop: 'sharpElectricity', label: '尖时段电量', minWidth: 120 },
    { prop: 'peakElectricity', label: '峰时段电量', minWidth: 120 },
    { prop: 'flatElectricity', label: '平时段电量', minWidth: 120 },
    { prop: 'valleyElectricity', label: '谷时段电量', minWidth: 120 },
    {
      prop: 'operate', label: $t('common.operate'), align: 'center', width: 160,
      formatter: row => {
        const handleConfirm = () => handleDelete(row.id);
        return (
          <div class="flex-center">
            <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>{$t('common.edit')}</ElButton>
            <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={handleConfirm}>
              <ElButton type="danger" plain size="small">{$t('common.delete')}</ElButton>
            </ElPopconfirm>
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, onDeleted } = useTableOperate(data, 'id', getData);

const formData = ref({
  organizationId: 1,
  timeType: 'MONTH',
  dataTime: '',
  totalElectricity: 0,
  totalFee: 0,
  sharpElectricity: 0,
  peakElectricity: 0,
  flatElectricity: 0,
  valleyElectricity: 0,
  sharpFee: 0,
  peakFee: 0,
  flatFee: 0,
  valleyFee: 0,
  powerFactor: 0,
  remark: ''
});

async function handleSubmit() {
  loading.value = true;
  try {
    const api = operateType.value === 'add' ? fetchCreateElectricityCost : fetchUpdateElectricityCost;
    const params = operateType.value === 'edit' ? { id: editingData.value!.id, ...formData.value } : formData.value;
    const { error } = await (api as any)(params);
    if (!error) {
      ElMessage.success('操作成功');
      drawerVisible.value = false;
      getDataByPage();
    }
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteElectricityCost(id);
  if (!error) onDeleted();
}

function edit(id: number) {
  handleEdit(id);
  const row = data.value.find(item => item.id === id);
  if (row) {
    formData.value = { ...formData.value, ...row };
  }
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="时间类型" class="w-280px">
          <ElSelect v-model="searchParams.timeType" placeholder="选择类型" clearable>
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.timeType = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>电费录入管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="handleAdd" @refresh="getData" />
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="id">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination v-if="mobilePagination.total" layout="total,prev,pager,next,sizes" v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']" @size-change="mobilePagination['size-change']" />
      </div>
    </ElCard>

    <ElDrawer v-model="drawerVisible" :title="operateType === 'add' ? '新增电费录入' : '编辑电费录入'" size="600px">
      <ElForm :model="formData" label-width="120px">
        <ElFormItem label="数据时间">
          <ElDatePicker v-model="formData.dataTime" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </ElFormItem>
        <ElFormItem label="时间类型">
          <ElSelect v-model="formData.timeType" placeholder="选择类型">
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="总电量(kWh)">
          <ElInputNumber v-model="formData.totalElectricity" :precision="2" :min="0" />
        </ElFormItem>
        <ElFormItem label="总电费(元)">
          <ElInputNumber v-model="formData.totalFee" :precision="2" :min="0" />
        </ElFormItem>
        <ElFormItem label="尖时段电量">
          <ElInputNumber v-model="formData.sharpElectricity" :precision="2" :min="0" />
        </ElFormItem>
        <ElFormItem label="峰时段电量">
          <ElInputNumber v-model="formData.peakElectricity" :precision="2" :min="0" />
        </ElFormItem>
        <ElFormItem label="平时段电量">
          <ElInputNumber v-model="formData.flatElectricity" :precision="2" :min="0" />
        </ElFormItem>
        <ElFormItem label="谷时段电量">
          <ElInputNumber v-model="formData.valleyElectricity" :precision="2" :min="0" />
        </ElFormItem>
        <ElFormItem label="功率因数">
          <ElInputNumber v-model="formData.powerFactor" :precision="2" :min="0" :max="1" :step="0.01" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput v-model="formData.remark" type="textarea" :rows="2" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDrawer>
  </div>
</template>