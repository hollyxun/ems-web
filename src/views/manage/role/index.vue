<script setup lang="tsx">
import { computed, ref } from 'vue';
import { ElButton, ElCard, ElPopconfirm, ElTag, ElTree } from 'element-plus';
import { fetchDeleteRole, fetchGetRoleTree } from '@/service/api';
import { $t } from '@/locales';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';
import BatchSetParentModal from './modules/batch-set-parent-modal.vue';

defineOptions({ name: 'RoleManage' });

// 树形数据
const roleTree = ref<Api.SystemManage.Role[]>([]);
const loading = ref(false);

// 搜索参数
const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.RoleSearchParams {
  return {
    page: 1,
    pageSize: 10,
    authorityName: undefined
  };
}

// 抽屉控制
const drawerVisible = ref(false);
const operateType = ref<UI.TableOperateType>('add');
const editingData = ref<Api.SystemManage.Role | null>(null);

// 批量设置父角色弹窗
const batchModalVisible = ref(false);
const selectedRoleIds = ref<number[]>([]);

// 获取角色树
async function getRoleTree() {
  loading.value = true;
  try {
    const { data } = await fetchGetRoleTree();
    roleTree.value = data || [];
  } finally {
    loading.value = false;
  }
}

// 处理添加
function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  drawerVisible.value = true;
}

// 处理编辑
function handleEdit(role: Api.SystemManage.Role) {
  operateType.value = 'edit';
  editingData.value = role;
  drawerVisible.value = true;
}

// 处理删除
async function handleDelete(id: number) {
  const { error } = await fetchDeleteRole(id);
  if (!error) {
    window.$message?.success($t('common.deleteSuccess'));
    getRoleTree();
  }
}

// 处理批量设置父角色
function handleBatchSetParent() {
  if (selectedRoleIds.value.length === 0) {
    window.$message?.warning('请至少选择一个角色');
    return;
  }
  batchModalVisible.value = true;
}

// 处理选择变化
function handleCheckChange(data: Api.SystemManage.Role, checked: boolean) {
  if (checked) {
    if (!selectedRoleIds.value.includes(data.authorityId)) {
      selectedRoleIds.value.push(data.authorityId);
    }
  } else {
    const index = selectedRoleIds.value.indexOf(data.authorityId);
    if (index > -1) {
      selectedRoleIds.value.splice(index, 1);
    }
  }
}

// 过滤树节点
const filterText = ref('');
const treeRef = ref<InstanceType<typeof ElTree>>();

const filteredTree = computed(() => {
  if (!filterText.value) return roleTree.value;

  const filter = (nodes: Api.SystemManage.Role[]): Api.SystemManage.Role[] => {
    return nodes.filter(node => {
      const match =
        node.authorityName?.toLowerCase().includes(filterText.value.toLowerCase()) ||
        node.authorityId?.toString().includes(filterText.value);
      if (node.children && node.children.length > 0) {
        const filteredChildren = filter(node.children);
        if (filteredChildren.length > 0) {
          node.children = filteredChildren;
          return true;
        }
      }
      return match;
    });
  };

  return filter([...roleTree.value]);
});

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
  filterText.value = '';
}

function handleSubmitted() {
  getRoleTree();
  drawerVisible.value = false;
}

function handleBatchSubmitted() {
  getRoleTree();
  selectedRoleIds.value = [];
}

// 初始化
getRoleTree();
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getRoleTree" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-16px">
            <p>{{ $t('page.manage.role.title') }}</p>
            <ElInput v-model="filterText" placeholder="搜索角色名称" clearable class="w-200px" />
          </div>
          <div class="flex items-center gap-8px">
            <ElButton type="primary" :disabled="selectedRoleIds.length === 0" @click="handleBatchSetParent">
              批量设置父角色
              <span v-if="selectedRoleIds.length > 0" class="ml-4px">({{ selectedRoleIds.length }})</span>
            </ElButton>
            <ElButton type="primary" @click="handleAdd">
              {{ $t('common.add') }}
            </ElButton>
            <ElButton @click="getRoleTree">
              {{ $t('common.refresh') }}
            </ElButton>
          </div>
        </div>
      </template>

      <div class="h-[calc(100%-60px)] overflow-auto">
        <ElTree
          ref="treeRef"
          v-loading="loading"
          :data="filteredTree"
          node-key="authorityId"
          show-checkbox
          default-expand-all
          @check-change="handleCheckChange"
        >
          <template #default="{ data }">
            <div class="w-full flex items-center justify-between pr-16px">
              <div class="flex items-center gap-8px">
                <span class="font-medium">{{ data.authorityName }}</span>
                <ElTag size="small" type="info">ID: {{ data.authorityId }}</ElTag>
                <ElTag v-if="data.status === 2" size="small" type="danger">禁用</ElTag>
              </div>
              <div class="flex items-center gap-8px" @click.stop>
                <ElButton type="primary" link size="small" @click="handleEdit(data)">
                  {{ $t('common.edit') }}
                </ElButton>
                <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(data.id)">
                  <template #reference>
                    <ElButton type="danger" link size="small">
                      {{ $t('common.delete') }}
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </div>
            </div>
          </template>
        </ElTree>

        <div v-if="roleTree.length === 0 && !loading" class="py-40px text-center text-gray-500">暂无角色数据</div>
      </div>

      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="handleSubmitted"
      />

      <BatchSetParentModal
        v-model:visible="batchModalVisible"
        :role-ids="selectedRoleIds"
        @submitted="handleBatchSubmitted"
      />
    </ElCard>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-tree) {
  .el-tree-node__content {
    height: 40px;
  }
}
</style>
