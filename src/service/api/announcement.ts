import { request } from '../request';

const ANNOUNCEMENT_MODULE = '/announcement';

/**
 * 创建公告（草稿）
 * @param data 公告信息
 */
export function fetchCreateAnnouncement(data: Api.Announcement.CreateParams) {
  return request<Api.Announcement.Announcement>({
    url: `${ANNOUNCEMENT_MODULE}/create`,
    method: 'post',
    data
  });
}

/**
 * 发布公告
 * @param id 公告ID
 */
export function fetchPublishAnnouncement(id: number) {
  return request<boolean>({
    url: `${ANNOUNCEMENT_MODULE}/publish`,
    method: 'post',
    data: { id }
  });
}

/**
 * 获取公告列表
 * @param params 查询参数
 */
export function fetchGetAnnouncementList(params: Api.Announcement.ListParams) {
  return request<Api.Common.PageResult<Api.Announcement.Announcement>>({
    url: `${ANNOUNCEMENT_MODULE}/list`,
    method: 'get',
    params
  });
}

/**
 * 获取公告详情
 * @param id 公告ID
 */
export function fetchGetAnnouncementDetail(id: number) {
  return request<Api.Announcement.AnnouncementDetail>({
    url: `${ANNOUNCEMENT_MODULE}/detail`,
    method: 'get',
    params: { id }
  });
}

/**
 * 撤回公告
 * @param id 公告ID
 */
export function fetchWithdrawAnnouncement(id: number) {
  return request<boolean>({
    url: `${ANNOUNCEMENT_MODULE}/withdraw`,
    method: 'post',
    data: { id }
  });
}

/**
 * 置顶公告
 * @param id 公告ID
 */
export function fetchPinAnnouncement(id: number) {
  return request<boolean>({
    url: `${ANNOUNCEMENT_MODULE}/pin`,
    method: 'post',
    data: { id }
  });
}

/**
 * 取消置顶
 * @param id 公告ID
 */
export function fetchUnpinAnnouncement(id: number) {
  return request<boolean>({
    url: `${ANNOUNCEMENT_MODULE}/unpin`,
    method: 'post',
    data: { id }
  });
}

/**
 * 标记公告已读
 * @param announcementId 公告ID
 */
export function fetchMarkAnnouncementRead(announcementId: number) {
  return request<boolean>({
    url: `${ANNOUNCEMENT_MODULE}/read`,
    method: 'post',
    data: { announcement_id: announcementId }
  });
}

/**
 * 获取未读公告数量
 */
export function fetchGetAnnouncementUnreadCount() {
  return request<Api.Announcement.UnreadCount>({
    url: `${ANNOUNCEMENT_MODULE}/unread-count`,
    method: 'get'
  });
}

/**
 * 上传公告附件
 * @param announcementId 公告ID
 * @param file 文件
 */
export function fetchUploadAnnouncementAttachment(announcementId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<Api.Announcement.Attachment>({
    url: `${ANNOUNCEMENT_MODULE}/upload-attachment`,
    method: 'post',
    data: formData,
    params: { announcementId }
  });
}

/**
 * 获取公告附件列表
 * @param announcementId 公告ID
 */
export function fetchGetAnnouncementAttachments(announcementId: number) {
  return request<Api.Announcement.Attachment[]>({
    url: `${ANNOUNCEMENT_MODULE}/attachments`,
    method: 'get',
    params: { announcementId }
  });
}

/**
 * 下载公告附件
 * @param id 附件ID
 */
export function getAnnouncementAttachmentDownloadUrl(id: number) {
  return `/api/v1${ANNOUNCEMENT_MODULE}/download-attachment?id=${id}`;
}

/**
 * 删除公告附件
 * @param id 附件ID
 */
export function fetchDeleteAnnouncementAttachment(id: number) {
  return request<boolean>({
    url: `${ANNOUNCEMENT_MODULE}/delete-attachment`,
    method: 'post',
    data: { id }
  });
}

/**
 * 获取公告阅读统计详情
 * @param id 公告ID
 */
export function fetchGetReadStatistics(id: number) {
  return request<Api.Announcement.DetailedReadStatistics>({
    url: `${ANNOUNCEMENT_MODULE}/read-statistics`,
    method: 'get',
    params: { id }
  });
}

// ============ 公告分类 API ============

const CATEGORY_MODULE = '/announcement-category';

/**
 * 创建公告分类
 * @param data 分类信息
 */
export function fetchCreateAnnouncementCategory(data: Api.Announcement.CreateCategoryParams) {
  return request<Api.Announcement.Category>({
    url: `${CATEGORY_MODULE}/create`,
    method: 'post',
    data
  });
}

/**
 * 获取公告分类列表（分页）
 * @param params 查询参数
 */
export function fetchGetAnnouncementCategoryList(params: Api.Announcement.CategoryListParams) {
  return request<Api.Common.PageResult<Api.Announcement.Category>>({
    url: `${CATEGORY_MODULE}/list`,
    method: 'get',
    params
  });
}

/**
 * 获取所有公告分类（下拉选择）
 */
export function fetchGetAllAnnouncementCategories() {
  return request<Api.Announcement.Category[]>({
    url: `${CATEGORY_MODULE}/all`,
    method: 'get'
  });
}

/**
 * 更新公告分类
 * @param data 分类信息
 */
export function fetchUpdateAnnouncementCategory(data: Api.Announcement.UpdateCategoryParams) {
  return request<boolean>({
    url: `${CATEGORY_MODULE}/update`,
    method: 'post',
    data
  });
}

/**
 * 删除公告分类
 * @param id 分类ID
 */
export function fetchDeleteAnnouncementCategory(id: number) {
  return request<boolean>({
    url: `${CATEGORY_MODULE}/delete`,
    method: 'post',
    data: { id }
  });
}

// ============ 公告评论 API ============

const COMMENT_MODULE = '/announcement-comment';

/**
 * 创建评论
 * @param data 评论信息
 */
export function fetchCreateComment(data: Api.Announcement.CreateCommentParams) {
  return request<Api.Announcement.Comment>({
    url: `${COMMENT_MODULE}/create`,
    method: 'post',
    data
  });
}

/**
 * 删除评论
 * @param id 评论ID
 */
export function fetchDeleteComment(id: number) {
  return request<boolean>({
    url: `${COMMENT_MODULE}/delete`,
    method: 'post',
    data: { id }
  });
}

/**
 * 获取评论列表（树形结构）
 * @param params 查询参数
 */
export function fetchGetCommentList(params: Api.Announcement.CommentListParams) {
  return request<Api.Common.PageResult<Api.Announcement.Comment>>({
    url: `${COMMENT_MODULE}/list`,
    method: 'get',
    params
  });
}

// ============ 公告预览 API ============

const PREVIEW_MODULE = '/announcement-preview';

/**
 * 预览目标用户数量
 * @param targetType 发送目标类型
 * @param targetIds 目标ID列表(JSON字符串)
 */
export function fetchPreviewTargetCount(targetType: number, targetIds: string) {
  return request<{ count: number; users: { id: number; name: string }[] }>({
    url: `${PREVIEW_MODULE}/target-count`,
    method: 'get',
    params: { targetType, targetIds }
  });
}
