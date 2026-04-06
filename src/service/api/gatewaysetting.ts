import { request } from '../request';

/**
 * 获取网关配置列表
 * @param params 查询参数
 */
export function fetchGatewaySettingList(params: Api.GatewaySetting.SearchParams) {
  return request<Api.Common.PageResult<Api.GatewaySetting.Item>>({
    url: '/gatewaySetting/list',
    method: 'get',
    params
  });
}

/**
 * 获取所有网关配置（用于下拉选择）
 */
export function fetchGatewaySettingAll() {
  return request<Api.GatewaySetting.Item[]>({
    url: '/gatewaySetting/all',
    method: 'get'
  });
}

/**
 * 根据ID获取网关配置
 * @param id 网关ID
 */
export function fetchGatewaySettingById(id: number) {
  return request<Api.GatewaySetting.Item>({
    url: `/gatewaySetting/${id}`,
    method: 'get'
  });
}

/**
 * 创建网关配置
 * @param data 创建参数
 */
export function fetchCreateGatewaySetting(data: Api.GatewaySetting.CreateParams) {
  return request<void>({
    url: '/gatewaySetting',
    method: 'post',
    data
  });
}

/**
 * 更新网关配置
 * @param data 更新参数
 */
export function fetchUpdateGatewaySetting(data: Api.GatewaySetting.UpdateParams) {
  return request<void>({
    url: `/gatewaySetting/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除网关配置
 * @param id 网关ID
 */
export function fetchDeleteGatewaySetting(id: number) {
  return request<void>({
    url: `/gatewaySetting/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除网关配置
 * @param ids 网关ID数组
 */
export function fetchBatchDeleteGatewaySetting(ids: number[]) {
  return request<void>({
    url: '/gatewaySetting/batch',
    method: 'delete',
    data: ids
  });
}