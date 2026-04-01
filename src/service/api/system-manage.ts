import { request } from '../request';

/**
 * User API
 */

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/api/v1/user/list',
    method: 'get',
    params
  });
}

/** get user by id */
export function fetchGetUserById(id: number) {
  return request<Api.SystemManage.User>({
    url: '/api/v1/user/get',
    method: 'get',
    params: { id }
  });
}

/** create user */
export function fetchCreateUser(data: Partial<Api.SystemManage.User> & { password?: string }) {
  return request<boolean>({
    url: '/api/v1/user/create',
    method: 'post',
    data
  });
}

/** update user */
export function fetchUpdateUser(data: Partial<Api.SystemManage.User>) {
  return request<boolean>({
    url: '/api/v1/user/update',
    method: 'put',
    data
  });
}

/** delete user */
export function fetchDeleteUser(id: number) {
  return request<boolean>({
    url: '/api/v1/user/delete',
    method: 'delete',
    params: { id }
  });
}

/** batch delete users */
export function fetchBatchDeleteUsers(ids: number[]) {
  return request<boolean>({
    url: '/api/v1/user/deleteByIds',
    method: 'delete',
    data: { ids }
  });
}

/**
 * Role API
 */

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/api/v1/authority/list',
    method: 'get',
    params
  });
}

/** get all roles */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.Role[]>({
    url: '/api/v1/authority/tree',
    method: 'get'
  });
}

/** create role (RBAC-1: support multiple parent roles via parentIds) */
export function fetchCreateRole(data: {
  parentIds?: number[];
  authorityName: string;
  authorityId: number;
  defaultRouter?: string;
  dataScope?: string;
  status?: number;
}) {
  return request<number>({
    url: '/api/v1/authority/create',
    method: 'post',
    data
  });
}

/** update role (RBAC-1: support multiple parent roles via parentIds) */
export function fetchUpdateRole(data: {
  authorityId: number;
  authorityName: string;
  parentIds?: number[];
  defaultRouter?: string;
  dataScope?: string;
  status?: number;
}) {
  return request<boolean>({
    url: '/api/v1/authority/update',
    method: 'put',
    data
  });
}

/** delete role */
export function fetchDeleteRole(id: number) {
  return request<boolean>({
    url: '/api/v1/authority/delete',
    method: 'delete',
    params: { id }
  });
}

/** get role tree */
export function fetchGetRoleTree() {
  return request<Api.SystemManage.Role[]>({
    url: '/api/v1/authority/tree',
    method: 'get'
  });
}

/**
 * Role Inheritance API (RBAC-1)
 */

/** get role detail with parent roles */
export function fetchGetRoleDetail(roleId: number) {
  return request<Api.SystemManage.RoleDetail>({
    url: '/api/v1/authority/detail',
    method: 'get',
    params: { id: roleId }
  });
}

/** batch set parent roles */
export function fetchBatchSetParentRoles(data: Api.SystemManage.BatchSetParentRolesParams) {
  return request<boolean>({
    url: '/api/v1/roleInheritance/batchSetParent',
    method: 'post',
    data
  });
}

/** get parent roles */
export function fetchGetParentRoles(roleId: number) {
  return request<number[]>({
    url: '/api/v1/roleInheritance/parents',
    method: 'get',
    params: { roleId }
  });
}

/** get ancestor roles (all parent roles recursively) */
export function fetchGetAncestorRoles(roleId: number) {
  return request<Api.SystemManage.RoleInheritanceNode[]>({
    url: '/api/v1/roleInheritance/ancestors',
    method: 'get',
    params: { roleId }
  });
}

/** get child roles */
export function fetchGetChildRoles(roleId: number) {
  return request<Api.SystemManage.RoleInheritanceNode[]>({
    url: '/api/v1/roleInheritance/children',
    method: 'get',
    params: { roleId }
  });
}

/** get descendant roles (all children recursively) */
export function fetchGetDescendantRoles(roleId: number) {
  return request<Api.SystemManage.RoleInheritanceNode[]>({
    url: '/api/v1/roleInheritance/descendants',
    method: 'get',
    params: { roleId }
  });
}

/** check circular reference */
export function fetchCheckCircularReference(data: Api.SystemManage.CheckCircularParams) {
  return request<boolean>({
    url: '/api/v1/roleInheritance/checkCircular',
    method: 'post',
    data
  });
}

/** get role hierarchy depth */
export function fetchGetRoleHierarchyDepth(roleId: number) {
  return request<number>({
    url: '/api/v1/roleInheritance/depth',
    method: 'get',
    params: { roleId }
  });
}

