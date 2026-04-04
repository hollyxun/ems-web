<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreatePolicy, fetchUpdatePolicy, fetchPolicyById } from '@/service/api/saving';

defineOptions({ name: 'PolicyDrawer' });

interface Props { visible: boolean; operateType: 'add' | 'edit'; rowData?: Api.Saving.Policy.Item | null; }
interface Emits { (e: 'update:visible', visible: boolean): void; (e: 'submitted'): void; }

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({ get() { return props.visible; }, set(v) { emit('update:visible', v); } });
const title = computed(() => props.operateType === 'add' ? '新增政策法规' : '编辑政策法规');

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({ title: '', type: '', dept: '', issuingTime: '', url: '' });

const rules: FormRules = { title: [{ required: true, message: '请输入政策标题', trigger: 'blur' }] };

const policyTypes = ['国家政策', '地方政策', '行业标准', '企业制度'];

watch(() => props.visible, async (visible) => {
  if (visible && props.operateType === 'edit' && props.rowData?.id) {
    const { data, error } = await fetchPolicyById(props.rowData.id);
    if (!error && data) formData.value = { ...formData.value, ...data };
  } else if (visible && props.operateType === 'add') {
    formData.value = { title: '', type: '', dept: '', issuingTime: '', url: '' };
    formRef.value?.clearValidate();
  }
});

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    const api = props.operateType === 'add' ? fetchCreatePolicy : fetchUpdatePolicy;
    const params = props.operateType === 'edit' ? { id: props.rowData!.id, ...formData.value } : formData.value;
    const { error } = await api(params as any);
    if (!error) { ElMessage.success('操作成功'); drawerVisible.value = false; emit('submitted'); }
  } finally { loading.value = false; }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="政策标题" prop="title">
        <ElInput v-model="formData.title" placeholder="请输入政策标题" />
      </ElFormItem>
      <ElFormItem label="政策类型" prop="type">
        <ElSelect v-model="formData.type" placeholder="请选择政策类型" class="w-full">
          <ElOption v-for="t in policyTypes" :key="t" :label="t" :value="t" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="印发部门" prop="dept">
        <ElInput v-model="formData.dept" placeholder="请输入印发部门" />
      </ElFormItem>
      <ElFormItem label="印发时间" prop="issuingTime">
        <ElDatePicker v-model="formData.issuingTime" type="date" placeholder="选择印发时间" value-format="YYYY-MM-DD" class="w-full" />
      </ElFormItem>
      <ElFormItem label="文件地址" prop="url">
        <ElInput v-model="formData.url" placeholder="请输入文件URL" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>