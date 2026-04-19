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
