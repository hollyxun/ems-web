/** 分项能耗分析 API */

import { request } from '@sa/request';

export namespace ItemizedEnergyAnalysis {
  export interface Item {
    nodeId: string;
    nodeName: string;
    total: number;
    value0?: number;
    value1?: number;
    value2?: number;
    value3?: number;
    value4?: number;
    value5?: number;
    value6?: number;
    value7?: number;
    value8?: number;
    value9?: number;
    value10?: number;
    value11?: number;
    value12?: number;
    value13?: number;
    value14?: number;
    value15?: number;
    value16?: number;
    value17?: number;
    value18?: number;
    value19?: number;
    value20?: number;
    value21?: number;
    value22?: number;
    value23?: number;
    value24?: number;
    value25?: number;
    value26?: number;
    value27?: number;
    value28?: number;
    value29?: number;
    value30?: number;
  }

  export interface Response {
    total: string;
    max: string;
    min: string;
    avg: string;
    unit: string;
    dataList: Item[];
  }

  export interface Request {
    nodeId: string;
    timeType: 'DAY' | 'MONTH' | 'YEAR';
    dataTime: string;
    energyType?: string;
  }
}

export function fetchItemizedEnergyAnalysis(params: ItemizedEnergyAnalysis.Request) {
  return request<ItemizedEnergyAnalysis.Response>({
    url: '/itemizedEnergyAnalysis/list',
    method: 'get',
    params
  });
}