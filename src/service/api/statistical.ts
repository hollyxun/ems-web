import { request } from '../request';

// ============ 能流图分析 ============

/**
 * 获取能流图分析数据
 * @param data 查询参数
 */
export function fetchFlowCharts(data: Api.Statistical.FlowCharts.FlowChartsParams) {
  return request<Api.Statistical.FlowCharts.FlowChartsResponse>({
    url: '/api/v1/statisticsAnalysis/getFlowCharts',
    method: 'post',
    data
  });
}

// ============ 同比环比分析 ============

/**
 * 获取电能耗同比数据
 * @param data 查询参数
 */
export function fetchElectricYoY(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.YoYResponse[]>({
    url: '/api/v1/statistical/getElectricDataComparisonYoY',
    method: 'post',
    data
  });
}

/**
 * 获取电能耗环比数据
 * @param data 查询参数
 */
export function fetchElectricMoM(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.MoMResponse[]>({
    url: '/api/v1/statistical/getElectricDataComparisonMoM',
    method: 'post',
    data
  });
}

/**
 * 获取水能耗同比数据
 * @param data 查询参数
 */
export function fetchWaterYoY(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.YoYResponse[]>({
    url: '/api/v1/statistical/getWaterDataComparisonYoY',
    method: 'post',
    data
  });
}

/**
 * 获取水能耗环比数据
 * @param data 查询参数
 */
export function fetchWaterMoM(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.MoMResponse[]>({
    url: '/api/v1/statistical/getWaterDataComparisonMoM',
    method: 'post',
    data
  });
}

/**
 * 获取同比分析列表数据
 * @param data 查询参数
 */
export function fetchSameCompareList(data: Api.Statistical.Comparison.QueryCompareParams) {
  return request<Api.Statistical.Comparison.EnergyTypeContrastedResponse[]>({
    url: '/api/v1/statistical/querySameCompareList',
    method: 'post',
    data
  });
}

/**
 * 获取环比分析列表数据
 * @param data 查询参数
 */
export function fetchLoopCompareList(data: Api.Statistical.Comparison.QueryCompareParams) {
  return request<Api.Statistical.Comparison.EnergyTypeContrastedResponse[]>({
    url: '/api/v1/statistical/queryLoopCompareList',
    method: 'post',
    data
  });
}

// ============ 成本趋势分析 ============

/**
 * 获取成本趋势分析列表
 * @param params 查询参数
 */
export function fetchEnergyCostTrendList(params: Api.Statistical.CostTrend.CostTrendParams) {
  return request<Api.Statistical.CostTrend.CostTrendResponse>({
    url: '/api/v1/energyTypeAnalysis/listEnergyCostTrend',
    method: 'get',
    params
  });
}

/**
 * 获取成本趋势分析详情
 * @param params 查询参数
 */
export function fetchEnergyCostTrendDetail(params: Api.Statistical.CostTrend.CostTrendDetailParams) {
  return request<Api.Statistical.CostTrend.CostTrendItem[]>({
    url: '/api/v1/energyTypeAnalysis/listEnergyCostTrendDetail',
    method: 'get',
    params
  });
}