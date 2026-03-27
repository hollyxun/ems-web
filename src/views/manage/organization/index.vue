<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElCard, ElPopconfirm, ElTag, ElTree } from 'element-plus';
import { fetchDeleteOrganization, fetchOrganizationTree } from '@/service/api';
import { $t } from '@/locales';
import OrganizationOperateDrawer from './modules/organization-operate-drawer.vue';

defineOptions({ name: 'OrganizationManage' });

// Organization type mapping
const orgTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '集团', type: 'primary' },
  2: { label: '工厂', type: 'success' },
  3: { label: '车间', type: 'warning' },
  4: { label: '班组', type: 'info' }
};

// Tree data
const organizationTree = ref<Api.Organization.OrganizationItem[]>([]);
const loading = ref(false);
const expandedKeys = ref<number[]>([]);

// Drawer control
const drawerVisible = ref(false);
const operateType = ref<UI.TableOperateType>('add');
const editingData = ref<Api.Organization.OrganizationItem | null>(null);
const parentId = ref<number>(0);

// Get organization tree
async function getOrganizationTree() {
  loading.value = true;
  try {
    const { data } = await fetchOrganizationTree();
    organizationTree.value = data || [];
    // Auto-expand first level
    if (data && data.length > 0) {
      expandedKeys.value = data.filter(n => n.level === 1).map(n => n.id);
    }
  } finally {
    loading.value = false;
  }
}

// Handle add root organization
function handleAddRoot() {
  operateType.value = 'add';
  editingData.value = null;
  parentId.value = 0;
  drawerVisible.value = true;
}

// Handle add child organization
function handleAddChild(data: Api.Organization.OrganizationItem) {
  if (data.level >= 4) {
    window.$message?.warning('班组下不能再添加子组织');
    return;
  }
  operateType.value = 'add';
  editingData.value = null;
  parentId.value = data.id;
  drawerVisible.value = true;
}

// Handle edit
function handleEdit(data: Api.Organization.OrganizationItem) {
  operateType.value = 'edit';
  editingData.value = data;
  parentId.value = data.parentId;
  drawerVisible.value = true;
}

// Handle delete
async function handleDelete(id: number) {
  const { error } = await fetchDeleteOrganization(id);
  if (!error) {
    window.$message?.success($t('common.deleteSuccess'));
    getOrganizationTree();
  }
}

// Filter text
const filterText = ref('');
const treeRef = ref<InstanceType<typeof ElTree>>();

// Filter tree nodes
function filterNode(value: string, data: Api.Organization.OrganizationItem): boolean {
  if (!value) return true;
  return data.name.includes(value) || data.code.includes(value);
}

// Watch filter text
function handleFilterChange(val: string) {
  treeRef.value?.filter(val);
}

// Expand all
function handleExpandAll() {
  const getAllIds = (orgs: Api.Organization.OrganizationItem[]): number[] => {
    return orgs.flatMap(org => [org.id, ...(org.children ? getAllIds(org.children) : [])]);
  };
  expandedKeys.value = getAllIds(organizationTree.value);
}

// Collapse all
function handleCollapseAll() {
  expandedKeys.value = [];
}

function handleSubmitted() {
  getOrganizationTree();
  drawerVisible.value = false;
}

// Initialize
getOrganizationTree();
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-16px">
            <p>组织架构管理</p>
            <ElInput
              v-model="filterText"
              placeholder="搜索组织名称或编码"
              clearable
              class="w-200px"
              @input="handleFilterChange"
            />
          </div>
          <div class="flex items-center gap-8px">
            <ElButton @click="handleExpandAll">展开全部</ElButton>
            <ElButton @click="handleCollapseAll">收起全部</ElButton>
            <ElButton type="primary" @click="handleAddRoot">{{ $t('common.add') }}根组织</ElButton>
            <ElButton @click="getOrganizationTree">
              {{ $t('common.refresh') }}
            </ElButton>
          </div>
        </div>
      </template>

      <div class="h-[calc(100%-60px)] overflow-auto">
        <ElTree
          ref="treeRef"
          v-loading="loading"
          :data="organizationTree"
          node-key="id"
          :expanded-keys="expandedKeys"
          :props="{ label: 'name', children: 'children' }"
          :filter-node-method="filterNode"
          @node-expand="(key: number) => expandedKeys.push(key)"
          @node-collapse="(key: number) => expandedKeys = expandedKeys.filter(k => k !== key)"
        >
          <template #default="{ data }">
            <div class="w-full flex items-center justify-between pr-16px">
              <div class="flex items-center gap-8px">
                <span class="font-medium">{{ data.name }}</span>
                <ElTag size="small" type="info">{{ data.code }}</ElTag>
                <ElTag size="small" :type="orgTypeMap[data.type]?.type || 'info'">
                  {{ orgTypeMap[data.type]?.label || '未知' }}
                </ElTag>
                <ElTag v-if="data.status === 2" size="small" type="danger">禁用</ElTag>
              </div>
              <div class="flex items-center gap-8px" @click.stop>
                <ElButton v-if="data.level < 4" type="primary" link size="small" @click="handleAddChild(data)">
                  添加子组织
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleEdit(data)">
                  {{ $t('common.edit') }}
                </ElButton>
                <ElPopconfirm
                  title="确定要删除该组织吗？删除后不可恢复，子组织也会被删除。"
                  @confirm="handleDelete(data.id)"
                >
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

        <div v-if="organizationTree.length === 0 && !loading" class="py-40px text-center text-gray-500">
          暂无组织数据，请点击上方"新增根组织"按钮添加
        </div>
      </div>

      <OrganizationOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :parent-id="parentId"
        @submitted="handleSubmitted"
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
