<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { enableStatusRecord } from '@/constants/business';
import {
  fetchBatchDeleteUsers,
  fetchCreateUser,
  fetchDeleteUser,
  fetchGetAllRoles,
  fetchGetDepartmentTree,
  fetchGetUserList,
  fetchUpdateUser
} from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

defineOptions({ name: 'UserManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.UserSearchParams {
  return {
    page: 1,
    pageSize: 30,
    username: undefined,
    nickName: undefined,
    phone: undefined,
    enabled: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetUserList(searchParams.value),
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
    { prop: 'username', label: $t('page.manage.user.userName'), minWidth: 100 },
    { prop: 'nickName', label: $t('page.manage.user.nickName'), minWidth: 100 },
    { prop: 'phone', label: $t('page.manage.user.userPhone'), width: 120 },
    { prop: 'email', label: $t('page.manage.user.userEmail'), minWidth: 200 },
    {
      prop: 'department',
      label: '所属部门',
      minWidth: 120,
      formatter: row => <span>{row.department?.name || '-'}</span>
    },
    {
      prop: 'roles',
      label: '角色',
      minWidth: 150,
      formatter: row => {
        if (!row.roles || row.roles.length === 0) {
          return <span class="text-gray-400">未分配</span>;
        }
        return (
          <div class="flex flex-wrap gap-4px">
            {row.roles.map((role: Api.SystemManage.Role) => (
              <ElTag key={role.authorityId} type="primary" size="small">
                {role.authorityName || role.roleName}
              </ElTag>
            ))}
          </div>
        );
      }
    },
    {
      prop: 'enabled',
      label: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      formatter: row => {
        const tagMap: Record<number, UI.ThemeColor> = {
          1: 'success',
          2: 'danger'
        };

        const label = row.enabled === 1 ? '启用' : '禁用';

        return <ElTag type={tagMap[row.enabled as 1 | 2] || 'info'}>{label}</ElTag>;
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

/** all roles for selection */
const allRoles = ref<Api.SystemManage.Role[]>([]);

/** all departments for selection */
const allDepartments = ref<Api.SystemManage.Department[]>([]);

async function getAllRoles() {
  const { data: roles } = await fetchGetAllRoles();
  allRoles.value = roles || [];
}

async function getAllDepartments() {
  const { data: departments } = await fetchGetDepartmentTree();
  allDepartments.value = departments || [];
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(key => Number(key));
  if (ids.length === 0) return;

  const { error } = await fetchBatchDeleteUsers(ids);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteUser(id);
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

// init
getAllRoles();
getAllDepartments();
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.user.title') }}</p>
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
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :all-roles="allRoles"
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
