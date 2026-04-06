import { request } from '../request';

// ============ 报警历史 API ============

export function fetchAlarmHistoryList(params: Api.AlarmHistory.SearchParams) {
  return request<Api.AlarmHistory.ListResponse>({
    url: '/alarm/history/list',
    method: 'get',
    params
  });
}

export function fetchAlarmHistoryById(id: string) {
  return request<Api.AlarmHistory.AlarmHistoryItem>({
    url: `/alarm/history/${id}`,
    method: 'get'
  });
}

export function fetchHandleAlarm(data: Api.AlarmHistory.HandleParams) {
  return request({
    url: '/alarm/history/handle',
    method: 'put',
    data
  });
}

export function fetchBatchHandleAlarm(data: Api.AlarmHistory.BatchHandleParams) {
  return request({
    url: '/alarm/history/batch-handle',
    method: 'put',
    data
  });
}

// ============ 报警设置 API ============

export function fetchAlarmItemList(params: Api.AlarmItem.SearchParams) {
  return request<Api.AlarmItem.ListResponse>({
    url: '/alarm/item/list',
    method: 'get',
    params
  });
}

export function fetchAlarmItemById(id: string) {
  return request<Api.AlarmItem.Item>({
    url: `/alarm/item/${id}`,
    method: 'get'
  });
}

export function fetchCreateAlarmItem(data: Api.AlarmItem.CreateParams) {
  return request<Api.AlarmItem.Item>({
    url: '/alarm/item/create',
    method: 'post',
    data
  });
}

export function fetchUpdateAlarmItem(data: Api.AlarmItem.UpdateParams) {
  return request<Api.AlarmItem.Item>({
    url: '/alarm/item/update',
    method: 'put',
    data
  });
}

export function fetchDeleteAlarmItem(id: string) {
  return request({
    url: `/alarm/item/${id}`,
    method: 'delete'
  });
}

export function fetchBatchDeleteAlarmItems(ids: string[]) {
  return request({
    url: '/alarm/item/batch-delete',
    method: 'post',
    data: { ids }
  });
}

export function fetchUpdateAlarmStartStop(data: { ids: string[]; startStop: string }) {
  return request({
    url: '/alarm/item/start-stop',
    method: 'put',
    data
  });
}

export function fetchAlarmItemsByPointId(pointId: string) {
  return request<Api.AlarmItem.Item[]>({
    url: `/alarm/item/by-point/${pointId}`,
    method: 'get'
  });
}

export function fetchAlarmSettingCount() {
  return request<{ count: number }>({
    url: '/alarm/item/setting-count',
    method: 'get'
  });
}

// ============ 报警限值类型 API ============

export function fetchAlarmLimitTypeList(params: Api.AlarmLimitType.SearchParams) {
  return request<Api.AlarmLimitType.ListResponse>({
    url: '/alarm/limit-type/list',
    method: 'get',
    params
  });
}

export function fetchAllAlarmLimitTypes() {
  return request<Api.AlarmLimitType.Item[]>({
    url: '/alarm/limit-type/all',
    method: 'get'
  });
}

export function fetchAlarmLimitTypeById(id: number) {
  return request<Api.AlarmLimitType.Item>({
    url: `/alarm/limit-type/${id}`,
    method: 'get'
  });
}

export function fetchCreateAlarmLimitType(data: Api.AlarmLimitType.CreateParams) {
  return request<Api.AlarmLimitType.Item>({
    url: '/alarm/limit-type/create',
    method: 'post',
    data
  });
}

export function fetchUpdateAlarmLimitType(data: Api.AlarmLimitType.UpdateParams) {
  return request<Api.AlarmLimitType.Item>({
    url: '/alarm/limit-type/update',
    method: 'put',
    data
  });
}

export function fetchDeleteAlarmLimitType(id: number) {
  return request({
    url: `/alarm/limit-type/${id}`,
    method: 'delete'
  });
}