/**
 * WebSocket 连接管理类
 * 用于权限实时刷新
 */

interface WebSocketMessage {
  type: 'permission_change' | 'heartbeat' | 'pong';
  userId?: number;
  changeType?: 'button' | 'menu' | 'role' | 'all';
  timestamp: number;
}

interface WebSocketOptions {
  url: string;
  token: string;
  onMessage?: (msg: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  maxReconnectAttempts?: number;
}

export class PermissionWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private isManualClose = false;

  constructor(private options: WebSocketOptions) {}

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualClose = false;
    const url = `${this.options.url}?token=${this.options.token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.options.onConnect?.();
        this.startHeartbeat();
      };

      this.ws.onmessage = event => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          this.options.onMessage?.(msg);
        } catch {
          console.warn('[WebSocket] 无法解析消息:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        if (!this.isManualClose) {
          this.options.onDisconnect?.();
          this.reconnect();
        }
      };

      this.ws.onerror = () => {
        console.error('[WebSocket] 连接错误');
        this.ws?.close();
      };
    } catch (err) {
      console.error('[WebSocket] 创建连接失败:', err);
      this.reconnect();
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private reconnect() {
    const maxAttempts = this.options.maxReconnectAttempts ?? 5;
    if (this.reconnectAttempts >= maxAttempts || this.isManualClose) {
      console.warn('[WebSocket] 达到最大重连次数或手动关闭，停止重连');
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts += 1;

    console.log(`[WebSocket] ${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
