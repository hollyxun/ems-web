/** 公告模块类型定义 */

declare namespace Api.Announcement {
  // ============ 公告状态枚举 ============

  /** 公告状态 */
  type Status = 1 | 2 | 3 | 4; // 1=草稿 2=已发布 3=已撤回 4=已过期

  /** 公告优先级 */
  type Priority = 1 | 2 | 3; // 1=普通 2=重要 3=紧急

  /** 发送目标类型 */
  type TargetType = 1 | 2 | 3 | 4; // 1=全员 2=指定角色 3=指定用户 4=指定组织

  // ============ 公告实体 ============

  /** 公告信息 */
  interface Announcement {
    id: number;
    title: string;
    content: string;
    status: Status;
    priority: Priority;
    category_id: number | null;
    target_type: TargetType;
    target_ids: string; // JSON数组
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
    category_id?: number | null;
    target_type?: TargetType;
    target_ids?: string; // JSON数组
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
    category_id?: number;
    keyword?: string;
  }

  /** 公告详情查询参数 */
  interface DetailParams {
    id: number;
  }

  // ============ 附件相关 ============

  /** 公告附件 */
  interface Attachment {
    id: number;
    announcement_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    created_at: string;
  }

  /** 上传附件参数 */
  interface UploadAttachmentParams {
    announcementId: number;
    file: File;
  }

  /** 附件列表参数 */
  interface AttachmentListParams {
    announcementId: number;
  }

  /** 下载附件参数 */
  interface DownloadAttachmentParams {
    id: number;
  }

  /** 删除附件参数 */
  interface DeleteAttachmentParams {
    id: number;
  }

  // ============ 阅读统计相关 ============

  /** 阅读用户详情 */
  interface ReadUserDetail {
    userId: number;
    username: string;
    nickname: string;
    readAt: string;
    firstReadAt: string;
  }

  /** 未读用户信息 */
  interface UnreadUserInfo {
    userId: number;
    username: string;
    nickname: string;
  }

  /** 详细阅读统计 */
  interface DetailedReadStatistics {
    readUsers: ReadUserDetail[];
    unreadUsers: UnreadUserInfo[];
    readCount: number;
    unreadCount: number;
  }

  // ============ 分类相关 ============

  /** 公告分类 */
  interface Category {
    id: number;
    name: string;
    code: string;
    sort: number;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
  }

  /** 创建分类请求 */
  interface CreateCategoryParams {
    name: string;
    code: string;
    sort?: number;
  }

  /** 更新分类请求 */
  interface UpdateCategoryParams {
    id: number;
    name?: string;
    code?: string;
    sort?: number;
  }

  /** 分类列表查询参数 */
  interface CategoryListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }

  /** 删除分类请求 */
  interface DeleteCategoryParams {
    id: number;
  }

  // ============ 评论相关 ============

  /** 公告评论 */
  interface Comment {
    id: number;
    announcementId: number;
    content: string;
    parentId: number | null;
    userId: number;
    replyToUserId: number | null;
    username: string;
    nickname: string;
    replyToName?: string;
    children?: Comment[];
    created_at: string;
    updated_at: string;
  }

  /** 创建评论请求 */
  interface CreateCommentParams {
    announcementId: number;
    content: string;
    parentId?: number | null;
    replyToUserId?: number | null;
  }

  /** 删除评论请求 */
  interface DeleteCommentParams {
    id: number;
  }

  /** 评论列表查询参数 */
  interface CommentListParams {
    announcementId: number;
    page?: number;
    pageSize?: number;
  }
}
