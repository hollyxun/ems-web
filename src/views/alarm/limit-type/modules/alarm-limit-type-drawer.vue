<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateAlarmLimitType, fetchUpdateAlarmLimitType } from '@/service/api/alarm';
import { $t } from '@/locales';

defineOptions({ name: 'AlarmLimitTypeDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: Api.AlarmLimitType.Item | null;
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
  set(visible: boolean) {
    emit('update:visible', visible);
  }
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增限值类型' : '编辑限值类型';
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = ref({
  limitName: '',
  limitCode: '',
  colorNumber: '',
  comparatorOperator: '',
  alarmType: '',
  sort: 0
});

const rules: FormRules = {
  limitName: [{ required: true, message: '请输入限值类型名称', trigger: 'blur' }],
  limitCode: [{ required: true, message: '请输入限值类型编码', trigger: 'blur' }]
};

watch(
  () => props.visible,
  visible => {
    if (visible && props.operateType === 'edit' && props.rowData) {
      formData.value = {
        limitName: props.rowData.limitName || '',
        limitCode: props.rowData.limitCode || '',
        colorNumber: props.rowData.colorNumber || '',
        comparatorOperator: props.rowData.comparatorOperator || '',
        alarmType: props.rowData.alarmType || '',
        sort: props.rowData.sort || 0
      };
    } else if (visible && props.operateType === 'add') {
      resetForm();
    }
  }
);

function resetForm() {
  formData.value = {
    limitName: '',
    limitCode: '',
    colorNumber: '',
    comparatorOperator: '',
    alarmType: '',
    sort: 0
  };
  formRef.value?.clearValidate();
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;

  try {
    if (props.operateType === 'add') {
      const { error } = await fetchCreateAlarmLimitType(formData.value);
      if (!error) {
        ElMessage.success('创建成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateAlarmLimitType({
        id: props.rowData.id,
        ...formData.value
      });
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="500px" @close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="名称" prop="limitName">
        <ElInput v-model="formData.limitName" placeholder="请输入限值类型名称" />
      </ElFormItem>
      <ElFormItem label="编码" prop="limitCode">
        <ElInput v-model="formData.limitCode" placeholder="请输入限值类型编码" />
      </ElFormItem>
      <ElFormItem label="颜色标识" prop="colorNumber">
        <ElColorPicker v-model="formData.colorNumber" show-alpha />
      </ElFormItem>
      <ElFormItem label="比较运算符" prop="comparatorOperator">
        <ElSelect v-model="formData.comparatorOperator" placeholder="请选择比较运算符" clearable>
          <ElOption label="大于 (>)" value=">" />
          <ElOption label="小于 (<)" value="<" />
          <ElOption label="大于等于 (>=)" value=">=" />
          <ElOption label="小于等于 (<=)" value="<=" />
          <ElOption label="等于 (==)" value="==" />
          <ElOption label="不等于 (!=)" value="!=" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="警戒类型" prop="alarmType">
        <ElInput v-model="formData.alarmType" placeholder="请输入警戒类型" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="0" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>
