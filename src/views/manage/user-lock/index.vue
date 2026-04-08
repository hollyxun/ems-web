<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchGetLockedUsers, fetchUnlockUser } from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'UserLockManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams() {
  return {
    page: 1,
    pageSize: 20
  };
}

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetLockedUsers(searchParams.value.page, searchParams.value.pageSize),
  transform: response => {
    return defaultTransform(response);
  },
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 20;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'username', label: '用户名', minWidth: 100 },
    { prop: 'nickName', label: '昵称', minWidth: 100 },
    {
      prop: 'loginFailCount',
      label: '失败次数',
      width: 100,
      align: 'center',
      formatter: row => <ElTag type="danger">{row.loginFailCount || 0} 次</ElTag>
    },
    {
      prop: 'lockedAt',
      label: '锁定时间',
      minWidth: 160,
      formatter: row => <span>{formatDateTime(row.lockedAt)}</span>
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 120,
      formatter: row => (
        <div class="flex-center">
          <ElPopconfirm title="确认解锁该用户？" onConfirm={() => handleUnlock(row.id)}>
            {{
              reference: () => (
                <ElButton type="primary" plain size="small">
                  解锁
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { checkedRowKeys } = useTableOperate(data, 'id', getData);

// 解锁用户
async function handleUnlock(userId: number) {
  const { error } = await fetchUnlockUser(userId);
  if (!error) {
    window.$message?.success('解锁成功');
    getData();
  }
}

// 格式化时间
function formatDateTime(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>用户锁定管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            :show-add="false"
            :show-delete="false"
            @refresh="getData"
          />
        </div>
      </template>

      <!-- 说明信息 -->
      <ElAlert
        title="用户因登录失败次数超过限制（5次）将被自动锁定30分钟，管理员可手动解锁。"
        type="info"
        class="mb-16px"
        :closable="false"
        show-icon
      />

      <div class="h-[calc(100%-100px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="id">
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
  </div>
</template>

<style scoped></style>
