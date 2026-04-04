/** 峰谷分析 API */

import { request } from '@sa/request';

export namespace PeakValley {
  // 电价时间段
  export interface PriceDate {
    id: number;
    beginDate: string;
    endDate: string;
    remark: string;
    createdAt: string;
    updatedAt: string;
  }

  // 电价明细
  export interface Price {
    id: number;
    parentId: string;
    type: string;
    startTime: string;
    stopTime: string;
    effectivityPrice: number;
    createdAt: string;
    updatedAt: string;
  }

  // 按小时统计结果
  export interface HourVO {
    dataList: HourDataVO[];
    lineChat: LineChatVO[];
    pieChat: PieChatVO;
  }

  // 按天统计结果
  export interface DayVO {
    costList: LineChatVO[];
    powerConsumptionList: LineChatVO[];
    totalVO: DayTotalVO;
  }

  // 按小时统计数据
  export interface HourDataVO {
    time: string;
    sharpFee: number;
    sharpPower: number;
    peakFee: number;
    peakPower: number;
    flatFee: number;
    flatPower: number;
    valleyFee: number;
    valleyPower: number;
    totalFee: number;
    totalPower: number;
  }

  // 折线图数据
  export interface LineChatVO {
    xdata: string;
    ytip: number;
    ypeak: number;
    yflat: number;
    ytrough: number;
  }

  // 饼图数据
  export interface PieChatVO {
    peak: string;
    flat: string;
    tip: string;
    trough: string;
  }

  // 按天统计汇总数据
  export interface DayTotalVO {
    peakPowerCost: number;
    peakPowerConsumption: number;
    peakPowerProportion: number;
    peakPowerCostProportion: number;
    flatPowerCost: number;
    flatPowerConsumption: number;
    flatPowerProportion: number;
    flatPowerCostProportion: number;
    tipPowerCost: number;
    tipPowerConsumption: number;
    tipPowerProportion: number;
    tipPowerCostProportion: number;
    troughPowerCost: number;
    troughPowerConsumption: number;
    troughPowerProportion: number;
    troughPowerCostProportion: number;
    totalCost: number;
    totalPowerConsumption: number;
  }

  // 查询参数
  export interface QueryParams {
    modelCode: string;
    nodeId: string;
    timeType: string;
    queryTime: string;
  }

  // 电价时间段查询参数
  export interface PriceDateSearchParams {
    page: number;
    pageSize: number;
    remark?: string;
  }

  // 电价明细查询参数
  export interface PriceSearchParams {
    page: number;
    pageSize: number;
    parentId: string;
    type?: string;
  }

  // 批量保存电价明细
  export interface PriceSaveParams {
    parentId: string;
    list: PriceItem[];
  }

  export interface PriceItem {
    type: string;
    startTime: string;
    stopTime: string;
    effectivityPrice: number;
  }
}

// ==================== 电价时间段 ====================

export function fetchPriceDateList(params: PeakValley.PriceDateSearchParams) {
  return request<PageResult<PeakValley.PriceDate>>({
    url: '/electricitypricedate/list',
    method: 'get',
    params
  });
}

export function fetchPriceDateById(id: number) {
  return request<PeakValley.PriceDate>({
    url: `/electricitypricedate/${id}`,
    method: 'get'
  });
}

export function fetchCreatePriceDate(data: PeakValley.PriceDate) {
  return request<void>({
    url: '/electricitypricedate',
    method: 'post',
    data
  });
}

export function fetchUpdatePriceDate(data: PeakValley.PriceDate) {
  return request<void>({
    url: `/electricitypricedate/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeletePriceDate(id: number) {
  return request<void>({
    url: `/electricitypricedate/${id}`,
    method: 'delete'
  });
}

// ==================== 电价明细 ====================

export function fetchPriceList(params: PeakValley.PriceSearchParams) {
  return request<PageResult<PeakValley.Price>>({
    url: '/electricityprice/list',
    method: 'get',
    params
  });
}

export function fetchPriceById(id: number) {
  return request<PeakValley.Price>({
    url: `/electricityprice/${id}`,
    method: 'get'
  });
}

export function fetchCreatePrice(data: PeakValley.Price) {
  return request<void>({
    url: '/electricityprice',
    method: 'post',
    data
  });
}

export function fetchUpdatePrice(data: PeakValley.Price) {
  return request<void>({
    url: `/electricityprice/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeletePrice(id: number) {
  return request<void>({
    url: `/electricityprice/${id}`,
    method: 'delete'
  });
}

export function fetchSavePriceList(data: PeakValley.PriceSaveParams) {
  return request<void>({
    url: '/electricityprice/save',
    method: 'put',
    data
  });
}

// ==================== 峰谷分析 ====================

export function fetchSegmentAnalysisHour(params: PeakValley.QueryParams) {
  return request<PeakValley.HourVO>({
    url: '/peakValley/segmentAnalysis/hour',
    method: 'get',
    params
  });
}

export function fetchSegmentAnalysisDay(params: PeakValley.QueryParams) {
  return request<PeakValley.DayVO>({
    url: '/peakValley/segmentAnalysis/day',
    method: 'get',
    params
  });
}