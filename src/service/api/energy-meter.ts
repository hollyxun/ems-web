import { request } from '../request';

// ============ 计量点管理 ============

/**
 * 创建计量点
 * @param data 计量点信息
 */
export function fetchCreateMeter(data: Api.Energy.MeteringPoint) {
  return request<Api.Energy.MeteringPoint>({
    url: '/api/v1/energy/meter/createMeter',
    method: 'post',
    data
  });
}

/**
 * 更新计量点
 * @param data 计量点信息
 */
export function fetchUpdateMeter(data: Partial<Api.Energy.MeteringPoint>) {
  return request<Api.Energy.MeteringPoint>({
    url: '/api/v1/energy/meter/updateMeter',
    method: 'put',
    data
  });
}

/**
 * 删除计量点
 * @param id 计量点ID
 */
export function fetchDeleteMeter(id: number) {
  return request({
    url: '/api/v1/energy/meter/deleteMeter',
    method: 'delete',
    data: { id }
  });
}

/**
 * 获取计量点列表
 * @param params 查询参数
 */
export function fetchGetMeterList(params: Api.Energy.MeterSearchParams) {
  return request<Api.Energy.MeterList>({
    url: '/api/v1/energy/meter/getMeterList',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取计量点
 * @param id 计量点ID
 */
export function fetchGetMeterById(id: number) {
  return request<Api.Energy.MeteringPoint>({
    url: '/api/v1/energy/meter/getMeterById',
    method: 'get',
    params: { id }
  });
}

/**
 * 绑定计量点到组织
 * @param meterId 计量点ID
 * @param organizationId 组织ID
 */
export function fetchBindMeterToOrg(meterId: number, organizationId: number) {
  return request({
    url: '/api/v1/energy/meter/bindToOrg',
    method: 'put',
    data: { meterId, organizationId }
  });
}

/**
 * 获取计量点二维码
 * @param id 计量点ID
 */
export function fetchGetQRCode(id: number) {
  return request<{ qrCode: string; meterId: number; meterName: string }>({
    url: '/api/v1/energy/meter/getQRCode',
    method: 'get',
    params: { id }
  });
}

// ============ 计量点树 ============

/**
 * 获取计量点树
 * @param meterId 父计量点ID
 */
export function fetchGetMeterTree(meterId: number) {
  return request<Api.Energy.MeterTreeNode>({
    url: '/api/v1/energy/meter/getMeterTree',
    method: 'get',
    params: { meterId }
  });
}

/**
 * 创建计量点父子关系
 * @param parentId 父计量点ID
 * @param childId 子计量点ID
 */
export function fetchCreateMeterTree(parentId: number, childId: number) {
  return request({
    url: '/api/v1/energy/meter/createMeterTree',
    method: 'post',
    data: { parentId, childId }
  });
}

/**
 * 删除计量点父子关系
 * @param parentId 父计量点ID
 * @param childId 子计量点ID
 */
export function fetchDeleteMeterTree(parentId: number, childId: number) {
  return request({
    url: '/api/v1/energy/meter/deleteMeterTree',
    method: 'delete',
    data: { parentId, childId }
  });
}

/**
 * 计算平衡率
 * @param parentId 父计量点ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function fetchCalculateBalance(parentId: number, startTime: string, endTime: string) {
  return request<Api.Energy.BalanceResult>({
    url: '/api/v1/energy/meter/calculateBalance',
    method: 'get',
    params: { parentId, startTime, endTime }
  });
}

// ============ 计量点状态 ============

/**
 * 获取离线计量点列表
 */
export function fetchGetOfflineMeters() {
  return request<Api.Energy.MeteringPoint[]>({
    url: '/api/v1/energy/meter/getOfflineMeters',
    method: 'get'
  });
}

/**
 * 获取计量点状态变更日志
 * @param meterId 计量点ID
 */
export function fetchGetStatusLog(meterId: number) {
  return request<{ list: Api.Energy.MeterStatusLog[]; total: number }>({
    url: '/api/v1/energy/meter/getStatusLog',
    method: 'get',
    params: { meterId }
  });
}

/**
 * 标记计量点为故障
 * @param meterId 计量点ID
 * @param reason 故障原因
 */
export function fetchMarkAsFault(meterId: number, reason: string) {
  return request({
    url: '/api/v1/energy/meter/markAsFault',
    method: 'put',
    data: { meterId, reason }
  });
}

/**
 * 获取所有在线计量点
 */
export function fetchGetAllOnlineMeters() {
  return request<Api.Energy.MeteringPoint[]>({
    url: '/api/v1/energy/meter/getAllOnlineMeters',
    method: 'get'
  });
}
