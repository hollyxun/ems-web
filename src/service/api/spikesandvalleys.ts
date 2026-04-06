import { request } from '../request';

/** 时段类型选项 */
export const timeTypeOptions = [
  { label: '尖', value: '1' },
  { label: '峰', value: '2' },
  { label: '平', value: '3' },
  { label: '谷', value: '4' }
];

/** 方案类型选项 */
export const schemeTypeOptions = [
  { label: '默认', value: '1' },
  { label: '后勤', value: '2' },
  { label: '外部', value: '3' }
];

/**
 * 获取尖峰平谷方案列表
 * @param params 查询参数
 */
export function fetchSpikesAndValleysList(params: Api.SpikesAndValleys.SearchParams) {
  return request<Api.Common.PageResult<Api.SpikesAndValleys.SchemeVO>>({
    url: '/spikesandvalleys/list',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取尖峰平谷方案详情
 * @param id 方案ID
 */
export function fetchSpikesAndValleysById(id: number) {
  return request<Api.SpikesAndValleys.SchemeVO>({
    url: `/spikesandvalleys/${id}`,
    method: 'get'
  });
}

/**
 * 创建尖峰平谷方案
 * @param data 创建参数
 */
export function fetchCreateSpikesAndValleys(data: Api.SpikesAndValleys.CreateParams) {
  return request({
    url: '/spikesandvalleys',
    method: 'post',
    data
  });
}

/**
 * 更新尖峰平谷方案
 * @param data 更新参数
 */
export function fetchUpdateSpikesAndValleys(data: Api.SpikesAndValleys.UpdateParams) {
  return request({
    url: `/spikesandvalleys/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除尖峰平谷方案
 * @param id 方案ID
 */
export function fetchDeleteSpikesAndValleys(id: number) {
  return request({
    url: `/spikesandvalleys/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除尖峰平谷方案
 * @param ids 方案ID数组
 */
export function fetchBatchDeleteSpikesAndValleys(ids: number[]) {
  return request({
    url: '/spikesandvalleys/batch',
    method: 'delete',
    data: ids
  });
}
