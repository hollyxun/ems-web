import { request } from '../request';

/**
 * 获取集团看板数据
 * @param orgId 组织ID
 */
export function fetchGroupDashboard(orgId: string) {
  return request<Api.Dashboard.GroupDashboardData>({
    url: '/dashboard/group',
    method: 'get',
    params: { orgId }
  });
}

/**
 * 获取工厂看板数据
 * @param factoryId 工厂ID
 */
export function fetchFactoryDashboard(factoryId: string) {
  return request<Api.Dashboard.FactoryDashboardData>({
    url: '/dashboard/factory',
    method: 'get',
    params: { factoryId }
  });
}

/**
 * 获取班组看板数据
 * @param teamId 班组ID
 */
export function fetchTeamDashboard(teamId: string) {
  return request<Api.Dashboard.TeamDashboardData>({
    url: '/dashboard/team',
    method: 'get',
    params: { teamId }
  });
}

/**
 * 获取趋势数据
 * @param params 查询参数
 */
export function fetchTrendData(params: Api.Dashboard.TrendDataParams) {
  return request<Api.Dashboard.TrendData>({
    url: '/dashboard/trend',
    method: 'get',
    params
  });
}

/**
 * 获取峰平谷分布
 * @param orgId 组织ID
 * @param period 周期
 */
export function fetchPeakValleyDistribution(orgId: string, period: 'day' | 'month' = 'day') {
  return request<Api.Dashboard.PeakValleyDistribution>({
    url: '/dashboard/peak-valley',
    method: 'get',
    params: { orgId, period }
  });
}

/**
 * 获取告警列表
 * @param params 查询参数
 */
export function fetchAlerts(params: Api.Dashboard.AlertQueryParams) {
  return request<Api.Dashboard.AlertListResponse>({
    url: '/alert/list',
    method: 'get',
    params
  });
}

/**
 * 确认告警
 * @param alertId 告警ID
 * @param remark 备注
 */
export function confirmAlert(alertId: string, remark?: string) {
  return request({
    url: '/alert/confirm',
    method: 'post',
    data: { alertId, remark }
  });
}

/**
 * 忽略告警
 * @param alertId 告警ID
 * @param remark 备注
 */
export function ignoreAlert(alertId: string, remark?: string) {
  return request({
    url: '/alert/ignore',
    method: 'post',
    data: { alertId, remark }
  });
}

// ===== 自定义看板 API =====

/** 保存看板配置 */
export function fetchSaveDashboardConfig(data: Api.Dashboard.SaveDashboardConfigParams) {
  return request({ url: '/dashboard/config/save', method: 'post', data });
}

/** 获取看板配置 */
export function fetchGetDashboardConfig(params: Api.Dashboard.GetDashboardConfigParams) {
  return request({ url: '/dashboard/config/get', method: 'get', params });
}

/** 删除看板配置 */
export function fetchDeleteDashboardConfig(data: Api.Dashboard.DeleteDashboardConfigParams) {
  return request({ url: '/dashboard/config/delete', method: 'delete', data });
}

/** 设为默认看板 */
export function fetchSetDefaultDashboard(data: Api.Dashboard.SetDefaultDashboardParams) {
  return request({ url: '/dashboard/config/set-default', method: 'post', data });
}

/** 看板列表 */
export function fetchDashboardConfigList(params?: Api.Dashboard.DashboardConfigListParams) {
  return request({ url: '/dashboard/config/list', method: 'get', params });
}

/** 组件市场 */
export function fetchDashboardComponents() {
  return request({ url: '/dashboard/components', method: 'get' });
}

/** 看板数据代理 */
export function fetchDashboardData(params: Api.Dashboard.DashboardDataParams) {
  return request({ url: '/dashboard/data', method: 'get', params });
}
