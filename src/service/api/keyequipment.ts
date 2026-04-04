/** 重点设备能耗分析 API */

import { request } from '@sa/request';

export namespace KeyEquipment {
  /** 日能耗数据 */
  export interface DailyData {
    id: number;
    indexId: string;
    indexName: string;
    value: string;
    dataTime: string;
    timeType: string;
    timeCode: string;
    unitId: string;
    value0: number;
    value1: number;
    value2: number;
    value3: number;
    value4: number;
    value5: number;
    value6: number;
    value7: number;
    value8: number;
    value9: number;
    value10: number;
    value11: number;
    value12: number;
    value13: number;
    value14: number;
    value15: number;
    value16: number;
    value17: number;
    value18: number;
    value19: number;
    value20: number;
    value21: number;
    value22: number;
    value23: number;
  }

  /** 月能耗数据 */
  export interface MonthlyData {
    id: number;
    indexId: string;
    indexName: string;
    value: string;
    dataTime: string;
    timeType: string;
    timeCode: string;
    unitId: string;
    count: number;
    value1: number;
    value2: number;
    value3: number;
    value4: number;
    value5: number;
    value6: number;
    value7: number;
    value8: number;
    value9: number;
    value10: number;
    value11: number;
    value12: number;
    value13: number;
    value14: number;
    value15: number;
    value16: number;
    value17: number;
    value18: number;
    value19: number;
    value20: number;
    value21: number;
    value22: number;
    value23: number;
    value24: number;
    value25: number;
    value26: number;
    value27: number;
    value28: number;
    value29: number;
    value30: number;
    value31: number;
  }

  /** 年能耗数据 */
  export interface YearData {
    id: number;
    indexId: string;
    indexName: string;
    value: string;
    dataTime: string;
    timeType: string;
    timeCode: string;
    unitId: string;
    value1: number;
    value2: number;
    value3: number;
    value4: number;
    value5: number;
    value6: number;
    value7: number;
    value8: number;
    value9: number;
    value10: number;
    value11: number;
    value12: number;
  }

  /** 设备信息 */
  export interface Device {
    id: number;
    name: string;
    code: string;
    type: string;
    status: string;
    pointId: string;
    pointName: string;
  }

  /** 查询参数 */
  export interface QueryParams {
    indexCode?: string;
    indexId?: string;
    dataTime?: string;
    beginTime?: string;
    endTime?: string;
    timeType?: string;
    energyType?: string;
  }
}

// ==================== 日能耗 API ====================

/** 获取日能耗数据列表 */
export function fetchDailyKeyEquipmentList(params: KeyEquipment.QueryParams) {
  return request<KeyEquipment.DailyData[]>({
    url: '/keyEquipment/daily/list',
    method: 'get',
    params
  });
}

/** 获取日能耗图表数据 */
export function fetchDailyKeyEquipmentChart(params: KeyEquipment.QueryParams) {
  return request<KeyEquipment.DailyData[]>({
    url: '/keyEquipment/daily/listChart',
    method: 'get',
    params
  });
}

/** 获取所有设备列表 */
export function fetchFacilityArchives() {
  return request<KeyEquipment.Device[]>({
    url: '/keyEquipment/daily/getFacilityArchives',
    method: 'get'
  });
}

/** 获取重点能耗设备列表 */
export function fetchPointFacility() {
  return request<KeyEquipment.Device[]>({
    url: '/keyEquipment/daily/getPointFacility',
    method: 'get'
  });
}

// ==================== 月能耗 API ====================

/** 获取月能耗数据列表 */
export function fetchMonthlyKeyEquipmentList(params: KeyEquipment.QueryParams) {
  return request<KeyEquipment.MonthlyData[]>({
    url: '/keyEquipment/monthly/list',
    method: 'get',
    params
  });
}

/** 获取月能耗图表数据 */
export function fetchMonthlyKeyEquipmentChart(params: KeyEquipment.QueryParams) {
  return request<KeyEquipment.MonthlyData[]>({
    url: '/keyEquipment/monthly/listChart',
    method: 'get',
    params
  });
}

// ==================== 年能耗 API ====================

/** 获取年能耗数据列表 */
export function fetchYearKeyEquipmentList(params: KeyEquipment.QueryParams) {
  return request<KeyEquipment.YearData[]>({
    url: '/keyEquipment/year/list',
    method: 'get',
    params
  });
}

/** 获取年能耗图表数据 */
export function fetchYearKeyEquipmentChart(params: KeyEquipment.QueryParams) {
  return request<KeyEquipment.YearData[]>({
    url: '/keyEquipment/year/listChart',
    method: 'get',
    params
  });
}