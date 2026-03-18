<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { enableStatusOptions } from '@/constants/business';
import {
  fetchCreateUser,
  fetchGetAllRoles,
  fetchGetDepartmentTree,
  fetchGetUserById,
  fetchGetUserRoles,
  fetchSetUserRoles,
  fetchUpdateUser
} from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'UserOperateDrawer' });

interface Props {
  /** the type of operation */
  operateType: UI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
  /** all roles for selection */
  allRoles?: Api.SystemManage.Role[];
}

const props = withDefaults(defineProps<Props>(), {
  allRoles: () => []
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule, formRules } = useFormRules();

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  username: string;
  password?: string;
  nickName: string;
  phone: string;
  email: string;
  enabled: number;
  departmentId: number;
  roleIds: number[];
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    username: '',
    password: '',
    nickName: '',
    phone: '',
    email: '',
    enabled: 1,
    departmentId: 0,
    roleIds: []
  };
}

const rules = computed(() => ({
  username: defaultRequiredRule,
  nickName: defaultRequiredRule,
  enabled: defaultRequiredRule,
  password: props.operateType === 'add' ? defaultRequiredRule : undefined
}));

const loading = ref(false);

/** all departments for selection */
const allDepartments = ref<Api.SystemManage.Department[]>([]);

async function getDepartmentTree() {
  const { data } = await fetchGetDepartmentTree();
  allDepartments.value = data || [];
}

async function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = props.rowData;
    model.value = {
      id: rowData.id,
      username: rowData.username || '',
      nickName: rowData.nickName,
      phone: rowData.phone || '',
      email: rowData.email || '',
      enabled: rowData.enabled ?? 1,
      departmentId: rowData.departmentId || 0,
      roleIds: []
    };

    // 获取用户已有的角色
    try {
      const { data: userRoles } = await fetchGetUserRoles(rowData.id);
      model.value.roleIds = (userRoles || []).map((role: Api.SystemManage.Role) => role.authorityId);
    } catch (error) {
      console.error('获取用户角色失败:', error);
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  loading.value = true;
  try {
    if (props.operateType === 'add') {
      const { error, data: userId } = await fetchCreateUser({
        username: model.value.username,
        password: model.value.password,
        nickName: model.value.nickName,
        phone: model.value.phone,
        email: model.value.email,
        enabled: model.value.enabled,
        departmentId: model.value.departmentId
      });
      if (!error) {
        // 设置用户角色
        if (model.value.roleIds.length > 0 && userId) {
          await fetchSetUserRoles({ userId: userId as unknown as number, roleIds: model.value.roleIds });
        }
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
        emit('submitted');
      }
    } else {
      const { error } = await fetchUpdateUser({
        id: model.value.id,
        username: model.value.username,
        nickName: model.value.nickName,
        phone: model.value.phone,
        email: model.value.email,
        enabled: model.value.enabled,
        departmentId: model.value.departmentId
      });
      if (!error) {
        // 更新用户角色
        if (model.value.id) {
          await fetchSetUserRoles({ userId: model.value.id, roleIds: model.value.roleIds });
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

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getDepartmentTree();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="400">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem :label="$t('page.manage.user.userName')" prop="username">
        <ElInput
          v-model="model.username"
          :placeholder="$t('page.manage.user.form.userName')"
          :disabled="operateType === 'edit'"
        />
      </ElFormItem>
      <ElFormItem v-if="operateType === 'add'" label="密码" prop="password">
        <ElInput v-model="model.password" type="password" placeholder="请输入密码" show-password />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.nickName')" prop="nickName">
        <ElInput v-model="model.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userPhone')" prop="phone">
        <ElInput v-model="model.phone" :placeholder="$t('page.manage.user.form.userPhone')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userEmail')" prop="email">
        <ElInput v-model="model.email" :placeholder="$t('page.manage.user.form.userEmail')" />
      </ElFormItem>
      <ElFormItem label="所属部门" prop="departmentId">
        <ElTreeSelect
          v-model="model.departmentId"
          :data="allDepartments"
          :props="{ label: 'name', value: 'id', children: 'children' } as any"
          check-strictly
          clearable
          placeholder="请选择所属部门"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="角色" prop="roleIds">
        <ElSelect
          v-model="model.roleIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择角色（可多选）"
          class="w-full"
        >
          <ElOption
            v-for="role in allRoles"
            :key="role.authorityId"
            :label="role.authorityName || role.roleName"
            :value="role.authorityId"
            :disabled="role.status === 2"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userStatus')" prop="enabled">
        <ElRadioGroup v-model="model.enabled">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
