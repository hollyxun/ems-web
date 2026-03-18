<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchBatchDeleteOperationRecords,
  fetchDeleteOperationRecord,
  fetchGetOperationRecordList
} from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'OperationRecordManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.OperationRecordSearchParams {
  return {
    page: 1,
    pageSize: 30,
    path: undefined,
    method: undefined,
    status: undefined
  };
}

const methodColorMap: Record<string, UI.ThemeColor> = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger',
  PATCH: 'info'
};

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetOperationRecordList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'ip', label: 'IP地址', width: 130 },
    {
      prop: 'method',
      label: '请求方法',
      width: 100,
      formatter: row => {
        const color = methodColorMap[row.method] || 'info';
        return <ElTag type={color}>{row.method}</ElTag>;
      }
    },
    { prop: 'path', label: '请求路径', minWidth: 250 },
    {
      prop: 'status',
      label: '响应状态',
      width: 100,
      formatter: row => {
        const isSuccess = row.status >= 200 && row.status < 300;
        return <ElTag type={isSuccess ? 'success' : 'danger'}>{row.status}</ElTag>;
      }
    },
    {
      prop: 'latency',
      label: '响应时间',
      width: 100,
      formatter: row => <span>{row.latency}ms</span>
    },
    { prop: 'userId', label: '用户ID', width: 80 },
    {
      prop: 'createdAt',
      label: '操作时间',
      width: 300,
      formatter: row => <span>{row.createdAt || '-'}</span>
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 100,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => viewDetail(row)}>
            详情
          </ElButton>
        </div>
      )
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

/** detail drawer */
const detailVisible = ref(false);
const detailData = ref<Api.SystemManage.OperationRecord | null>(null);

function viewDetail(row: Api.SystemManage.OperationRecord) {
  detailData.value = { ...row };
  detailVisible.value = true;
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(key => Number(key));
  if (ids.length === 0) return;

  const { error } = await fetchBatchDeleteOperationRecords(ids);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteOperationRecord(id);
  if (!error) {
    onDeleted();
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem :title="$t('common.search')" name="record-search">
          <ElForm :model="searchParams" label-position="right" :label-width="80">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="请求路径" prop="path">
                  <ElInput v-model="searchParams.path" placeholder="请输入请求路径" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="请求方法" prop="method">
                  <ElSelect v-model="searchParams.method" clearable placeholder="请选择请求方法">
                    <ElOption label="GET" value="GET" />
                    <ElOption label="POST" value="POST" />
                    <ElOption label="PUT" value="PUT" />
                    <ElOption label="DELETE" value="DELETE" />
                    <ElOption label="PATCH" value="PATCH" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="响应状态" prop="status">
                  <ElInput v-model.number="searchParams.status" placeholder="请输入响应状态码" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="24" :sm="24">
                <ElSpace class="w-full justify-end" alignment="end">
                  <ElButton @click="resetSearchParams">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    {{ $t('common.reset') }}
                  </ElButton>
                  <ElButton type="primary" plain @click="() => getDataByPage()">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </ElButton>
                </ElSpace>
              </ElCol>
            </ElRow>
          </ElForm>
        </ElCollapseItem>
      </ElCollapse>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>操作日志</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="false"
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
    </ElCard>

    <!-- Detail Drawer -->
    <ElDrawer v-model="detailVisible" title="操作日志详情" :size="600">
      <ElDescriptions v-if="detailData" :column="2" border>
        <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户ID">{{ detailData.userId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="IP地址">{{ detailData.ip }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求方法">{{ detailData.method }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求路径" :span="2">{{ detailData.path }}</ElDescriptionsItem>
        <ElDescriptionsItem label="响应状态">{{ detailData.status }}</ElDescriptionsItem>
        <ElDescriptionsItem label="响应时间">{{ detailData.latency }}ms</ElDescriptionsItem>
        <ElDescriptionsItem label="User-Agent" :span="2">{{ detailData.agent }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作时间" :span="2">{{ detailData.createdAt }}</ElDescriptionsItem>
        <ElDescriptionsItem v-if="detailData.errorMessage" label="错误信息" :span="2">
          <ElText type="danger">{{ detailData.errorMessage }}</ElText>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求Body" :span="2">
          <ElInput :model-value="detailData.body" type="textarea" :rows="5" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="响应Body" :span="2">
          <ElInput :model-value="detailData.resp" type="textarea" :rows="5" readonly />
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDrawer>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
