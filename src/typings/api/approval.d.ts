/** 审批流类型定义 */

declare namespace Api.Approval {
  // ============ 流程定义 ============

  /** 流程定义 */
  interface Definition {
    id: number;
    name: string;
    code: string;
    category: string;
    definition_json: string;
    version: number;
    status: 'draft' | 'active' | 'deprecated';
    description: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
  }

  /** 流程节点定义 */
  interface NodeDefinition {
    id: string;
    name: string;
    type: 'start' | 'end' | 'approval' | 'condition' | 'parallel';
    description: string;
    config: Record<string, any>;
    position?: { x: number; y: number };
  }

  /** 流程边定义 */
  interface EdgeDefinition {
    id: string;
    source: string;
    target: string;
    label: string;
    condition: string;
  }

  /** 流程完整定义 */
  interface FlowDefinition {
    nodes: NodeDefinition[];
    edges: EdgeDefinition[];
  }

  // ============ 审批实例 ============

  /** 审批实例 */
  interface Instance {
    id: number;
    definition_id: number;
    definition_version: number;
    title: string;
    business_type: string;
    business_id: number;
    status: 'running' | 'completed' | 'cancelled' | 'rejected';
    current_nodes: string;
    variables: string;
    initiator_id: number;
    initiator_name?: string;
    started_at: string;
    completed_at: string | null;
    created_at: string;
    definition_snapshot?: string;
    history?: Task[];
  }

  /** 审批任务 */
  interface Task {
    id: number;
    instance_id: number;
    node_id: string;
    node_name: string;
    task_type: 'approve' | 'countersign' | 'condition_check';
    assignee_type: 'user' | 'role' | 'department' | 'initiator_leader';
    assignee_id: string;
    assignee_name: string;
    status: 'pending' | 'approved' | 'rejected' | 'transferred' | 'cancelled';
    approval_mode: 'or_sign' | 'and_sign' | 'sequential';
    comment: string;
    completed_at: string | null;
    completed_by: number;
    created_at: string;
    instance_title?: string;
    operator_name?: string;
  }

  /** 实例详情（含任务列表） */
  interface InstanceDetail {
    instance: Instance;
    tasks: Task[];
  }

  // ============ 请求参数类型 ============

  /** 创建流程定义请求 */
  interface CreateDefinitionParams {
    name: string;
    code: string;
    category: string;
    definition_json: string;
    description?: string;
  }

  /** 更新流程定义请求 */
  interface UpdateDefinitionParams {
    id: number;
    name?: string;
    code?: string;
    category?: string;
    definition_json?: string;
    description?: string;
  }

  /** 激活流程定义请求 */
  interface ActivateDefinitionParams {
    id: number;
    version?: number;
  }

  /** 删除流程定义请求 */
  interface DeleteDefinitionParams {
    id: number;
  }

  /** 获取流程定义详情请求 */
  interface GetDefinitionParams {
    id: number;
  }

  /** 流程定义列表查询参数 */
  interface DefinitionListParams {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
    keyword?: string;
  }

  /** 发起审批请求 */
  interface StartInstanceParams {
    definition_code: string;
    title: string;
    business_type: string;
    business_id: number;
    variables?: Record<string, any>;
  }

  /** 审批通过请求 */
  interface ApproveParams {
    task_id: number;
    comment?: string;
  }

  /** 驳回请求 */
  interface RejectParams {
    task_id: number;
    comment: string;
  }

  /** 转办请求 */
  interface TransferParams {
    task_id: number;
    target_user_id: number;
    target_user_name: string;
    comment?: string;
  }

  /** 撤回请求 */
  interface CancelInstanceParams {
    instance_id: number;
    comment?: string;
  }

  /** 实例详情请求 */
  interface InstanceDetailParams {
    id: number;
  }

  /** 待办/已办列表查询参数 */
  interface TaskListParams {
    page?: number;
    pageSize?: number;
    business_type?: string;
  }

  /** 我发起的列表查询参数 */
  interface InitiatedListParams {
    page?: number;
    pageSize?: number;
    status?: string;
    business_type?: string;
  }
}
