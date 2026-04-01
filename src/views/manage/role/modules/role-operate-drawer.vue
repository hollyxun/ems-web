<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import {
  fetchCheckCircularReference,
  fetchCreateRole,
  fetchGetDepartmentTree,
  fetchGetRoleDepartments,
  fetchGetRoleDetail,
  fetchGetRoleHierarchyDepth,
  fetchGetRoleTree,
  fetchSetRoleDepartments,
  fetchUpdateRole
} from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import MenuAuthModal from './menu-auth-modal.vue';
import ButtonAuthModal from './button-auth-modal.vue';

defineOptions({ name: 'RoleOperateDrawer' });

interface Props {
  /** the type of operation */
  operateType: UI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();
const { bool: menuAuthVisible, setTrue: openMenuAuthModal } = useBoolean();
const { bool: buttonAuthVisible, setTrue: openButtonAuthModal } = useBoolean();

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  authorityId: number;
  parentIds: number[];
  authorityName: string;
  defaultRouter: string;
  dataScope: string;
  status: number;
  customDepartmentIds: number[];
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    authorityId: 0,
    parentIds: [],
    authorityName: '',
    defaultRouter: '',
    dataScope: '1',
    status: 1,
    customDepartmentIds: []
  };
}

const rules = {
  authorityName: defaultRequiredRule,
  authorityId: defaultRequiredRule
};

const roleId = computed(() => props.rowData?.id || -1);

const isEdit = computed(() => props.operateType === 'edit');

const loading = ref(false);
const checkLoading = ref(false);

/** all roles for parent selection */
const allRoles = ref<Api.SystemManage.Role[]>([]);

/** all departments for custom data permission */
const allDepartments = ref<Api.SystemManage.Department[]>([]);

/** show custom department selection when dataScope is '2' (自定义数据) */
const showCustomDepartment = computed(() => model.value.dataScope === '2');

/** circular reference warning */
const circularWarning = ref('');

/** hierarchy depth warning */
const depthWarning = ref('');

/** max hierarchy depth */
const MAX_DEPTH = 5;

async function getRoleTree() {
  const { data } = await fetchGetRoleTree();
  allRoles.value = data || [];
}

async function getDepartmentTree() {
  const { data } = await fetchGetDepartmentTree();
  allDepartments.value = data || [];
}

async function getRoleDepartments() {
  if (!props.rowData?.id) return;
  try {
    const { data: departmentIds } = await fetchGetRoleDepartments(props.rowData.id);
    model.value.customDepartmentIds = departmentIds || [];
  } catch {
    // Silently ignore role department fetch errors
  }
}

async function getRoleDetail() {
  if (!props.rowData?.id) return;
  try {
    const { data } = await fetchGetRoleDetail(props.rowData.id);
    if (data) {
      model.value.parentIds = data.parentIds || [];
    }
  } catch {
    // Silently ignore role detail fetch errors
  }
}

