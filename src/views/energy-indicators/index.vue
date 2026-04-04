<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchEnergyIndicatorsList, fetchDeleteEnergyIndicators, fetchBatchDeleteEnergyIndicators } from '@/service/api/energy-indicators';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import EnergyIndicatorsDrawer from './modules/energy-indicators-drawer.vue';

defineOptions({ name: 'EnergyIndicatorsManage' });

const searchParams = ref({
  page: 1,
  pageSize: 10,
  nodeId: undefined as string | undefined,
  timeType: undefined as string | undefined,
  name: undefined as string | undefined,
  energyType: undefined as string | undefined,
  indicatorsType: undefined as string | undefined
});

const timeTypes = ['年', '月', '日'];
const energyTypes = ['电', '水', '气', '热'];
const indicatorsTypes = ['单位产品能耗', '综合能耗', '能耗强度'];

const selectedIds = ref<number[]>([]);

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchEnergyIndicatorsList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'selection', type: 'selection', width: 50 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'name', label: '名称', minWidth: 120 },
    { prop: 'nodeName', label: '节点名称', minWidth: 120 },
    { prop: 'nodeId', label: '用能单元ID', minWidth: 100 },
    {
      prop: 'timeType',
      label: '时间类型',
      minWidth: 80,
      formatter: row => <ElTag type={row.timeType === '年' ? 'success' : row.timeType === '月' ? 'warning' : 'info'}>{row.timeType}</ElTag>
    },
    { prop: 'dataTime', label: '时间', minWidth: 100 },
    {
      prop: 'energyType',
      label: '能源类型',
      minWidth: 80,
      formatter: row => <ElTag type={row.energyType === '电' ? 'primary' : row.energyType === '水' ? 'info' : 'warning'}>{row.energyType}</ElTag>
    },
    {
      prop: 'indicatorsType',
      label: '指标类型',
      minWidth: 120,
      formatter: row => <ElTag effect="plain">{row.indicatorsType}</ElTag>
    },
    { prop: 'number', label: '产量/值', minWidth: 100 },
    { prop: 'unit', label: '单位', minWidth: 80 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 160,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.id)}>
            {{ reference: () => <ElButton type="danger" plain size="small">{$t('common.delete')}</ElButton> }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, onDeleted } = useTableOperate(data, 'id', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteEnergyIndicators(id);
  if (!error) onDeleted();
}

function edit(id: number) {
  handleEdit(id);
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return;
  const { error } = await fetchBatchDeleteEnergyIndicators(selectedIds.value);
  if (!error) {
    selectedIds.value = [];
    getData();
  }
}

function handleSelectionChange(selection: EnergyIndicators.Item[]) {
  selectedIds.value = selection.map(item => item.id);
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="名称" class="w-280px">
          <ElInput v-model="searchParams.name" placeholder="搜索名称" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem label="用能单元" class="w-280px">
          <ElInput v-model="searchParams.nodeId" placeholder="搜索用能单元ID" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem label="时间类型" class="w-280px">
          <ElSelect v-model="searchParams.timeType" placeholder="选择时间类型" clearable>
            <ElOption v-for="t in timeTypes" :key="t" :label="t" :value="t" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="能源类型" class="w-280px">
          <ElSelect v-model="searchParams.energyType" placeholder="选择能源类型" clearable>
            <ElOption v-for="e in energyTypes" :key="e" :label="e" :value="e" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="指标类型" class="w-280px">
          <ElSelect v-model="searchParams.indicatorsType" placeholder="选择指标类型" clearable>
            <ElOption v-for="i in indicatorsTypes" :key="i" :label="i" :value="i" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.nodeId = undefined; searchParams.timeType = undefined; searchParams.name = undefined; searchParams.energyType = undefined; searchParams.indicatorsType = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>能源指标管理</p>
          <div class="flex gap-8px">
            <ElButton v-if="selectedIds.length > 0" type="danger" @click="handleBatchDelete">批量删除 ({{ selectedIds.length }})</ElButton>
            <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="handleAdd" @refresh="getData" />
          </div>
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="id" @selection-change="handleSelectionChange">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination v-if="mobilePagination.total" layout="total,prev,pager,next,sizes" v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']" @size-change="mobilePagination['size-change']" />
      </div>
      <EnergyIndicatorsDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="getDataByPage" />
    </ElCard>
  </div>
</template>