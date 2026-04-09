<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchBatchDeletePolicies, fetchDeletePolicy, fetchGetPolicyList } from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PolicyOperateDrawer from './modules/policy-operate-drawer.vue';
import PolicySearch from './modules/policy-search.vue';

defineOptions({ name: 'PolicyManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.Casbin.PolicySearchParams {
  return {
    page: 1,
    pageSize: 30,
    sub: undefined,
    obj: undefined,
    act: undefined
  };
}

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetPolicyList(searchParams.value),
  transform: response => defaultTransform(response as any),
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage;
    searchParams.value.pageSize = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    {
      prop: 'sub',
      label: '角色ID',
      minWidth: 100,
      formatter: (row: any) => <ElTag type="primary">{row.sub}</ElTag>
    },
    { prop: 'obj', label: '资源', minWidth: 200 },
    { prop: 'act', label: '操作', minWidth: 100 },
    {
      prop: 'effect',
      label: '效果',
      width: 80,
      align: 'center',
      formatter: (row: any) => {
        const type = row.effect === 'allow' ? 'success' : 'danger';
        return <ElTag type={type}>{row.effect || 'allow'}</ElTag>;
      }
    },
    {
      prop: 'ctx',
      label: '上下文',
      minWidth: 150,
      formatter: (row: any) => {
        if (!row.ctx) return <span class="text-gray-400">-</span>;
        const truncated = row.ctx.length > 50 ? `${row.ctx.substring(0, 50)}...` : row.ctx;
        return <span title={row.ctx}>{truncated}</span>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 130,
      formatter: (row: any) => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row)}>
            {$t('common.edit')}
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row)}>
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
  useTableOperate(data, 'sub', getData);

async function handleBatchDelete() {
  const policies = checkedRowKeys.value
    .map(key => {
      const row = data.value.find((item: any) => item.sub === key);
      return {
        sub: row?.sub || '',
        obj: row?.obj || '',
        act: row?.act || '',
        effect: row?.effect,
        ctx: row?.ctx
      };
    })
    .filter((p: any) => p.sub);

  if (policies.length === 0) return;

  const { error } = await fetchBatchDeletePolicies({ policies });
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(policy: any) {
  const { error } = await fetchDeletePolicy({
    sub: policy.sub,
    obj: policy.obj,
    act: policy.act,
    effect: policy.effect,
    ctx: policy.ctx
  });
  if (!error) {
    onDeleted();
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function edit(policy: any) {
  handleEdit(policy);
}

function addNew() {
  handleAdd();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PolicySearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>Casbin 策略管理</p>
          <TableHeaderOperation
            :loading="loading"
            :add-btn="true"
            :batch-delete-btn="true"
            @add="addNew"
            @batch-delete="handleBatchDelete"
            @refresh="getData"
          />
        </div>
      </template>
      <ElTable v-loading="loading" :data="data" :border="true" stripe @selection-change="checkedRowKeys = $event">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-16px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
    </ElCard>
    <PolicyOperateDrawer
      v-model:visible="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getData"
    />
  </div>
</template>

<style scoped></style>
