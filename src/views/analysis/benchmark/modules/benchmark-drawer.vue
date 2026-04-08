<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchBenchmarkById, fetchCreateBenchmark, fetchUpdateBenchmark } from '@/service/api/benchmark';

defineOptions({ name: 'BenchmarkDrawer' });

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
const title = computed(() => (props.operateType === 'add' ? '新增标杆' : '编辑标杆'));

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({ code: '', type: '', grade: '', value: '', nationalNum: '' });

const rules: FormRules = { code: [{ required: true, message: '请输入标杆编码', trigger: 'blur' }] };

const benchmarkTypes = ['国家标杆', '行业标杆', '企业标杆'];
const benchmarkGrades = ['一级', '二级', '三级'];

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchBenchmarkById(props.rowData.id);
      if (!error && data) formData.value = { ...formData.value, ...data };
    } else if (visible && props.operateType === 'add') {
      formData.value = { code: '', type: '', grade: '', value: '', nationalNum: '' };
      formRef.value?.clearValidate();
    }
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateBenchmark({ id: props.rowData.id, ...formData.value });
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateBenchmark(formData.value);
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
      <ElFormItem label="标杆编码" prop="code">
        <ElInput v-model="formData.code" placeholder="请输入标杆编码" />
      </ElFormItem>
      <ElFormItem label="标杆类型" prop="type">
        <ElSelect v-model="formData.type" placeholder="请选择标杆类型" class="w-full">
          <ElOption v-for="t in benchmarkTypes" :key="t" :label="t" :value="t" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="标杆等级" prop="grade">
        <ElSelect v-model="formData.grade" placeholder="请选择标杆等级" class="w-full">
          <ElOption v-for="g in benchmarkGrades" :key="g" :label="g" :value="g" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="标杆值" prop="value">
        <ElInput v-model="formData.value" placeholder="请输入标杆值" />
      </ElFormItem>
      <ElFormItem label="国标编号" prop="nationalNum">
        <ElInput v-model="formData.nationalNum" placeholder="请输入国标编号" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>
