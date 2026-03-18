<script setup lang="ts">
import { ref } from 'vue';
import { useAIStorage } from '../../hooks/use-ai-storage';
import SessionItem from './session-item.vue';

const props = defineProps<{
  model: string;
}>();

const emit = defineEmits<{
  sessionCreated: [];
}>();

// 存储管理
const {
  sessions,
  currentSessionId,
  sessionCount,
  isSessionLimitReached,
  createSession,
  selectSession,
  renameSession,
  deleteSession,
  clearAllSessions,
  MAX_SESSIONS
} = useAIStorage();

// 计算属性
const isLimitReached = isSessionLimitReached;
const maxSessions = MAX_SESSIONS;

// 创建新会话
function handleCreate() {
  const session = createSession(props.model);
  if (session) {
    emit('sessionCreated');
  } else {
    window.$message?.warning('已达到会话上限，请删除部分会话');
  }
}

// 选择会话
function handleSelect(sessionId: string) {
  selectSession(sessionId);
}

// 重命名会话
function handleRename(data: { id: string; title: string }) {
  renameSession(data.id, data.title);
}

// 删除会话
function handleDelete(sessionId: string) {
  window.$messageBox?.warning('确定要删除这个对话吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    onConfirm: () => {
      deleteSession(sessionId);
    }
  });
}

// 清空所有会话
function handleClearAll() {
  window.$messageBox?.warning('确定要清空所有对话吗？此操作不可恢复。', '清空确认', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    onConfirm: () => {
      clearAllSessions();
    }
  });
}
</script>

<template>
  <div class="h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
    <!-- 头部 -->
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <NButton type="primary" block :disabled="isLimitReached" @click="handleCreate">
        <template #icon>
          <icon-mdi-plus />
        </template>
        新建对话
      </NButton>
      <NText v-if="isLimitReached" depth="3" class="mt-1 block text-xs">
        已达上限({{ sessionCount }}/{{ maxSessions }})
      </NText>
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-y-auto">
      <NEmpty v-if="sessions.length === 0" description="暂无对话" class="py-10" />
      <div v-else class="p-2 space-y-1">
        <SessionItem
          v-for="session in sessions"
          :key="session.id"
          :session="session"
          :active="session.id === currentSessionId"
          @select="handleSelect"
          @rename="handleRename"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="border-t border-gray-200 p-4 dark:border-gray-700">
      <NButton quaternary block :disabled="sessions.length === 0" @click="handleClearAll">
        <template #icon>
          <icon-mdi-delete-sweep />
        </template>
        清空所有对话
      </NButton>
    </div>
  </div>
</template>
