/** 能源指标 API */

import { request } from '@sa/request';

export namespace EnergyIndicators {
  export interface Item {
    id: number;
    nodeId: string;
    timeType: string;
    dataTime: string;
    name: string;
    number: number;
    unit: string;
    energyType: string;
    indicatorsType: string;
    nodeName: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface SearchParams {
    page: number;
    pageSize: number;
    nodeId?: string;
    timeType?: string;
    dataTime?: string;
    name?: string;
    energyType?: string;
    indicatorsType?: string;
    beginTime?: string;
    endTime?: string;
  }

  export interface CreateParams {
    nodeId: string;
    timeType: string;
    dataTime: string;
    name: string;
    number?: number;
    unit?: string;
    energyType?: string;
    indicatorsType?: string;
    nodeName?: string;
  }

  export interface UpdateParams {
    id: number;
    nodeId?: string;
    timeType?: string;
    dataTime?: string;
    name?: string;
    number?: number;
    unit?: string;
    energyType?: string;
    indicatorsType?: string;
    nodeName?: string;
  }
}

export function fetchEnergyIndicatorsList(params: EnergyIndicators.SearchParams) {
  return request<PageResult<EnergyIndicators.Item>>({
    url: '/energyIndicators/list',
    method: 'get',
    params
  });
}

export function fetchEnergyIndicatorsById(id: number) {
  return request<EnergyIndicators.Item>({
    url: `/energyIndicators/${id}`,
    method: 'get'
  });
}

export function fetchEnergyIndicatorsByNodeId(nodeId: string) {
  return request<EnergyIndicators.Item>({
    url: `/energyIndicators/node/${nodeId}`,
    method: 'get'
  });
}

export function fetchCreateEnergyIndicators(data: EnergyIndicators.CreateParams) {
  return request<void>({
    url: '/energyIndicators',
    method: 'post',
    data
  });
}

export function fetchUpdateEnergyIndicators(data: EnergyIndicators.UpdateParams) {
  return request<void>({
    url: `/energyIndicators/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeleteEnergyIndicators(id: number) {
  return request<void>({
    url: `/energyIndicators/${id}`,
    method: 'delete'
  });
}

export function fetchBatchDeleteEnergyIndicators(ids: number[]) {
  return request<void>({
    url: '/energyIndicators/batch',
    method: 'delete',
    data: ids
  });
}