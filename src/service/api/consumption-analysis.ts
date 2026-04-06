import { request } from '../request';

/**
 * 能耗分析查询
 * @param params 查询参数
 */
export function fetchConsumptionAnalysis(params: { nodeId: string; timeType: string; dataTime: string }) {
  return request<Api.ConsumptionAnalysis.ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getComprehensiveEnergy',
    method: 'get',
    params
  });
}

/**
 * 科室能耗分析列表
 * @param params 查询参数
 */
export function fetchGetByArea(params: Api.ConsumptionAnalysis.GetByAreaParams) {
  return request<Api.ConsumptionAnalysis.ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getByArea',
    method: 'get',
    params
  });
}

/**
 * 科室能耗排名
 * @param params 查询参数
 */
export function fetchGetByDepartment(params: Api.ConsumptionAnalysis.GetByDepartmentParams) {
  return request<Api.ConsumptionAnalysis.RankingDataVO[]>({
    url: '/consumptionanalysis/getByDepartment',
    method: 'get',
    params
  });
}

/**
 * 综合能耗分析
 * @param params 查询参数
 */
export function fetchGetComprehensiveEnergy(params: Api.ConsumptionAnalysis.GetComprehensiveEnergyParams) {
  return request<Api.ConsumptionAnalysis.ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getComprehensiveEnergy',
    method: 'get',
    params
  });
}

/**
 * 综合能耗同比环比
 * @param params 查询参数
 */
export function fetchGetYOY(params: Api.ConsumptionAnalysis.GetYOYParams) {
  return request<Api.ConsumptionAnalysis.ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getYOY',
    method: 'get',
    params
  });
}

/**
 * 综合能耗排名
 * @param params 查询参数
 */
export function fetchConsumptionEnergyRanking(params: Api.ConsumptionAnalysis.GetEnergyRankingParams) {
  return request<Api.ConsumptionAnalysis.RankingEnergyData[]>({
    url: '/consumptionanalysis/getEnergyRanking',
    method: 'get',
    params
  });
}

/**
 * 计划与产量
 * @param params 查询参数
 */
export function fetchGetPlanAndProdCount(params: Api.ConsumptionAnalysis.GetPlanAndProdCountParams) {
  return request<Api.ConsumptionAnalysis.ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getPlanAndProdCount',
    method: 'get',
    params
  });
}

/**
 * 产品单耗分析
 * @param params 查询参数
 */
export function fetchGetProdEnergy(params: Api.ConsumptionAnalysis.GetProdEnergyParams) {
  return request<Api.ConsumptionAnalysis.ProductEnergyAnalysisVO>({
    url: '/consumptionanalysis/getProdEnergy',
    method: 'get',
    params
  });
}
