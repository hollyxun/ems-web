import { request } from '../request';

/**
 * 获取能源指标列表
 * @param params 查询参数
 */
export function fetchEnergyIndicatorsList(params: Api.EnergyIndicators.SearchParams) {
  return request<Api.Common.PageResult<Api.EnergyIndicators.Item>>({
    url: '/energyIndicators/list',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取能源指标详情
 * @param id 指标ID
 */
export function fetchEnergyIndicatorsById(id: number) {
  return request<Api.EnergyIndicators.Item>({
    url: `/energyIndicators/${id}`,
    method: 'get'
  });
}

/**
 * 根据节点ID获取能源指标
 * @param nodeId 节点ID
 */
export function fetchEnergyIndicatorsByNodeId(nodeId: string) {
  return request<Api.EnergyIndicators.Item>({
    url: `/energyIndicators/node/${nodeId}`,
    method: 'get'
  });
}

/**
 * 创建能源指标
 * @param data 创建参数
 */
export function fetchCreateEnergyIndicators(data: Api.EnergyIndicators.CreateParams) {
  return request({
    url: '/energyIndicators',
    method: 'post',
    data
  });
}

/**
 * 更新能源指标
 * @param data 更新参数
 */
export function fetchUpdateEnergyIndicators(data: Api.EnergyIndicators.UpdateParams) {
  return request({
    url: `/energyIndicators/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除能源指标
 * @param id 指标ID
 */
export function fetchDeleteEnergyIndicators(id: number) {
  return request({
    url: `/energyIndicators/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除能源指标
 * @param ids 指标ID数组
 */
export function fetchBatchDeleteEnergyIndicators(ids: number[]) {
  return request({
    url: '/energyIndicators/batch',
    method: 'delete',
    data: ids
  });
}
