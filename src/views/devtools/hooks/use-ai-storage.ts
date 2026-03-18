import { computed, ref } from 'vue';
import type { AIConfig, AIStorage, ChatMessage, ChatSession } from '@/typings/api/devtools';

const STORAGE_KEY = 'devtools_ai_storage';
const MAX_SESSIONS = 30;
const MAX_MESSAGES_PER_SESSION = 100;

// 存储数据
const storage = ref<AIStorage>({
  config: null,
  sessions: [],
  currentSessionId: null
});

/**
 * 从LocalStorage加载数据
 */
function loadFromStorage(): void {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      storage.value = JSON.parse(data);
    }
  } catch {
    // 解析失败，使用默认值
    storage.value = {
      config: null,
      sessions: [],
      currentSessionId: null
    };
  }
}

/**
 * 保存到LocalStorage
 */
function saveToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage.value));
  } catch {
    // 保存失败，静默处理
  }
}

// 初始化加载
loadFromStorage();

/**
 * AI存储管理Hook
 */
export function useAIStorage() {
  // 配置相关
  const config = computed(() => storage.value.config);
  const hasConfig = computed(() => Boolean(storage.value.config));

  /**
   * 保存AI配置
   */
  function saveConfig(newConfig: Omit<AIConfig, 'createdAt' | 'updatedAt'>): void {
    const now = Date.now();
    storage.value.config = {
      ...newConfig,
      createdAt: storage.value.config?.createdAt || now,
      updatedAt: now
    };
    saveToStorage();
  }

  /**
   * 清除AI配置
   */
  function clearConfig(): void {
    storage.value.config = null;
    saveToStorage();
  }

  // 会话相关
  const sessions = computed(() => storage.value.sessions);
  const currentSessionId = computed(() => storage.value.currentSessionId);
  const currentSession = computed(
    () => storage.value.sessions.find(s => s.id === storage.value.currentSessionId) || null
  );
  const sessionCount = computed(() => storage.value.sessions.length);

  /**
   * 生成唯一ID
   */
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 检查会话数量是否达到上限
   */
  function isSessionLimitReached(): boolean {
    return storage.value.sessions.length >= MAX_SESSIONS;
  }

  /**
   * 创建新会话
   */
  function createSession(model: string): ChatSession | null {
    if (isSessionLimitReached()) {
      return null;
    }

    const now = Date.now();
    const session: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      model,
      createdAt: now,
      updatedAt: now
    };

    storage.value.sessions.unshift(session);
    storage.value.currentSessionId = session.id;
    saveToStorage();

    return session;
  }

  /**
   * 选择会话
   */
  function selectSession(sessionId: string): void {
    const session = storage.value.sessions.find(s => s.id === sessionId);
    if (session) {
      storage.value.currentSessionId = sessionId;
      saveToStorage();
    }
  }

  /**
   * 重命名会话
   */
  function renameSession(sessionId: string, newTitle: string): void {
    const session = storage.value.sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = newTitle;
      session.updatedAt = Date.now();
      saveToStorage();
    }
  }

  /**
   * 删除会话
   */
  function deleteSession(sessionId: string): void {
    const index = storage.value.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      storage.value.sessions.splice(index, 1);

      // 如果删除的是当前会话，切换到第一个会话或清空
      if (storage.value.currentSessionId === sessionId) {
        storage.value.currentSessionId = storage.value.sessions[0]?.id || null;
      }

      saveToStorage();
    }
  }

  /**
   * 清空所有会话
   */
  function clearAllSessions(): void {
    storage.value.sessions = [];
    storage.value.currentSessionId = null;
    saveToStorage();
  }

  // 消息相关

  /**
   * 检查消息数量是否达到上限
   */
  function isMessageLimitReached(sessionId: string): boolean {
    const session = storage.value.sessions.find(s => s.id === sessionId);
    return session ? session.messages.length >= MAX_MESSAGES_PER_SESSION : false;
  }

  /**
   * 添加消息到当前会话
   */
  function addMessage(message: Omit<ChatMessage, 'role'> & { role: ChatMessage['role'] }): boolean {
    const session = currentSession.value;
    if (!session) {
      return false;
    }

    if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
      return false;
    }

    session.messages.push(message);
    session.updatedAt = Date.now();

    // 如果是第一条用户消息，自动生成标题
    if (session.title === '新对话' && message.role === 'user') {
      session.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
    }

    saveToStorage();
    return true;
  }

  /**
   * 更新最后一条助手消息
   */
  function updateLastAssistantMessage(content: string): void {
    const session = currentSession.value;
    if (!session) {
      return;
    }

    const lastMessage = session.messages[session.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = content;
      session.updatedAt = Date.now();
      saveToStorage();
    }
  }

  /**
   * 获取当前会话的消息列表
   */
  const currentMessages = computed(() => currentSession.value?.messages || []);

  return {
    // 配置
    config,
    hasConfig,
    saveConfig,
    clearConfig,

    // 会话
    sessions,
    currentSessionId,
    currentSession,
    sessionCount,
    isSessionLimitReached,
    createSession,
    selectSession,
    renameSession,
    deleteSession,
    clearAllSessions,

    // 消息
    currentMessages,
    isMessageLimitReached,
    addMessage,
    updateLastAssistantMessage,

    // 常量
    MAX_SESSIONS,
    MAX_MESSAGES_PER_SESSION
  };
}
