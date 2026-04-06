<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreatePriceTactics, fetchPriceTacticsById, fetchUpdatePriceTactics } from '@/service/api/costmanagement';

defineOptions({ name: 'TacticsDrawer' });

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
const title = computed(() => (props.operateType === 'add' ? '新增成本策略' : '编辑成本策略'));

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({
  tacticsNumber: '',
  tacticsName: '',
  energyType: 1,
  isLadder: false,
  description: '',
  status: 1
});

const rules: FormRules = {
  tacticsName: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  energyType: [{ required: true, message: '请选择能源类型', trigger: 'change' }]
};

const energyTypes = [
  { label: '电', value: 1 },
  { label: '水', value: 2 },
  { label: '气', value: 3 },
  { label: '热', value: 4 }
];

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchPriceTacticsById(props.rowData.id);
      if (!error && data) formData.value = { ...formData.value, ...data };
    } else if (visible && props.operateType === 'add') {
      formData.value = {
        tacticsNumber: '',
        tacticsName: '',
        energyType: 1,
        isLadder: false,
        description: '',
        status: 1
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
      const { error } = await fetchUpdatePriceTactics(props.rowData.id, formData.value as any);
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreatePriceTactics(formData.value as any);
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
      <ElFormItem label="策略编码" prop="tacticsNumber">
        <ElInput v-model="formData.tacticsNumber" placeholder="请输入策略编码" />
      </ElFormItem>
      <ElFormItem label="策略名称" prop="tacticsName">
        <ElInput v-model="formData.tacticsName" placeholder="请输入策略名称" />
      </ElFormItem>
      <ElFormItem label="能源类型" prop="energyType">
        <ElSelect v-model="formData.energyType" placeholder="请选择能源类型" class="w-full">
          <ElOption v-for="t in energyTypes" :key="t.value" :label="t.label" :value="t.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="阶梯价格" prop="isLadder">
        <ElSwitch v-model="formData.isLadder" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>
