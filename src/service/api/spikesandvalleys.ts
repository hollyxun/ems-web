/** 尖峰平谷方案管理 API */

import { request } from '@sa/request';

export namespace SpikesAndValleys {
  /** 方案 */
  export interface Scheme {
    id: number;
    schemeName: string;
    executeTime: string;
    type: string;
    remark: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  }

  /** 时段明细 */
  export interface Item {
    id: number;
    schemeId: number;
    time: string;
    electrovalency: number;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
  }

  /** 方案VO（包含时段明细） */
  export interface SchemeVO {
    id: number;
    schemeName: string;
    executeTime: string;
    type: string;
    remark: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    itemList: Item[];
  }

  export interface SearchParams {
    page: number;
    pageSize: number;
    schemeName?: string;
    type?: string;
  }

  export interface ItemCreate {
    time: string;
    electrovalency: number;
    startTime: string;
    endTime: string;
  }

  export interface CreateParams {
    schemeName: string;
    executeTime: string;
    type: string;
    remark?: string;
    itemList: ItemCreate[];
  }

  export interface UpdateParams {
    id: number;
    schemeName: string;
    executeTime: string;
    type: string;
    remark?: string;
    itemList: ItemCreate[];
  }
}

/** 时段类型选项 */
export const timeTypeOptions = [
  { label: '尖', value: '1' },
  { label: '峰', value: '2' },
  { label: '平', value: '3' },
  { label: '谷', value: '4' }
];

/** 方案类型选项 */
export const schemeTypeOptions = [
  { label: '默认', value: '1' },
  { label: '后勤', value: '2' },
  { label: '外部', value: '3' }
];

export function fetchSpikesAndValleysList(params: SpikesAndValleys.SearchParams) {
  return request<PageResult<SpikesAndValleys.SchemeVO>>({
    url: '/spikesandvalleys/list',
    method: 'get',
    params
  });
}

export function fetchSpikesAndValleysById(id: number) {
  return request<SpikesAndValleys.SchemeVO>({
    url: `/spikesandvalleys/${id}`,
    method: 'get'
  });
}

export function fetchCreateSpikesAndValleys(data: SpikesAndValleys.CreateParams) {
  return request<void>({
    url: '/spikesandvalleys',
    method: 'post',
    data
  });
}

export function fetchUpdateSpikesAndValleys(data: SpikesAndValleys.UpdateParams) {
  return request<void>({
    url: `/spikesandvalleys/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeleteSpikesAndValleys(id: number) {
  return request<void>({
    url: `/spikesandvalleys/${id}`,
    method: 'delete'
  });
}

export function fetchBatchDeleteSpikesAndValleys(ids: number[]) {
  return request<void>({
    url: '/spikesandvalleys/batch',
    method: 'delete',
    data: ids
  });
}
