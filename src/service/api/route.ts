import { request } from '../request';

/**
 * 获取常量路由
 * @returns 常量路由列表
 */
export function fetchGetConstantRoutes() {
  return request<Api.Route.BackendRoute[]>({ url: '/api/v1/route/constantRoutes' });
}

/**
 * 检查路由是否存在
 * @param routeName 路由名称
 * @returns 路由是否存在
 */
export function fetchIsRouteExist(routeName: string) {
  return request<boolean>({ url: '/api/v1/route/isRouteExist', params: { routeName } });
}

/**
 * 获取后端存储的路由版本号
 * @returns 版本号（可能为空）
 */
export function fetchGetRouteVersion() {
  return request<string>({ url: '/api/v1/route/version' });
}

/**
 * 获取用户有权限的路由（基于 Casbin 策略过滤）
 * @returns 用户授权路由
 */
export function fetchGetUserAuthorizedRoutes() {
  return request<Api.Route.UserRoute>({ url: '/api/v1/route/userAuthorizedRoutes' });
}
