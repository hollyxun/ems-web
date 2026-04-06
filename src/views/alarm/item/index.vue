<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchAlarmItemList,
  fetchBatchDeleteAlarmItems,
  fetchDeleteAlarmItem,
  fetchUpdateAlarmStartStop
} from '@/service/api/alarm';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AlarmItemSearch from './modules/alarm-item-search.vue';
import AlarmItemDrawer from './modules/alarm-item-drawer.vue';

defineOptions({ name: 'AlarmItemManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams() {
  return {
    page: 1,
    pageSize: 10,
    indexCode: undefined,
    nodeId: undefined,
    pointId: undefined,
    startStop: undefined
  } as Api.AlarmItem.SearchParams;
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchAlarmItemList(searchParams.value),
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
    { prop: 'indexCode', label: '指标编码', minWidth: 120 },
    { prop: 'timeSlot', label: '时段', minWidth: 100 },
    {
      prop: 'limitType',
      label: '限值类型',
      minWidth: 100,
      formatter: row => {
        const typeMap: Record<string, string> = {
          '1': '上限',
          '2': '下限'
        };
        return typeMap[row.limitType] || row.limitType;
      }
    },
    { prop: 'limitVal', label: '限值', minWidth: 100 },
    { prop: 'alarmLevel', label: '报警级别', minWidth: 100 },
    {
      prop: 'startStop',
      label: '状态',
      align: 'center',
      width: 100,
      formatter: row => {
        const tagMap: Record<string, UI.ThemeColor> = {
          '1': 'success',
          '2': 'danger'
        };
        const label = row.startStop === '1' ? '启用' : '停止';
        return <ElTag type={tagMap[row.startStop] || 'info'}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 240,
      formatter: row => {
        const handleConfirm = () => handleDelete(row.id);
        return (
          <div class="flex-center">
            <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>
              {$t('common.edit')}
            </ElButton>
            <ElButton
              type={row.startStop === '1' ? 'warning' : 'success'}
              plain
              size="small"
              onClick={() => handleToggleStatus(row)}
            >
              {row.startStop === '1' ? '停止' : '启用'}
            </ElButton>
            <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={handleConfirm}>
              <ElButton type="danger" plain size="small">
                {$t('common.delete')}
              </ElButton>
            </ElPopconfirm>
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, checkedRowKeys, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

async function handleToggleStatus(row: Api.AlarmItem.Item) {
  const startStop = row.startStop === '1' ? '2' : '1';
  const { error } = await fetchUpdateAlarmStartStop({ ids: [row.id], startStop });
  if (!error) {
    ElMessage.success('操作成功');
    getData();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteAlarmItem(id);
  if (!error) {
    onDeleted();
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
    <AlarmItemSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>预报警设置</p>
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
      <AlarmItemDrawer
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
