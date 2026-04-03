<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElButton, ElDrawer, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus';
import { fetchCreateVersion, fetchGetCurrentVersion } from '@/service/api/scheduling/rule-engine';

interface Props {
  visible: boolean;
  ruleId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}>();

const formRef = ref();
const loading = ref(false);

const formData = ref({
  versionName: '',
  configValue: '',
  changeReason: ''
});

const rules = {
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
};

watch(
  () => props.visible,
  async visible => {
    if (visible && props.ruleId) {
      // 获取当前激活版本的配置作为基础
      const { data } = await fetchGetCurrentVersion(props.ruleId);
      if (data?.configValue) {
        try {
          formData.value.configValue = JSON.stringify(JSON.parse(data.configValue), null, 2);
        } catch {
          formData.value.configValue = data.configValue;
        }
      } else {
        formData.value.configValue = '{}';
      }
    }
  }
);

function handleClose() {
  emit('update:visible', false);
  formRef.value?.resetFields();
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const { error } = await fetchCreateVersion({
      ruleId: props.ruleId,
      versionName: formData.value.versionName,
      configValue: formData.value.configValue,
      changeReason: formData.value.changeReason
    });

    if (!error) {
      ElMessage.success('版本创建成功');
      emit('success');
      handleClose();
    } else {
      ElMessage.error(error.message || '创建失败');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElDrawer :model-value="visible" title="创建新版本" size="600px" @close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-position="top">
      <ElFormItem label="版本名称" prop="versionName">
        <ElInput v-model="formData.versionName" placeholder="可选，如 V2.0-优化轮换逻辑" />
      </ElFormItem>

      <ElFormItem label="配置值" prop="configValue">
        <ElInput
          v-model="formData.configValue"
          type="textarea"
          :rows="15"
          placeholder="请输入JSON格式的配置值"
          class="font-mono"
        />
      </ElFormItem>

      <ElFormItem label="变更原因" prop="changeReason">
        <ElInput v-model="formData.changeReason" type="textarea" :rows="3" placeholder="请说明本次变更的原因" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">创建</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>
