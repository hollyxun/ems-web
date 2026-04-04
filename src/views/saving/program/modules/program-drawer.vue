<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateProgram, fetchUpdateProgram, fetchProgramById } from '@/service/api/saving';

defineOptions({ name: 'ProgramDrawer' });

interface Props { visible: boolean; operateType: 'add' | 'edit'; rowData?: Api.Saving.Program.Item | null; }
interface Emits { (e: 'update:visible', visible: boolean): void; (e: 'submitted'): void; }

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({ get() { return props.visible; }, set(v) { emit('update:visible', v); } });
const title = computed(() => props.operateType === 'add' ? '新增节能项目' : '编辑节能项目');

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({ plan: '', completionTime: '', liablePerson: '', implementationPlan: '', currentWork: '', savingAmount: '', remark: '' });

const rules: FormRules = {};

watch(() => props.visible, async (visible) => {
  if (visible && props.operateType === 'edit' && props.rowData?.id) {
    const { data, error } = await fetchProgramById(props.rowData.id);
    if (!error && data) formData.value = { ...formData.value, ...data };
  } else if (visible && props.operateType === 'add') {
    formData.value = { plan: '', completionTime: '', liablePerson: '', implementationPlan: '', currentWork: '', savingAmount: '', remark: '' };
    formRef.value?.clearValidate();
  }
});

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    const api = props.operateType === 'add' ? fetchCreateProgram : fetchUpdateProgram;
    const params = props.operateType === 'edit' ? { id: props.rowData!.id, ...formData.value } : formData.value;
    const { error } = await api(params as any);
    if (!error) { ElMessage.success('操作成功'); drawerVisible.value = false; emit('submitted'); }
  } finally { loading.value = false; }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="600px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="总体计划" prop="plan">
        <ElInput v-model="formData.plan" type="textarea" :rows="3" placeholder="请输入总体计划" />
      </ElFormItem>
      <ElFormItem label="完成时间" prop="completionTime">
        <ElDatePicker v-model="formData.completionTime" type="date" placeholder="选择完成时间" value-format="YYYY-MM-DD" />
      </ElFormItem>
      <ElFormItem label="项目组长" prop="liablePerson">
        <ElInput v-model="formData.liablePerson" placeholder="请输入项目组长" />
      </ElFormItem>
      <ElFormItem label="实施计划" prop="implementationPlan">
        <ElInput v-model="formData.implementationPlan" type="textarea" :rows="3" placeholder="请输入实施计划" />
      </ElFormItem>
      <ElFormItem label="当前工作" prop="currentWork">
        <ElInput v-model="formData.currentWork" type="textarea" :rows="2" placeholder="请输入当前工作" />
      </ElFormItem>
      <ElFormItem label="节约量" prop="savingAmount">
        <ElInput v-model="formData.savingAmount" placeholder="请输入节约量" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>