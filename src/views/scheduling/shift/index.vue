<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchChangeShiftStatus,
  fetchDeleteShift,
  fetchGetShiftList
} from '@/service/api/scheduling';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ShiftOperateDrawer from './modules/shift-operate-drawer.vue';
import ShiftSearch from './modules/shift-search.vue';

defineOptions({ name: 'ShiftManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.Scheduling.ShiftSearchParams {
  return {
    page: 1,
    pageSize: 10,
    name: undefined,
    shiftType: undefined,
    status: undefined
  };
}

const shiftTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '早班', type: 'success' },
  2: { label: '中班', type: 'warning' },
  3: { label: '晚班', type: 'info' },
  4: { label: '夜班', type: 'danger' },
  5: { label: '休息', type: 'info' }
};

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetShiftList(searchParams.value),
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
    { prop: 'name', label: '班次名称', minWidth: 120 },
    { prop: 'code', label: '班次编码', minWidth: 120 },
    {
      prop: 'shiftType',
      label: '班次类型',
      width: 100,
      align: 'center',
      formatter: row => {
        const config = shiftTypeMap[row.shiftType] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    {
      prop: 'workTime',
      label: '工作时间',
      minWidth: 150,
      formatter: row => {
        if (!row.startTime || !row.endTime) return '-';
        const start = row.startTime.substring(11, 16);
        const end = row.endTime.substring(11, 16);
        return `${start} - ${end}${row.isNextDay ? ' (次日)' : ''}`;
      }
    },
    { prop: 'durationHours', label: '时长(小时)', width: 100, align: 'center' },
    {
      prop: 'color',
      label: '颜色',
      width: 80,
      align: 'center',
      formatter: row => {
        return row.color ? (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: row.color,
              border: '1px solid #ddd',
              margin: '0 auto'
            }}
          />
        ) : (
          '-'
        );
      }
    },
    { prop: 'sort', label: '排序', width: 80, align: 'center' },
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
        const label = row.status === 1 ? '启用' : '禁用';
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
          <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </ElButton>
          <ElButton
            type={row.status === 1 ? 'warning' : 'success'}
            plain
            size="small"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === 1 ? '禁用' : '启用'}
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

const { drawerVisible, operateType, handleEdit, onDeleted } = useTableOperate(data, 'id', getData);

async function handleToggleStatus(row: Api.Scheduling.Shift) {
  const status = row.status === 1 ? 2 : 1;
  const { error } = await fetchChangeShiftStatus({ id: row.id, status });
  if (!error) {
    ElMessage.success('操作成功');
    getData();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteShift(id);
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
    <ShiftSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>班次管理</p>
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
      <ShiftOperateDrawer
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
