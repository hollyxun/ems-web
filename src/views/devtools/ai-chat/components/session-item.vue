<script setup lang="ts">
import { ref } from 'vue';
import type { ChatSession } from '@/typings/api/devtools';

const props = defineProps<{
  session: ChatSession;
  active: boolean;
}>();

const emit = defineEmits<{
  select: [sessionId: string];
  rename: [data: { id: string; title: string }];
  delete: [sessionId: string];
}>();

// 编辑状态
const isEditing = ref(false);
const editTitle = ref('');

// 开始编辑
function handleStartEdit() {
  editTitle.value = props.session.title;
  isEditing.value = true;
}

// 保存编辑
function handleSaveEdit() {
  if (editTitle.value.trim() && editTitle.value !== props.session.title) {
    emit('rename', { id: props.session.id, title: editTitle.value.trim() });
  }
  isEditing.value = false;
}

// 取消编辑
function handleCancelEdit() {
  isEditing.value = false;
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 1分钟内
  if (diff < 60000) {
    return '刚刚';
  }

  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }

  // 其他
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
</script>

<template>
  <div
    class="group cursor-pointer rounded-lg p-3 transition-colors"
    :class="[active ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800']"
    @click="$emit('select', session.id)"
  >
    <div class="flex items-center justify-between">
      <div class="min-w-0 flex-1">
        <div v-if="!isEditing" class="truncate font-medium">
          {{ session.title }}
        </div>
        <NInput
          v-else
          v-model:value="editTitle"
          size="small"
          placeholder="输入新标题"
          @click.stop
          @keyup.enter="handleSaveEdit"
          @keyup.esc="handleCancelEdit"
          @blur="handleSaveEdit"
        />
      </div>

      <!-- 操作按钮 -->
      <div v-if="!isEditing" class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <NButton quaternary circle size="tiny" @click.stop="handleStartEdit">
          <template #icon>
            <icon-mdi-pencil class="text-sm" />
          </template>
        </NButton>
        <NButton quaternary circle size="tiny" @click.stop="$emit('delete', session.id)">
          <template #icon>
            <icon-mdi-delete class="text-sm text-red-500" />
          </template>
        </NButton>
      </div>
    </div>

    <div class="mt-1 text-xs text-gray-400">
      {{ formatTime(session.updatedAt) }}
    </div>
  </div>
</template>
