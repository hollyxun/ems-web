import { request } from '../request';

/**
 * 获取产品产量列表
 * @param params 查询参数
 */
export function fetchProductOutputList(params: Api.ProductOutput.SearchParams) {
  return request<Api.Common.PageResult<Api.ProductOutput.Item>>({
    url: '/productoutput/list',
    method: 'get',
    params
  });
}

/**
 * 获取所有产品产量
 * @param nodeId 节点ID
 * @param dataType 数据类型
 */
export function fetchProductOutputAll(nodeId?: string, dataType?: string) {
  return request<Api.ProductOutput.Item[]>({
    url: '/productoutput/all',
    method: 'get',
    params: { nodeId, dataType }
  });
}

/**
 * 根据ID获取产品产量详情
 * @param id 产品产量ID
 */
export function fetchProductOutputById(id: number) {
  return request<Api.ProductOutput.Item>({
    url: `/productoutput/${id}`,
    method: 'get'
  });
}

/**
 * 创建产品产量
 * @param data 创建参数
 */
export function fetchCreateProductOutput(data: Api.ProductOutput.CreateParams) {
  return request<void>({
    url: '/productoutput',
    method: 'post',
    data
  });
}

/**
 * 更新产品产量
 * @param data 更新参数
 */
export function fetchUpdateProductOutput(data: Api.ProductOutput.UpdateParams) {
  return request<void>({
    url: `/productoutput/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除产品产量
 * @param id 产品产量ID
 */
export function fetchDeleteProductOutput(id: number) {
  return request<void>({
    url: `/productoutput/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除产品产量
 * @param ids 产品产量ID数组
 */
export function fetchBatchDeleteProductOutput(ids: number[]) {
  return request<void>({
    url: '/productoutput/batch',
    method: 'delete',
    data: { ids }
  });
}