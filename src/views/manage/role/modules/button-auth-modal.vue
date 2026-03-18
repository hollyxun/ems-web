<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { ElButton, ElTag } from 'element-plus';
import {
  fetchGetMenuButtons,
  fetchGetRoleButtons,
  fetchGetRolePermissionSources,
  fetchSetRoleButtons
} from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'ButtonAuthModal' });

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

const title = computed(() => $t('common.edit') + $t('page.manage.role.buttonAuth'));

interface ButtonConfig {
  id: number;
  label: string;
  name: string;
  parentId: string;
  title: string;
}

const tree = shallowRef<ButtonConfig[]>([]);
const loading = shallowRef(false);

async function getAllButtons() {
  loading.value = true;
  try {
    const { data } = await fetchGetMenuButtons();
    // 将按钮列表转换为树形数据格式
    tree.value = (data || []).map(btn => ({
      id: btn.id,
      label: btn.title,
      name: btn.name,
      parentId: btn.parentId,
      title: btn.title
    }));
  } finally {
    loading.value = false;
  }
}

// 权限项类型：包含ID、效果和来源信息
interface PermissionItem {
  id: number;
  effect: 'allow' | 'deny';
  sourceType: 'self' | 'inherited';
  sourceRoleName?: string;
}

const permissionItems = ref<PermissionItem[]>([]);
const checks = shallowRef<number[]>([]);
const denyItems = ref<Set<number>>(new Set());
const checksLoading = shallowRef(false);

async function getChecks() {
  if (!props.roleId) return;

  checksLoading.value = true;
  try {
    // 获取角色的按钮权限
    const { data: buttonIds } = await fetchGetRoleButtons(props.roleId);
    // 获取权限来源信息
    const { data: sources } = await fetchGetRolePermissionSources(props.roleId, 'button');

    // 初始化权限项
    permissionItems.value = [];
    checks.value = buttonIds || [];
    denyItems.value = new Set();

    if (sources) {
      permissionItems.value = sources;
      // 找出deny的项
      sources.forEach(source => {
        if (source.effect === 'deny') {
          denyItems.value.add(source.id);
        }
      });
    }
  } finally {
    checksLoading.value = false;
  }
}

// 获取按钮的权限信息
function getButtonPermissionInfo(buttonId: number): PermissionItem | undefined {
  return permissionItems.value.find(item => item.id === buttonId);
}

// 切换权限效果
function toggleEffect(buttonId: number) {
  if (denyItems.value.has(buttonId)) {
    denyItems.value.delete(buttonId);
  } else {
    denyItems.value.add(buttonId);
  }
}

const submitting = shallowRef(false);

async function handleSubmit() {
  if (!props.roleId) return;

  submitting.value = true;
  try {
    // 分离allow和deny的按钮ID
    const allowButtonIds: number[] = [];
    const denyButtonIds: number[] = [];

    checks.value.forEach(id => {
      if (denyItems.value.has(id)) {
        denyButtonIds.push(id);
      } else {
        allowButtonIds.push(id);
      }
    });

    // 先设置允许的权限
    if (allowButtonIds.length > 0) {
      const { error } = await fetchSetRoleButtons({
        roleId: props.roleId,
        buttonIds: allowButtonIds,
        effect: 'allow'
      });
      if (error) throw error;
    }

    // 再设置拒绝的权限
    if (denyButtonIds.length > 0) {
      const { error } = await fetchSetRoleButtons({
        roleId: props.roleId,
        buttonIds: denyButtonIds,
        effect: 'deny'
      });
      if (error) throw error;
    }

    window.$message?.success?.($t('common.modifySuccess'));
    closeModal();
  } finally {
    submitting.value = false;
  }
}

function init() {
  getAllButtons();
  getChecks();
}

watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-560px">
    <!-- 图例说明 -->
    <div class="flex items-center gap-16px border-b border-gray-200 pb-12px text-12px text-gray-500">
      <div class="flex items-center gap-4px">
        <span class="rounded bg-green-100 px-8px py-2px text-green-600">允许</span>
        <span>正常访问</span>
      </div>
      <div class="flex items-center gap-4px">
        <span class="rounded bg-red-100 px-8px py-2px text-red-600">拒绝</span>
        <span>显式拒绝(优先级最高)</span>
      </div>
      <div class="flex items-center gap-4px">
        <ElTag size="small" type="info">继承</ElTag>
        <span>从父角色继承</span>
      </div>
    </div>

    <ElTree
      v-model:checked-keys="checks"
      v-loading="loading || checksLoading"
      :data="tree"
      node-key="id"
      show-checkbox
      class="mt-12px h-280px overflow-y-auto"
      :default-checked-keys="checks"
    >
      <template #default="{ data }">
        <div class="w-full flex items-center justify-between pr-16px">
          <div class="flex items-center gap-8px">
            <span>{{ data.label }}</span>
            <span class="text-xs text-gray-400">[{{ data.name }}]</span>
          </div>
          <div class="flex items-center gap-8px">
            <!-- 继承来源标签 -->
            <template v-if="getButtonPermissionInfo(data.id)">
              <ElTag v-if="getButtonPermissionInfo(data.id)?.sourceType === 'inherited'" size="small" type="info">
                继承: {{ getButtonPermissionInfo(data.id)?.sourceRoleName || '父角色' }}
              </ElTag>
              <!-- 允许/拒绝切换按钮 -->
              <ElButton
                v-if="checks.includes(data.id)"
                :type="denyItems.has(data.id) ? 'danger' : 'success'"
                size="small"
                text
                @click.stop="toggleEffect(data.id)"
              >
                {{ denyItems.has(data.id) ? '拒绝' : '允许' }}
              </ElButton>
            </template>
          </div>
        </div>
      </template>
    </ElTree>
    <template #footer>
      <ElSpace class="w-full justify-end">
        <ElButton size="small" class="mt-16px" @click="closeModal">{{ $t('common.cancel') }}</ElButton>
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
