import { request } from '../request';

/**
 * 设置跨工厂权限
 * @param data 跨工厂权限配置
 */
export function fetchSetCrossFactoryPermission(data: Api.AdvancedPermission.CrossFactoryPermission) {
  return request<boolean>({
    url: '/advancedPermission/setCrossFactoryPermission',
    method: 'post',
    data
  });
}

/**
 * 获取跨工厂权限
 * @param roleId 角色ID
 */
export function fetchGetCrossFactoryPermission(roleId: number) {
  return request<Api.AdvancedPermission.CrossFactoryPermission>({
    url: '/advancedPermission/getCrossFactoryPermission',
    method: 'get',
    params: { roleId }
  });
}

/**
 * 设置班次权限
 * @param data 班次权限配置
 */
export function fetchSetShiftPermission(data: Api.AdvancedPermission.ShiftPermission) {
  return request<boolean>({
    url: '/advancedPermission/setShiftPermission',
    method: 'post',
    data
  });
}

/**
 * 获取班次权限
 * @param roleId 角色ID
 */
export function fetchGetShiftPermission(roleId: number) {
  return request<Api.AdvancedPermission.ShiftPermission>({
    url: '/advancedPermission/getShiftPermission',
    method: 'get',
    params: { roleId }
  });
}

/**
 * 设置操作权限
 * @param data 操作权限配置
 */
export function fetchSetOperationPermission(data: Api.AdvancedPermission.OperationPermission) {
  return request<boolean>({
    url: '/advancedPermission/setOperationPermission',
    method: 'post',
    data
  });
}

/**
 * 获取操作权限列表
 * @param roleId 角色ID
 */
export function fetchGetOperationPermissions(roleId: number) {
  return request<Api.AdvancedPermission.OperationPermission[]>({
    url: '/advancedPermission/getOperationPermissions',
    method: 'get',
    params: { roleId }
  });
}