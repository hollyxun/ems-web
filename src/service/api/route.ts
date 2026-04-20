import { request } from '../request';

/**
 * Route API
 * 路由相关接口（新架构：路由/菜单分离）
 */

/**
 * 获取常量路由
 */
export function fetchGetConstantRoutes() {
  return request<Api.Route.BackendRoute[]>({ url: '/api/v1/route/constantRoutes' });
}

/**
 * 检查路由是否存在
 */
export function fetchIsRouteExist(routeName: string) {
  return request<boolean>({ url: '/api/v1/route/isRouteExist', params: { routeName } });
}

/**
 * 获取用户有权限的路由
 */
export function fetchGetUserAuthorizedRoutes() {
  return request<Api.Route.UserRoute>({ url: '/api/v1/route/userAuthorizedRoutes' });
}

/**
 * 同步前端路由到后端（新架构）
 */
export function fetchSyncRoutes(data: Api.Route.RouteSyncRequest) {
  return request<Api.Route.RouteSyncResponse>({
    url: '/api/v1/route/sync',
    method: 'post',
    data
  });
}
