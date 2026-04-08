import { request } from '../request';

const MODULE = '/approval';

// ===== 流程定义 =====

/** 创建流程定义 */
export function fetchCreateDefinition(data: CreateDefinitionRequest) {
  return request({ url: `${MODULE}/definition/create`, method: 'post', data });
}

/** 更新流程定义 */
export function fetchUpdateDefinition(data: Partial<ApprovalDefinition> & { id: number }) {
  return request({ url: `${MODULE}/definition/update`, method: 'put', data });
}

/** 激活流程定义 */
export function fetchActivateDefinition(data: { id: number; version?: number }) {
  return request({ url: `${MODULE}/definition/activate`, method: 'post', data });
}

/** 删除流程定义 */
export function fetchDeleteDefinition(data: { id: number }) {
  return request({ url: `${MODULE}/definition/delete`, method: 'delete', data });
}

/** 获取流程定义详情 */
export function fetchGetDefinition(params: { id: number }) {
  return request<ApprovalDefinition>({ url: `${MODULE}/definition/get`, method: 'get', params });
}

/** 流程定义列表 */
export function fetchDefinitionList(params?: { page?: number; pageSize?: number; category?: string; status?: string; keyword?: string }) {
  return request({ url: `${MODULE}/definition/list`, method: 'get', params });
}

// ===== 审批实例 =====

/** 发起审批 */
export function fetchStartInstance(data: StartInstanceRequest) {
  return request<ApprovalInstance>({ url: `${MODULE}/instance/start`, method: 'post', data });
}

/** 审批通过 */
export function fetchApproveInstance(data: ApproveRequest) {
  return request({ url: `${MODULE}/instance/approve`, method: 'post', data });
}

/** 驳回 */
export function fetchRejectInstance(data: RejectRequest) {
  return request({ url: `${MODULE}/instance/reject`, method: 'post', data });
}

/** 转办 */
export function fetchTransferInstance(data: TransferRequest) {
  return request({ url: `${MODULE}/instance/transfer`, method: 'post', data });
}

/** 撤回 */
export function fetchCancelInstance(data: CancelInstanceRequest) {
  return request({ url: `${MODULE}/instance/cancel`, method: 'post', data });
}

/** 实例详情 */
export function fetchInstanceDetail(params: { id: number }) {
  return request<InstanceDetail>({ url: `${MODULE}/instance/detail`, method: 'get', params });
}

/** 我的待办 */
export function fetchMyPending(params?: { page?: number; pageSize?: number; business_type?: string }) {
  return request({ url: `${MODULE}/instance/my-pending`, method: 'get', params });
}

/** 我的已办 */
export function fetchMyDone(params?: { page?: number; pageSize?: number; business_type?: string }) {
  return request({ url: `${MODULE}/instance/my-done`, method: 'get', params });
}

/** 我发起的 */
export function fetchMyInitiated(params?: { page?: number; pageSize?: number; status?: string; business_type?: string }) {
  return request({ url: `${MODULE}/instance/my-initiated`, method: 'get', params });
}
