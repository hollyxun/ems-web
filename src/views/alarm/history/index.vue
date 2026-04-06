<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElTag } from 'element-plus';
import { fetchAlarmHistoryList, fetchBatchHandleAlarm, fetchHandleAlarm } from '@/service/api/alarm';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AlarmHistorySearch from './modules/alarm-history-search.vue';
import AlarmHandleDialog from './modules/alarm-handle-dialog.vue';

defineOptions({ name: 'AlarmHistoryManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams() {
  return {
    page: 1,
    pageSize: 10,
    indexCode: undefined,
    nodeId: undefined,
    handleStatus: undefined,
    beginTime: undefined,
    endTime: undefined,
    alarmLevel: undefined
  } as Api.AlarmHistory.SearchParams;
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchAlarmHistoryList(searchParams.value),
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
    { prop: 'indexName', label: '指标名称', minWidth: 120 },
    { prop: 'indexCode', label: '指标编码', minWidth: 120 },
    {
      prop: 'limitingValue',
      label: '限值',
      minWidth: 100,
      formatter: row => row.limitingValue?.toFixed(2) || '-'
    },
    {
      prop: 'alarmValue',
      label: '报警值',
      minWidth: 100,
      formatter: row => row.alarmValue?.toFixed(2) || '-'
    },
    { prop: 'beginTime', label: '开始时间', minWidth: 160 },
    { prop: 'endTime', label: '结束时间', minWidth: 160 },
    {
      prop: 'duration',
      label: '持续时间',
      minWidth: 100,
      formatter: row => (row.duration ? `${row.duration}分钟` : '-')
    },
    { prop: 'content', label: '报警描述', minWidth: 200 },
    {
      prop: 'handleStatus',
      label: '处理状态',
      align: 'center',
      width: 100,
      formatter: row => {
        const statusMap: Record<string, { label: string; type: UI.ThemeColor }> = {
          '0': { label: '未处理', type: 'danger' },
          '1': { label: '已确认', type: 'warning' },
          '2': { label: '已处理', type: 'success' }
        };
        const item = statusMap[row.handleStatus] || { label: '未知', type: 'info' };
        return <ElTag type={item.type}>{item.label}</ElTag>;
      }
    },
    { prop: 'handler', label: '处理人', minWidth: 100 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 120,
      formatter: row =>
        row.handleStatus === '0' ? (
          <ElButton type="primary" plain size="small" onClick={() => handleOpenHandleDialog(row)}>
            处理
          </ElButton>
        ) : null
    }
  ]
});

const handleDialogVisible = ref(false);
const selectedRow = ref<Api.AlarmHistory.Item | null>(null);
const checkedRowKeys = ref<number[]>([]);

function handleOpenHandleDialog(row: Api.AlarmHistory.Item) {
  selectedRow.value = row;
  handleDialogVisible.value = true;
}

async function handleConfirm(id: number, handleStatus: string, handleRemark: string) {
  const { error } = await fetchHandleAlarm({ id, handleStatus, handleRemark });
  if (!error) {
    ElMessage.success('处理成功');
    handleDialogVisible.value = false;
    getData();
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
    <AlarmHistorySearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>报警历史</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="true"
            :loading="loading"
            :show-add="false"
            :show-delete="false"
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
      <AlarmHandleDialog v-model:visible="handleDialogVisible" :row-data="selectedRow" @confirm="handleConfirm" />
    </ElCard>
  </div>
</template>
