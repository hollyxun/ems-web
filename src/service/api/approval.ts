import { request } from '../request';

const DEFINITION_MODULE = '/approval-definition';
const INSTANCE_MODULE = '/approval-instance';

type ServiceResult<T> = {
  data?: T | null;
  error?: unknown;
} & Record<string, unknown>;

type ApprovalDefinitionResponse = {
  id: number;
  name: string;
  code: string;
  category: string;
  definitionJson: string;
  version: number;
  status: 'draft' | 'active' | 'deprecated';
  description: string;
  createdBy?: string | number;
  updatedBy?: string | number;
  createdAt?: string;
  updatedAt?: string;
};

type ApprovalTaskResponse = {
  id: number;
  instanceId: number;
  nodeId: string;
  nodeName: string;
  taskType: 'approve' | 'countersign' | 'condition_check';
  assigneeType: 'user' | 'role' | 'department' | 'initiator_leader';
  assigneeID?: string;
  assigneeId?: string;
  assigneeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'transferred' | 'cancelled';
  approvalMode: 'or_sign' | 'and_sign' | 'sequential';
  comment: string;
  completedAt: string | null;
  completedBy: number;
  createdAt?: string;
  instanceTitle?: string;
  operatorName?: string;
};

type ApprovalInstanceResponse = {
  id: number;
  definitionId: number;
  definitionVersion: number;
  title: string;
  businessType: string;
  businessID?: number;
  businessId?: number;
  status: 'running' | 'completed' | 'cancelled' | 'rejected';
  currentNodes: string;
  variables: string;
  initiatorId: number;
  startedAt: string;
  completedAt: string | null;
  createdAt?: string;
};

function toSnakeDefinition(definition: ApprovalDefinitionResponse): Api.Approval.Definition {
  return {
    id: definition.id,
    name: definition.name,
    code: definition.code,
    category: definition.category,
    definition_json: definition.definitionJson,
    version: definition.version,
    status: definition.status,
    description: definition.description,
    created_by: Number(definition.createdBy || 0),
    updated_by: Number(definition.updatedBy || 0),
    created_at: definition.createdAt || '',
    updated_at: definition.updatedAt || ''
  };
}

function toSnakeTask(task: ApprovalTaskResponse): Api.Approval.Task {
  return {
    id: task.id,
    instance_id: task.instanceId,
    node_id: task.nodeId,
    node_name: task.nodeName,
    task_type: task.taskType,
    assignee_type: task.assigneeType,
    assignee_id: task.assigneeId ?? task.assigneeID ?? '',
    assignee_name: task.assigneeName,
    status: task.status,
    approval_mode: task.approvalMode,
    comment: task.comment,
    completed_at: task.completedAt,
    completed_by: task.completedBy,
    created_at: task.createdAt || '',
    instance_title: task.instanceTitle || '',
    operator_name: task.operatorName || ''
  };
}

function toSnakeInstance(instance: ApprovalInstanceResponse): Api.Approval.Instance {
  return {
    id: instance.id,
    definition_id: instance.definitionId,
    definition_version: instance.definitionVersion,
    title: instance.title,
    business_type: instance.businessType,
    business_id: instance.businessId ?? instance.businessID ?? 0,
    status: instance.status,
    current_nodes: instance.currentNodes,
    variables: instance.variables,
    initiator_id: instance.initiatorId,
    initiator_name: '',
    started_at: instance.startedAt,
    completed_at: instance.completedAt,
    created_at: instance.createdAt || '',
    definition_snapshot: '',
    history: []
  };
}

function mapPageResult<TInput, TOutput>(
  data: Api.Common.PageResult<TInput> | null | undefined,
  mapper: (item: TInput) => TOutput
): Api.Common.PageResult<TOutput> {
  return {
    list: (data?.list || []).map(mapper),
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 10
  };
}

function mapResult<TInput, TOutput>(
  result: ServiceResult<TInput>,
  mapper: (data: TInput) => TOutput
): ServiceResult<TOutput> {
  if (!result.data) {
    return result as ServiceResult<TOutput>;
  }

  return {
    ...result,
    data: mapper(result.data)
  };
}

// ===== 流程定义 =====

export async function fetchCreateDefinition(data: Api.Approval.CreateDefinitionParams) {
  const result = (await request<ApprovalDefinitionResponse>({
    url: `${DEFINITION_MODULE}/create`,
    method: 'post',
    data: {
      name: data.name,
      code: data.code,
      category: data.category,
      definitionJson: data.definition_json,
      description: data.description
    }
  })) as ServiceResult<ApprovalDefinitionResponse>;

  return mapResult(result, toSnakeDefinition);
}

export async function fetchUpdateDefinition(data: Api.Approval.UpdateDefinitionParams) {
  const result = (await request<ApprovalDefinitionResponse>({
    url: `${DEFINITION_MODULE}/update`,
    method: 'put',
    data: {
      id: data.id,
      name: data.name,
      code: data.code,
      category: data.category,
      definitionJson: data.definition_json,
      description: data.description
    }
  })) as ServiceResult<ApprovalDefinitionResponse>;

  return mapResult(result, toSnakeDefinition);
}

