/** 通知中心类型定义 */

declare namespace Api.Notification {
  // ============ 通知消息 ============

  /** 通知消息 */
  interface Message {
    id: number;
    type: 'approval' | 'system';
    level: 'info' | 'warning' | 'urgent';
    title: string;
    content: string;
    action: 'submit' | 'approve' | 'reject' | 'transfer' | 'cancel' | '';
    source_module: string;
    source_type: string;
    source_id: number;
    link: string;
    payload: Record<string, any>;
    created_by: number;
    created_at: string;
  }

  /** 通知投递记录 */
  interface Delivery {
    id: number;
    message_id: number;
    receiver_id: number;
    receiver_name: string;
    status: 'unread' | 'read' | 'handled';
    read_at: string | null;
    handled_at: string | null;
    channel: 'inbox' | 'sse';
    created_at: string;
    /** 关联的消息详情 */
    message?: Message;
  }

  /** 未读统计 */
  interface UnreadCount {
    total: number;
    approval: number;
    system: number;
    urgent: number;
  }

  // ============ 请求参数类型 ============

  /** 通知列表查询参数 */
  interface ListParams {
    page?: number;
    pageSize?: number;
    type?: 'approval' | 'system';
    status?: 'unread' | 'read' | 'handled';
    level?: 'info' | 'warning' | 'urgent';
    keyword?: string;
  }

  /** 标记已读请求 */
  interface ReadParams {
    delivery_ids: number[];
  }

  /** 标记已处理请求 */
  interface HandleParams {
    delivery_id: number;
    handled_at?: string;
  }
}