/**
 * Menu API
 */

/** get menu list */
export function fetchGetMenuList(params?: {
  page: number;
  pageSize: number;
  title?: string;
  path?: string;
  menuType?: string;
}) {
  return request<Api.SystemManage.MenuList>({
    url: '/api/v1/menu/list',
    method: 'get',
    params
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/api/v1/menu/tree',
    method: 'get'
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/api/v1/menu/allPages',
    method: 'get'
  });
}

/** get user menus */
export function fetchGetUserMenus() {
  return request<Api.SystemManage.Menu[]>({
    url: '/api/v1/menu/userMenus',
    method: 'get'
  });
}

/** create menu */
export function fetchCreateMenu(data: {
  parentId: string;
  path: string;
  name: string;
  hidden: number;
  component: string;
  sort: number;
  keepAlive: number;
  title: string;
  icon: string;
  menuType: string;
  isFrame: number;
}) {
  return request<boolean>({
    url: '/api/v1/menu/create',
    method: 'post',
    data
  });
}

/** update menu */
export function fetchUpdateMenu(data: Partial<Api.SystemManage.Menu> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/menu/update',
    method: 'put',
    data
  });
}

/** delete menu */
export function fetchDeleteMenu(id: number) {
  return request<boolean>({
    url: '/api/v1/menu/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * API Management
 */

/** get api list */
export function fetchGetApiList(params?: Api.SystemManage.ApiSearchParams) {
  return request<Api.SystemManage.ApiList>({
    url: '/api/v1/api/list',
    method: 'get',
    params
  });
}

/** get all apis */
export function fetchGetAllApis() {
  return request<Api.SystemManage.ApiItem[]>({
    url: '/api/v1/api/all',
    method: 'get'
  });
}

/** create api */
export function fetchCreateApi(data: {
  path: string;
  description: string;
  apiGroup: string;
  method: string;
  status?: number;
}) {
  return request<boolean>({
    url: '/api/v1/api/create',
    method: 'post',
    data
  });
}

/** update api */
export function fetchUpdateApi(data: Partial<Api.SystemManage.ApiItem> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/api/update',
    method: 'put',
    data
  });
}

/** delete api */
export function fetchDeleteApi(id: number) {
  return request<boolean>({
    url: '/api/v1/api/delete',
    method: 'delete',
    params: { id }
  });
}

/** batch delete apis */
export function fetchBatchDeleteApis(ids: number[]) {
  return request<boolean>({
    url: '/api/v1/api/deleteByIds',
    method: 'delete',
    data: { ids }
  });
}

/**
 * Operation Record API
 */

/** get operation record list */
export function fetchGetOperationRecordList(params?: Api.SystemManage.OperationRecordSearchParams) {
  return request<Api.SystemManage.OperationRecordList>({
    url: '/api/v1/operationRecord/list',
    method: 'get',
    params
  });
}

/** delete operation record */
export function fetchDeleteOperationRecord(id: number) {
  return request<boolean>({
    url: '/api/v1/operationRecord/delete',
    method: 'delete',
    params: { id }
  });
}

/** batch delete operation records */
export function fetchBatchDeleteOperationRecords(ids: number[]) {
  return request<boolean>({
    url: '/api/v1/operationRecord/deleteByIds',
    method: 'delete',
    data: { ids }
  });
}

/**
 * Dictionary API
 */

/** get dictionary list */
export function fetchGetDictionaryList(params?: Api.SystemManage.DictionarySearchParams) {
  return request<Api.SystemManage.DictionaryList>({
    url: '/api/v1/dictionary/list',
    method: 'get',
    params
  });
}

/** get dictionary by type */
export function fetchGetDictionaryByType(type: string) {
  return request<Api.SystemManage.Dictionary>({
    url: '/api/v1/dictionary/getByType',
    method: 'get',
    params: { type }
  });
}

/** create dictionary */
export function fetchCreateDictionary(data: { name: string; type: string; status: number; description: string }) {
  return request<boolean>({
    url: '/api/v1/dictionary/create',
    method: 'post',
    data
  });
}

/** update dictionary */
export function fetchUpdateDictionary(data: Partial<Api.SystemManage.Dictionary> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/dictionary/update',
    method: 'put',
    data
  });
}

/** delete dictionary */
export function fetchDeleteDictionary(id: number) {
  return request<boolean>({
    url: '/api/v1/dictionary/delete',
    method: 'delete',
    params: { id }
  });
}

