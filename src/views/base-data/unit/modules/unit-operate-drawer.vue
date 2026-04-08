<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreateUnit, fetchUpdateUnit } from '@/service/api/energy';
import { $t } from '@/locales';

defineOptions({ name: 'UnitOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.UnitView | null;
  mediums: Api.Energy.Medium[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();
const formData = ref<Api.Energy.Unit>({
  id: 0,
  mediumId: 0,
  mediumCode: '',
  unitCode: '',
  unitName: '',
  isStandard: false,
  conversionFactor: 1,
  status: 1,
  remark: ''
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增介质单位' : '编辑介质单位';
});

const rules = {
  mediumId: [{ required: true, message: '请选择所属介质', trigger: 'change' }],
  unitCode: [{ required: true, message: '请输入单位编码', trigger: 'blur' }],
  unitName: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
  conversionFactor: [{ required: true, message: '请输入换算系数', trigger: 'blur' }]
};

function resetForm() {
  formData.value = {
    id: 0,
    mediumId: 0,
    mediumCode: '',
    unitCode: '',
    unitName: '',
    isStandard: false,
    conversionFactor: 1,
    status: 1,
    remark: ''
  };
}

async function handleSubmit() {
  await formRef.value?.validate();

  const isEdit = props.operateType === 'edit';
  const { error } = isEdit ? await fetchUpdateUnit(formData.value) : await fetchCreateUnit(formData.value);

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
      <ElFormItem label="所属介质" prop="mediumId">
        <ElSelect
          v-model="formData.mediumId"
          placeholder="请选择所属介质"
          style="width: 100%"
          :disabled="operateType === 'edit'"
        >
          <ElOption v-for="item in mediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="单位编码" prop="unitCode">
        <ElInput v-model="formData.unitCode" placeholder="请输入单位编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="单位名称" prop="unitName">
        <ElInput v-model="formData.unitName" placeholder="请输入单位名称" />
      </ElFormItem>
      <ElFormItem label="换算系数" prop="conversionFactor">
        <ElInputNumber v-model="formData.conversionFactor" :min="0.000001" :precision="6" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="标准单位">
        <ElRadioGroup v-model="formData.isStandard">
          <ElRadio :value="true">是</ElRadio>
          <ElRadio :value="false">否</ElRadio>
        </ElRadioGroup>
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
