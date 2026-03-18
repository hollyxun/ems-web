# EMSS Web 知识库

> Energy-Management-System-Web (EMSS Web) 的 Agent 协作知识库。

---

## 快速导航

| 文档 | 说明 |
|------|------|
| [`AGENTS.md`](./AGENTS.md) | **必读** - 知识库入口，协作规则，知识加载策略 |
| [`base/knowledge-sedimentation.md`](./base/knowledge-sedimentation.md) | 知识沉淀规范 - 何时/如何记录经验 |
| [`roles/emss-frontend/AGENTS.md`](./roles/emss-frontend/AGENTS.md) | EMSS 前端开发角色入口 |

---

## 目录结构

```
.knowledge/
├── AGENTS.md                    # 根入口：协作规则、加载策略
├── README.md                    # 本文件
├── base/                        # 通用知识（所有角色共享）
│   ├── knowledge-sedimentation.md   # 知识沉淀规范
│   ├── architecture/            # 架构设计
│   │   ├── overview.md          # 项目架构概览
│   │   ├── directory-structure.md   # 详细目录结构
│   │   └── module-architecture.md   # 模块架构设计
│   ├── conventions/             # 编码规范
│   │   ├── naming-conventions.md    # 命名约定
│   │   └── code-style.md        # 代码风格规范
│   └── principles/              # 通用原则
│       ├── knowledge-loading.md     # 知识加载策略
│       ├── check-conventions-first.md   # 先查惯例原则
│       └── credential-safety.md     # 凭证安全原则
└── roles/                       # 各角色目录
    └── emss-frontend/           # EMSS 前端开发角色
        ├── AGENTS.md            # 角色入口 + 知识索引
        ├── questions.md         # 待验证问题
        ├── principles/          # 行为准则
        │   ├── composition-api.md
        │   ├── pinia-store.md
        │   └── api-encapsulation.md
        ├── skills/              # 操作流程
        │   ├── page-development.md
        │   ├── component-development.md
        │   └── plugin-integration.md
        ├── insights/            # 规律性认知
        │   └── typescript-generic.md
        └── experience/          # 事件复盘（待填充）
```

---

## 使用方式

### 对于 Agent

1. **开始任务前**：
   - 读取 `AGENTS.md` 了解协作规则
   - 根据任务类型加载对应角色的 `AGENTS.md`
   - 识别并加载相关的 skill/principle/insight

2. **执行任务时**：
   - 遵循加载的 principle 和 skill
   - 遇到不确定时，先查询知识库再问用户

3. **结束任务时**：
   - 反思是否学到新东西
   - 按需更新知识库（experience → skill/principle/insight）
   - 更新 `questions.md` 中的待验证问题

### 对于用户

- 查看 [`roles/emss-frontend/AGENTS.md`](./roles/emss-frontend/AGENTS.md) 了解 EMSS Web 开发规范
- 知识库内容会随项目演进持续更新

---

## 知识类型说明

| 类型 | 存放位置 | 用途 | 示例 |
|------|----------|------|------|
| **experience** | `roles/xxx/experience/` | 具体事件复盘 | 「Element Plus 表格高度计算问题」 |
| **skill** | `roles/xxx/skills/` | 可复用操作流程 | 「页面开发完整流程」 |
| **principle** | `roles/xxx/principles/` | 行为准则 | 「必须使用 Composition API」 |
| **insight** | `roles/xxx/insights/` | 规律性认知 | 「响应式数据解构陷阱」 |

---

## 核心原则速览

1. **严格模块化架构**：页面 → API → 组件，严禁跨模块直接调用
2. **Composition API + TypeScript**：所有组件必须使用 `<script setup lang="ts">`
3. **Pinia 状态管理**：使用 Setup Store 模式，避免 Options Store
4. **API 层封装**：所有后端调用必须通过 `src/api/` 目录
5. **先查惯例**：添加新功能前先查看同类功能的历史实现

---

## 贡献与维护

- 发现知识缺失？→ 按沉淀规范添加新文档
- 发现知识错误？→ 更新文档，添加注释说明
- 遇到问题？→ 记录到 `questions.md`

---

**创建日期**: 2026-03-18
**项目**: Energy-Management-System-Web
