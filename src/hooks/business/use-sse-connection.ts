import { computed, onUnmounted, ref } from 'vue';
import { useRealtimeDataStore } from '@/store/modules/energy/realtime-data';
import { useAuthStore } from '@/store/modules/auth/index';

/**
 * SSE连接选项
 */
interface UseSSEConnectionOptions {
  /** SSE端点URL */
  url?: string;
  /** 工厂ID (必填) */
  factoryId: number;
  /** 车间ID (可选) */
  workshopId?: number;
  /** 是否自动重连 */
  autoReconnect?: boolean;
  /** 初始重连间隔 (毫秒) */
  reconnectInterval?: number;
  /** 最大重连次数 */
  maxReconnectAttempts?: number;
  /** 自定义消息处理 */
  onMessage?: (message: Api.Energy.Realtime.SSEMessage) => void;
  /** 自定义错误处理 */
  onError?: (error: Event) => void;
}

/**
 * SSE连接返回值
 */
interface UseSSEConnectionReturn {
  /** 连接状态 */
  connectionStatus: ReturnType<typeof computed<Api.Energy.Realtime.SSEConnectionStatus>>;
  /** 是否已连接 */
  isConnected: ReturnType<typeof computed<boolean>>;
  /** 重连次数 */
  reconnectAttempts: ReturnType<typeof ref<number>>;
  /** 最后错误 */
  lastError: ReturnType<typeof ref<string | null>>;
  /** 手动连接 */
  connect: () => void;
  /** 手动断开 */
  disconnect: () => void;
  /** 手动重连 */
  reconnect: () => void;
}

/**
 * SSE实时数据连接Hook
 * 支持自动重连、指数退避、JWT认证
 */
export function useSSEConnection(options: UseSSEConnectionOptions): UseSSEConnectionReturn {
  const {
    url = '/api/v1/energy/sse/subscribe',
    factoryId,
    workshopId,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onError
  } = options;

  // Stores
  const realtimeDataStore = useRealtimeDataStore();
  const authStore = useAuthStore();

  // State
  const reconnectAttempts = ref(0);
  const lastError = ref<string | null>(null);
  const currentReconnectInterval = ref(reconnectInterval);

  let eventSource: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Computed
  const connectionStatus = computed(() => realtimeDataStore.connectionStatus);
  const isConnected = computed(() => realtimeDataStore.isConnected);

  /**
   * 计算指数退避间隔
   */
  function calculateBackoff(attempt: number): number {
    // 指数退避: 3s, 6s, 12s, 24s, 48s
    const baseInterval = reconnectInterval;
    const maxInterval = 60000; // 最大60秒
    const backoff = baseInterval * 2 ** attempt;
    return Math.min(backoff, maxInterval);
  }

  /**
   * 处理SSE消息
   */
  function handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data) as Api.Energy.Realtime.SSEMessage;

      switch (message.eventType) {
        case 'connection_ack': {
          realtimeDataStore.setConnectionStatus('connected');
          reconnectAttempts.value = 0;
          currentReconnectInterval.value = reconnectInterval;
          const ackData = message.data as Api.Energy.Realtime.ConnectionAckData;
          realtimeDataStore.addSubscribedChannel(ackData.connectionId);
          break;
        }

        case 'data_update': {
          const batch = message.data as Api.Energy.Realtime.MeterDataBatch;
          realtimeDataStore.updateMeterData(batch.meters);
          break;
        }

        case 'heartbeat': {
          // 心跳消息，重置连接超时
          break;
        }

        case 'alert': {
          const alertData = message.data as Api.Energy.Realtime.AlertData;
          window.console.warn('[SSE Alert]', alertData);
          break;
        }

        case 'meter_status': {
          // 计量点状态变化
          break;
        }

        default:
          window.console.debug('[SSE] Unknown event type:', message.eventType);
      }

      // 调用自定义消息处理
      onMessage?.(message);
    } catch (e) {
      window.console.error('[SSE] Failed to parse message:', e);
    }
  }

  /**
   * 处理连接错误
   */
  function handleError(event: Event) {
    realtimeDataStore.setConnectionStatus('disconnected');
    lastError.value = 'SSE connection error';
    onError?.(event);

    // 自动重连逻辑
    if (autoReconnect && reconnectAttempts.value < maxReconnectAttempts) {
      scheduleReconnect();
    } else if (reconnectAttempts.value >= maxReconnectAttempts) {
      realtimeDataStore.setConnectionStatus('disconnected');
      lastError.value = 'Max reconnect attempts reached';
    }
  }

  /**
   * 安排重连
   */
  function scheduleReconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    reconnectAttempts.value += 1;
    realtimeDataStore.setConnectionStatus('reconnecting');
    currentReconnectInterval.value = calculateBackoff(reconnectAttempts.value - 1);

    window.console.log(
      `[SSE] Reconnecting in ${currentReconnectInterval.value}ms (attempt ${reconnectAttempts.value}/${maxReconnectAttempts})`
    );

    reconnectTimeout = setTimeout(() => {
      connect();
    }, currentReconnectInterval.value);
  }

  /**
   * 建立SSE连接
   */
  function connect() {
    // 清理现有连接
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    realtimeDataStore.setConnectionStatus('connecting');
    lastError.value = null;

    // 构建URL参数
    const params = new URLSearchParams({
      factory_id: String(factoryId)
    });

    if (workshopId) {
      params.append('workshop_id', String(workshopId));
    }

    // EventSource不支持自定义Header，通过URL传递token
    const token = authStore.token;
    if (token) {
      params.append('token', token);
    }

    const fullUrl = `${url}?${params.toString()}`;

    try {
      eventSource = new EventSource(fullUrl);

      eventSource.onopen = () => {
        // 连接打开，等待connection_ack确认
      };

      eventSource.onmessage = handleMessage;
      eventSource.onerror = handleError;
    } catch (e) {
      lastError.value = 'Failed to create EventSource';
      window.console.error('[SSE] Failed to create EventSource:', e);
      realtimeDataStore.setConnectionStatus('disconnected');
    }
  }

  /**
   * 断开SSE连接
   */
  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    realtimeDataStore.setConnectionStatus('disconnected');
    reconnectAttempts.value = 0;
  }

  /**
   * 手动重连
   */
  function reconnect() {
    disconnect();
    connect();
  }

  // 组件卸载时自动断开连接
  onUnmounted(() => {
    disconnect();
  });

  // 自动连接
  connect();

  return {
    connectionStatus,
    isConnected,
    reconnectAttempts,
    lastError,
    connect,
    disconnect,
    reconnect
  };
}

// 导出类型
export type { UseSSEConnectionOptions, UseSSEConnectionReturn };
