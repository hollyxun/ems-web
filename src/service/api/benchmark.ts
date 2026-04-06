import { request } from '../request';

/**
 * 获取标杆列表
 * @param params 查询参数
 */
export function fetchBenchmarkList(params: Api.Benchmark.SearchParams) {
  return request<Api.Common.PageResult<Api.Benchmark.Item>>({
    url: '/benchmark/list',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取标杆详情
 * @param id 标杆ID
 */
export function fetchBenchmarkById(id: number) {
  return request<Api.Benchmark.Item>({
    url: `/benchmark/${id}`,
    method: 'get'
  });
}

/**
 * 创建标杆
 * @param data 创建参数
 */
export function fetchCreateBenchmark(data: Api.Benchmark.CreateParams) {
  return request<void>({
    url: '/benchmark',
    method: 'post',
    data
  });
}

/**
 * 更新标杆
 * @param data 更新参数
 */
export function fetchUpdateBenchmark(data: Api.Benchmark.UpdateParams) {
  return request<void>({
    url: `/benchmark/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除标杆
 * @param id 标杆ID
 */
export function fetchDeleteBenchmark(id: number) {
  return request<void>({
    url: `/benchmark/${id}`,
    method: 'delete'
  });
}