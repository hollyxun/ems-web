<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { fetchAIModels } from '../../api';
import { useAIStorage } from '../../hooks/use-ai-storage';

const emit = defineEmits<{
  configSaved: [];
}>();

// 存储管理
const { config, hasConfig, saveConfig, clearConfig } = useAIStorage();

// 表单
const formRef = ref<FormInst | null>(null);
const formData = reactive({
  baseUrl: '',
  apiKey: '',
  defaultModel: ''
});

// 状态
const saving = ref(false);
const modelsLoading = ref(false);
const modelOptions = ref<Array<{ label: string; value: string }>>([]);

// 表单验证规则
const rules: FormRules = {
  baseUrl: [
    { required: true, message: '请输入服务地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }]
};

// 获取模型列表
async function fetchModels() {
  if (!formData.baseUrl || !formData.apiKey) {
    window.$message?.warning('请先填写服务地址和API密钥');
    return;
  }

  modelsLoading.value = true;
  try {
    const response = await fetchAIModels({
      baseUrl: formData.baseUrl,
      apiKey: formData.apiKey
    });

    modelOptions.value = response.data.map(model => ({
      label: model.id,
      value: model.id
    }));

    window.$message?.success(`获取到${response.data.length}个模型`);

    // 如果没有选择模型且列表不为空，选择第一个
    if (!formData.defaultModel && modelOptions.value.length > 0) {
      formData.defaultModel = modelOptions.value[0].value;
    }
  } catch {
    window.$message?.error('获取模型列表失败');
  } finally {
    modelsLoading.value = false;
  }
}

// 保存配置
async function handleSave() {
  await formRef.value?.validate();

  saving.value = true;
  try {
    saveConfig({
      baseUrl: formData.baseUrl,
      apiKey: formData.apiKey,
      defaultModel: formData.defaultModel
    });

    window.$message?.success('配置已保存');
    emit('configSaved');
  } finally {
    saving.value = false;
  }
}

// 清除配置
function handleClear() {
  clearConfig();
  formData.baseUrl = '';
  formData.apiKey = '';
  formData.defaultModel = '';
  modelOptions.value = [];
  window.$message?.success('配置已清除');
}

// 初始化加载配置
onMounted(() => {
  if (config.value) {
    formData.baseUrl = config.value.baseUrl;
    formData.apiKey = config.value.apiKey;
    formData.defaultModel = config.value.defaultModel;

    // 自动获取模型列表
    if (formData.baseUrl && formData.apiKey) {
      fetchModels();
    }
  }
});
</script>

<template>
  <NCard title="AI服务配置" :bordered="false">
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="auto">
      <NFormItem label="服务地址" path="baseUrl">
        <NInput v-model:value="formData.baseUrl" placeholder="请输入AI服务地址，如: https://api.openai.com" clearable />
      </NFormItem>

      <NFormItem label="API Key" path="apiKey">
        <NInput
          v-model:value="formData.apiKey"
          type="password"
          show-password-on="click"
          placeholder="请输入API密钥"
          clearable
        />
      </NFormItem>

      <NFormItem label="默认模型" path="defaultModel">
        <NSelect
          v-model:value="formData.defaultModel"
          :options="modelOptions"
          :loading="modelsLoading"
          placeholder="请选择默认模型"
          clearable
          filterable
        />
      </NFormItem>

      <NFormItem>
        <NSpace>
          <NButton type="primary" :loading="saving" @click="handleSave">保存配置</NButton>
          <NButton :loading="modelsLoading" @click="fetchModels">获取模型列表</NButton>
          <NButton v-if="hasConfig" type="error" ghost @click="handleClear">清除配置</NButton>
        </NSpace>
      </NFormItem>
    </NForm>

    <NAlert v-if="!hasConfig" type="info" title="配置引导" class="mt-4">
      请先配置AI服务地址和API密钥，然后获取模型列表选择默认模型。配置仅保存在本地浏览器中。
    </NAlert>
  </NCard>
</template>