/** create dictionary data */
export function fetchCreateDictionaryData(data: {
  dictionaryId: number;
  label: string;
  value: string;
  status: number;
  sort: number;
  remark: string;
}) {
  return request<boolean>({
    url: '/api/v1/dictionaryData/create',
    method: 'post',
    data
  });
}

/** update dictionary data */
export function fetchUpdateDictionaryData(data: Partial<Api.SystemManage.DictionaryData> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/dictionaryData/update',
    method: 'put',
    data
  });
}

/** delete dictionary data */
export function fetchDeleteDictionaryData(id: number) {
  return request<boolean>({
    url: '/api/v1/dictionaryData/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * Role Menu Permission API
 */

/** get role menu ids */
export function fetchGetRoleMenus(roleId: number) {
  return request<number[]>({
    url: '/api/v1/roleMenu/getRoleMenus',
    method: 'get',
    params: { roleId }
  });
}

/** set role menus (RBAC-1: support effect param) */
export function fetchSetRoleMenus(data: Api.SystemManage.SetRoleMenusParams) {
  return request<boolean>({
    url: '/api/v1/roleMenu/setRoleMenus',
    method: 'post',
    data
  });
}

/** get role button ids */
export function fetchGetRoleButtons(roleId: number) {
  return request<number[]>({
    url: '/api/v1/button/role-buttons',
    method: 'get',
    params: { roleId }
  });
}

/** set role buttons (RBAC-1: support effect param) */
export function fetchSetRoleButtons(data: Api.SystemManage.SetRoleButtonsParams) {
  return request<boolean>({
    url: '/api/v1/button/set-role-buttons',
    method: 'post',
    data
  });
}

/** get all menu buttons (for permission config) */
export function fetchGetMenuButtons() {
  return request<Api.SystemManage.Menu[]>({
    url: '/api/v1/button/menu-buttons',
    method: 'get'
  });
}

/** get current user buttons */
export function fetchGetUserButtons() {
  return request<string[]>({
    url: '/api/v1/button/user-buttons',
    method: 'get'
  });
}

/** get role permission sources (RBAC-1: show where permissions come from) */
export function fetchGetRolePermissionSources(roleId: number, type: 'menu' | 'button') {
  return request<Api.SystemManage.PermissionSourceList>({
    url: '/api/v1/permission/sources',
    method: 'get',
    params: { roleId, type }
  });
}

/**
 * User Role API
 */

/** set user roles */
export function fetchSetUserRoles(data: { userId: number; roleIds: number[] }) {
  return request<boolean>({
    url: '/api/v1/user/setRoles',
    method: 'post',
    data
  });
}

/** get user roles */
export function fetchGetUserRoles(userId: number) {
  return request<Api.SystemManage.Role[]>({
    url: '/api/v1/user/getRoles',
    method: 'get',
    params: { userId }
  });
}

/** remove user role */
export function fetchRemoveUserRole(data: { userId: number; roleId: number }) {
  return request<boolean>({
    url: '/api/v1/user/removeRole',
    method: 'delete',
    data
  });
}

/**
 * Department API
 */

/** get department list */
export function fetchGetDepartmentList(params?: Api.SystemManage.DepartmentSearchParams) {
  return request<Api.SystemManage.DepartmentList>({
    url: '/api/v1/department/list',
    method: 'get',
    params
  });
}

/** get department tree */
export function fetchGetDepartmentTree() {
  return request<Api.SystemManage.Department[]>({
    url: '/api/v1/department/tree',
    method: 'get'
  });
}

/** get all departments */
export function fetchGetAllDepartments() {
  return request<Api.SystemManage.Department[]>({
    url: '/api/v1/department/all',
    method: 'get'
  });
}

/** create department */
export function fetchCreateDepartment(data: Partial<Api.SystemManage.Department>) {
  return request<boolean>({
    url: '/api/v1/department/create',
    method: 'post',
    data
  });
}

/** update department */
export function fetchUpdateDepartment(data: Partial<Api.SystemManage.Department> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/department/update',
    method: 'put',
    data
  });
}

/** delete department */
export function fetchDeleteDepartment(id: number) {
  return request<boolean>({
    url: '/api/v1/department/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * Role Department API
 */

/** set role departments */
export function fetchSetRoleDepartments(data: { roleId: number; departmentIds: number[] }) {
  return request<boolean>({
    url: '/api/v1/roleDepartment/setRoleDepartments',
    method: 'post',
    data
  });
}

/** get role departments */
export function fetchGetRoleDepartments(roleId: number) {
  return request<number[]>({
    url: '/api/v1/roleDepartment/getRoleDepartments',
    method: 'get',
    params: { roleId }
  });
}