async function checkCircularReference() {
  if (!isEdit.value || model.value.parentIds.length === 0) {
    circularWarning.value = '';
    return;
  }

  checkLoading.value = true;
  try {
    const { data: hasCircular } = await fetchCheckCircularReference({
      roleId: props.rowData!.id,
      parentIds: model.value.parentIds
    });
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

async function checkHierarchyDepth() {
  if (model.value.parentIds.length === 0) {
    depthWarning.value = '';
    return;
  }

  // Calculate max parent depth + 1 (parallel fetch)
  try {
    const depthResults = await Promise.all(model.value.parentIds.map(parentId => fetchGetRoleHierarchyDepth(parentId)));

    let maxParentDepth = 0;
    for (const { data: depth } of depthResults) {
      if (depth && depth > maxParentDepth) {
        maxParentDepth = depth;
      }
    }

    const newDepth = maxParentDepth + 1;
    if (newDepth > MAX_DEPTH) {
      depthWarning.value = `警告：设置后角色层级深度为${newDepth}，超过最大限制${MAX_DEPTH}级`;
    } else {
      depthWarning.value = `当前角色层级深度：${newDepth}级`;
    }
  } catch {
    // Silently ignore hierarchy depth check errors
  }
}

function handleInitModel() {
  model.value = createDefaultModel();
  circularWarning.value = '';
  depthWarning.value = '';

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = props.rowData;
    model.value = {
      id: rowData.id,
      authorityId: rowData.authorityId,
      parentIds: rowData.parentIds || [],
      authorityName: rowData.authorityName || rowData.roleName || '',
      defaultRouter: rowData.defaultRouter || '',
      dataScope: rowData.dataScope || '1',
      status: rowData.status || 1,
      customDepartmentIds: []
    };
    // Load role detail with parentIds
    getRoleDetail();
    // Load role custom department permissions
    getRoleDepartments();
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (circularWarning.value) {
    window.$message?.error(circularWarning.value);
    return;
  }

  if (depthWarning.value && depthWarning.value.includes('超过最大限制')) {
    window.$message?.error(depthWarning.value);
    return;
  }

  loading.value = true;
  try {
    if (props.operateType === 'add') {
      const { error, data: newRoleId } = await fetchCreateRole({
        parentIds: model.value.parentIds,
        authorityName: model.value.authorityName,
        authorityId: model.value.authorityId,
        defaultRouter: model.value.defaultRouter,
        dataScope: model.value.dataScope,
        status: model.value.status
      });
      if (!error) {
        // If custom data scope is selected, set department permissions
        if (model.value.dataScope === '2' && model.value.customDepartmentIds.length > 0 && newRoleId) {
          await fetchSetRoleDepartments({
            roleId: newRoleId as number,
            departmentIds: model.value.customDepartmentIds
          });
        }
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
        emit('submitted');
      }
    } else {
      const { error } = await fetchUpdateRole({
        authorityId: model.value.authorityId!,
        authorityName: model.value.authorityName,
        parentIds: model.value.parentIds,
        defaultRouter: model.value.defaultRouter,
        dataScope: model.value.dataScope,
        status: model.value.status
      });
      if (!error) {
        // Update role custom department permissions
        if (model.value.dataScope === '2' && model.value.id) {
          await fetchSetRoleDepartments({
            roleId: model.value.id,
            departmentIds: model.value.customDepartmentIds
          });
        }
        window.$message?.success($t('common.updateSuccess'));
        closeDrawer();
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}

// Watch parentIds changes to check circular reference and depth
watch(
  () => model.value.parentIds,
  () => {
    if (isEdit.value) {
      checkCircularReference();
    }
    checkHierarchyDepth();
  },
  { deep: true }
);

// Data scope options
const dataScopeOptions = [
  { label: '全部数据', value: '1' },
  { label: '自定义数据', value: '2' },
  { label: '本部门数据', value: '3' },
  { label: '本部门及以下数据', value: '4' },
  { label: '仅本人数据', value: '5' }
];

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getRoleTree();
    getDepartmentTree();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="400">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem :label="$t('page.manage.role.roleName')" prop="authorityName">
        <ElInput v-model="model.authorityName" :placeholder="$t('page.manage.role.form.roleName')" />
      </ElFormItem>
      <ElFormItem v-if="!isEdit" label="角色ID" prop="authorityId">
        <ElInputNumber v-model="model.authorityId" :min="1" placeholder="请输入角色ID" class="w-full" />
      </ElFormItem>
      <ElFormItem label="父级角色" prop="parentIds">
        <ElTreeSelect
          v-model="model.parentIds"
          :data="allRoles"
          :props="{ label: 'authorityName', value: 'authorityId', children: 'children' } as any"
          multiple
          check-strictly
          clearable
          placeholder="请选择父级角色（可多选）"
          class="w-full"
        />
        <div v-if="circularWarning" class="mt-4px text-12px text-red-500">
          {{ circularWarning }}
        </div>
        <div v-else-if="depthWarning" class="mt-4px text-12px text-gray-500">
          {{ depthWarning }}
        </div>
        <div v-else class="mt-4px text-12px text-gray-500">支持多继承，子角色将继承所有父角色的权限</div>
      </ElFormItem>
      <ElFormItem v-if="isEdit" label="默认路由" prop="defaultRouter">
        <ElInput v-model="model.defaultRouter" placeholder="请输入默认路由" />
      </ElFormItem>
      <ElFormItem label="数据权限" prop="dataScope">
        <ElSelect v-model="model.dataScope" placeholder="请选择数据权限" class="w-full">
          <ElOption
            v-for="option in dataScopeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
        <div class="mt-4px text-12px text-gray-500">控制角色可查看的数据范围</div>
      </ElFormItem>
      <ElFormItem v-if="showCustomDepartment" label="自定义部门权限" prop="customDepartmentIds">
        <ElTreeSelect
          v-model="model.customDepartmentIds"
          :data="allDepartments"
          :props="{ label: 'name', value: 'id', children: 'children' } as any"
          multiple
          check-strictly
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择可访问的部门"
          class="w-full"
        />
        <div class="mt-4px text-12px text-gray-500">选择该角色可以访问的部门数据</div>
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <ElSpace v-if="isEdit">
      <ElButton @click="openMenuAuthModal">{{ $t('page.manage.role.menuAuth') }}</ElButton>
      <MenuAuthModal v-model:visible="menuAuthVisible" :role-id="roleId" />
      <ElButton @click="openButtonAuthModal">{{ $t('page.manage.role.buttonAuth') }}</ElButton>
      <ButtonAuthModal v-model:visible="buttonAuthVisible" :role-id="roleId" />
    </ElSpace>
    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" :disabled="checkLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
