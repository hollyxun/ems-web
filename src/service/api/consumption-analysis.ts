import { request } from '../request';

// ============ 类型定义 ============

/** 能耗分析数据项 */
export interface ConsumptionAnalysisData {
  currentTime: string;
  currentValue: number;
  compareTime: string;
  compareValue: number;
  ratio: number;
}

/** 图表数据 */
export interface ChartData {
  xData: string;
  yValue: number;
  yCompareValue: number;
  yQOQ: number;
}

/** 能源占比 */
export interface EnergyProportion {
  energyNo: string;
  energyName: string;
  count: number;
  percentage: number;
}

/** 能耗分析响应 */
export interface ConsumptionAnalysisVO {
  dataList: ConsumptionAnalysisData[];
  chartDataList: ChartData[];
  energyProportion: EnergyProportion[];
  tongbi: ConsumptionAnalysisData;
  huanbi: ConsumptionAnalysisData;
  planCount: number;
  prodCount: number;
}

/** 能耗排名数据 */
export interface RankingEnergyData {
  nodeId: string;
  nodeName: string;
  energyTypeNo: string;
  energyTypeName: string;
  energyConsumption: number;
}

/** 排名数据响应 */
export interface RankingDataVO {
  nodeId: string;
  nodeName: string;
  data: RankingEnergyData[];
}

/** 产品单耗分析数据 */
export interface ProductEnergyAnalysisData {
  dateTime: string;
  productCount: number;
  energyCount: number;
  average: number;
}

/** 产品单耗分析响应 */
export interface ProductEnergyAnalysisVO {
  chart: ProductEnergyAnalysisData[];
  averageEnergy: number;
  totalEnergy: number;
  totalProduct: number;
  tongbi: number;
  huanbi: number;
}

// ============ 查询参数类型 ============

/** 科室能耗分析查询参数 */
export interface GetByAreaParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime?: string;
  energyType: string;
  analysisType?: 'YOY' | 'QOQ';
}

/** 科室能耗排名查询参数 */
export interface GetByDepartmentParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime: string;
}

/** 综合能耗查询参数 */
export interface GetComprehensiveEnergyParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime: string;
  energyType?: string;
}

/** 同比环比查询参数 */
export interface GetYOYParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime: string;
  energyType?: string;
}

/** 能耗排名查询参数 */
export interface GetEnergyRankingParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime: string;
}

/** 计划产量查询参数 */
export interface GetPlanAndProdCountParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime: string;
  energyType: string;
}

/** 产品单耗查询参数 */
export interface GetProdEnergyParams {
  nodeId: string;
  timeType: 'DAY' | 'MONTH' | 'YEAR';
  dataTime: string;
  energyType: string;
  prodType?: string;
}

// ============ API 函数 ============

/**
 * 科室能耗分析列表
 * @param params 查询参数
 */
export function fetchGetByArea(params: GetByAreaParams) {
  return request<ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getByArea',
    method: 'get',
    params
  });
}

/**
 * 科室能耗排名
 * @param params 查询参数
 */
export function fetchGetByDepartment(params: GetByDepartmentParams) {
  return request<RankingDataVO[]>({
    url: '/consumptionanalysis/getByDepartment',
    method: 'get',
    params
  });
}

/**
 * 综合能耗分析
 * @param params 查询参数
 */
export function fetchGetComprehensiveEnergy(params: GetComprehensiveEnergyParams) {
  return request<ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getComprehensiveEnergy',
    method: 'get',
    params
  });
}

/**
 * 综合能耗同比环比
 * @param params 查询参数
 */
export function fetchGetYOY(params: GetYOYParams) {
  return request<ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getYOY',
    method: 'get',
    params
  });
}

/**
 * 综合能耗排名
 * @param params 查询参数
 */
export function fetchGetEnergyRanking(params: GetEnergyRankingParams) {
  return request<RankingEnergyData[]>({
    url: '/consumptionanalysis/getEnergyRanking',
    method: 'get',
    params
  });
}

/**
 * 计划与产量
 * @param params 查询参数
 */
export function fetchGetPlanAndProdCount(params: GetPlanAndProdCountParams) {
  return request<ConsumptionAnalysisVO>({
    url: '/consumptionanalysis/getPlanAndProdCount',
    method: 'get',
    params
  });
}

/**
 * 产品单耗分析
 * @param params 查询参数
 */
export function fetchGetProdEnergy(params: GetProdEnergyParams) {
  return request<ProductEnergyAnalysisVO>({
    url: '/consumptionanalysis/getProdEnergy',
    method: 'get',
    params
  });
}