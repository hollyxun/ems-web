/** 公告模块类型定义 */

declare namespace Api.Announcement {
  // ============ 公告状态枚举 ============

  /** 公告状态 */
  type Status = 1 | 2 | 3 | 4; // 1=草稿 2=已发布 3=已撤回 4=已过期

  /** 公告优先级 */
  type Priority = 1 | 2 | 3; // 1=普通 2=重要 3=紧急

  // ============ 公告实体 ============

  /** 公告信息 */
  interface Announcement {
    id: number;
    title: string;
    content: string;
    status: Status;
    priority: Priority;
    publish_at: string | null;
    expire_at: string | null;
    publisher_id: number;
    is_pinned: boolean;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
  }

  /** 公告详情（含阅读状态） */
  interface AnnouncementDetail {
    announcement: Announcement;
    is_read: boolean;
  }

  /** 阅读统计 */
  interface ReadingStats {
    read_count: number;
    unread_count: number;
  }

  /** 未读统计 */
  interface UnreadCount {
    total: number;
    urgent: number;
    important: number;
    normal: number;
  }

  // ============ 请求参数类型 ============

  /** 创建公告请求 */
  interface CreateParams {
    title: string;
    content: string;
    priority?: Priority;
    expire_at?: string;
  }

  /** 发布公告请求 */
  interface PublishParams {
    id: number;
  }

  /** 撤回公告请求 */
  interface WithdrawParams {
    id: number;
  }

  /** 置顶公告请求 */
  interface PinParams {
    id: number;
  }

  /** 标记已读请求 */
  interface MarkReadParams {
    announcement_id: number;
  }

  /** 公告列表查询参数 */
  interface ListParams {
    page?: number;
    pageSize?: number;
    status?: Status;
    priority?: Priority;
    keyword?: string;
  }

  /** 公告详情查询参数 */
  interface DetailParams {
    id: number;
  }
}
