<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchDeletePowerDistributions,
  fetchGetPowerDistributionList
} from '@/service/api/power-distribution';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PowerDistributionOperateDrawer from './modules/power-distribution-operate-drawer.vue';
import PowerDistributionSearch from './modules/power-distribution-search.vue';

defineOptions({ name: 'BaseDataPowerDistribution' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.PowerDistribution.PowerDistributionSearchParams {
  return {
    page: 1,
    pageSize: 10,
    name: undefined,
    code: undefined,
    principals: undefined,
    principalsTel: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetPowerDistributionList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage;
    searchParams.value.pageSize = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'name', label: '配电室名称', minWidth: 120 },
    { prop: 'code', label: '配电室编码', minWidth: 120 },
    { prop: 'principals', label: '负责人', minWidth: 100, formatter: row => row.principals || '-' },
    { prop: 'principalsTel', label: '负责人电话', minWidth: 120, formatter: row => row.principalsTel || '-' },
    { prop: 'remark', label: '备注', minWidth: 150, formatter: row => row.remark || '-' },
    { prop: 'createdAt', label: '创建时间', minWidth: 160, formatter: row => row.createdAt || '-' },
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
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, checkedRowKeys, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

async function handleDelete(id: number) {
  const { error } = await fetchDeletePowerDistributions([id]);
  if (!error) {
    onDeleted();
  }
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) {
    ElMessage.warning('请选择要删除的数据');
    return;
  }
  const { error } = await fetchDeletePowerDistributions(checkedRowKeys.value as number[]);
  if (!error) {
    checkedRowKeys.value = [];
    getData();
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function edit(id: number) {
  handleEdit(id);
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PowerDistributionSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>配电室管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable
          v-loading="loading"
          height="100%"
          border
          class="sm:h-full"
          :data="data"
          row-key="id"
          @selection-change="checkedRowKeys = $event"
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
      <PowerDistributionOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>