import { request } from '../request';

/**
 * 审计日志 API
 */

/** 获取审计日志列表 */
export function fetchGetAuditLogList(params?: Api.Audit.AuditLogSearchParams) {
  return request<Api.Common.PageResult<Api.Audit.AuditLogItem>>({
    url: '/api/v1/audit/logs',
    method: 'get',
    params
  });
}

/** 获取审计日志详情 */
export function fetchGetAuditLogById(id: number) {
  return request<Api.Audit.AuditLogItem>({
    url: `/api/v1/audit/logs/${id}`,
    method: 'get'
  });
}

/** 获取审计统计 */
export function fetchGetAuditStatistics(params?: Api.Audit.AuditStatisticsRequest) {
  return request<Api.Audit.AuditStatisticsResult>({
    url: '/api/v1/audit/statistics',
    method: 'get',
    params
  });
}

/** 清理过期日志 */
export function fetchCleanupAuditLogs(data: Api.Audit.CleanupRequest) {
  return request<Api.Audit.CleanupResult>({
    url: '/api/v1/audit/cleanup',
    method: 'post',
    data
  });
}

/** 获取审计分类列表 */
export function fetchGetAuditCategories() {
  return request<Api.Audit.CategoryOption[]>({
    url: '/api/v1/audit/categories',
    method: 'get'
  });
}

/** 获取审计操作类型列表 */
export function fetchGetAuditActions() {
  return request<Api.Audit.ActionOption[]>({
    url: '/api/v1/audit/actions',
    method: 'get'
  });
}

/** 导出审计日志 */
export function fetchExportAuditLogs(params?: Api.Audit.AuditLogSearchParams) {
  return request<Api.Audit.AuditLogItem[]>({
    url: '/api/v1/audit/export',
    method: 'get',
    params
  });
}
