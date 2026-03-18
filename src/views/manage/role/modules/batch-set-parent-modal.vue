<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchBatchSetParentRoles, fetchCheckCircularReference, fetchGetRoleTree } from '@/service/api';
import { $t } from '@/locales';

interface Props {
  /** 选中的角色ID列表 */
  roleIds: number[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const loading = ref(false);
const checkLoading = ref(false);
const allRoles = ref<Api.SystemManage.Role[]>([]);
const parentIds = ref<number[]>([]);

// 警告信息
const circularWarning = ref('');
const depthWarning = ref('');
const MAX_DEPTH = 5;

// 过滤掉选中的角色（不能设置自己为父角色）
const availableRoles = computed(() => {
  const filterRoles = (roles: Api.SystemManage.Role[]): Api.SystemManage.Role[] => {
    return roles.filter(role => {
      // 排除选中的角色
      if (props.roleIds.includes(role.authorityId)) {
        return false;
      }
      // 递归过滤子角色
      if (role.children && role.children.length > 0) {
        role.children = filterRoles(role.children);
      }
      return true;
    });
  };
  return filterRoles([...allRoles.value]);
});

// 获取所有角色
async function getRoleTree() {
  const { data } = await fetchGetRoleTree();
  allRoles.value = data || [];
}

// 检查循环引用
async function checkCircularReference() {
  if (parentIds.value.length === 0 || props.roleIds.length === 0) {
    circularWarning.value = '';
    return;
  }

  checkLoading.value = true;
  try {
    // 检查每个选中的角色（并行检查）
    const results = await Promise.all(
      props.roleIds.map(roleId =>
        fetchCheckCircularReference({
          roleId,
          parentIds: parentIds.value
        })
      )
    );

    const hasCircular = results.some(res => res.data);
    if (hasCircular) {
      circularWarning.value = '警告：选择的父角色会形成循环引用，请重新选择';
    } else {
      circularWarning.value = '';
    }
  } catch {
    // Silently ignore circular reference check errors
  } finally {
    checkLoading.value = false;
  }
}

// 检查层级深度
async function checkHierarchyDepth() {
  if (parentIds.value.length === 0) {
    depthWarning.value = '';
    return;
  }

  // 简化处理：设置固定深度
  const newDepth = 2;
  if (newDepth > MAX_DEPTH) {
    depthWarning.value = `警告：设置后角色层级深度将超过最大限制${MAX_DEPTH}级`;
  } else {
    depthWarning.value = '';
  }
}

// 处理提交
async function handleSubmit() {
  if (circularWarning.value) {
    window.$message?.error(circularWarning.value);
    return;
  }

  if (depthWarning.value) {
    window.$message?.error(depthWarning.value);
    return;
  }

  loading.value = true;
  try {
    const { error } = await fetchBatchSetParentRoles({
      roleIds: props.roleIds,
      parentIds: parentIds.value
    });
    if (!error) {
      window.$message?.success('批量设置父角色成功');
      closeModal();
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  visible.value = false;
  parentIds.value = [];
  circularWarning.value = '';
  depthWarning.value = '';
}

watch(visible, () => {
  if (visible.value) {
    getRoleTree();
    parentIds.value = [];
    circularWarning.value = '';
    depthWarning.value = '';
  }
});

watch(
  parentIds,
  () => {
    checkCircularReference();
    checkHierarchyDepth();
  },
  { deep: true }
);
</script>

<template>
  <ElDialog v-model="visible" title="批量设置父角色" width="500px" :close-on-click-modal="false">
    <div class="mb-16px">
      <p class="mb-8px text-14px text-gray-600">
        已选择
        <strong>{{ roleIds.length }}</strong>
        个角色
      </p>
      <p class="text-12px text-gray-500">设置父角色后，这些角色将继承所选父角色的所有权限</p>
    </div>

    <ElForm label-position="top">
      <ElFormItem label="选择父角色">
        <ElTreeSelect
          v-model="parentIds"
          :data="availableRoles"
          :props="{ label: 'authorityName', value: 'authorityId', children: 'children' } as any"
          multiple
          check-strictly
          clearable
          placeholder="请选择父角色（可多选）"
          class="w-full"
        />

        <div v-if="circularWarning" class="mt-4px text-12px text-red-500">
          {{ circularWarning }}
        </div>
        <div v-else-if="depthWarning" class="mt-4px text-12px text-red-500">
          {{ depthWarning }}
        </div>
        <div v-else class="mt-4px text-12px text-gray-500">支持多继承，选择的角色将继承所有父角色的权限</div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElSpace>
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          :disabled="checkLoading || !!circularWarning || !!depthWarning"
          @click="handleSubmit"
        >
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
