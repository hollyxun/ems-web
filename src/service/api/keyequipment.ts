import { request } from '../request';

// ==================== 日能耗 API ====================

/**
 * 获取日能耗数据列表
 * @param params 查询参数
 */
export function fetchDailyKeyEquipmentList(params: Api.KeyEquipment.QueryParams) {
  return request<Api.KeyEquipment.DailyData[]>({
    url: '/keyEquipment/daily/list',
    method: 'get',
    params
  });
}

/**
 * 获取日能耗图表数据
 * @param params 查询参数
 */
export function fetchDailyKeyEquipmentChart(params: Api.KeyEquipment.QueryParams) {
  return request<Api.KeyEquipment.DailyData[]>({
    url: '/keyEquipment/daily/listChart',
    method: 'get',
    params
  });
}

/**
 * 获取所有设备列表
 */
export function fetchFacilityArchives() {
  return request<Api.KeyEquipment.Device[]>({
    url: '/keyEquipment/daily/getFacilityArchives',
    method: 'get'
  });
}

/**
 * 获取重点能耗设备列表
 */
export function fetchPointFacility() {
  return request<Api.KeyEquipment.Device[]>({
    url: '/keyEquipment/daily/getPointFacility',
    method: 'get'
  });
}

// ==================== 月能耗 API ====================

/**
 * 获取月能耗数据列表
 * @param params 查询参数
 */
export function fetchMonthlyKeyEquipmentList(params: Api.KeyEquipment.QueryParams) {
  return request<Api.KeyEquipment.MonthlyData[]>({
    url: '/keyEquipment/monthly/list',
    method: 'get',
    params
  });
}

/**
 * 获取月能耗图表数据
 * @param params 查询参数
 */
export function fetchMonthlyKeyEquipmentChart(params: Api.KeyEquipment.QueryParams) {
  return request<Api.KeyEquipment.MonthlyData[]>({
    url: '/keyEquipment/monthly/listChart',
    method: 'get',
    params
  });
}

// ==================== 年能耗 API ====================

/**
 * 获取年能耗数据列表
 * @param params 查询参数
 */
export function fetchYearKeyEquipmentList(params: Api.KeyEquipment.QueryParams) {
  return request<Api.KeyEquipment.YearData[]>({
    url: '/keyEquipment/year/list',
    method: 'get',
    params
  });
}

/**
 * 获取年能耗图表数据
 * @param params 查询参数
 */
export function fetchYearKeyEquipmentChart(params: Api.KeyEquipment.QueryParams) {
  return request<Api.KeyEquipment.YearData[]>({
    url: '/keyEquipment/year/listChart',
    method: 'get',
    params
  });
}
