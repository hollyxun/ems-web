import { request } from '../request';

const NOTIFICATION_MODULE = '/notification';

type ServiceResult<T> = {
  data?: T | null;
  error?: unknown;
} & Record<string, unknown>;

type NotificationMessageResponse = {
  id: number;
  type: string;
  level: string;
  title: string;
  content: string;
  action: string;
  sourceModule: string;
  sourceType: string;
  sourceId: number;
  link: string;
  payload: Record<string, unknown>;
  createdBy: number;
  createdAt: string;
};

type NotificationDeliveryResponse = {
  id: number;
  messageId: number;
  receiverId: number;
  receiverName: string;
  status: string;
  readAt: string | null;
  handledAt: string | null;
  channel: string;
  createdAt: string;
  message?: NotificationMessageResponse;
};

type UnreadCountResponse = {
  total: number;
  approval: number;
  system: number;
  urgent: number;
};

function toSnakeMessage(msg: NotificationMessageResponse): Api.Notification.Message {
  return {
    id: msg.id,
    type: msg.type as Api.Notification.Message['type'],
    level: msg.level as Api.Notification.Message['level'],
    title: msg.title,
    content: msg.content,
    action: msg.action as Api.Notification.Message['action'],
    source_module: msg.sourceModule,
    source_type: msg.sourceType,
    source_id: msg.sourceId,
    link: msg.link,
    payload: msg.payload,
    created_by: msg.createdBy,
    created_at: msg.createdAt
  };
}

function toSnakeDelivery(delivery: NotificationDeliveryResponse): Api.Notification.Delivery {
  return {
    id: delivery.id,
    message_id: delivery.messageId,
    receiver_id: delivery.receiverId,
    receiver_name: delivery.receiverName,
    status: delivery.status as Api.Notification.Delivery['status'],
    read_at: delivery.readAt,
    handled_at: delivery.handledAt,
    channel: delivery.channel as Api.Notification.Delivery['channel'],
    created_at: delivery.createdAt,
    message: delivery.message ? toSnakeMessage(delivery.message) : undefined
  };
}

function toSnakeUnreadCount(count: UnreadCountResponse): Api.Notification.UnreadCount {
  return {
    total: count.total,
    approval: count.approval,
    system: count.system,
    urgent: count.urgent
  };
}

function mapPageResult<TInput, TOutput>(
  data: Api.Common.PageResult<TInput> | null | undefined,
  mapper: (item: TInput) => TOutput
): Api.Common.PageResult<TOutput> {
  return {
    list: (data?.list || []).map(mapper),
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 10
  };
}

function mapResult<TInput, TOutput>(
  result: ServiceResult<TInput>,
  mapper: (data: TInput) => TOutput
): ServiceResult<TOutput> {
  if (!result.data) {
    return result as ServiceResult<TOutput>;
  }

  return {
    ...result,
    data: mapper(result.data)
  };
}

// ===== 通知列表 =====

export async function fetchNotificationList(params?: Api.Notification.ListParams) {
  const result = (await request<Api.Common.PageResult<NotificationDeliveryResponse>>({
    url: `${NOTIFICATION_MODULE}/list`,
    method: 'get',
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      type: params?.type,
      status: params?.status,
      level: params?.level,
      keyword: params?.keyword
    }
  })) as ServiceResult<Api.Common.PageResult<NotificationDeliveryResponse>>;

  return mapResult(result, data => mapPageResult(data, toSnakeDelivery));
}

// ===== 未读统计 =====

export async function fetchUnreadCount() {
  const result = (await request<UnreadCountResponse>({
    url: `${NOTIFICATION_MODULE}/unread-count`,
    method: 'get'
  })) as ServiceResult<UnreadCountResponse>;

  return mapResult(result, toSnakeUnreadCount);
}

// ===== 标记已读 =====

export function fetchReadNotification(data: Api.Notification.ReadParams) {
  return request({
    url: `${NOTIFICATION_MODULE}/read`,
    method: 'post',
    data: { deliveryIds: data.delivery_ids }
  });
}

// ===== 标记已处理 =====

export function fetchHandleNotification(data: Api.Notification.HandleParams) {
  return request({
    url: `${NOTIFICATION_MODULE}/handle`,
    method: 'post',
    data: { deliveryId: data.delivery_id, handledAt: data.handled_at }
  });
}
