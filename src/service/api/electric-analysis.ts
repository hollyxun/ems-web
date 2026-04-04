import { request } from '@sa/request';

// 负荷分析类型定义
export namespace ElectricLoad {
  export interface Request {
    nodeId: string;
    meterId?: string;
    timeType: 'DAY' | 'MONTH' | 'YEAR';
    timeCode: string;
  }

  export interface Item {
    timeCode: string;
    timeCodeChart: string;
    name: string;
    max: string;
    min: string;
    avg: string;
    rate: string;
    value: string;
  }

  export interface Detail {
    max: string;
    maxTime: string;
    min: string;
    minTime: string;
    avg: string;
    rate: string;
  }

  export interface Response {
    itemList: Item[];
    detail: Detail;
  }

  export interface MeterOption {
    code: string;
    label: string;
  }
}

// 功率因数类型定义
export namespace PowerFactor {
  export interface Request {
    nodeId: string;
    meterId?: string;
    timeCode: string;
  }

  export interface Item {
    timeCode: string;
    timeCodeChart: string;
    name: string;
    value: string;
  }

  export interface Detail {
    max: string;
    maxTime: string;
    min: string;
    minTime: string;
    avg: string;
  }

  export interface Response {
    itemList: Item[];
    detail: Detail;
  }
}

// 三相不平衡类型定义
export namespace ThreePhase {
  export interface Request {
    nodeId: string;
    meterId: string;
    timeType: 'DAY' | 'MONTH' | 'YEAR';
    timeCode: string;
    requestType: '0' | '1'; // 0:电压 1:电流
  }

  export interface Item {
    timeCode: string;
    timeCodeChart: string;
    name: string;
    phaseA: string;
    phaseB: string;
    phaseC: string;
    unbalanceRate: string;
  }

  export interface Detail {
    maxUnbalance: string;
    maxUnbalanceTime: string;
    avgUnbalance: string;
  }

  export interface Response {
    itemList: Item[];
    detail: Detail;
  }
}

// 历史数据类型定义
export namespace HistoricalData {
  export interface Request {
    indexId: string;
    dataTime: string;
    timeType: 'DAY' | 'HOUR';
  }

  export interface Item {
    dataTime: string;
    indexId: string;
    indexName: string;
    value: string;
  }

  export interface Response {
    indexId: string;
    indexName: string;
    data: Item[];
  }
}

// 获取负荷分析数据
export function fetchElectricLoadAnalysis(params: ElectricLoad.Request) {
  return request<ElectricLoad.Response>({
    url: '/energyMonitor/loadAnalysis',
    method: 'get',
    params
  });
}

// 获取电表列表
export function fetchElectricityMeterList(nodeId: string) {
  return request<ElectricLoad.MeterOption[]>({
    url: '/energyMonitor/listElectricMeter',
    method: 'get',
    params: { nodeId }
  });
}

// 获取功率因数分析数据
export function fetchPowerFactorAnalysis(params: PowerFactor.Request) {
  return request<PowerFactor.Response>({
    url: '/energyMonitor/powerFactor',
    method: 'get',
    params
  });
}

// 获取三相不平衡分析数据
export function fetchThreePhaseAnalysis(params: ThreePhase.Request) {
  return request<ThreePhase.Response>({
    url: '/energyMonitor/threePhase',
    method: 'get',
    params
  });
}

// 获取历史数据趋势
export function fetchHistoricalData(params: HistoricalData.Request) {
  return request<HistoricalData.Response>({
    url: '/history/dataTrend',
    method: 'get',
    params
  });
}

// 导出历史数据
export function exportHistoricalData(params: HistoricalData.Request) {
  return request<Blob>({
    url: '/history/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}