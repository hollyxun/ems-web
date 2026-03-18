<script setup lang="ts">
import { computed } from 'vue';
import type { ChatMessage } from '@/typings/api/devtools';

const props = defineProps<{
  message: ChatMessage;
  isLoading?: boolean;
}>();

// 简单的Markdown渲染（实际项目中应使用marked或markdown-it）
const renderedContent = computed(() => {
  let content = props.message.content;

  // 转义HTML
  content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 代码块
  content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // 行内代码
  content = content.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>');

  // 粗体
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 斜体
  content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 换行
  content = content.replace(/\n/g, '<br>');

  return content;
});
</script>

<template>
  <div
    class="rounded-lg p-4"
    :class="[message.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' : 'bg-gray-50 dark:bg-gray-800/50 mr-8']"
  >
    <div class="flex items-start gap-3">
      <!-- 头像 -->
      <div
        class="h-8 w-8 flex flex-shrink-0 items-center justify-center rounded-full"
        :class="[message.role === 'user' ? 'bg-blue-500' : 'bg-green-500']"
      >
        <Icon :icon="message.role === 'user' ? 'mdi:account' : 'mdi:robot'" class="text-lg text-white" />
      </div>

      <!-- 内容 -->
      <div class="min-w-0 flex-1">
        <div class="mb-1 text-sm text-gray-500">
          {{ message.role === 'user' ? '你' : 'AI' }}
        </div>
        <div v-if="isLoading" class="flex items-center gap-2">
          <NSpin size="small" />
          <span class="text-gray-400">思考中...</span>
        </div>
        <div v-else class="prose prose-sm dark:prose-invert max-w-none" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(pre) {
  margin: 0.5rem 0;
}

.prose :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}
</style>
