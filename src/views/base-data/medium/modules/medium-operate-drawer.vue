<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreateMedium, fetchUpdateMedium } from '@/service/api/energy';
import { $t } from '@/locales';

defineOptions({ name: 'MediumOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.Medium | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();
const formData = ref<Api.Energy.Medium>({
  id: 0,
  mediumCode: '',
  mediumName: '',
  mediumType: 1,
  parentCode: '',
  status: 1,
  remark: ''
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增能源介质' : '编辑能源介质';
});

const mediumTypeOptions = [
  { label: '一次能源', value: 1 },
  { label: '二次能源', value: 2 },
  { label: '耗能工质', value: 3 }
];

const rules = {
  mediumCode: [{ required: true, message: '请输入介质编码', trigger: 'blur' }],
  mediumName: [{ required: true, message: '请输入介质名称', trigger: 'blur' }],
  mediumType: [{ required: true, message: '请选择介质类型', trigger: 'change' }]
};

function resetForm() {
  formData.value = {
    id: 0,
    mediumCode: '',
    mediumName: '',
    mediumType: 1,
    parentCode: '',
    status: 1,
    remark: ''
  };
}

async function handleSubmit() {
  await formRef.value?.validate();

  const isEdit = props.operateType === 'edit';
  const { error } = isEdit ? await fetchUpdateMedium(formData.value) : await fetchCreateMedium(formData.value);

  if (!error) {
    ElMessage.success(isEdit ? '编辑成功' : '新增成功');
    visible.value = false;
    emit('submitted');
  }
}

watch(visible, val => {
  if (val) {
    if (props.operateType === 'edit' && props.rowData) {
      formData.value = { ...props.rowData };
    } else {
      resetForm();
    }
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="介质编码" prop="mediumCode">
        <ElInput v-model="formData.mediumCode" placeholder="请输入介质编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="介质名称" prop="mediumName">
        <ElInput v-model="formData.mediumName" placeholder="请输入介质名称" />
      </ElFormItem>
      <ElFormItem label="介质类型" prop="mediumType">
        <ElSelect v-model="formData.mediumType" placeholder="请选择介质类型" style="width: 100%">
          <ElOption v-for="item in mediumTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="上级介质">
        <ElInput v-model="formData.parentCode" placeholder="请输入上级介质编码（可选）" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>
