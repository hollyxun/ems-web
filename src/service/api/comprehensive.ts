import { request } from '../request';

// ============ 综合能耗统计 API ============

/**
 * 获取综合能耗统计数据列表
 * @param params 查询参数
 */
export function fetchGetComprehensiveList(params: Api.Comprehensive.ComprehensiveQuery) {
  return request<Api.Comprehensive.ComprehensiveResponse>({
    url: '/api/v1/comprehensive/statistics/getList',
    method: 'get',
    params
  });
}

/**
 * 获取重点设备能耗排名
 * @param params 查询参数
 */
export function fetchGetEnergyList(params: Api.Comprehensive.ComprehensiveQuery) {
  return request<Api.Comprehensive.ComprehensiveStatistics[]>({
    url: '/api/v1/comprehensive/statistics/energyList',
    method: 'get',
    params
  });
}

/**
 * 获取设备能耗数据
 * @param params 查询参数
 */
export function fetchGetEnergyDevice(params: Api.Comprehensive.ComprehensiveQuery) {
  return request<Api.Comprehensive.ComprehensiveStatistics[]>({
    url: '/api/v1/comprehensive/statistics/energyDevice',
    method: 'get',
    params
  });
}

/**
 * 获取设备列表
 * @param params 查询参数
 */
export function fetchGetDeviceList(params: Api.Comprehensive.ComprehensiveQuery) {
  return request<Api.Comprehensive.ComprehensiveStatistics[]>({
    url: '/api/v1/comprehensive/statistics/getDeviceList',
    method: 'get',
    params
  });
}

/**
 * 获取同比环比数据
 * @param params 查询参数
 */
export function fetchGetYoY(params: Api.Comprehensive.ComprehensiveQuery) {
  return request<Api.Comprehensive.YoYResponse>({
    url: '/api/v1/comprehensive/statistics/getYoY',
    method: 'get',
    params
  });
}

/**
 * 获取能耗排名
 * @param params 查询参数
 */
export function fetchGetEnergyRanking(params: Api.Comprehensive.ComprehensiveQuery) {
  return request<Api.Comprehensive.EnergyRanking[]>({
    url: '/api/v1/comprehensive/statistics/getEnergyRanking',
    method: 'get',
    params
  });
}

/**
 * 导出综合统计数据
 * @param params 查询参数
 */
export function fetchExportComprehensive(params: Api.Comprehensive.ComprehensiveQuery) {
  return request({
    url: '/api/v1/comprehensive/statistics/export',
    method: 'get',
    params
  });
}

// ============ 日综合指标分析 API ============

/**
 * 获取日综合指标分析列表
 * @param params 查询参数
 */
export function fetchGetDailyList(params: Api.Comprehensive.DailyComprehensiveQuery) {
  return request<Api.Comprehensive.DailyComprehensive[]>({
    url: '/api/v1/comprehensive/daily/list',
    method: 'get',
    params
  });
}

/**
 * 获取日综合指标分析图表数据
 * @param params 查询参数
 */
export function fetchGetDailyListChart(params: Api.Comprehensive.DailyComprehensiveQuery) {
  return request<Api.Comprehensive.DailyComprehensive[]>({
    url: '/api/v1/comprehensive/daily/listChart',
    method: 'get',
    params
  });
}

// ============ 月综合指标分析 API ============

/**
 * 获取月综合指标分析列表
 * @param params 查询参数
 */
export function fetchGetMonthlyList(params: Api.Comprehensive.MonthlyComprehensiveQuery) {
  return request<Api.Comprehensive.MonthlyComprehensive>({
    url: '/api/v1/comprehensive/monthly/list',
    method: 'get',
    params
  });
}

/**
 * 获取月综合指标分析图表数据
 * @param params 查询参数
 */
export function fetchGetMonthlyListChart(params: Api.Comprehensive.MonthlyComprehensiveQuery) {
  return request<Api.Comprehensive.MonthlyComprehensive[]>({
    url: '/api/v1/comprehensive/monthly/listChart',
    method: 'get',
    params
  });
}

/**
 * 导出月综合报表
 * @param params 查询参数
 */
export function fetchExportMonthly(params: Api.Comprehensive.MonthlyComprehensiveQuery) {
  return request({
    url: '/api/v1/comprehensive/monthly/export',
    method: 'get',
    params
  });
}

// ============ 年综合指标分析 API ============

/**
 * 获取年综合指标分析列表
 * @param params 查询参数
 */
export function fetchGetYearList(params: Api.Comprehensive.YearComprehensiveQuery) {
  return request<{ slots: Api.Comprehensive.YearComprehensive[]; list: Api.Comprehensive.YearComprehensive[] }>({
    url: '/api/v1/comprehensive/year/list',
    method: 'get',
    params
  });
}

/**
 * 获取年综合指标分析图表数据
 * @param params 查询参数
 */
export function fetchGetYearListChart(params: Api.Comprehensive.YearComprehensiveQuery) {
  return request<Api.Comprehensive.YearComprehensive[]>({
    url: '/api/v1/comprehensive/year/listChart',
    method: 'get',
    params
  });
}

/**
 * 导出年综合报表
 * @param params 查询参数
 */
export function fetchExportYear(params: Api.Comprehensive.YearComprehensiveQuery) {
  return request({
    url: '/api/v1/comprehensive/year/export',
    method: 'get',
    params
  });
}
