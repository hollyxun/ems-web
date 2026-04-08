<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

defineOptions({ name: 'AlarmHandleDialog' });

interface Props {
  visible: boolean;
  rowData: Api.AlarmHistory.AlarmHistoryItem | null;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'confirm', id: string, handleStatus: string, handleRemark: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(props.visible);
const formRef = ref<FormInstance>();

const formData = ref({
  handleStatus: '2',
  handleRemark: ''
});

const rules: FormRules = {
  handleStatus: [{ required: true, message: '请选择处理状态', trigger: 'change' }]
};

watch(
  () => props.visible,
  visible => {
    dialogVisible.value = visible;
    if (visible) {
      formData.value = {
        handleStatus: '2',
        handleRemark: ''
      };
    }
  }
);

watch(dialogVisible, visible => {
  emit('update:visible', visible);
});

async function handleSubmit() {
  await formRef.value?.validate();
  if (props.rowData?.id) {
    emit('confirm', props.rowData.id, formData.value.handleStatus, formData.value.handleRemark);
  }
}

function handleClose() {
  dialogVisible.value = false;
}
</script>

<template>
  <ElDialog v-model="dialogVisible" title="报警处理" width="500px" @close="handleClose">
    <ElDescriptions v-if="rowData" :column="1" border class="mb-16px">
      <ElDescriptionsItem label="指标名称">{{ rowData.indexName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="报警值">{{ rowData.alarmValue }}</ElDescriptionsItem>
      <ElDescriptionsItem label="限值">{{ rowData.limitingValue }}</ElDescriptionsItem>
      <ElDescriptionsItem label="开始时间">{{ rowData.beginTime }}</ElDescriptionsItem>
      <ElDescriptionsItem label="报警描述">{{ rowData.content }}</ElDescriptionsItem>
    </ElDescriptions>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="处理状态" prop="handleStatus">
        <ElRadioGroup v-model="formData.handleStatus">
          <ElRadio value="1">已确认</ElRadio>
          <ElRadio value="2">已处理</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="处理备注" prop="handleRemark">
        <ElInput v-model="formData.handleRemark" type="textarea" :rows="3" placeholder="请输入处理备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>
