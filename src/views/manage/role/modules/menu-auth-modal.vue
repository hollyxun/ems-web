<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import type { ElTree } from 'element-plus';
import { fetchBindRoleRoutes, fetchGetRoleRouteIds, fetchGetRouteTree } from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'MenuAuthModal' });

interface Props {
  /** the roleId */
  roleId: number;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.menuAuth'));

// 树形数据
const tree = shallowRef<Api.RouteMenu.RouteMenu[]>([]);
const loading = shallowRef(false);

// 获取路由树
async function getTree() {
  loading.value = true;
  try {
    const { data } = await fetchGetRouteTree();
    tree.value = data || [];
  } finally {
    loading.value = false;
  }
}

// 选中的路由ID
const checks = shallowRef<number[]>([]);
const checksLoading = shallowRef(false);

// 树组件引用
const treeRef = ref<InstanceType<typeof ElTree>>();

// 获取角色已绑定的路由ID
async function getChecks() {
  if (!props.roleId) return;

  checksLoading.value = true;
  try {
    const { data } = await fetchGetRoleRouteIds(props.roleId);
    checks.value = data || [];
  } finally {
    checksLoading.value = false;
  }
}

// 获取所有路由ID（扁平化）
function getAllRouteIds(routes: Api.RouteMenu.RouteMenu[]): number[] {
  const ids: number[] = [];
  function traverse(nodes: Api.RouteMenu.RouteMenu[]) {
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  }
  traverse(routes);
  return ids;
}

// 全选
function handleSelectAll() {
  const allIds = getAllRouteIds(tree.value);
  checks.value = allIds;
  treeRef.value?.setCheckedKeys(allIds, false);
}

// 反选
function handleInvertSelection() {
  const allIds = getAllRouteIds(tree.value);
  const currentChecks = (treeRef.value?.getCheckedKeys(false) as number[]) || [];
  const invertedIds = allIds.filter(id => !currentChecks.includes(id));
  checks.value = invertedIds;
  treeRef.value?.setCheckedKeys(invertedIds, false);
}

// 清空选择
function handleClearSelection() {
  checks.value = [];
  treeRef.value?.setCheckedKeys([], false);
}

// 按模块选择
interface ModuleNode {
  name: string;
  title: string;
  children: Api.RouteMenu.RouteMenu[];
}

// 获取模块列表（一级目录）
const modules = computed<ModuleNode[]>(() => {
  return tree.value
    .filter(node => node.children && node.children.length > 0)
    .map(node => ({
      name: node.name,
      title: node.title || node.name,
      children: node.children || []
    }));
});

// 选中指定模块的所有路由
function handleSelectModule(module: ModuleNode) {
  const moduleIds: number[] = [];
  function traverse(nodes: Api.RouteMenu.RouteMenu[]) {
    for (const node of nodes) {
      moduleIds.push(node.id);
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  }
  traverse(module.children);

  // 合并当前选中和模块的所有ID
  const currentChecks = (treeRef.value?.getCheckedKeys(false) as number[]) || [];
  const mergedIds = [...new Set([...currentChecks, ...moduleIds])];
  checks.value = mergedIds;
  treeRef.value?.setCheckedKeys(mergedIds, false);
}

const submitting = shallowRef(false);

async function handleSubmit() {
  if (!props.roleId) return;

  submitting.value = true;
  try {
    // 获取选中的路由ID
    const checkedKeys = (treeRef.value?.getCheckedKeys(false) as number[]) || [];

    const { error } = await fetchBindRoleRoutes({
      roleId: props.roleId,
      routeMenuIds: checkedKeys
    });

    if (error) throw error;

    window.$message?.success?.($t('common.modifySuccess'));
    closeModal();
  } finally {
    submitting.value = false;
  }
}

function init() {
  getTree();
  getChecks();
}

watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-640px">
    <!-- 操作按钮区域 -->
    <div class="flex flex-wrap items-center justify-between gap-8px border-b border-gray-200 pb-12px">
      <div class="flex flex-wrap gap-8px">
        <ElButton size="small" type="primary" plain @click="handleSelectAll">
          {{ $t('common.selectAll') || '全选' }}
        </ElButton>
        <ElButton size="small" @click="handleInvertSelection">
          {{ $t('common.invertSelection') || '反选' }}
        </ElButton>
        <ElButton size="small" @click="handleClearSelection">
          {{ $t('common.clearSelection') || '清空' }}
        </ElButton>
      </div>
    </div>

    <!-- 模块快捷选择 -->
    <div v-if="modules.length > 0" class="border-b border-gray-200 py-12px">
      <div class="mb-8px text-12px text-gray-500">
        {{ $t('page.manage.role.moduleQuickSelect') || '模块快捷选择' }}
      </div>
      <div class="flex flex-wrap gap-8px">
        <ElButton
          v-for="module in modules"
          :key="module.name"
          size="small"
          type="info"
          plain
          @click="handleSelectModule(module)"
        >
          {{ module.title }}
        </ElButton>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="flex items-center gap-16px border-b border-gray-200 py-12px text-12px text-gray-500">
      <div class="flex items-center gap-4px">
        <span class="rounded bg-blue-100 px-8px py-2px text-blue-600">
          {{ $t('page.manage.role.routePermission') || '路由权限' }}
        </span>
      </div>
      <div class="flex items-center gap-4px">
        <span class="text-gray-400">
          {{ $t('page.manage.role.selectHint') || '勾选节点为角色分配路由访问权限' }}
        </span>
      </div>
    </div>

    <!-- 路由树 -->
    <ElTree
      ref="treeRef"
      v-model:checked-keys="checks"
      v-loading="loading || checksLoading"
      :data="tree"
      node-key="id"
      show-checkbox
      :check-strictly="false"
      :default-expand-all="true"
      :default-checked-keys="checks"
      class="mt-12px h-320px overflow-y-auto"
    >
      <template #default="{ data }">
        <div class="flex items-center gap-8px">
          <span>{{ data.title || data.name }}</span>
          <ElTag v-if="data.isConstant" size="small" type="info">
            {{ $t('page.manage.route.constant') || '常量' }}
          </ElTag>
          <ElTag v-if="data.status === 2" size="small" type="warning">
            {{ $t('page.manage.route.disabled') || '禁用' }}
          </ElTag>
          <ElTag v-if="data.status === 3" size="small" type="danger">
            {{ $t('page.manage.route.obsolete') || '废弃' }}
          </ElTag>
        </div>
      </template>
    </ElTree>

    <template #footer>
      <ElSpace class="w-full justify-end">
        <ElButton size="small" class="mt-16px" @click="closeModal">
          {{ $t('common.cancel') }}
        </ElButton>
        <ElButton type="primary" size="small" class="mt-16px" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped>
:deep(.el-tree-node__content) {
  height: 36px;
}
</style>
