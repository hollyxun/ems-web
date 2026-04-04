<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchProductOutputList, fetchDeleteProductOutput, fetchBatchDeleteProductOutput } from '@/service/api/productoutput';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ProductOutputDrawer from './modules/productoutput-drawer.vue';

defineOptions({ name: 'ProductOutputManage' });

const searchParams = ref({
  page: 1,
  pageSize: 10,
  nodeId: undefined as string | undefined,
  name: undefined as string | undefined,
  timeType: undefined as string | undefined,
  dataType: undefined as string | undefined
});

const timeTypes = ['年', '月', '日'];
const dataTypes = ['产量', '仪表', '指标'];

const selectedIds = ref<number[]>([]);

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchProductOutputList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'selection', type: 'selection', width: 50 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'nodeId', label: '用能单元ID', minWidth: 100 },
    { prop: 'nodeName', label: '用能单元名称', minWidth: 120 },
    { prop: 'name', label: '名称', minWidth: 120 },
    { prop: 'timeType', label: '时间类型', minWidth: 80 },
    { prop: 'dataTime', label: '时间', minWidth: 100 },
    { prop: 'number', label: '产量', minWidth: 100 },
    { prop: 'unit', label: '单位', minWidth: 80 },
    { prop: 'dataType', label: '数据类型', minWidth: 80 },
    { prop: 'productType', label: '产品类型', minWidth: 100 },
    {
      prop: 'operate', label: $t('common.operate'), align: 'center', width: 160,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>{$t('common.edit')}</ElButton>
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
  const { error } = await fetchDeleteProductOutput(id);
  if (!error) onDeleted();
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return;
  const { error } = await fetchBatchDeleteProductOutput(selectedIds.value);
  if (!error) {
    selectedIds.value = [];
    getData();
  }
}

function edit(id: number) { handleEdit(id); }

function handleSelectionChange(selection: any[]) {
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
        <ElFormItem label="时间类型" class="w-280px">
          <ElSelect v-model="searchParams.timeType" placeholder="选择时间类型" clearable>
            <ElOption v-for="t in timeTypes" :key="t" :label="t" :value="t" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="数据类型" class="w-280px">
          <ElSelect v-model="searchParams.dataType" placeholder="选择数据类型" clearable>
            <ElOption v-for="t in dataTypes" :key="t" :label="t" :value="t" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.name = undefined; searchParams.timeType = undefined; searchParams.dataType = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>产品产量管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="handleAdd" @refresh="getData">
            <ElButton type="danger" plain :disabled="selectedIds.length === 0" @click="handleBatchDelete">
              批量删除
            </ElButton>
          </TableHeaderOperation>
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="id" @selection-change="handleSelectionChange">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination v-if="mobilePagination.total" layout="total,prev,pager,next,sizes" v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']" @size-change="mobilePagination['size-change']" />
      </div>
      <ProductOutputDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="getDataByPage" />
    </ElCard>
  </div>
</template>