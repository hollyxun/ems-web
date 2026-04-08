# EMSS Agent 知识库

> Energy-Management-System-Web (EMSS Web) 是一个基于 Vue 3 + TypeScript 的现代化前端管理后台框架。
> 本知识库存储与项目相关的 agent 协作规则、技术规范和最佳实践。

---

## 快速开始

每个 agent 在开始任何任务前，**必须先通读本文件**，然后根据任务类型加载对应角色的 `AGENTS.md`。

### 当前支持的角色

| 角色 | 路径 | 职责 |
|------|------|------|
| EMSS 前端开发 | `roles/emss-frontend/AGENTS.md` | Vue 3/TypeScript/Pinia 前端开发、组件开发 |

---

## 核心开发指令（不可违背）

### 1. 开始任务时
- **必须先查询** `.knowledge/` 中的相关文件
- **遇到不确定的项目知识** → 先查询 `.knowledge/` 再问用户
- **加载对应角色的 AGENTS.md** → 获取角色特定的知识索引

### 2. 执行任务时
- **先查项目惯例再动手**：添加新功能前，查看同类功能的历史实现
- **严格模块化架构**：页面组件 → API 服务 → 后端接口
- **所有组件必须使用 Composition API 和 TypeScript**
- **全局状态必须使用 Pinia**

### 3. 结束任务时
**必须主动进行 `.knowledge/` 维护**，无需用户提醒：

1. 这次学到了什么新东西？→ 写入对应的 `.knowledge/` 文件
2. 发现之前的知识是错误的？→ 更新或删除
3. 有没有新的未解决问题？→ 写入 `questions/`

### 4. 知识提炼链条
```
question → experience → skill / principle / insight
```

---

## 知识加载策略

### 常驻加载（每次任务都加载）
- `AGENTS.md`（本文件）：协作规则、安全底线、知识索引
- `roles/<role>/AGENTS.md`：角色职责 + 知识索引

### 按需加载（通过索引判断后加载）
- **skill**：可复用的操作流程、checklist、代码模式
- **principle**：行为准则、设计原则
- **insight**：规律性认知、架构模式
- **experience**：具体事件的复盘和踩坑记录

### 触发式加载（特定场景必须加载）
| 场景 | 必须加载的文件 |
|------|---------------|
| 接触凭证/权限/token | `base/principles/credential-safety.md` |
| 添加新功能/模块 | `base/principles/check-conventions-first.md` |

### Context 压缩后恢复
长 session 中 context 会被自动压缩。如果你：
- 不确定当前角色的知识索引内容
- 不记得项目硬性要求（如 Composition API、Pinia）

**立即重新 Read**：
1. `AGENTS.md`（本文件）
2. `roles/<role>/AGENTS.md`（角色知识索引）

---

## 项目结构速查

```
web/src/
├── api/                # API 接口封装
├── assets/             # 静态资源
├── components/         # 公共组件
│   ├── advanced/       # 高级组件
│   ├── common/         # 通用组件
│   └── custom/         # 自定义组件
├── constants/          # 常量定义
├── directives/         # 自定义指令
├── enum/               # 枚举定义
├── hooks/              # 组合式函数
│   ├── business/       # 业务相关 hooks
│   └── common/         # 通用 hooks
├── layouts/            # 布局组件
├── locales/            # 国际化
├── plugins/            # 前端插件
├── router/             # 路由配置
├── service/            # 请求封装 (Axios)
├── store/              # 状态管理 (Pinia)
├── styles/             # 样式文件
├── typings/            # TypeScript 类型定义
├── utils/              # 工具函数
└── views/              # 页面组件
```

### 依赖方向（严格单向）
```
页面组件 → API 服务 → 后端接口
    ↓
公共组件
```

---

## 知识沉淀规范

### 知识分类

| 类型 | 定义 | 存放位置 | 示例 |
|------|------|----------|------|
| **experience** | 具体事件的复盘 | `roles/<role>/experience/` | 「Element Plus 表格高度计算问题」 |
| **skill** | 可复用的操作流程 | `roles/<role>/skills/` 或 `base/skills/` | 「页面开发完整流程」 |
| **principle** | 抽象的行为准则 | `roles/<role>/principles/` 或 `base/principles/` | 「必须使用 Composition API」 |
| **insight** | 规律性认知 | `roles/<role>/insights/` 或 `base/insights/` | 「响应式数据解构陷阱」 |

### 沉淀流程

1. **先写 experience**：记录具体事件
2. **再提炼 skill/principle/insight**：抽取可复用模式
3. **更新索引**：同步更新角色 `AGENTS.md`

详细规范见 `base/knowledge-sedimentation.md`

---

## 知识索引

### 架构设计（base/architecture/）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `overview.md` | 项目架构概览、技术栈、核心特性 | 了解项目整体架构 |
| `directory-structure.md` | 详细目录结构说明 | 查找文件位置、了解模块组织 |
| `module-architecture.md` | 模块架构详细设计、组件通信 | 理解模块边界、开发新功能 |

### 编码规范（base/conventions/）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `naming-conventions.md` | 命名规范：文件、变量、函数、组件 | 创建新文件、定义新组件 |
| `code-style.md` | 代码风格规范：格式、注释、TypeScript | 编写代码、代码审查 |

### 通用原则（base/principles/）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `knowledge-loading.md` | 知识加载策略详述 | 需要了解如何加载知识 |
| `knowledge-sedimentation.md` | 知识沉淀规范 | 需要沉淀经验 |
| `check-conventions-first.md` | 先查惯例再动手 | 添加新功能前 |
| `credential-safety.md` | 凭证安全原则 | 接触凭证/权限/token |

---

## 反馈与维护

- 发现知识失效？→ 在对应文件末尾添加 `## Comments`
- 发现知识缺失？→ 按沉淀规范添加新文档
- 角色划分不当？→ 提出重构建议

---

**最后更新**: 2026-04-08
