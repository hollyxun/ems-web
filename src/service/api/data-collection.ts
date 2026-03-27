import { request } from '../request';

// ============ Manual Entry ============

/**
 * 创建人工录入
 */
export function fetchCreateManualEntry(data: Api.DataCollection.ManualEntryCreate) {
  return request<Api.DataCollection.ManualEntry>({
    url: '/api/v1/energy/manual-entry/create',
    method: 'post',
    data
  });
}

/**
 * 更新人工录入
 */
export function fetchUpdateManualEntry(data: Api.DataCollection.ManualEntryUpdate) {
  return request({
    url: '/api/v1/energy/manual-entry/update',
    method: 'put',
    data
  });
}

/**
 * 提交审批
 */
export function fetchSubmitManualEntry(id: number) {
  return request({
    url: '/api/v1/energy/manual-entry/submit',
    method: 'post',
    params: { id }
  });
}

/**
 * 审批通过
 */
export function fetchApproveManualEntry(data: Api.DataCollection.ApprovalRequest) {
  return request({
    url: '/api/v1/energy/manual-entry/approve',
    method: 'post',
    data
  });
}

/**
 * 审批拒绝
 */
export function fetchRejectManualEntry(data: Api.DataCollection.ApprovalRequest) {
  return request({
    url: '/api/v1/energy/manual-entry/reject',
    method: 'post',
    data
  });
}

/**
 * 获取录入详情
 */
export function fetchGetManualEntry(id: number) {
  return request<Api.DataCollection.ManualEntry>({
    url: '/api/v1/energy/manual-entry/detail',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取录入列表
 */
export function fetchGetManualEntryList(params: Api.DataCollection.ManualEntryQuery) {
  return request<{ list: Api.DataCollection.ManualEntry[]; total: number }>({
    url: '/api/v1/energy/manual-entry/list',
    method: 'get',
    params
  });
}

/**
 * 获取待审批列表
 */
export function fetchGetPendingApprovals(page = 1, pageSize = 20) {
  return request<{ list: Api.DataCollection.ManualEntry[]; total: number }>({
    url: '/api/v1/energy/manual-entry/pending',
    method: 'get',
    params: { page, pageSize }
  });
}

/**
 * 删除录入
 */
export function fetchDeleteManualEntry(id: number) {
  return request({
    url: '/api/v1/energy/manual-entry/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * 获取审计日志
 */
export function fetchGetEntryAuditLog(entryId: number) {
  return request<Api.DataCollection.EntryAuditLog[]>({
    url: '/api/v1/energy/manual-entry/audit-log',
    method: 'get',
    params: { entryId }
  });
}

/**
 * 按计量点查询录入
 */
export function fetchGetEntriesByMeter(meterId: number, startTime: string, endTime: string) {
  return request<Api.DataCollection.ManualEntry[]>({
    url: '/api/v1/energy/manual-entry/by-meter',
    method: 'get',
    params: { meterId, startTime, endTime }
  });
}

// ============ Validation Rules ============

/**
 * 获取验证规则
 */
export function fetchGetValidationRules(meterId?: number, energyMedium?: string) {
  return request<Api.DataCollection.ValidationRule[]>({
    url: '/api/v1/energy/validation/rules',
    method: 'get',
    params: { meterId, energyMedium }
  });
}

/**
 * 创建验证规则
 */
export function fetchCreateValidationRule(data: Api.DataCollection.ValidationRuleRequest) {
  return request<Api.DataCollection.ValidationRule>({
    url: '/api/v1/energy/validation/rules',
    method: 'post',
    data
  });
}

/**
 * 更新验证规则
 */
export function fetchUpdateValidationRule(data: Api.DataCollection.ValidationRuleRequest) {
  return request({
    url: '/api/v1/energy/validation/rules',
    method: 'put',
    data
  });
}

/**
 * 删除验证规则
 */
export function fetchDeleteValidationRule(id: number) {
  return request({
    url: '/api/v1/energy/validation/rules',
    method: 'delete',
    params: { id }
  });
}

/**
 * 验证数据点
 */
export function fetchValidateDataPoint(data: {
  meterId: number;
  value: number;
  timestamp: string;
  energyMedium: string;
}) {
  return request<{ valid: boolean; result?: Api.DataCollection.ValidationResult }>({
    url: '/api/v1/energy/validation/validate',
    method: 'post',
    data
  });
}

// ============ Data Aggregation ============

/**
 * 获取小时聚合数据
 */
export function fetchGetHourlyAggregation(meterId: number, date?: string) {
  return request<Api.DataCollection.AggregatedPoint[]>({
    url: '/api/v1/energy/aggregation/hourly',
    method: 'get',
    params: { meterId, date }
  });
}

/**
 * 获取日聚合数据
 */
export function fetchGetDailyAggregation(meterId: number, year: number, month: number) {
  return request<Api.DataCollection.AggregatedPoint[]>({
    url: '/api/v1/energy/aggregation/daily',
    method: 'get',
    params: { meterId, year, month }
  });
}

/**
 * 获取月聚合数据
 */
export function fetchGetMonthlyAggregation(meterId: number, year: number) {
  return request<Api.DataCollection.AggregatedPoint[]>({
    url: '/api/v1/energy/aggregation/monthly',
    method: 'get',
    params: { meterId, year }
  });
}

/**
 * 多计量点统计
 */
export function fetchGetMultiMeterStats(data: {
  meterIds: number[];
  startTime: string;
  endTime: string;
  interval?: string;
}) {
  return request<Api.DataCollection.MultiMeterStats[]>({
    url: '/api/v1/energy/aggregation/multi',
    method: 'post',
    data
  });
}

/**
 * 自定义聚合查询
 */
export function fetchGetAggregationByInterval(params: Api.DataCollection.AggregationQueryRequest) {
  return request<Api.DataCollection.AggregatedTimeSeries>({
    url: '/api/v1/energy/aggregation/query',
    method: 'get',
    params
  });
}

// ============ Real-Time Data Query ============

/**
 * 实时数据查询
 */
export function fetchRealTimeData(params: Api.DataCollection.RealTimeQueryRequest) {
  return request<Api.DataCollection.DataPoint[]>({
    url: '/api/v1/energy/data/query/realtime',
    method: 'get',
    params
  });
}
