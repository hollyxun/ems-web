<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreateFactoryTouPrice, fetchUpdateFactoryTouPrice } from '@/service/api/energy-tou';
import { fetchGetAllMediums } from '@/service/api/energy';

defineOptions({ name: 'TouPriceDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.FactoryTouPrice | null;
  factoryId: number;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();
const allMediums = ref<Api.Energy.Medium[]>([]);

const formData = ref<Api.Energy.FactoryTouPrice>({
  id: 0,
  factoryId: 0,
  mediumId: 0,
  periodType: 1,
  price: 0,
  currency: 'CNY',
  effectiveDate: ''
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增电价' : '编辑电价';
});

const periodTypeOptions = [
  { label: '峰时电价', value: 1 },
  { label: '平时电价', value: 2 },
  { label: '谷时电价', value: 3 }
];

const currencyOptions = [
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' }
];

const rules = {
  mediumId: [{ required: true, message: '请选择能源介质', trigger: 'change' }],
  periodType: [{ required: true, message: '请选择时段类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入电价', trigger: 'blur' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
};

async function loadMediums() {
  const { data } = await fetchGetAllMediums();
  if (data) {
    allMediums.value = data;
  }
}

function resetForm() {
  formData.value = {
    id: 0,
    factoryId: props.factoryId,
    mediumId: 0,
    periodType: 1,
    price: 0,
    currency: 'CNY',
    effectiveDate: new Date().toISOString().split('T')[0]
  };
}

async function handleSubmit() {
  await formRef.value?.validate();

  const isEdit = props.operateType === 'edit';
  const { error } = isEdit
    ? await fetchUpdateFactoryTouPrice(formData.value)
    : await fetchCreateFactoryTouPrice(formData.value);

  if (!error) {
    ElMessage.success(isEdit ? '编辑成功' : '新增成功');
    visible.value = false;
    emit('submitted');
  }
}

watch(visible, val => {
  if (val) {
    loadMediums();
    if (props.operateType === 'edit' && props.rowData) {
      formData.value = { ...props.rowData };
    } else {
      resetForm();
    }
  }
});

onMounted(() => {
  loadMediums();
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="能源介质" prop="mediumId">
        <ElSelect v-model="formData.mediumId" placeholder="请选择能源介质" class="w-full">
          <ElOption v-for="item in allMediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="时段类型" prop="periodType">
        <ElRadioGroup v-model="formData.periodType">
          <ElRadio v-for="item in periodTypeOptions" :key="item.value" :label="item.value">{{ item.label }}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="电价" prop="price">
        <ElInputNumber
          v-model="formData.price"
          :precision="4"
          :min="0"
          :step="0.01"
          placeholder="请输入电价"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="币种" prop="currency">
        <ElSelect v-model="formData.currency" placeholder="请选择币种" class="w-full">
          <ElOption v-for="item in currencyOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="生效日期" prop="effectiveDate">
        <ElDatePicker
          v-model="formData.effectiveDate"
          type="date"
          placeholder="请选择生效日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="失效日期">
        <ElDatePicker
          v-model="formData.expireDate"
          type="date"
          placeholder="请选择失效日期（可选）"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>
