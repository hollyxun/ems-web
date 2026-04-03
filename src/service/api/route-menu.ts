import type { AxiosError } from 'axios';
import type { FlatResponseData } from '@sa/axios';
import { request } from '../request';

/**
 * Route Menu API
 * 路由菜单管理相关接口
 */

/**
 * 重试配置
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000 // 最大10秒
};

/**
 * 计算指数退避延迟时间
 * @param retryCount 当前重试次数
 */
function calculateDelay(retryCount: number): number {
  const delay = Math.min(RETRY_CONFIG.baseDelay * 2 ** retryCount, RETRY_CONFIG.maxDelay);
  // 添加随机抖动，避免重试请求同时到达
  return delay + Math.random() * 100;
}

/**
 * 带指数退避的请求重试（递归实现，避免循环内 await）
 * @param requestFn 请求函数
 * @param shouldRetry 判断是否需要重试的条件
 * @param retryCount 当前重试次数
 * @param lastResult 上一次请求结果
 */
async function retryWithBackoff<T>(
  requestFn: () => Promise<FlatResponseData<App.Service.Response<any>, T>>,
  shouldRetry: (error: AxiosError | null) => boolean = error =>
    error !== null &&
    (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || error?.response?.status === 500),
  retryCount: number = 0,
  _lastResult: FlatResponseData<App.Service.Response<any>, T> | null = null
): Promise<FlatResponseData<App.Service.Response<any>, T>> {
  const result = await requestFn();

  if (result.error === null) {
    return result;
  }

  // 检查是否应该重试
  if (!shouldRetry(result.error) || retryCount >= RETRY_CONFIG.maxRetries) {
    return result;
  }

  const delay = calculateDelay(retryCount);
  // eslint-disable-next-line no-console
  console.warn(
    `[RouteMenuAPI] Retry ${retryCount + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms due to:`,
    result.error?.message
  );

  await new Promise(resolve => {
    setTimeout(resolve, delay);
  });

  return retryWithBackoff(requestFn, shouldRetry, retryCount + 1, result);
}

/**
 * 同步前端路由到后端（带重试）
 * @param data 路由同步请求
 */
export function fetchSyncRoutes(data: Api.RouteMenu.RouteSyncRequest) {
  return retryWithBackoff<Api.RouteMenu.RouteSyncResponse>(() =>
    request<Api.RouteMenu.RouteSyncResponse>({
      url: '/api/v1/route-menu/sync',
      method: 'post',
      data
    })
  );
}

/**
 * 获取用户有权限的路由列表
 */
export function fetchGetUserRoutes() {
  return request<Api.RouteMenu.UserRouteResponse>({
    url: '/api/v1/route-menu/user-routes',
    method: 'get'
  });
}

/**
 * 获取路由菜单列表（管理员）
 * @param params 查询参数
 */
export function fetchGetRouteList(params?: Api.RouteMenu.RouteMenuSearchParams) {
  return request<Api.Common.PageResult<Api.RouteMenu.RouteMenu>>({
    url: '/api/v1/route-menu/list',
    method: 'get',
    params
  });
}

/**
 * 更新路由菜单
 * @param data 更新请求
 */
export function fetchUpdateRoute(data: Api.RouteMenu.RouteMenuUpdateRequest) {
  return request<boolean>({
    url: '/api/v1/route-menu/update',
    method: 'put',
    data
  });
}

/**
 * 绑定角色路由权限
 * @param data 绑定请求
 */
export function fetchBindRoleRoutes(data: Api.RouteMenu.RouteBindRoleRequest) {
  return request<boolean>({
    url: '/api/v1/route-menu/bind-role',
    method: 'post',
    data
  });
}

/**
 * 获取废弃路由列表
 * @param params 查询参数
 */
export function fetchGetObsoleteRoutes(params?: { days?: number; page?: number; pageSize?: number }) {
  return request<Api.Common.PageResult<Api.RouteMenu.RouteObsoleteItem>>({
    url: '/api/v1/route-menu/obsolete-list',
    method: 'get',
    params
  });
}

/**
 * 恢复废弃路由
 * @param data 恢复请求
 */
export function fetchRestoreRoute(data: { id: number }) {
  return request<{ success: boolean; message: string }>({
    url: '/api/v1/route-menu/restore',
    method: 'put',
    data
  });
}

/**
 * 物理删除废弃路由
 * @param data 删除请求
 */
export function fetchDeleteObsoleteRoutes(data: { ids: number[]; forceDays?: number }) {
  return request<boolean>({
    url: '/api/v1/route-menu/delete-obsolete',
    method: 'delete',
    data
  });
}

/**
 * 批量分配路由权限
 * @param data 批量分配请求
 */
export function fetchBatchAssignRoutes(data: Api.RouteMenu.RouteBatchAssignRequest) {
  return request<{ affectedCount: number; message: string }>({
    url: '/api/v1/route-menu/batch-assign',
    method: 'post',
    data
  });
}

/**
 * 获取路由树（用于权限配置）
 */
export function fetchGetRouteTree() {
  return request<Api.RouteMenu.RouteMenu[]>({
    url: '/api/v1/route-menu/tree',
    method: 'get'
  });
}

/**
 * 获取角色已绑定的路由ID列表
 * @param roleId 角色ID
 */
export function fetchGetRoleRouteIds(roleId: number) {
  return request<number[]>({
    url: '/api/v1/route-menu/role-route-ids',
    method: 'get',
    params: { roleId }
  });
}