export function fetchActivateDefinition(data: Api.Approval.ActivateDefinitionParams) {
  return request({ url: `${DEFINITION_MODULE}/activate`, method: 'post', data });
}

export function fetchDeleteDefinition(data: Api.Approval.DeleteDefinitionParams) {
  return request({ url: `${DEFINITION_MODULE}/delete`, method: 'delete', data });
}

export async function fetchGetDefinition(params: Api.Approval.GetDefinitionParams) {
  const result = (await request<ApprovalDefinitionResponse>({
    url: `${DEFINITION_MODULE}/get`,
    method: 'get',
    params
  })) as ServiceResult<ApprovalDefinitionResponse>;

  return mapResult(result, toSnakeDefinition);
}

export async function fetchDefinitionList(params?: Api.Approval.DefinitionListParams) {
  const result = (await request<Api.Common.PageResult<ApprovalDefinitionResponse>>({
    url: `${DEFINITION_MODULE}/list`,
    method: 'get',
    params
  })) as ServiceResult<Api.Common.PageResult<ApprovalDefinitionResponse>>;

  return mapResult(result, data => mapPageResult(data, toSnakeDefinition));
}

// ===== 审批实例 =====

export async function fetchStartInstance(data: Api.Approval.StartInstanceParams) {
  const result = (await request<ApprovalInstanceResponse>({
    url: `${INSTANCE_MODULE}/start`,
    method: 'post',
    data: {
      definitionCode: data.definition_code,
      title: data.title,
      businessType: data.business_type,
      businessId: data.business_id,
      variables: data.variables
    }
  })) as ServiceResult<ApprovalInstanceResponse>;

  return mapResult(result, toSnakeInstance);
}

export function fetchApproveInstance(data: Api.Approval.ApproveParams) {
  return request({
    url: `${INSTANCE_MODULE}/approve`,
    method: 'post',
    data: { taskId: data.task_id, comment: data.comment }
  });
}

export function fetchRejectInstance(data: Api.Approval.RejectParams) {
  return request({
    url: `${INSTANCE_MODULE}/reject`,
    method: 'post',
    data: { taskId: data.task_id, comment: data.comment }
  });
}

export function fetchTransferInstance(data: Api.Approval.TransferParams) {
  return request({
    url: `${INSTANCE_MODULE}/transfer`,
    method: 'post',
    data: {
      taskId: data.task_id,
      targetUserId: data.target_user_id,
      targetUserName: data.target_user_name,
      comment: data.comment
    }
  });
}

export function fetchCancelInstance(data: Api.Approval.CancelInstanceParams) {
  return request({
    url: `${INSTANCE_MODULE}/cancel`,
    method: 'post',
    data: { instanceId: data.instance_id, comment: data.comment }
  });
}

export async function fetchInstanceDetail(params: Api.Approval.InstanceDetailParams) {
  const result = (await request<{ instance: ApprovalInstanceResponse; tasks: ApprovalTaskResponse[] }>({
    url: `${INSTANCE_MODULE}/detail`,
    method: 'get',
    params
  })) as ServiceResult<{ instance: ApprovalInstanceResponse; tasks: ApprovalTaskResponse[] }>;

  return mapResult(result, payload => {
    const tasks = (payload.tasks || []).map(toSnakeTask);
    const instance = toSnakeInstance(payload.instance);
    instance.history = tasks;

    return {
      instance,
      tasks
    };
  });
}

export async function fetchMyPending(params?: Api.Approval.TaskListParams) {
  const result = (await request<Api.Common.PageResult<ApprovalTaskResponse>>({
    url: `${INSTANCE_MODULE}/my-pending`,
    method: 'get',
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      businessType: params?.business_type
    }
  })) as ServiceResult<Api.Common.PageResult<ApprovalTaskResponse>>;

  return mapResult(result, data => mapPageResult(data, toSnakeTask));
}

export async function fetchMyDone(params?: Api.Approval.TaskListParams) {
  const result = (await request<Api.Common.PageResult<ApprovalTaskResponse>>({
    url: `${INSTANCE_MODULE}/my-done`,
    method: 'get',
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      businessType: params?.business_type
    }
  })) as ServiceResult<Api.Common.PageResult<ApprovalTaskResponse>>;

  return mapResult(result, data => mapPageResult(data, toSnakeTask));
}

export async function fetchMyInitiated(params?: Api.Approval.InitiatedListParams) {
  const result = (await request<Api.Common.PageResult<ApprovalInstanceResponse>>({
    url: `${INSTANCE_MODULE}/my-initiated`,
    method: 'get',
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      status: params?.status,
      businessType: params?.business_type
    }
  })) as ServiceResult<Api.Common.PageResult<ApprovalInstanceResponse>>;

  return mapResult(result, data => mapPageResult(data, toSnakeInstance));
}
