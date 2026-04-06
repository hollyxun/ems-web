import { request } from '../request';

// ============ 统计分析列表 ============

export function fetchStatisticalList(params: Api.Statistical.SearchParams) {
  return request<Api.Statistical.ListResponse>({
    url: '/statistical/list',
    method: 'get',
    params
  });
}

// ============ 能流图分析 ============

export function fetchFlowCharts(data: Api.Statistical.FlowCharts.FlowChartsParams) {
  return request<Api.Statistical.FlowCharts.FlowChartsResponse>({
    url: '/api/v1/statisticsAnalysis/getFlowCharts',
    method: 'post',
    data
  });
}

// ============ 同比环比分析 ============

export function fetchElectricYoY(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.YoYResponse[]>({
    url: '/api/v1/statistical/getElectricDataComparisonYoY',
    method: 'post',
    data
  });
}

export function fetchElectricMoM(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.MoMResponse[]>({
    url: '/api/v1/statistical/getElectricDataComparisonMoM',
    method: 'post',
    data
  });
}

export function fetchWaterYoY(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.YoYResponse[]>({
    url: '/api/v1/statistical/getWaterDataComparisonYoY',
    method: 'post',
    data
  });
}

export function fetchWaterMoM(data: Api.Statistical.Comparison.CompareParams) {
  return request<Api.Statistical.Comparison.MoMResponse[]>({
    url: '/api/v1/statistical/getWaterDataComparisonMoM',
    method: 'post',
    data
  });
}

export function fetchSameCompareList(data: Api.Statistical.Comparison.QueryCompareParams) {
  return request<Api.Statistical.Comparison.EnergyTypeContrastedResponse[]>({
    url: '/api/v1/statistical/querySameCompareList',
    method: 'post',
    data
  });
}

export function fetchLoopCompareList(data: Api.Statistical.Comparison.QueryCompareParams) {
  return request<Api.Statistical.Comparison.EnergyTypeContrastedResponse[]>({
    url: '/api/v1/statistical/queryLoopCompareList',
    method: 'post',
    data
  });
}

// ============ 成本趋势分析 ============

export function fetchEnergyCostTrendList(params: Api.Statistical.CostTrend.CostTrendParams) {
  return request<Api.Statistical.CostTrend.CostTrendResponse>({
    url: '/api/v1/energyTypeAnalysis/listEnergyCostTrend',
    method: 'get',
    params
  });
}

export function fetchEnergyCostTrendDetail(params: Api.Statistical.CostTrend.CostTrendDetailParams) {
  return request<Api.Statistical.CostTrend.CostTrendItem[]>({
    url: '/api/v1/energyTypeAnalysis/listEnergyCostTrendDetail',
    method: 'get',
    params
  });
}
