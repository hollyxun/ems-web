<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchDeleteShiftPattern,
  fetchGetShiftPatternList
} from '@/service/api/scheduling';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ShiftPatternOperateDrawer from './modules/shiftPattern-operate-drawer.vue';
import ShiftPatternSearch from './modules/shiftPattern-search.vue';

defineOptions({ name: 'ShiftPatternManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.Scheduling.ShiftPatternSearchParams {
  return {
    page: 1,
    pageSize: 10,
    name: undefined,
    patternType: undefined,
    status: undefined
  };
}

const patternTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '五班四运转', type: 'primary' },
  2: { label: '四班三运转', type: 'success' },
  3: { label: '三班两运转', type: 'warning' },
  4: { label: '两班制', type: 'info' },
  5: { label: '长白班', type: 'danger' },
  6: { label: '自定义', type: 'default' }
};

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetShiftPatternList(searchParams.value),
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
    { prop: 'name', label: '模式名称', minWidth: 150 },
    { prop: 'code', label: '模式编码', minWidth: 120 },
    {
      prop: 'patternType',
      label: '模式类型',
      width: 120,
      align: 'center',
      formatter: row => {
        const config = patternTypeMap[row.patternType] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    {
      prop: 'cycleInfo',
      label: '周期配置',
      minWidth: 150,
      formatter: row => {
        return `${row.cycleDays}天周期 (工作${row.workDaysPerCycle}天 / 休息${row.restDaysPerCycle}天)`;
      }
    },
    { prop: 'teamsCount', label: '班组数', width: 80, align: 'center' },
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
      prop: 'description',
      label: '描述',
      minWidth: 200,
      showOverflowTooltip: true,
      formatter: row => row.description || '-'
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 150,
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(data, 'id', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteShiftPattern(id);
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
    <ShiftPatternSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>排班模式管理</p>
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
      <ShiftPatternOperateDrawer
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
