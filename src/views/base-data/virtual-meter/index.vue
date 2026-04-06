<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchDeleteVirtualMeter, fetchGetVirtualMeterList } from '@/service/api/virtual-meter';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import VirtualMeterSearch from './modules/virtual-meter-search.vue';
import VirtualMeterOperateDrawer from './modules/virtual-meter-operate-drawer.vue';

defineOptions({ name: 'BaseDataVirtualMeter' });

const searchParams = ref(getInitSearchParams());

// Late binding for handleEdit
const editHandler = ref<(row: any) => void>(() => {});

// 计算类型映射
const calculateTypeMap: Record<string, { label: string; type: UI.ThemeColor }> = {
  sum: { label: '求和', type: 'success' },
  difference: { label: '差值', type: 'warning' },
  average: { label: '平均值', type: 'info' },
  ratio: { label: '比率', type: 'primary' },
  custom: { label: '自定义公式', type: 'danger' }
};

function getInitSearchParams(): Api.Energy.VirtualMeterSearchParams {
  return {
    page: 1,
    pageSize: 10,
    name: undefined,
    code: undefined,
    mediumId: undefined,
    calculateType: undefined,
    status: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetVirtualMeterList(searchParams.value),
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
    { prop: 'code', label: '编码', minWidth: 120 },
    { prop: 'name', label: '名称', minWidth: 150 },
    { prop: 'mediumCode', label: '能源介质', width: 100 },
    {
      prop: 'calculateType',
      label: '计算类型',
      width: 120,
      align: 'center',
      formatter: row => {
        const config = calculateTypeMap[row.calculateType] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    { prop: 'formula', label: '计算公式', minWidth: 200 },
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
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 200,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => editHandler.value(row)}>
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

// Bind editHandler after useTableOperate returns handleEdit
editHandler.value = handleEdit;

async function handleDelete(id: number) {
  const { error } = await fetchDeleteVirtualMeter(id);
  if (!error) {
    onDeleted();
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
    <VirtualMeterSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>虚拟计量点管理</p>
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

    <VirtualMeterOperateDrawer
      v-model="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getDataByPage"
    />
  </div>
</template>
