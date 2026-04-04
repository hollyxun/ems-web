/** 网关设置 API */

import { request } from '@sa/request';

export namespace GatewaySetting {
  export interface Item {
    id: number;
    gatewayNum: string;
    gatewayName: string;
    specsModel: string;
    installLocation: string;
    ipAdd: string;
    runStatus: string;
    hbtTime: string;
    deviceNum: number;
    ptNum: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface SearchParams {
    page: number;
    pageSize: number;
    gatewayNum?: string;
    gatewayName?: string;
    runStatus?: string;
    installLocation?: string;
  }

  export interface CreateParams {
    gatewayNum: string;
    gatewayName: string;
    specsModel?: string;
    installLocation?: string;
    ipAdd?: string;
    runStatus?: string;
    hbtTime?: string;
    deviceNum?: number;
    ptNum?: number;
  }

  export interface UpdateParams {
    id: number;
    gatewayNum?: string;
    gatewayName?: string;
    specsModel?: string;
    installLocation?: string;
    ipAdd?: string;
    runStatus?: string;
    hbtTime?: string;
    deviceNum?: number;
    ptNum?: number;
  }
}

/** 获取网关配置列表 */
export function fetchGatewaySettingList(params: GatewaySetting.SearchParams) {
  return request<PageResult<GatewaySetting.Item>>({
    url: '/gatewaySetting/list',
    method: 'get',
    params
  });
}

/** 获取所有网关配置（用于下拉选择） */
export function fetchGatewaySettingAll() {
  return request<GatewaySetting.Item[]>({
    url: '/gatewaySetting/all',
    method: 'get'
  });
}

/** 根据ID获取网关配置 */
export function fetchGatewaySettingById(id: number) {
  return request<GatewaySetting.Item>({
    url: `/gatewaySetting/${id}`,
    method: 'get'
  });
}

/** 创建网关配置 */
export function fetchCreateGatewaySetting(data: GatewaySetting.CreateParams) {
  return request<void>({
    url: '/gatewaySetting',
    method: 'post',
    data
  });
}

/** 更新网关配置 */
export function fetchUpdateGatewaySetting(data: GatewaySetting.UpdateParams) {
  return request<void>({
    url: `/gatewaySetting/${data.id}`,
    method: 'put',
    data
  });
}

/** 删除网关配置 */
export function fetchDeleteGatewaySetting(id: number) {
  return request<void>({
    url: `/gatewaySetting/${id}`,
    method: 'delete'
  });
}

/** 批量删除网关配置 */
export function fetchBatchDeleteGatewaySetting(ids: number[]) {
  return request<void>({
    url: '/gatewaySetting/batch',
    method: 'delete',
    data: ids
  });
}