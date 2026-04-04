/** 标杆管理 API */

import { request } from '@sa/request';

export namespace Benchmark {
  export interface Item {
    id: number;
    code: string;
    type: string;
    grade: string;
    value: string;
    nationalNum: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface SearchParams {
    page: number;
    pageSize: number;
    code?: string;
    type?: string;
    grade?: string;
  }

  export interface CreateParams {
    code: string;
    type: string;
    grade?: string;
    value?: string;
    nationalNum?: string;
  }

  export interface UpdateParams {
    id: number;
    code?: string;
    type?: string;
    grade?: string;
    value?: string;
    nationalNum?: string;
  }
}

export function fetchBenchmarkList(params: Benchmark.SearchParams) {
  return request<PageResult<Benchmark.Item>>({
    url: '/benchmark/list',
    method: 'get',
    params
  });
}

export function fetchBenchmarkById(id: number) {
  return request<Benchmark.Item>({
    url: `/benchmark/${id}`,
    method: 'get'
  });
}

export function fetchCreateBenchmark(data: Benchmark.CreateParams) {
  return request<void>({
    url: '/benchmark',
    method: 'post',
    data
  });
}

export function fetchUpdateBenchmark(data: Benchmark.UpdateParams) {
  return request<void>({
    url: `/benchmark/${data.id}`,
    method: 'put',
    data
  });
}

export function fetchDeleteBenchmark(id: number) {
  return request<void>({
    url: `/benchmark/${id}`,
    method: 'delete'
  });
}