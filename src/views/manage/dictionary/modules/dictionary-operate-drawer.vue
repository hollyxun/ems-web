<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchCreateDictionary, fetchUpdateDictionary } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'DictionaryOperateDrawer' });

interface Props {
  /** the type of operation */
  operateType: UI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Dictionary | null;
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
    add: '新增字典',
    edit: '编辑字典'
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  name: string;
  type: string;
  status: number;
  description: string;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    name: '',
    type: '',
    status: 1,
    description: ''
  };
}

const rules = {
  name: defaultRequiredRule,
  type: defaultRequiredRule
};

const loading = ref(false);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = props.rowData;
    model.value = {
      id: rowData.id,
      name: rowData.name,
      type: rowData.type,
      status: rowData.status,
      description: rowData.description || ''
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
      const { error } = await fetchCreateDictionary({
        name: model.value.name,
        type: model.value.type,
        status: model.value.status,
        description: model.value.description
      });
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
        emit('submitted');
      }
    } else {
      const { error } = await fetchUpdateDictionary({
        id: model.value.id!,
        name: model.value.name,
        type: model.value.type,
        status: model.value.status,
        description: model.value.description
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
      <ElFormItem label="字典名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="type">
        <ElInput v-model="model.type" placeholder="请输入字典类型，如 gender" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput v-model="model.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
