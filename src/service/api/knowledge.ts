import { request } from '../request';

export function fetchKnowledgeList(params: Api.Knowledge.SearchParams) {
  return request<Api.Knowledge.ListResponse>({
    url: '/knowledge/list',
    method: 'get',
    params
  });
}

export function fetchKnowledgeById(id: string) {
  return request<Api.Knowledge.Item>({
    url: `/knowledge/${id}`,
    method: 'get'
  });
}

export function fetchCreateKnowledge(data: Api.Knowledge.CreateParams) {
  return request<Api.Knowledge.Item>({
    url: '/knowledge/create',
    method: 'post',
    data
  });
}

export function fetchUpdateKnowledge(data: Api.Knowledge.UpdateParams) {
  return request<Api.Knowledge.Item>({
    url: '/knowledge/update',
    method: 'put',
    data
  });
}

export function fetchDeleteKnowledge(id: string) {
  return request({
    url: `/knowledge/${id}`,
    method: 'delete'
  });
}

export function fetchBatchDeleteKnowledge(ids: string[]) {
  return request({
    url: '/knowledge/batch-delete',
    method: 'post',
    data: { ids }
  });
}