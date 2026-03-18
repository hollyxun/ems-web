<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchCreateDepartment, fetchGetDepartmentTree, fetchUpdateDepartment } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'DepartmentOperateModal' });

export type OperateType = UI.TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit department data or the parent department data when adding a child department */
  rowData?: Api.SystemManage.Department | null;
}

const props = withDefaults(defineProps<Props>(), {});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: '新增部门',
    addChild: '新增子部门',
    edit: '编辑部门'
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  parentId: number;
  name: string;
  leaderId: number;
  phone: string;
  email: string;
  sort: number;
  status: number;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    parentId: 0,
    name: '',
    leaderId: 0,
    phone: '',
    email: '',
    sort: 0,
    status: 1
  };
}

const rules = {
  name: defaultRequiredRule
};

const loading = ref(false);

// 部门树数据（用于选择父部门）
const departmentTreeData = ref<Api.SystemManage.Department[]>([]);
const departmentTreeLoading = ref(false);

async function loadDepartmentTree() {
  departmentTreeLoading.value = true;
  try {
    const response = await fetchGetDepartmentTree();
    departmentTreeData.value = response.data || [];
  } catch (error) {
    console.error('加载部门树失败:', error);
  } finally {
    departmentTreeLoading.value = false;
  }
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (!props.rowData) return;

  if (props.operateType === 'addChild') {
    const { id } = props.rowData;
    Object.assign(model.value, { parentId: id });
  }

  if (props.operateType === 'edit') {
    const row = props.rowData;
    model.value = {
      id: row.id,
      parentId: row.parentId || 0,
      name: row.name,
      leaderId: row.leaderId || 0,
      phone: row.phone || '',
      email: row.email || '',
      sort: row.sort || 0,
      status: row.status || 1
    };
  }
}

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  loading.value = true;
  try {
    const submitData = {
      parentId: model.value.parentId,
      name: model.value.name,
      leaderId: model.value.leaderId || 0,
      phone: model.value.phone || '',
      email: model.value.email || '',
      sort: model.value.sort,
      status: model.value.status
    };

    if (props.operateType === 'edit') {
      const { error } = await fetchUpdateDepartment({
        id: model.value.id!,
        ...submitData
      });
      if (!error) {
        window.$message?.success($t('common.updateSuccess'));
        closeModal();
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateDepartment(submitData);
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeModal();
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
    loadDepartmentTree();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-600px">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
      <ElFormItem label="上级部门" prop="parentId">
        <ElTreeSelect
          v-model="model.parentId"
          :data="departmentTreeData"
          :props="{ label: 'name', value: 'id', children: 'children' } as any"
          check-strictly
          clearable
          placeholder="请选择上级部门（不选则为顶级部门）"
          class="w-full"
          :loading="departmentTreeLoading"
        />
      </ElFormItem>
      <ElFormItem label="部门名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入部门名称" />
      </ElFormItem>
      <ElFormItem label="联系电话" prop="phone">
        <ElInput v-model="model.phone" placeholder="请输入联系电话" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="email">
        <ElInput v-model="model.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="model.sort" :min="0" class="w-full" placeholder="请输入排序" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
