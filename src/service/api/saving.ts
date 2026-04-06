import { request } from '../request';

// ============ 节能项目 API ============

export function fetchProgramList(params: Api.Saving.Program.SearchParams) {
  return request<Api.Saving.Program.ListResponse>({
    url: '/saving/program/list',
    method: 'get',
    params
  });
}

export function fetchProgramById(id: number) {
  return request<Api.Saving.Program.Item>({
    url: `/saving/program/${id}`,
    method: 'get'
  });
}

export function fetchCreateProgram(data: Api.Saving.Program.CreateParams) {
  return request<Api.Saving.Program.Item>({
    url: '/saving/program/create',
    method: 'post',
    data
  });
}

export function fetchUpdateProgram(data: Api.Saving.Program.UpdateParams) {
  return request<Api.Saving.Program.Item>({
    url: '/saving/program/update',
    method: 'put',
    data
  });
}

export function fetchDeleteProgram(id: number) {
  return request({
    url: `/saving/program/${id}`,
    method: 'delete'
  });
}

// ============ 政策法规 API ============

export function fetchPolicyList(params: Api.Saving.Policy.SearchParams) {
  return request<Api.Saving.Policy.ListResponse>({
    url: '/saving/policy/list',
    method: 'get',
    params
  });
}

export function fetchPolicyById(id: number) {
  return request<Api.Saving.Policy.Item>({
    url: `/saving/policy/${id}`,
    method: 'get'
  });
}

export function fetchCreatePolicy(data: Api.Saving.Policy.CreateParams) {
  return request<Api.Saving.Policy.Item>({
    url: '/saving/policy/create',
    method: 'post',
    data
  });
}

export function fetchUpdatePolicy(data: Api.Saving.Policy.UpdateParams) {
  return request<Api.Saving.Policy.Item>({
    url: '/saving/policy/update',
    method: 'put',
    data
  });
}

export function fetchDeletePolicy(id: number) {
  return request({
    url: `/saving/policy/${id}`,
    method: 'delete'
  });
}