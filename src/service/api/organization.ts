import { request } from '../request';

/**
 * Organization API
 */

/** Get organization tree */
export function fetchOrganizationTree(status?: number) {
  return request<Api.Organization.OrganizationItem[]>({
    url: '/api/v1/organization/tree',
    method: 'get',
    params: status ? { status } : undefined
  });
}

/** Get organization list (paginated) */
export function fetchOrganizationList(data: Api.Organization.SearchRequest) {
  return request<Api.Organization.OrganizationList>({
    url: '/api/v1/organization/list',
    method: 'post',
    data
  });
}

/** Get organization by id */
export function fetchOrganizationById(id: number) {
  return request<Api.Organization.OrganizationItem>({
    url: '/api/v1/organization/detail',
    method: 'get',
    params: { id }
  });
}

/** Create organization */
export function fetchCreateOrganization(data: Api.Organization.CreateRequest) {
  return request<Api.Organization.OrganizationItem>({
    url: '/api/v1/organization/create',
    method: 'post',
    data
  });
}

/** Update organization */
export function fetchUpdateOrganization(data: Api.Organization.UpdateRequest) {
  return request<boolean>({
    url: '/api/v1/organization/update',
    method: 'put',
    data
  });
}

/** Delete organization */
export function fetchDeleteOrganization(id: number) {
  return request<boolean>({
    url: '/api/v1/organization/delete',
    method: 'delete',
    params: { id }
  });
}
