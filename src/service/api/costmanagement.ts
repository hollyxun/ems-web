import { request } from '../request';

// ============ 电费录入 API ============

export function fetchElectricityCostList(params: Api.CostManagement.ElectricityCostSearchParams) {
  return request<Api.CostManagement.ElectricityCostListResponse>({
    url: '/cost/electricity/list',
    method: 'get',
    params
  });
}

export function fetchCreateElectricityCost(data: Api.CostManagement.CreateElectricityCostParams) {
  return request<Api.CostManagement.ElectricityCost>({
    url: '/cost/electricity',
    method: 'post',
    data
  });
}

export function fetchUpdateElectricityCost(data: Api.CostManagement.UpdateElectricityCostParams) {
  return request<Api.CostManagement.ElectricityCost>({
    url: `/cost/electricity/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeleteElectricityCost(id: string) {
  return request({
    url: `/cost/electricity/${id}`,
    method: 'delete'
  });
}

// ============ 成本策略 API ============

export function fetchPriceTacticsList(params: Api.CostManagement.PriceTacticsSearchParams) {
  return request<Api.CostManagement.PriceTacticsListResponse>({
    url: '/cost/tactics/list',
    method: 'get',
    params
  });
}

export function fetchPriceTacticsById(id: string) {
  return request<Api.CostManagement.PriceTactics>({
    url: `/cost/tactics/${id}`,
    method: 'get'
  });
}

export function fetchCreatePriceTactics(data: Api.CostManagement.CreatePriceTacticsParams) {
  return request<Api.CostManagement.PriceTactics>({
    url: '/cost/tactics',
    method: 'post',
    data
  });
}

export function fetchUpdatePriceTactics(id: string, data: Api.CostManagement.UpdatePriceTacticsParams) {
  return request<Api.CostManagement.PriceTactics>({
    url: `/cost/tactics/${id}`,
    method: 'put',
    data
  });
}

export function fetchDeletePriceTactics(id: string) {
  return request({
    url: `/cost/tactics/${id}`,
    method: 'delete'
  });
}

// ============ 成本趋势 API ============

export function fetchCostTrend(params: Api.CostManagement.CostTrendParams) {
  return request<Api.CostManagement.CostTrendData[]>({
    url: '/cost/trend',
    method: 'get',
    params
  });
}
