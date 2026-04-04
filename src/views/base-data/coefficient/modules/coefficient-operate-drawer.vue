<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { fetchCreateCoefficient, fetchUpdateCoefficient } from '@/service/api/energy';
import { $t } from '@/locales';

defineOptions({ name: 'CoefficientOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.CoefficientView | null;
  mediums: Api.Energy.Medium[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();
const formData = ref<Api.Energy.Coefficient>({
  id: 0,
  mediumId: 0,
  mediumCode: '',
  coefficientType: 1,
  coefficientPurpose: '国家核算标准',
  coefficientValue: 0,
  unit: '',
  effectiveDate: dayjs().format('YYYY-MM-DD'),
  expiryDate: undefined,
  versionDesc: '',
  status: 1,
  remark: ''
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增系数折算' : '编辑系数折算';
});

const coefficientTypeOptions = [
  { label: '折标煤系数', value: 1 },
  { label: '碳排放系数', value: 2 }
];

const rules = {
  mediumId: [{ required: true, message: '请选择所属介质', trigger: 'change' }],
  coefficientType: [{ required: true, message: '请选择系数类型', trigger: 'change' }],
  coefficientValue: [{ required: true, message: '请输入系数值', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
};

function resetForm() {
  formData.value = {
    id: 0,
    mediumId: 0,
    mediumCode: '',
    coefficientType: 1,
    coefficientPurpose: '国家核算标准',
    coefficientValue: 0,
    unit: '',
    effectiveDate: dayjs().format('YYYY-MM-DD'),
    expiryDate: undefined,
    versionDesc: '',
    status: 1,
    remark: ''
  };
}

function handleMediumChange(mediumId: number) {
  const medium = props.mediums.find(m => m.id === mediumId);
  if (medium) {
    formData.value.mediumCode = medium.mediumCode;
  }
}

async function handleSubmit() {
  await formRef.value?.validate();

  const isEdit = props.operateType === 'edit';
  const { error } = isEdit
    ? await fetchUpdateCoefficient(formData.value)
    : await fetchCreateCoefficient(formData.value);

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
          @change="handleMediumChange"
        >
          <ElOption v-for="item in mediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="系数类型" prop="coefficientType">
        <ElSelect
          v-model="formData.coefficientType"
          placeholder="请选择系数类型"
          style="width: 100%"
          :disabled="operateType === 'edit'"
        >
          <ElOption v-for="item in coefficientTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="系数用途" prop="coefficientPurpose">
        <ElInput v-model="formData.coefficientPurpose" placeholder="请输入系数用途" />
      </ElFormItem>
      <ElFormItem label="系数值" prop="coefficientValue">
        <ElInputNumber
          v-model="formData.coefficientValue"
          :min="0"
          :precision="6"
          style="width: 100%"
          placeholder="请输入系数值"
        />
      </ElFormItem>
      <ElFormItem label="单位" prop="unit">
        <ElInput v-model="formData.unit" placeholder="请输入单位，如 kgce/kWh" />
      </ElFormItem>
      <ElFormItem label="生效日期" prop="effectiveDate">
        <ElDatePicker
          v-model="formData.effectiveDate"
          type="date"
          placeholder="请选择生效日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </ElFormItem>
      <ElFormItem label="失效日期">
        <ElDatePicker
          v-model="formData.expiryDate"
          type="date"
          placeholder="请选择失效日期（可选）"
          style="width: 100%"
          value-format="YYYY-MM-DD"
          clearable
        />
      </ElFormItem>
      <ElFormItem label="版本说明">
        <ElInput v-model="formData.versionDesc" placeholder="请输入版本说明" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :label="1">启用</ElRadio>
          <ElRadio :label="2">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="formData.remark" type="textarea" rows="3" placeholder="请输入备注" />
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
