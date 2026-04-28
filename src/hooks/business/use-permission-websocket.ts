/**
 * 权限 WebSocket Hook
 * 用于实时刷新用户权限
 */

import { fetchGetUserButtons } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { PermissionWebSocket } from '@/utils/websocket';

let wsInstance: PermissionWebSocket | null = null;

export function usePermissionWebSocket() {
  const authStore = useAuthStore();

  function getWebSocketUrl(): string {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}/api/v1/websocket/connect`;
  }

  function connect() {
    if (!authStore.token) {
      console.warn('[PermissionWS] 无 token，跳过连接');
      return;
    }

    if (wsInstance?.isConnected()) {
      console.log('[PermissionWS] 已连接，跳过');
      return;
    }

    wsInstance = new PermissionWebSocket({
      url: getWebSocketUrl(),
      token: authStore.token,
      onMessage: async msg => {
        if (msg.type === 'permission_change') {
          console.log('[PermissionWS] 收到权限变更通知:', msg.changeType);
          await refreshPermissions();
        }
      },
      onConnect: () => {
        console.log('[PermissionWS] 连接成功');
      },
      onDisconnect: () => {
        console.log('[PermissionWS] 连接断开');
      },
      maxReconnectAttempts: 5
    });

    wsInstance.connect();
  }

  async function refreshPermissions() {
    try {
      const { data: buttons, error } = await fetchGetUserButtons();
      if (!error && buttons) {
        authStore.userInfo.buttons = buttons;
        console.log('[PermissionWS] 按钮权限已刷新:', buttons);
      }
    } catch (err) {
      console.error('[PermissionWS] 刷新权限失败:', err);
    }
  }

  function disconnect() {
    if (wsInstance) {
      wsInstance.disconnect();
      wsInstance = null;
    }
  }

  return { connect, disconnect, refreshPermissions };
}
