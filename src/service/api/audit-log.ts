import { request } from '../request';

// Types
export interface AuditLog {
  id: number;
  createdAt: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  latency: number;
  agent: string;
  body: string;
  resp: string;
  userId: number;
  action: string;
  module: string;
  targetId: string;
}

export interface AuditLogSearchParams {
  page: number;
  pageSize: number;
  userId?: number;
  method?: string;
  path?: string;
  startTime?: string;
  endTime?: string;
  status?: number;
}

export interface AuditLogStatistics {
  total: number;
  byMethod: { method: string; count: number }[];
  topUsers: { userId: number; count: number }[];
  startDate: string;
  endDate: string;
}

// API Functions

/** Get audit logs with filtering */
export function fetchGetAuditLogs(params: AuditLogSearchParams) {
  return request<{ list: AuditLog[]; total: number }>({
    url: '/auditLog/list',
    method: 'get',
    params
  });
}

/** Get audit log detail */
export function fetchGetAuditLogDetail(id: number) {
  return request<AuditLog>({
    url: '/auditLog/detail',
    method: 'get',
    params: { id }
  });
}

/** Get audit log statistics */
export function fetchGetAuditLogStatistics(startDate: string, endDate: string) {
  return request<AuditLogStatistics>({
    url: '/auditLog/statistics',
    method: 'get',
    params: { startDate, endDate }
  });
}

/** Get current user's operation history */
export function fetchGetMyHistory(page: number, pageSize: number) {
  return request<{ list: AuditLog[]; total: number }>({
    url: '/auditLog/myHistory',
    method: 'get',
    params: { page, pageSize }
  });
}

/** Manual cleanup of old logs */
export function fetchCleanupAuditLogs(retentionDays: number) {
  return request<{ deletedCount: number }>({
    url: '/auditLog/cleanup',
    method: 'post',
    params: { retentionDays }
  });
}