import { request } from '../request';

/**
 * Create production data
 * @param data Production data
 */
export function fetchCreateProductionData(data: Api.Production.CreateProductionDataParams) {
  return request<Api.Production.ProductionData>({
    url: '/production/create',
    method: 'post',
    data
  });
}

/**
 * Update production data
 * @param data Production data
 */
export function fetchUpdateProductionData(data: Api.Production.UpdateProductionDataParams) {
  return request<boolean>({
    url: '/production/update',
    method: 'put',
    data
  });
}

/**
 * Delete production data
 * @param id Production data ID
 */
export function fetchDeleteProductionData(id: number) {
  return request<boolean>({
    url: '/production/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * Get production data by ID
 * @param id Production data ID
 */
export function fetchGetProductionDataById(id: number) {
  return request<Api.Production.ProductionData>({
    url: '/production/detail',
    method: 'get',
    params: { id }
  });
}

/**
 * Get production data list
 * @param data Search params
 */
export function fetchGetProductionDataList(data: Api.Production.ProductionSearchParams) {
  return request<Api.Common.PageResult<Api.Production.ProductionData>>({
    url: '/production/list',
    method: 'post',
    data
  });
}

/**
 * Approve production data
 * @param id Production data ID
 */
export function fetchApproveProductionData(id: number) {
  return request<boolean>({
    url: '/production/approve',
    method: 'post',
    data: { id }
  });
}

/**
 * Calculate specific consumption
 * @param productionId Production data ID
 */
export function fetchCalculateSpecificConsumption(productionId: number) {
  return request<number>({
    url: '/production/calculateSpecific',
    method: 'post',
    data: { productionId }
  });
}

/**
 * Get production summary
 * @param params Summary params
 */
export function fetchGetProductionSummary(params: { startDate: string; endDate: string; teamIds?: number[] }) {
  return request<Api.Production.ProductionSummary[]>({
    url: '/production/summary',
    method: 'get',
    params
  });
}

/**
 * Link to attribution
 * @param productionId Production data ID
 * @param shiftAttributionId Shift attribution ID
 */
export function fetchLinkToAttribution(productionId: number, shiftAttributionId: number) {
  return request<boolean>({
    url: '/production/linkAttribution',
    method: 'post',
    data: { productionId, shiftAttributionId }
  });
}
