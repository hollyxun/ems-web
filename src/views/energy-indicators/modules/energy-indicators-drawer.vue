<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateEnergyIndicators, fetchUpdateEnergyIndicators, fetchEnergyIndicatorsById } from '@/service/api/energy-indicators';

defineOptions({ name: 'EnergyIndicatorsDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: { id: number } | null;
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
const title = computed(() => props.operateType === 'add' ? '新增能源指标' : '编辑能源指标');

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({
  nodeId: '',
  timeType: '',
  dataTime: '',
  name: '',
  number: 0,
  unit: '',
  energyType: '',
  indicatorsType: '',
  nodeName: ''
});

const rules: FormRules = {
  nodeId: [{ required: true, message: '请输入用能单元ID', trigger: 'blur' }],
  timeType: [{ required: true, message: '请选择时间类型', trigger: 'change' }],
  dataTime: [{ required: true, message: '请输入时间', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
};

const timeTypes = ['年', '月', '日'];
const energyTypes = ['电', '水', '气', '热'];
const indicatorsTypes = ['单位产品能耗', '综合能耗', '能耗强度'];
const units = ['吨', '千克', '立方米', '千瓦时', '万千瓦时'];

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchEnergyIndicatorsById(props.rowData.id);
      if (!error && data) {
        formData.value = {
          nodeId: data.nodeId || '',
          timeType: data.timeType || '',
          dataTime: data.dataTime || '',
          name: data.name || '',
          number: data.number || 0,
          unit: data.unit || '',
          energyType: data.energyType || '',
          indicatorsType: data.indicatorsType || '',
          nodeName: data.nodeName || ''
        };
      }
    } else if (visible && props.operateType === 'add') {
      formData.value = {
        nodeId: '',
        timeType: '',
        dataTime: '',
        name: '',
        number: 0,
        unit: '',
        energyType: '',
        indicatorsType: '',
        nodeName: ''
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
      const { error } = await fetchUpdateEnergyIndicators({ id: props.rowData.id, ...formData.value });
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateEnergyIndicators(formData.value);
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
  <ElDrawer v-model="drawerVisible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="用能单元ID" prop="nodeId">
        <ElInput v-model="formData.nodeId" placeholder="请输入用能单元ID" />
      </ElFormItem>
      <ElFormItem label="节点名称" prop="nodeName">
        <ElInput v-model="formData.nodeName" placeholder="请输入节点名称" />
      </ElFormItem>
      <ElFormItem label="时间类型" prop="timeType">
        <ElSelect v-model="formData.timeType" placeholder="请选择时间类型" class="w-full">
          <ElOption v-for="t in timeTypes" :key="t" :label="t" :value="t" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="时间" prop="dataTime">
        <ElInput v-model="formData.dataTime" placeholder="请输入时间（如：2024-01）" />
      </ElFormItem>
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入指标名称" />
      </ElFormItem>
      <ElFormItem label="能源类型" prop="energyType">
        <ElSelect v-model="formData.energyType" placeholder="请选择能源类型" class="w-full" clearable>
          <ElOption v-for="e in energyTypes" :key="e" :label="e" :value="e" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="指标类型" prop="indicatorsType">
        <ElSelect v-model="formData.indicatorsType" placeholder="请选择指标类型" class="w-full" clearable>
          <ElOption v-for="i in indicatorsTypes" :key="i" :label="i" :value="i" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="产量/值" prop="number">
        <ElInputNumber v-model="formData.number" :precision="4" :min="0" placeholder="请输入产量或值" class="w-full" />
      </ElFormItem>
      <ElFormItem label="单位" prop="unit">
        <ElSelect v-model="formData.unit" placeholder="请选择单位" class="w-full" clearable>
          <ElOption v-for="u in units" :key="u" :label="u" :value="u" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>