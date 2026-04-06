import { request } from '../request';

// ============ 基础数据概览 ============

/**
 * 获取基础数据概览统计
 */
export function fetchGetOverview() {
  return request<Api.BaseData.OverviewStatistics>({
    url: '/api/v1/base-data/overview',
    method: 'get'
  });
}
