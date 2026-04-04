import { request } from '../request';

// ============ 日工序能耗 ============

/**
 * 获取日工序能耗统计列表
 * @param params 查询参数
 */
export function fetchDailyProcessEnergyList(params: Api.ProcessEnergy.DailyQuery) {
  return request<Api.ProcessEnergy.DailyList[]>({
    url: '/api/v1/processEnergy/dailyProcessEnergy/list',
    method: 'get',
    params
  });
}

/**
 * 获取日工序能耗图表数据
 * @param params 查询参数
 */
export function fetchDailyProcessEnergyChart(params: Api.ProcessEnergy.ChartQuery) {
  return request<Api.ProcessEnergy.ChartData[]>({
    url: '/api/v1/processEnergy/dailyProcessEnergy/listChart',
    method: 'get',
    params
  });
}

// ============ 月工序能耗 ============

/**
 * 获取月工序能耗统计列表
 * @param params 查询参数
 */
export function fetchMonthlyProcessEnergyList(params: Api.ProcessEnergy.MonthlyQuery) {
  return request<Api.ProcessEnergy.MonthlyList[]>({
    url: '/api/v1/processEnergy/monthlyProcessEnergy/list',
    method: 'get',
    params
  });
}

/**
 * 获取月工序能耗图表数据
 * @param params 查询参数
 */
export function fetchMonthlyProcessEnergyChart(params: Api.ProcessEnergy.ChartQuery) {
  return request<Api.ProcessEnergy.ChartData[]>({
    url: '/api/v1/processEnergy/monthlyProcessEnergy/listChart',
    method: 'get',
    params
  });
}

// ============ 年工序能耗 ============

/**
 * 获取年工序能耗统计列表
 * @param params 查询参数
 */
export function fetchYearProcessEnergyList(params: Api.ProcessEnergy.YearQuery) {
  return request<Api.ProcessEnergy.YearList[]>({
    url: '/api/v1/processEnergy/yearProcessEnergy/list',
    method: 'get',
    params
  });
}

/**
 * 获取年工序能耗图表数据
 * @param params 查询参数
 */
export function fetchYearProcessEnergyChart(params: Api.ProcessEnergy.ChartQuery) {
  return request<Api.ProcessEnergy.ChartData[]>({
    url: '/api/v1/processEnergy/yearProcessEnergy/listChart',
    method: 'get',
    params
  });
}