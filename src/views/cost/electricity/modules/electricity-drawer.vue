<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateElectricityCost, fetchUpdateElectricityCost } from '@/service/api/costmanagement';

defineOptions({ name: 'ElectricityDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: { id: string } | null;
}
interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({
  get() {
    return props.visible;
  },
  set(v) {
    emit('update:visible', v);
  }
});
const title = computed(() => (props.operateType === 'add' ? '新增电费录入' : '编辑电费录入'));

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({
  organizationId: 1,
  timeType: 'MONTH',
  dataTime: '',
  totalElectricity: 0,
  totalFee: 0,
  sharpElectricity: 0,
  peakElectricity: 0,
  flatElectricity: 0,
  valleyElectricity: 0,
  sharpFee: 0,
  peakFee: 0,
  flatFee: 0,
  valleyFee: 0,
  powerFactor: 0.9,
  remark: ''
});

const rules: FormRules = {
  timeType: [{ required: true, message: '请选择时间类型', trigger: 'change' }],
  dataTime: [{ required: true, message: '请选择数据时间', trigger: 'change' }]
};

const timeTypes = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData) {
      formData.value = { ...formData.value, ...(props.rowData as any) };
    } else if (visible && props.operateType === 'add') {
      formData.value = {
        organizationId: 1,
        timeType: 'MONTH',
        dataTime: '',
        totalElectricity: 0,
        totalFee: 0,
        sharpElectricity: 0,
        peakElectricity: 0,
        flatElectricity: 0,
        valleyElectricity: 0,
        sharpFee: 0,
        peakFee: 0,
        flatFee: 0,
        valleyFee: 0,
        powerFactor: 0.9,
        remark: ''
      };
      formRef.value?.clearValidate();
    }
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateElectricityCost({ id: props.rowData.id, ...formData.value } as any);
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateElectricityCost(formData.value as any);
      if (!error) {
        ElMessage.success('创建成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="600px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="时间类型" prop="timeType">
        <ElSelect v-model="formData.timeType" placeholder="请选择时间类型" class="w-full">
          <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="数据时间" prop="dataTime">
        <ElDatePicker
          v-model="formData.dataTime"
          type="month"
          placeholder="选择数据时间"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </ElFormItem>
      <ElDivider content-position="left">电量数据 (kWh)</ElDivider>
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="总电量">
            <ElInputNumber v-model="formData.totalElectricity" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="尖时段">
            <ElInputNumber v-model="formData.sharpElectricity" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="峰时段">
            <ElInputNumber v-model="formData.peakElectricity" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="平时段">
            <ElInputNumber v-model="formData.flatElectricity" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="谷时段">
            <ElInputNumber v-model="formData.valleyElectricity" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElDivider content-position="left">电费数据 (元)</ElDivider>
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="总电费">
            <ElInputNumber v-model="formData.totalFee" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="尖时段">
            <ElInputNumber v-model="formData.sharpFee" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="峰时段">
            <ElInputNumber v-model="formData.peakFee" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="平时段">
            <ElInputNumber v-model="formData.flatFee" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="谷时段">
            <ElInputNumber v-model="formData.valleyFee" :min="0" :precision="2" class="w-full" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElFormItem label="功率因数">
        <ElInputNumber v-model="formData.powerFactor" :min="0" :max="1" :precision="2" :step="0.01" class="w-full" />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>
