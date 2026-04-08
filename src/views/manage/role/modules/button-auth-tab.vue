<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import type { ElTree } from 'element-plus';
import { ElButton, ElTag } from 'element-plus';
import { fetchGetMenuButtons, fetchGetRoleButtons, fetchSetRoleButtons } from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'ButtonAuthTab' });

interface Props {
  roleId: number;
}

const props = defineProps<Props>();

const tree = shallowRef<Api.SystemManage.Menu[]>([]);
const loading = shallowRef(false);

// 将菜单按钮树转换为树形数据格式
async function getAllButtons() {
  loading.value = true;
  try {
    const { data } = await fetchGetMenuButtons();
    tree.value = data || [];
  } finally {
    loading.value = false;
  }
}

const checks = shallowRef<number[]>([]);
const checksLoading = shallowRef(false);

// 树组件引用
const treeRef = ref<InstanceType<typeof ElTree>>();

async function getChecks() {
  if (!props.roleId) return;

  checksLoading.value = true;
  try {
    const { data: buttonIds } = await fetchGetRoleButtons(props.roleId);
    checks.value = buttonIds || [];
  } finally {
    checksLoading.value = false;
  }
}

const submitting = shallowRef(false);

async function handleSubmit() {
  if (!props.roleId) return;

  submitting.value = true;
  try {
    const checkedKeys = (treeRef.value?.getCheckedKeys(false) as number[]) || [];

    const { error } = await fetchSetRoleButtons({
      roleId: props.roleId,
      buttonIds: checkedKeys,
      effect: 'allow'
    });

    if (error) throw error;

    window.$message?.success?.($t('common.modifySuccess'));
  } finally {
    submitting.value = false;
  }
}

// 全选按钮
function handleSelectAll() {
  const allIds: number[] = [];
  function traverse(nodes: Api.SystemManage.Menu[]) {
    for (const node of nodes) {
      if (node.buttons) {
        for (const btn of node.buttons) {
          allIds.push(btn.id);
        }
      }
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  }
  traverse(tree.value);
  checks.value = allIds;
  treeRef.value?.setCheckedKeys(allIds, false);
}

// 清空选择
function handleClearSelection() {
  checks.value = [];
  treeRef.value?.setCheckedKeys([], false);
}

function init() {
  getAllButtons();
  getChecks();
}

watch(
  () => props.roleId,
  () => {
    if (props.roleId) {
      init();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="button-auth-tab">
    <!-- 操作按钮 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-12px">
      <div class="flex items-center gap-8px">
        <ElButton size="small" type="primary" plain @click="handleSelectAll">
          {{ $t('common.selectAll') || '全选' }}
        </ElButton>
        <ElButton size="small" @click="handleClearSelection">
          {{ $t('common.clearSelection') || '清空' }}
        </ElButton>
      </div>
      <ElButton type="primary" size="small" :loading="submitting" @click="handleSubmit">
        {{ $t('common.save') || '保存' }}
      </ElButton>
    </div>

    <!-- 图例说明 -->
    <div class="flex items-center gap-16px border-b border-gray-200 py-12px text-12px text-gray-500">
      <div class="flex items-center gap-4px">
        <span class="rounded bg-green-100 px-8px py-2px text-green-600">按钮权限</span>
        <span>控制页面内操作按钮的显示</span>
      </div>
    </div>

    <!-- 按钮权限树 -->
    <ElTree
      ref="treeRef"
      v-model:checked-keys="checks"
      v-loading="loading || checksLoading"
      :data="tree"
      node-key="id"
      show-checkbox
      :default-expand-all="true"
      :default-checked-keys="checks"
      class="mt-12px h-320px overflow-y-auto"
    >
      <template #default="{ data }">
        <div class="w-full flex items-center justify-between pr-8px">
          <div class="flex items-center gap-8px">
            <!-- 菜单节点 -->
            <span v-if="!data.buttons" class="font-medium">{{ data.title || data.name }}</span>
            <!-- 按钮节点 -->
            <template v-else>
              <span class="text-gray-600">{{ data.title }}</span>
              <ElTag size="small" type="info">{{ data.name }}</ElTag>
            </template>
          </div>
        </div>
      </template>
    </ElTree>
  </div>
</template>

<style scoped>
.button-auth-tab {
  min-height: 400px;
}
:deep(.el-tree-node__content) {
  height: 36px;
}
</style>
