import { request } from '../request';

/**
 * 获取常量路由
 * @returns 常量路由列表
 */
export function fetchGetConstantRoutes() {
  return request<Api.Route.BackendRoute[]>({ url: '/api/v1/route/constantRoutes' });
}

/**
 * 获取用户路由
 * @returns 用户路由数据和首页路由
 */
export function fetchGetUserRoutes() {
  return request<Api.Route.UserRoute>({ url: '/api/v1/route/userRoutes' });
}

/**
 * 检查路由是否存在
 * @param routeName 路由名称
 * @returns 路由是否存在
 */
export function fetchIsRouteExist(routeName: string) {
  return request<boolean>({ url: '/api/v1/route/isRouteExist', params: { routeName } });
}
