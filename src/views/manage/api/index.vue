<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchBatchDeleteApis, fetchCreateApi, fetchDeleteApi, fetchGetApiList, fetchUpdateApi } from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ApiOperateDrawer from './modules/api-operate-drawer.vue';

defineOptions({ name: 'ApiManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.ApiSearchParams {
  return {
    page: 1,
    pageSize: 30,
    path: undefined,
    apiGroup: undefined,
    method: undefined
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
  api: () => fetchGetApiList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'path', label: 'API路径', minWidth: 200 },
    { prop: 'description', label: 'API描述', minWidth: 150 },
    { prop: 'apiGroup', label: 'API分组', width: 120 },
    {
      prop: 'method',
      label: '请求方法',
      width: 100,
      formatter: row => {
        const color = methodColorMap[row.method] || 'info';
        return <ElTag type={color}>{row.method}</ElTag>;
      }
    },
    {
      prop: 'status',
      label: '状态',
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
      width: 130,
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(key => Number(key));
  if (ids.length === 0) return;

  const { error } = await fetchBatchDeleteApis(ids);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteApi(id);
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
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem :title="$t('common.search')" name="api-search">
          <ElForm :model="searchParams" label-position="right" :label-width="80">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="API路径" prop="path">
                  <ElInput v-model="searchParams.path" placeholder="请输入API路径" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="API分组" prop="apiGroup">
                  <ElInput v-model="searchParams.apiGroup" placeholder="请输入API分组" />
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
          <p>API接口管理</p>
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
      <ApiOperateDrawer
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
