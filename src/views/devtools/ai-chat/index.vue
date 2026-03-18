<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAIStorage } from './hooks/use-ai-storage';
import { fetchAIModels } from './api';
import ConfigPanel from './components/config-panel.vue';
import SessionSidebar from './components/session-sidebar.vue';
import ChatContainer from './components/chat-container.vue';

// 存储管理
const { config, hasConfig, currentSession, createSession } = useAIStorage();

// 状态
const currentModel = ref('');
const modelOptions = ref<Array<{ label: string; value: string }>>([]);
const chatContainerRef = ref<InstanceType<typeof ChatContainer> | null>(null);

// 配置保存后
function handleConfigSaved() {
  if (config.value?.defaultModel) {
    currentModel.value = config.value.defaultModel;
  }
  loadModels();
}

// 会话创建后
function handleSessionCreated() {
  // 会话已创建，可以开始对话
}

// 创建新会话
function handleCreateSession() {
  if (!currentModel.value) {
    window.$message?.warning('请先选择模型');
    return;
  }
  createSession(currentModel.value);
}

// 加载模型列表
async function loadModels() {
  if (!config.value) {
    return;
  }

  try {
    const response = await fetchAIModels({
      baseUrl: config.value.baseUrl,
      apiKey: config.value.apiKey
    });

    modelOptions.value = response.data.map(model => ({
      label: model.id,
      value: model.id
    }));

    // 设置默认模型
    if (config.value.defaultModel) {
      currentModel.value = config.value.defaultModel;
    } else if (modelOptions.value.length > 0) {
      currentModel.value = modelOptions.value[0].value;
    }
  } catch {
    // 加载失败，不处理
  }
}

// 初始化
onMounted(() => {
  if (hasConfig.value) {
    loadModels();
  }
});
</script>

<template>
  <div class="h-full flex">
    <!-- 会话侧边栏 -->
    <div class="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
      <SessionSidebar :model="currentModel" @session-created="handleSessionCreated" />
    </div>

    <!-- 主内容区 -->
    <div class="min-w-0 flex flex-col flex-1">
      <!-- 配置未完成时显示配置面板 -->
      <template v-if="!hasConfig">
        <div class="flex flex-1 items-center justify-center p-8">
          <div class="max-w-lg w-full">
            <ConfigPanel @config-saved="handleConfigSaved" />
          </div>
        </div>
      </template>

      <!-- 已配置时显示对话界面 -->
      <template v-else>
        <!-- 模型选择 -->
        <div class="flex items-center gap-4 border-b border-gray-200 p-3 dark:border-gray-700">
          <NSelect
            v-model:value="currentModel"
            :options="modelOptions"
            placeholder="选择模型"
            style="width: 200px"
            size="small"
          />
          <NText depth="3" class="text-sm">会话: {{ currentSession?.title || '无' }}</NText>
        </div>

        <!-- 对话区域 -->
        <div class="flex-1 overflow-hidden">
          <template v-if="currentSession">
            <ChatContainer ref="chatContainerRef" :model="currentModel" />
          </template>
          <template v-else>
            <div class="h-full flex items-center justify-center">
              <NEmpty description="选择或创建一个对话开始">
                <template #extra>
                  <NButton type="primary" @click="handleCreateSession">新建对话</NButton>
                </template>
              </NEmpty>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
