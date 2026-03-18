<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { ChatMessage } from '@/typings/api/devtools';
import { useAIStorage } from '../../hooks/use-ai-storage';
import { createAIChatStream } from '../../api';
import MessageItem from './message-item.vue';

const props = defineProps<{
  model: string;
}>();

// 存储管理
const { currentMessages, isMessageLimitReached, addMessage, updateLastAssistantMessage, MAX_MESSAGES_PER_SESSION } =
  useAIStorage();

// 状态
const inputText = ref('');
const isLoading = ref(false);
const messageContainer = ref<HTMLElement | null>(null);
const abortController = ref<AbortController | null>(null);

// 计算属性
const messages = currentMessages;
const maxMessages = MAX_MESSAGES_PER_SESSION;
const isMessageLimit = isMessageLimitReached;

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}

// 发送消息
async function handleSend() {
  const content = inputText.value.trim();
  if (!content || isLoading.value) {
    return;
  }

  // 添加用户消息
  if (!addMessage({ role: 'user', content })) {
    window.$message?.warning('已达到消息上限');
    return;
  }

  inputText.value = '';
  scrollToBottom();

  // 添加空的助手消息占位
  addMessage({ role: 'assistant', content: '' });
  isLoading.value = true;

  // 获取配置
  const { config } = useAIStorage();
  if (!config.value) {
    window.$message?.error('请先配置AI服务');
    isLoading.value = false;
    return;
  }

  // 构建消息历史
  const chatMessages: ChatMessage[] = messages.value
    .slice(0, -1) // 排除最后一个空的助手消息
    .map(m => ({ role: m.role, content: m.content }));

  // 创建流式请求
  let fullContent = '';
  abortController.value = createAIChatStream(
    {
      baseUrl: config.value.baseUrl,
      apiKey: config.value.apiKey,
      model: props.model,
      messages: chatMessages
    },
    chunk => {
      fullContent += chunk;
      updateLastAssistantMessage(fullContent);
      scrollToBottom();
    },
    error => {
      window.$message?.error(`对话失败: ${error}`);
      updateLastAssistantMessage(`错误: ${error}`);
      isLoading.value = false;
    },
    () => {
      isLoading.value = false;
      abortController.value = null;
    }
  );
}

// 键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

// 监听消息变化，滚动到底部
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// 暴露方法
defineExpose({
  stop: () => {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
      isLoading.value = false;
    }
  }
});
</script>

<template>
  <NCard :bordered="false" class="h-full flex flex-col">
    <!-- 消息列表 -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <template v-if="messages.length === 0">
        <NEmpty description="开始对话吧" class="py-20">
          <template #extra>
            <NText depth="3">输入消息开始与AI对话</NText>
          </template>
        </NEmpty>
      </template>

      <MessageItem
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        :is-loading="isLoading && index === messages.length - 1 && message.role === 'assistant'"
      />
    </div>

    <!-- 输入区域 -->
    <div class="border-t border-gray-200 p-4">
      <NInput
        v-model:value="inputText"
        type="textarea"
        placeholder="输入消息... (Enter发送, Shift+Enter换行)"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :disabled="isLoading"
        @keydown="handleKeydown"
      />
      <div class="mt-2 flex items-center justify-between">
        <NText depth="3" class="text-sm">
          {{ isMessageLimit ? '已达到消息上限' : `${messages.length}/${maxMessages} 条消息` }}
        </NText>
        <NButton
          type="primary"
          :disabled="!inputText.trim() || isLoading || isMessageLimit"
          :loading="isLoading"
          @click="handleSend"
        >
          发送
        </NButton>
      </div>
    </div>
  </NCard>
</template>
