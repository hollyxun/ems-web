<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchCreateApi, fetchUpdateApi } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'ApiOperateDrawer' });

interface Props {
  /** the type of operation */
  operateType: UI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.ApiItem | null;
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

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: '新增API',
    edit: '编辑API'
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  path: string;
  description: string;
  apiGroup: string;
  method: string;
  status: number;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    path: '',
    description: '',
    apiGroup: '',
    method: 'GET',
    status: 1
  };
}

const rules = {
  path: defaultRequiredRule,
  apiGroup: defaultRequiredRule,
  method: defaultRequiredRule
};

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
];

const loading = ref(false);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = props.rowData;
    model.value = {
      id: rowData.id,
      path: rowData.path,
      description: rowData.description,
      apiGroup: rowData.apiGroup,
      method: rowData.method,
      status: rowData.status || 1
    };
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
      const { error } = await fetchCreateApi({
        path: model.value.path,
        description: model.value.description,
        apiGroup: model.value.apiGroup,
        method: model.value.method,
        status: model.value.status
      });
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
        emit('submitted');
      }
    } else {
      const { error } = await fetchUpdateApi({
        id: model.value.id!,
        path: model.value.path,
        description: model.value.description,
        apiGroup: model.value.apiGroup,
        method: model.value.method,
        status: model.value.status
      });
      if (!error) {
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
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="400">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem label="API路径" prop="path">
        <ElInput v-model="model.path" placeholder="请输入API路径，如 /api/v1/user/list" />
      </ElFormItem>
      <ElFormItem label="API分组" prop="apiGroup">
        <ElInput v-model="model.apiGroup" placeholder="请输入API分组，如 user" />
      </ElFormItem>
      <ElFormItem label="请求方法" prop="method">
        <ElSelect v-model="model.method" placeholder="请选择请求方法" class="w-full">
          <ElOption v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="API描述" prop="description">
        <ElInput v-model="model.description" type="textarea" :rows="3" placeholder="请输入API描述" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
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
