<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { ElTag } from 'element-plus';
import {
  fetchGetAllPages,
  fetchGetMenuTree,
  fetchGetRoleMenus,
  fetchGetRolePermissionSources,
  fetchSetRoleMenus
} from '@/service/api';
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

const home = shallowRef('');

async function getHome() {
  // 获取角色信息以获取默认首页
  // 暂时使用默认值
  home.value = 'home';
}

const pages = shallowRef<string[]>([]);

async function getPages() {
  const { data } = await fetchGetAllPages();
  pages.value = data || [];
}

const pageSelectOptions = computed(() => {
  const opts: CommonType.Option[] = pages.value.map(page => ({
    label: page,
    value: page
  }));

  return opts;
});

const tree = shallowRef<Api.SystemManage.MenuTree[]>([]);
const loading = shallowRef(false);

async function getTree() {
  loading.value = true;
  try {
    const { data } = await fetchGetMenuTree();
    tree.value = data || [];
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
    // 获取角色的菜单权限
    const { data: menuIds } = await fetchGetRoleMenus(props.roleId);
    // 获取权限来源信息
    const { data: sources } = await fetchGetRolePermissionSources(props.roleId, 'menu');

    // 初始化权限项
    permissionItems.value = [];
    checks.value = menuIds || [];
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

// 获取菜单的权限信息
function getMenuPermissionInfo(menuId: number): PermissionItem | undefined {
  return permissionItems.value.find(item => item.id === menuId);
}

const submitting = shallowRef(false);

async function handleSubmit() {
  if (!props.roleId) return;

  submitting.value = true;
  try {
    // 分离allow和deny的菜单ID
    const allowMenuIds: number[] = [];
    const denyMenuIds: number[] = [];

    checks.value.forEach(id => {
      if (denyItems.value.has(id)) {
        denyMenuIds.push(id);
      } else {
        allowMenuIds.push(id);
      }
    });

    // 先设置允许的权限
    if (allowMenuIds.length > 0) {
      const { error } = await fetchSetRoleMenus({
        roleId: props.roleId,
        menuIds: allowMenuIds,
        home: home.value,
        effect: 'allow'
      });
      if (error) throw error;
    }

    // 再设置拒绝的权限
    if (denyMenuIds.length > 0) {
      const { error } = await fetchSetRoleMenus({
        roleId: props.roleId,
        menuIds: denyMenuIds,
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
  getHome();
  getPages();
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
  <ElDialog v-model="visible" :title="title" preset="card" class="w-560px">
    <div class="flex-y-center gap-16px pb-12px">
      <div>{{ $t('page.manage.menu.home') }}</div>
      <ElSelect v-model="home" size="small" class="w-160px">
        <ElOption v-for="{ value, label } in pageSelectOptions" :key="value" :value="value" :label="label" />
      </ElSelect>
    </div>

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
        <span>{{ data.label }}</span>
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
