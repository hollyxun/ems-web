import { request } from '../request';

// ============ 虚拟计量点管理 ============

/**
 * 创建虚拟计量点
 * @param data 虚拟计量点信息
 */
export function fetchCreateVirtualMeter(data: Api.Energy.VirtualMeterCreate) {
  return request<Api.Energy.VirtualMeter>({
    url: '/api/v1/energy/virtual-meter/create',
    method: 'post',
    data
  });
}

/**
 * 更新虚拟计量点
 * @param data 虚拟计量点信息
 */
export function fetchUpdateVirtualMeter(data: Partial<Api.Energy.VirtualMeterUpdate>) {
  return request<Api.Energy.VirtualMeter>({
    url: '/api/v1/energy/virtual-meter/update',
    method: 'put',
    data
  });
}

/**
 * 删除虚拟计量点
 * @param id 虚拟计量点ID
 */
export function fetchDeleteVirtualMeter(id: number) {
  return request({
    url: '/api/v1/energy/virtual-meter/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * 获取虚拟计量点列表
 * @param params 查询参数
 */
export function fetchGetVirtualMeterList(params: Api.Energy.VirtualMeterSearchParams) {
  return request<Api.Energy.VirtualMeterList>({
    url: '/api/v1/energy/virtual-meter/list',
    method: 'get',
    params
  });
}

/**
 * 根据ID获取虚拟计量点详情
 * @param id 虚拟计量点ID
 */
export function fetchGetVirtualMeterById(id: number) {
  return request<Api.Energy.VirtualMeter>({
    url: '/api/v1/energy/virtual-meter/get',
    method: 'get',
    params: { id }
  });
}

/**
 * 验证公式
 * @param data 公式验证请求
 */
export function fetchValidateFormula(data: Api.Energy.ValidateFormulaRequest) {
  return request<Api.Energy.FormulaValidationResult>({
    url: '/api/v1/energy/virtual-meter/validate-formula',
    method: 'post',
    data
  });
}

/**
 * 计算虚拟计量点
 * @param data 计算请求
 */
export function fetchCalculateVirtualMeter(data: Api.Energy.CalculateVirtualMeterRequest) {
  return request<Api.Energy.VirtualMeterCalculateResult>({
    url: '/api/v1/energy/virtual-meter/calculate',
    method: 'post',
    data
  });
}

/**
 * 获取可用的源计量点列表
 * @param mediumId 能源介质ID
 */
export function fetchGetAvailableSourceMeters(mediumId?: number) {
  return request<Api.Energy.MeteringPoint[]>({
    url: '/api/v1/energy/virtual-meter/available-sources',
    method: 'get',
    params: { mediumId }
  });
}
