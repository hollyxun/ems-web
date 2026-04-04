/** 产品产量 API */

import { request } from '@sa/request';

export namespace ProductOutput {
  export interface Item {
    id: number;
    nodeId: string;
    nodeName: string;
    timeType: string;
    dataTime: string;
    name: string;
    number: number;
    unit: string;
    dataType: string;
    productType: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  }

  export interface SearchParams {
    page: number;
    pageSize: number;
    nodeId?: string;
    name?: string;
    timeType?: string;
    dataTime?: string;
    dataType?: string;
    productType?: string;
    beginTime?: string;
    endTime?: string;
  }

  export interface CreateParams {
    nodeId: string;
    nodeName?: string;
    timeType: string;
    dataTime: string;
    name: string;
    number: number;
    unit?: string;
    dataType: string;
    productType?: string;
  }

  export interface UpdateParams {
    id: number;
    nodeId?: string;
    nodeName?: string;
    timeType?: string;
    dataTime?: string;
    name?: string;
    number?: number;
    unit?: string;
    dataType?: string;
    productType?: string;
  }

  export interface BatchDeleteParams {
    ids: number[];
  }
}

export function fetchProductOutputList(params: ProductOutput.SearchParams) {
  return request<PageResult<ProductOutput.Item>>({
    url: '/productoutput/list',
    method: 'get',
    params
  });
}

export function fetchProductOutputAll(nodeId?: string, dataType?: string) {
  return request<ProductOutput.Item[]>({
    url: '/productoutput/all',
    method: 'get',
    params: { nodeId, dataType }
  });
}

export function fetchProductOutputById(id: number) {
  return request<ProductOutput.Item>({
    url: `/productoutput/${id}`,
    method: 'get'
  });
}

export function fetchCreateProductOutput(data: ProductOutput.CreateParams) {
  return request<void>({
    url: '/productoutput',
    method: 'post',
    data
  });
}

export function fetchUpdateProductOutput(data: ProductOutput.UpdateParams) {
  return request<void>({
    url: `/productoutput/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeleteProductOutput(id: number) {
  return request<void>({
    url: `/productoutput/${id}`,
    method: 'delete'
  });
}

export function fetchBatchDeleteProductOutput(ids: number[]) {
  return request<void>({
    url: '/productoutput/batch',
    method: 'delete',
    data: { ids }
  });
}