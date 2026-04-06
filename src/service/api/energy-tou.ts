import { request } from '../request';

// ============ 分时时段管理 ============

/**
 * 创建分时时段
 * @param data 时段信息
 */
export function fetchCreateTouPeriod(data: Api.Energy.TouPeriod) {
  return request<Api.Energy.TouPeriod>({
    url: '/api/v1/energy/tou/createPeriod',
    method: 'post',
    data
  });
}

/**
 * 更新分时时段
 * @param data 时段信息
 */
export function fetchUpdateTouPeriod(data: Partial<Api.Energy.TouPeriod>) {
  return request<Api.Energy.TouPeriod>({
    url: '/api/v1/energy/tou/updatePeriod',
    method: 'put',
    data
  });
}

/**
 * 删除分时时段
 * @param id 时段ID
 */
export function fetchDeleteTouPeriod(id: number) {
  return request({
    url: '/api/v1/energy/tou/deletePeriod',
    method: 'delete',
    data: { id }
  });
}

/**
 * 获取分时时段列表
 * @param params 查询参数
 */
export function fetchGetTouPeriods(params?: Api.Energy.TouPeriodSearchParams) {
  return request<Api.Energy.TouPeriod[]>({
    url: '/api/v1/energy/tou/getPeriods',
    method: 'get',
    params
  });
}

/**
 * 获取当前时段
 * @param factoryId 工厂ID
 */
export function fetchGetCurrentPeriod(factoryId: number) {
  return request<{ period: Api.Energy.TouPeriod; periodType: number }>({
    url: '/api/v1/energy/tou/getCurrentPeriod',
    method: 'get',
    params: { factoryId }
  });
}

// ============ 分时电价管理 ============

/**
 * 创建分时电价
 * @param data 电价信息
 */
export function fetchCreateTouPrice(data: Api.Energy.TouPrice) {
  return request<Api.Energy.TouPrice>({
    url: '/api/v1/energy/tou/createPrice',
    method: 'post',
    data
  });
}

/**
 * 更新分时电价
 * @param data 电价信息
 */
export function fetchUpdateTouPrice(data: Partial<Api.Energy.TouPrice>) {
  return request<Api.Energy.TouPrice>({
    url: '/api/v1/energy/tou/updatePrice',
    method: 'put',
    data
  });
}

/**
 * 删除分时电价
 * @param id 电价ID
 */
export function fetchDeleteTouPrice(id: number) {
  return request({
    url: '/api/v1/energy/tou/deletePrice',
    method: 'delete',
    data: { id }
  });
}

/**
 * 获取分时电价列表
 * @param params 查询参数
 */
export function fetchGetTouPrices(params?: Api.Energy.TouPriceSearchParams) {
  return request<Api.Energy.TouPrice[]>({
    url: '/api/v1/energy/tou/getPrices',
    method: 'get',
    params
  });
}

/**
 * 获取当前电价
 * @param factoryId 工厂ID
 * @param mediumId 介质ID
 */
export function fetchGetCurrentPrice(factoryId: number, mediumId: number) {
  return request<{ price: number; periodType: number; currency: string }>({
    url: '/api/v1/energy/tou/getCurrentPrice',
    method: 'get',
    params: { factoryId, mediumId }
  });
}

// ============ 工厂分时电价 ============

/**
 * 创建工厂分时电价
 * @param data 电价信息
 */
export function fetchCreateFactoryTouPrice(data: Api.Energy.FactoryTouPrice) {
  return request<Api.Energy.FactoryTouPrice>({
    url: '/api/v1/energy/tou/createFactoryPrice',
    method: 'post',
    data
  });
}

/**
 * 更新工厂分时电价
 * @param data 电价信息
 */
export function fetchUpdateFactoryTouPrice(data: Partial<Api.Energy.FactoryTouPrice>) {
  return request<Api.Energy.FactoryTouPrice>({
    url: '/api/v1/energy/tou/updateFactoryPrice',
    method: 'put',
    data
  });
}

/**
 * 删除工厂分时电价
 * @param id 电价ID
 */
export function fetchDeleteFactoryTouPrice(id: number) {
  return request({
    url: '/api/v1/energy/tou/deleteFactoryPrice',
    method: 'delete',
    data: { id }
  });
}

/**
 * 获取工厂分时电价列表
 * @param params 查询参数
 */
export function fetchGetFactoryTouPrices(params: Api.Energy.FactoryTouPriceSearchParams) {
  return request<Api.Energy.FactoryTouPrice[]>({
    url: '/api/v1/energy/tou/getFactoryPrices',
    method: 'get',
    params
  });
}

// ============ 电费计算 ============

/**
 * 计算电费
 * @param data 计算参数
 */
export function fetchCalculateCost(data: {
  factoryId: number;
  mediumId: number;
  startTime: string;
  endTime: string;
  consumptions: { timestamp: string; value: number }[];
}) {
  return request<Api.Energy.CostResult>({
    url: '/api/v1/energy/tou/calculateCost',
    method: 'post',
    data
  });
}
