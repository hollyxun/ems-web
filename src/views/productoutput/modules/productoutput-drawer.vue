<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateProductOutput, fetchUpdateProductOutput, fetchProductOutputById } from '@/service/api/productoutput';

defineOptions({ name: 'ProductOutputDrawer' });

interface Props { visible: boolean; operateType: 'add' | 'edit'; rowData?: { id: number } | null; }
interface Emits { (e: 'update:visible', visible: boolean): void; (e: 'submitted'): void; }

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({ get() { return props.visible; }, set(v) { emit('update:visible', v); } });
const title = computed(() => props.operateType === 'add' ? '新增产品产量' : '编辑产品产量');

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({
  nodeId: '',
  nodeName: '',
  timeType: '',
  dataTime: '',
  name: '',
  number: 0,
  unit: '',
  dataType: '',
  productType: ''
});

const rules: FormRules = {
  nodeId: [{ required: true, message: '请输入用能单元ID', trigger: 'blur' }],
  timeType: [{ required: true, message: '请选择时间类型', trigger: 'change' }],
  dataTime: [{ required: true, message: '请输入时间', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  number: [{ required: true, message: '请输入产量', trigger: 'blur' }],
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }]
};

const timeTypes = ['年', '月', '日'];
const dataTypes = ['产量', '仪表', '指标'];
const productTypes = ['主要产品', '副产品', '中间产品'];

watch(() => props.visible, async (visible) => {
  if (visible && props.operateType === 'edit' && props.rowData?.id) {
    const { data, error } = await fetchProductOutputById(props.rowData.id);
    if (!error && data) {
      formData.value = {
        nodeId: data.nodeId || '',
        nodeName: data.nodeName || '',
        timeType: data.timeType || '',
        dataTime: data.dataTime || '',
        name: data.name || '',
        number: data.number || 0,
        unit: data.unit || '',
        dataType: data.dataType || '',
        productType: data.productType || ''
      };
    }
  } else if (visible && props.operateType === 'add') {
    formData.value = {
      nodeId: '',
      nodeName: '',
      timeType: '',
      dataTime: '',
      name: '',
      number: 0,
      unit: '',
      dataType: '',
      productType: ''
    };
    formRef.value?.clearValidate();
  }
});

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateProductOutput({ id: props.rowData.id, ...formData.value });
      if (!error) { ElMessage.success('更新成功'); drawerVisible.value = false; emit('submitted'); }
    } else {
      const { error } = await fetchCreateProductOutput(formData.value);
      if (!error) { ElMessage.success('创建成功'); drawerVisible.value = false; emit('submitted'); }
    }
  } finally { loading.value = false; }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="用能单元ID" prop="nodeId">
        <ElInput v-model="formData.nodeId" placeholder="请输入用能单元ID" />
      </ElFormItem>
      <ElFormItem label="用能单元名称" prop="nodeName">
        <ElInput v-model="formData.nodeName" placeholder="请输入用能单元名称" />
      </ElFormItem>
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入名称" />
      </ElFormItem>
      <ElFormItem label="时间类型" prop="timeType">
        <ElSelect v-model="formData.timeType" placeholder="请选择时间类型" class="w-full">
          <ElOption v-for="t in timeTypes" :key="t" :label="t" :value="t" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="时间" prop="dataTime">
        <ElInput v-model="formData.dataTime" placeholder="请输入时间（如2024-01）" />
      </ElFormItem>
      <ElFormItem label="产量" prop="number">
        <ElInputNumber v-model="formData.number" :min="0" :precision="4" class="w-full" />
      </ElFormItem>
      <ElFormItem label="单位" prop="unit">
        <ElInput v-model="formData.unit" placeholder="请输入单位（如吨、件）" />
      </ElFormItem>
      <ElFormItem label="数据类型" prop="dataType">
        <ElSelect v-model="formData.dataType" placeholder="请选择数据类型" class="w-full">
          <ElOption v-for="t in dataTypes" :key="t" :label="t" :value="t" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="产品类型" prop="productType">
        <ElSelect v-model="formData.productType" placeholder="请选择产品类型" class="w-full" clearable>
          <ElOption v-for="t in productTypes" :key="t" :label="t" :value="t" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>