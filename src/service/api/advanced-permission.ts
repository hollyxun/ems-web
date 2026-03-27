import { request } from '../request';

// Types
export interface CrossFactoryPermission {
  roleId: number;
  allowed: boolean;
  factoryIds: number[];
}

export interface ShiftPermission {
  roleId: number;
  scope: 'own' | 'all';
}

export interface OperationPermission {
  roleId: number;
  module: string;
  operation: 'view' | 'enter' | 'modify' | 'delete' | 'export';
  allowed: boolean;
}

export interface RolePermissionConfig {
  roleId: number;
  roleName: string;
  crossFactory: CrossFactoryPermission;
  shift: ShiftPermission;
  operations: OperationPermission[];
}

// API Functions

/** Set cross-factory permission for a role */
export function fetchSetCrossFactoryPermission(data: CrossFactoryPermission) {
  return request<void>({
    url: '/advancedPermission/setCrossFactoryPermission',
    method: 'post',
    data
  });
}

/** Get cross-factory permission for a role */
export function fetchGetCrossFactoryPermission(roleId: number) {
  return request<CrossFactoryPermission>({
    url: '/advancedPermission/getCrossFactoryPermission',
    method: 'get',
    params: { roleId }
  });
}

/** Set shift permission for a role */
export function fetchSetShiftPermission(data: ShiftPermission) {
  return request<void>({
    url: '/advancedPermission/setShiftPermission',
    method: 'post',
    data
  });
}

/** Get shift permission for a role */
export function fetchGetShiftPermission(roleId: number) {
  return request<ShiftPermission>({
    url: '/advancedPermission/getShiftPermission',
    method: 'get',
    params: { roleId }
  });
}

/** Set operation permission for a role */
export function fetchSetOperationPermission(data: OperationPermission) {
  return request<void>({
    url: '/advancedPermission/setOperationPermission',
    method: 'post',
    data
  });
}

/** Get operation permissions for a role */
export function fetchGetOperationPermissions(roleId: number) {
  return request<OperationPermission[]>({
    url: '/advancedPermission/getOperationPermissions',
    method: 'get',
    params: { roleId }
  });
}