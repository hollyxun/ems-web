import { request } from '../request';

/**
 * Casbin 策略管理 API
 */

/** 获取策略列表 */
export function fetchGetPolicyList(params?: Api.Casbin.PolicySearchParams) {
  return request<Api.Casbin.PolicyListResult>({
    url: '/api/v1/casbin/policies',
    method: 'get',
    params
  });
}

/** 创建策略 */
export function fetchCreatePolicy(data: Api.Casbin.CreatePolicyRequest) {
  return request<boolean>({
    url: '/api/v1/casbin/policy',
    method: 'post',
    data
  });
}

/** 更新策略 */
export function fetchUpdatePolicy(data: Api.Casbin.UpdatePolicyRequest) {
  return request<boolean>({
    url: '/api/v1/casbin/policy',
    method: 'put',
    data
  });
}

/** 删除策略 */
export function fetchDeletePolicy(data: Api.Casbin.DeletePolicyRequest) {
  return request<boolean>({
    url: '/api/v1/casbin/policy',
    method: 'delete',
    data
  });
}

/** 批量创建策略 */
export function fetchBatchCreatePolicies(data: Api.Casbin.BatchCreatePoliciesRequest) {
  return request<boolean>({
    url: '/api/v1/casbin/batch',
    method: 'post',
    data
  });
}

/** 批量删除策略 */
export function fetchBatchDeletePolicies(data: Api.Casbin.BatchDeletePoliciesRequest) {
  return request<boolean>({
    url: '/api/v1/casbin/batch',
    method: 'delete',
    data
  });
}

/** 测试权限 */
export function fetchTestEnforce(data: Api.Casbin.TestEnforceRequest) {
  return request<{ allowed: boolean }>({
    url: '/api/v1/casbin/enforce',
    method: 'post',
    data
  });
}

/** 清除权限缓存 */
export function fetchClearCache(data: Api.Casbin.ClearCacheRequest) {
  return request<boolean>({
    url: '/api/v1/casbin/cache/clear',
    method: 'post',
    data
  });
}

/** 获取角色继承关系 */
export function fetchGetGroupingPolicies() {
  return request<Api.Casbin.GroupingPolicy[]>({
    url: '/api/v1/casbin/grouping',
    method: 'get'
  });
}
