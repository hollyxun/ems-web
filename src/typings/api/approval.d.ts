/** 审批流类型定义 */

// 流程定义
export interface ApprovalDefinition {
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

// 流程节点定义
export interface NodeDefinition {
  id: string;
  name: string;
  type: 'start' | 'end' | 'approval' | 'condition' | 'parallel';
  description: string;
  config: Record<string, any>;
  position?: { x: number; y: number };
}

// 流程边定义
export interface EdgeDefinition {
  id: string;
  source: string;
  target: string;
  label: string;
  condition: string;
}

// 流程完整定义
export interface FlowDefinition {
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
}

// 审批实例
export interface ApprovalInstance {
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
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// 审批任务
export interface ApprovalTask {
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
}

// 请求类型
export interface CreateDefinitionRequest {
  name: string;
  code: string;
  category: string;
  definition_json: string;
  description?: string;
}

export interface StartInstanceRequest {
  definition_code: string;
  title: string;
  business_type: string;
  business_id: number;
  variables?: Record<string, any>;
}

export interface ApproveRequest {
  task_id: number;
  comment?: string;
}

export interface RejectRequest {
  task_id: number;
  comment: string;
}

export interface TransferRequest {
  task_id: number;
  target_user_id: number;
  target_user_name: string;
  comment?: string;
}

export interface CancelInstanceRequest {
  instance_id: number;
  comment?: string;
}

// 实例详情（含任务列表）
export interface InstanceDetail {
  instance: ApprovalInstance;
  tasks: ApprovalTask[];
}
