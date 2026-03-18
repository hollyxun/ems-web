<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchChangeMediumStatus,
  fetchDeleteMedium,
  fetchGetAllMediums,
  fetchGetMediumList
} from '@/service/api/energy';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import MediumSearch from './modules/medium-search.vue';
import MediumOperateDrawer from './modules/medium-operate-drawer.vue';

defineOptions({ name: 'EnergyMedium' });

const searchParams = ref(getInitSearchParams());

const mediumTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '一次能源', type: 'success' },
  2: { label: '二次能源', type: 'warning' },
  3: { label: '耗能工质', type: 'info' }
};

function getInitSearchParams(): Api.Energy.MediumSearchParams {
  return {
    page: 1,
    pageSize: 10,
    mediumCode: undefined,
    mediumName: undefined,
    mediumType: undefined,
    status: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetMediumList(searchParams.value),
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
    { prop: 'mediumCode', label: '介质编码', minWidth: 120 },
    { prop: 'mediumName', label: '介质名称', minWidth: 150 },
    {
      prop: 'mediumType',
      label: '介质类型',
      width: 120,
      align: 'center',
      formatter: row => {
        const config = mediumTypeMap[row.mediumType] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    {
      prop: 'status',
      label: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      formatter: row => {
        const tagMap: Record<number, UI.ThemeColor> = {
          1: 'success',
          2: 'danger'
        };
        const label = row.status === 1 ? '启用' : '停用';
        return <ElTag type={tagMap[row.status] || 'info'}>{label}</ElTag>;
      }
    },
    {
      prop: 'remark',
      label: '备注',
      minWidth: 200,
      formatter: row => row.remark || '-'
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 200,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => handleEdit(row)}>
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMedium(id);
  if (!error) {
    onDeleted();
  }
}

async function handleChangeStatus(id: number, status: number) {
  const { error } = await fetchChangeMediumStatus(id, status);
  if (!error) {
    ElMessage.success('状态修改成功');
    getDataByPage();
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <MediumSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>能源介质管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
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
    </ElCard>

    <MediumOperateDrawer
      v-model="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getDataByPage"
    />
  </div>
</template>
