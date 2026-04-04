import { request } from '../request';

/**
 * Power Distribution (配电室) Management API
 */

/** get power distribution list */
export function fetchGetPowerDistributionList(params?: Api.PowerDistribution.PowerDistributionSearchParams) {
  return request<Api.PowerDistribution.PowerDistributionList>({
    url: '/api/v1/powerDistribution/getPowerDistributionList',
    method: 'get',
    params
  });
}

/** get all power distributions */
export function fetchGetAllPowerDistributions() {
  return request<Api.PowerDistribution.PowerDistribution[]>({
    url: '/api/v1/powerDistribution/getAllPowerDistributions',
    method: 'get'
  });
}

/** get power distribution by id */
export function fetchGetPowerDistributionById(id: number) {
  return request<Api.PowerDistribution.PowerDistribution>({
    url: '/api/v1/powerDistribution/getPowerDistributionById',
    method: 'get',
    params: { id }
  });
}

/** create power distribution */
export function fetchCreatePowerDistribution(data: Partial<Api.PowerDistribution.PowerDistribution>) {
  return request<boolean>({
    url: '/api/v1/powerDistribution/createPowerDistribution',
    method: 'post',
    data
  });
}

/** update power distribution */
export function fetchUpdatePowerDistribution(data: Partial<Api.PowerDistribution.PowerDistribution> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/powerDistribution/updatePowerDistribution',
    method: 'put',
    data
  });
}

/** delete power distributions (batch) */
export function fetchDeletePowerDistributions(ids: number[]) {
  return request<boolean>({
    url: '/api/v1/powerDistribution/deletePowerDistributions',
    method: 'delete',
    data: { ids }
  });
}