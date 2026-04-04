<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreatePriceDate, fetchUpdatePriceDate, fetchPriceDateById } from '@/service/api/peakvalley';

defineOptions({ name: 'PriceDateDrawer' });

interface Props { visible: boolean; operateType: 'add' | 'edit'; rowData?: { id: number } | null; }
interface Emits { (e: 'update:visible', visible: boolean): void; (e: 'submitted'): void; }

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({ get() { return props.visible; }, set(v) { emit('update:visible', v); } });
const title = computed(() => props.operateType === 'add' ? '新增电价时间段' : '编辑电价时间段');

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({ beginDate: '', endDate: '', remark: '' });

const rules: FormRules = {
  beginDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
};

watch(() => props.visible, async (visible) => {
  if (visible && props.operateType === 'edit' && props.rowData?.id) {
    const { data, error } = await fetchPriceDateById(props.rowData.id);
    if (!error && data) {
      formData.value = { beginDate: data.beginDate, endDate: data.endDate, remark: data.remark || '' };
    }
  } else if (visible && props.operateType === 'add') {
    formData.value = { beginDate: '', endDate: '', remark: '' };
    formRef.value?.clearValidate();
  }
});

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdatePriceDate({ id: props.rowData.id, ...formData.value });
      if (!error) { ElMessage.success('更新成功'); drawerVisible.value = false; emit('submitted'); }
    } else {
      const { error } = await fetchCreatePriceDate(formData.value);
      if (!error) { ElMessage.success('创建成功'); drawerVisible.value = false; emit('submitted'); }
    }
  } finally { loading.value = false; }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="开始日期" prop="beginDate">
        <ElDatePicker v-model="formData.beginDate" type="date" placeholder="请选择开始日期" value-format="YYYY-MM-DD" class="w-full" />
      </ElFormItem>
      <ElFormItem label="结束日期" prop="endDate">
        <ElDatePicker v-model="formData.endDate" type="date" placeholder="请选择结束日期" value-format="YYYY-MM-DD" class="w-full" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" placeholder="请输入备注" type="textarea" :rows="3" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>