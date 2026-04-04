<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateAlarmItem, fetchUpdateAlarmItem, fetchAlarmItemById } from '@/service/api/alarm';
import { $t } from '@/locales';

defineOptions({ name: 'AlarmItemDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: Api.AlarmItem.Item | null;
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
  return props.operateType === 'add' ? '新增预报警设置' : '编辑预报警设置';
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = ref({
  indexCode: '',
  startStop: '1',
  timeSlot: '',
  limitType: '1',
  limitVal: '',
  alarmLevel: '',
  nodeId: '',
  pointId: ''
});

const rules: FormRules = {
  indexCode: [{ required: true, message: '请输入指标编码', trigger: 'blur' }]
};

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchAlarmItemById(props.rowData.id);
      if (!error && data) {
        formData.value = {
          indexCode: data.indexCode || '',
          startStop: data.startStop || '1',
          timeSlot: data.timeSlot || '',
          limitType: data.limitType || '1',
          limitVal: data.limitVal || '',
          alarmLevel: data.alarmLevel || '',
          nodeId: data.nodeId || '',
          pointId: data.pointId || ''
        };
      }
    } else if (visible && props.operateType === 'add') {
      resetForm();
    }
  }
);

function resetForm() {
  formData.value = {
    indexCode: '',
    startStop: '1',
    timeSlot: '',
    limitType: '1',
    limitVal: '',
    alarmLevel: '',
    nodeId: '',
    pointId: ''
  };
  formRef.value?.clearValidate();
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;

  try {
    if (props.operateType === 'add') {
      const { error } = await fetchCreateAlarmItem(formData.value);
      if (!error) {
        ElMessage.success('创建成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateAlarmItem({
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
      <ElFormItem label="指标编码" prop="indexCode">
        <ElInput v-model="formData.indexCode" placeholder="请输入指标编码" />
      </ElFormItem>
      <ElFormItem label="时段" prop="timeSlot">
        <ElInput v-model="formData.timeSlot" placeholder="请输入时段" />
      </ElFormItem>
      <ElFormItem label="限值类型" prop="limitType">
        <ElSelect v-model="formData.limitType" placeholder="请选择限值类型">
          <ElOption label="上限" value="1" />
          <ElOption label="下限" value="2" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="限值" prop="limitVal">
        <ElInput v-model="formData.limitVal" placeholder="请输入限值" />
      </ElFormItem>
      <ElFormItem label="报警级别" prop="alarmLevel">
        <ElInput v-model="formData.alarmLevel" placeholder="请输入报警级别" />
      </ElFormItem>
      <ElFormItem label="启停状态" prop="startStop">
        <ElRadioGroup v-model="formData.startStop">
          <ElRadio value="1">启用</ElRadio>
          <ElRadio value="2">停止</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="节点ID" prop="nodeId">
        <ElInput v-model="formData.nodeId" placeholder="请输入节点ID" />
      </ElFormItem>
      <ElFormItem label="计量点ID" prop="pointId">
        <ElInput v-model="formData.pointId" placeholder="请输入计量点ID" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>