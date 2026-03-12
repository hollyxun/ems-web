/** 开发者工具相关类型定义 */

/** CPU信息 */
export interface CPUInfo {
  /** 用户态使用率 */
  user: number;
  /** 系统态使用率 */
  system: number;
  /** 空闲率 */
  idle: number;
  /** CPU核心数 */
  coreCount: number;
}

/** 内存信息 */
export interface MemoryInfo {
  /** 总内存(MB) */
  total: number;
  /** 已用内存(MB) */
  used: number;
  /** 可用内存(MB) */
  available: number;
  /** 使用率 */
  usedPercent: number;
}

/** 操作系统信息 */
export interface OSInfo {
  /** 系统类型 */
  type: string;
  /** 平台名称 */
  platform: string;
  /** 系统版本 */
  version: string;
  /** 系统架构 */
  arch: string;
}

/** 运行时长信息 */
export interface UptimeInfo {
  /** 总秒数 */
  seconds: number;
  /** 格式化显示 */
  formatted: string;
  /** 启动时间 */
  bootTime: string;
}

/** 端口信息 */
export interface PortInfo {
  /** 端口号 */
  port: number;
  /** 状态 */
  status: string;
  /** 服务名称 */
  service: string;
}

/** 服务器状态响应 */
export interface ServerStatusResponse {
  /** CPU信息 */
  cpu: CPUInfo;
  /** 内存信息 */
  memory: MemoryInfo;
  /** 操作系统信息 */
  os: OSInfo;
  /** 运行时长 */
  uptime: UptimeInfo;
  /** 端口信息 */
  ports: PortInfo[];
}

/** 依赖信息 */
export interface DependencyInfo {
  /** 名称 */
  name: string;
  /** 版本 */
  version: string;
}

/** 系统版本 */
export interface SystemVersion {
  /** 版本号 */
  version: string;
  /** 构建时间 */
  buildTime: string;
  /** Go版本 */
  goVersion: string;
}

/** 后端版本 */
export interface BackendVersion {
  /** Go版本 */
  goVersion: string;
  /** 主模块 */
  mainModule: string;
  /** 依赖列表 */
  dependencies: DependencyInfo[];
}

/** 前端版本 */
export interface FrontendVersion {
  /** Node版本 */
  nodeVersion: string;
  /** 依赖列表 */
  dependencies: DependencyInfo[];
}

/** 版本信息响应 */
export interface VersionInfoResponse {
  /** 系统版本 */
  system: SystemVersion;
  /** 后端版本 */
  backend: BackendVersion;
  /** 前端版本 */
  frontend: FrontendVersion;
}

/** AI模型信息 */
export interface ModelInfo {
  /** 模型ID */
  id: string;
  /** 对象类型 */
  object: string;
  /** 创建时间 */
  created: number;
  /** 所有者 */
  ownedBy: string;
}

/** AI模型列表响应 */
export interface ModelsResponse {
  /** 模型列表 */
  data: ModelInfo[];
}

/** AI对话消息 */
export interface ChatMessage {
  /** 角色 */
  role: 'user' | 'assistant' | 'system';
  /** 内容 */
  content: string;
}

/** AI配置 */
export interface AIConfig {
  /** 基础URL */
  baseUrl: string;
  /** API密钥 */
  apiKey: string;
  /** 默认模型 */
  defaultModel: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/** 对话会话 */
export interface ChatSession {
  /** 会话ID */
  id: string;
  /** 会话标题 */
  title: string;
  /** 消息列表 */
  messages: ChatMessage[];
  /** 使用的模型 */
  model: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/** AI对话存储 */
export interface AIStorage {
  /** AI配置 */
  config: AIConfig | null;
  /** 会话列表 */
  sessions: ChatSession[];
  /** 当前会话ID */
  currentSessionId: string | null;
}
