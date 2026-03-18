import { request } from '@/service/request';
import type { ServerStatusResponse, VersionInfoResponse } from '@/typings/api/devtools';

/**
 * 获取服务器状态
 * @returns 服务器状态数据
 */
export function fetchServerStatus() {
  return request<ServerStatusResponse>({ url: '/api/v1/devtools/server/status' });
}

/**
 * 获取版本信息
 * @returns 版本信息数据
 */
export function fetchVersionInfo() {
  return request<VersionInfoResponse>({ url: '/api/v1/devtools/server/version' });
}
