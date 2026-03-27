import { request } from '../request';

/**
 * 创建能源介质
 * @param data 介质信息
 */
export function fetchCreateMedium(data: Api.Energy.Medium) {
  return request<Api.Energy.Medium>({
    url: '/api/v1/energy/medium/createMedium',
    method: 'post',
    data
  });
}

/**
 * 更新能源介质
 * @param data 介质信息
 */
export function fetchUpdateMedium(data: Api.Energy.Medium) {
  return request<Api.Energy.Medium>({
    url: '/api/v1/energy/medium/updateMedium',
    method: 'put',
    data
  });
}

/**
 * 删除能源介质
 * @param id 介质ID
 */
export function fetchDeleteMedium(id: number) {
  return request({
    url: '/api/v1/energy/medium/deleteMedium',
    method: 'delete',
    data: { id }
  });
}

/**
 * 根据ID获取能源介质
 * @param id 介质ID
 */
export function fetchGetMediumById(id: number) {
  return request<Api.Energy.Medium>({
    url: '/api/v1/energy/medium/getMediumById',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取能源介质列表
 * @param params 查询参数
 */
export function fetchGetMediumList(params: Api.Energy.MediumSearchParams) {
  return request<Api.Energy.MediumList>({
    url: '/api/v1/energy/medium/getMediumList',
    method: 'get',
    params
  });
}

/**
 * 获取所有能源介质
 */
export function fetchGetAllMediums() {
  return request<Api.Energy.Medium[]>({
    url: '/api/v1/energy/medium/getAllMediums',
    method: 'get'
  });
}

/**
 * 修改能源介质状态
 * @param id 介质ID
 * @param status 状态
 */
export function fetchChangeMediumStatus(id: number, status: number) {
  return request({
    url: '/api/v1/energy/medium/changeMediumStatus',
    method: 'put',
    data: { id, status }
  });
}

// ============ 介质单位 ============

/**
 * 创建介质单位
 * @param data 单位信息
 */
export function fetchCreateUnit(data: Api.Energy.Unit) {
  return request<Api.Energy.Unit>({
    url: '/api/v1/energy/unit/createUnit',
    method: 'post',
    data
  });
}

/**
 * 更新介质单位
 * @param data 单位信息
 */
export function fetchUpdateUnit(data: Api.Energy.Unit) {
  return request<Api.Energy.Unit>({
    url: '/api/v1/energy/unit/updateUnit',
    method: 'put',
    data
  });
}

/**
 * 删除介质单位
 * @param id 单位ID
 */
export function fetchDeleteUnit(id: number) {
  return request({
    url: '/api/v1/energy/unit/deleteUnit',
    method: 'delete',
    data: { id }
  });
}

/**
 * 根据ID获取介质单位
 * @param id 单位ID
 */
export function fetchGetUnitById(id: number) {
  return request<Api.Energy.UnitView>({
    url: '/api/v1/energy/unit/getUnitById',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取介质单位列表
 * @param params 查询参数
 */
export function fetchGetUnitList(params: Api.Energy.UnitSearchParams) {
  return request<{ list: Api.Energy.UnitView[]; total: number }>({
    url: '/api/v1/energy/unit/getUnitList',
    method: 'get',
    params
  });
}

/**
 * 获取指定介质的所有单位
 * @param mediumId 介质ID
 */
export function fetchGetUnitsByMedium(mediumId: number) {
  return request<Api.Energy.Unit[]>({
    url: '/api/v1/energy/unit/getUnitsByMedium',
    method: 'get',
    params: { mediumId }
  });
}

/**
 * 设置标准单位
 * @param id 单位ID
 */
export function fetchSetStandardUnit(id: number) {
  return request({
    url: '/api/v1/energy/unit/setStandardUnit',
    method: 'put',
    data: { id }
  });
}

// ============ 系数折算 ============

/**
 * 创建系数折算
 * @param data 系数信息
 */
export function fetchCreateCoefficient(data: Api.Energy.Coefficient) {
  return request<Api.Energy.Coefficient>({
    url: '/api/v1/energy/coefficient/createCoefficient',
    method: 'post',
    data
  });
}

/**
 * 更新系数折算
 * @param data 系数信息
 */
export function fetchUpdateCoefficient(data: Api.Energy.Coefficient) {
  return request<Api.Energy.Coefficient>({
    url: '/api/v1/energy/coefficient/updateCoefficient',
    method: 'put',
    data
  });
}

/**
 * 删除系数折算
 * @param id 系数ID
 */
export function fetchDeleteCoefficient(id: number) {
  return request({
    url: '/api/v1/energy/coefficient/deleteCoefficient',
    method: 'delete',
    data: { id }
  });
}

/**
 * 根据ID获取系数折算
 * @param id 系数ID
 */
export function fetchGetCoefficientById(id: number) {
  return request<Api.Energy.CoefficientView>({
    url: '/api/v1/energy/coefficient/getCoefficientById',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取系数折算列表
 * @param params 查询参数
 */
export function fetchGetCoefficientList(params: Api.Energy.CoefficientSearchParams) {
  return request<Api.Energy.CoefficientList>({
    url: '/api/v1/energy/coefficient/getCoefficientList',
    method: 'get',
    params
  });
}

/**
 * 获取有效系数
 * @param mediumId 介质ID
 * @param coefficientType 系数类型
 * @param queryDate 查询日期
 */
export function fetchGetEffectiveCoefficient(mediumId: number, coefficientType: number, queryDate?: string) {
  return request<Api.Energy.Coefficient>({
    url: '/api/v1/energy/coefficient/getEffectiveCoefficient',
    method: 'get',
    params: { mediumId, coefficientType, queryDate }
  });
}

// ============ 介质台账 ============

/**
 * 获取介质台账列表
 * @param params 查询参数
 */
export function fetchGetLedgerList(params: Api.Energy.LedgerSearchParams) {
  return request<Api.Energy.LedgerList>({
    url: '/api/v1/energy/ledger/getLedgerList',
    method: 'get',
    params
  });
}

/**
 * 获取介质台账详情
 * @param mediumId 介质ID
 * @param queryDate 查询日期
 */
export function fetchGetLedgerDetail(mediumId: number, queryDate?: string) {
  return request<Api.Energy.Ledger>({
    url: '/api/v1/energy/ledger/getLedgerDetail',
    method: 'get',
    params: { mediumId, queryDate }
  });
}

// ============ SSE实时数据 ============

/**
 * 获取SSE服务状态
 */
export function fetchSSEStatus() {
  return request<{ connectionCount: number; channelCount: number; status: string }>({
    url: '/api/v1/energy/sse/status',
    method: 'get'
  });
}

/**
 * 注册计量点到SSE通道
 * @param data 注册请求
 */
export function fetchRegisterMeter(data: { meterId: number; factoryId: number; workshopId?: number }) {
  return request<{ message: string }>({
    url: '/api/v1/energy/sse/register-meter',
    method: 'post',
    data
  });
}

/**
 * 取消SSE订阅
 * @param data 通道范围
 */
export function fetchUnsubscribeSSE(data: Api.Energy.Realtime.ChannelScope) {
  return request<{ message: string }>({
    url: '/api/v1/energy/sse/unsubscribe',
    method: 'post',
    data
  });
}
