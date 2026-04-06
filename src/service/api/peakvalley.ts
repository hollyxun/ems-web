import { request } from '../request';

// ==================== 电价时间段 ====================

/**
 * 获取电价时间段列表
 * @param params 查询参数
 */
export function fetchPriceDateList(params: Api.PeakValley.PriceDateSearchParams) {
  return request<Api.Common.PageResult<Api.PeakValley.PriceDate>>({
    url: '/electricitypricedate/list',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取电价时间段
 * @param id 时间段ID
 */
export function fetchPriceDateById(id: number) {
  return request<Api.PeakValley.PriceDate>({
    url: `/electricitypricedate/${id}`,
    method: 'get'
  });
}

/**
 * 创建电价时间段
 * @param data 创建参数
 */
export function fetchCreatePriceDate(data: Api.PeakValley.PriceDate) {
  return request<void>({
    url: '/electricitypricedate',
    method: 'post',
    data
  });
}

/**
 * 更新电价时间段
 * @param data 更新参数
 */
export function fetchUpdatePriceDate(data: Api.PeakValley.PriceDate) {
  return request<void>({
    url: `/electricitypricedate/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除电价时间段
 * @param id 时间段ID
 */
export function fetchDeletePriceDate(id: number) {
  return request<void>({
    url: `/electricitypricedate/${id}`,
    method: 'delete'
  });
}

// ==================== 电价明细 ====================

/**
 * 获取电价明细列表
 * @param params 查询参数
 */
export function fetchPriceList(params: Api.PeakValley.PriceSearchParams) {
  return request<Api.Common.PageResult<Api.PeakValley.Price>>({
    url: '/electricityprice/list',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取电价明细
 * @param id 电价ID
 */
export function fetchPriceById(id: number) {
  return request<Api.PeakValley.Price>({
    url: `/electricityprice/${id}`,
    method: 'get'
  });
}

/**
 * 创建电价明细
 * @param data 创建参数
 */
export function fetchCreatePrice(data: Api.PeakValley.Price) {
  return request<void>({
    url: '/electricityprice',
    method: 'post',
    data
  });
}

/**
 * 更新电价明细
 * @param data 更新参数
 */
export function fetchUpdatePrice(data: Api.PeakValley.Price) {
  return request<void>({
    url: `/electricityprice/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除电价明细
 * @param id 电价ID
 */
export function fetchDeletePrice(id: number) {
  return request<void>({
    url: `/electricityprice/${id}`,
    method: 'delete'
  });
}

/**
 * 批量保存电价明细
 * @param data 保存参数
 */
export function fetchSavePriceList(data: Api.PeakValley.PriceSaveParams) {
  return request<void>({
    url: '/electricityprice/save',
    method: 'put',
    data
  });
}

// ==================== 峰谷分析 ====================

/**
 * 按小时统计峰谷分析
 * @param params 查询参数
 */
export function fetchSegmentAnalysisHour(params: Api.PeakValley.QueryParams) {
  return request<Api.PeakValley.HourVO>({
    url: '/peakValley/segmentAnalysis/hour',
    method: 'get',
    params
  });
}

/**
 * 按天统计峰谷分析
 * @param params 查询参数
 */
export function fetchSegmentAnalysisDay(params: Api.PeakValley.QueryParams) {
  return request<Api.PeakValley.DayVO>({
    url: '/peakValley/segmentAnalysis/day',
    method: 'get',
    params
  });
}