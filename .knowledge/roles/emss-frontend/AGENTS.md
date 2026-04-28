# EMSS 前端开发角色

> Vue 3 + TypeScript + Element Plus + UnoCSS 前端开发知识沉淀

---

## ⚠️ Beta 状态约束（最高优先级）

**当前开发状态为 Beta，以下约束优先级高于所有其他章节：**

1. **不需要考虑历史兼容性**：任何旧代码、旧数据、旧链路的历史兼容性都不在本次改造范围内。
2. **不需要考虑数据兼容性**：任何历史 route/menu 数据、授权数据、缓存数据的迁移、兼容、平滑过渡都不在本次改造范围内。
3. **随时可以删除重建整个数据库**：数据库可以随时清空重建，不需要保留任何历史业务数据。
4. **默认数据来源是前端 async sync**：业务 route/menu 的唯一权威来源是前端 `generatedRoutes`，通过 `syncRoutesWithBackend()` 写入后端。
5. **不新增长期兼容补丁**：任何为了兼容旧脏数据、旧错误链路、旧 API 契约的补丁都不在本次改造范围内。

---

## 快速定位

| 我需要... | 查看文件 |
|-----------|----------|
| 开发新页面 | `skills/page-development.md` |
| 开发新组件 | `skills/component-development.md` |
| 封装 API 类型 | `skills/api-type-architecture.md` |
| 配置路由权限 | `skills/route-sync-development.md` |
| 实现按钮权限 | `skills/button-permission.md` |
| 配置 Casbin | `skills/casbin-policy-module.md` |
| 移除旧模块 | `skills/module-removal.md` |
| 常见陷阱速查 | 见下方表格 |

---

## 知识索引

### Skills（操作流程）

| 文件 | 描述 |
|------|------|
| `page-development.md` | 页面开发完整流程 |
| `component-development.md` | 组件开发规范 |
| `api-type-architecture.md` | API 类型封装架构 |
| `route-sync-development.md` | 路由权限同步 |
| `button-permission.md` | 按钮权限实现 |
| `casbin-policy-module.md` | Casbin 权限配置 |
| `audit-log-module.md` | 审计日志前端接入 |
| `plugin-integration.md` | 插件集成流程 |
| `module-removal.md` | 模块移除流程 |

### Principles（行为准则）

| 文件 | 描述 |
|------|------|
| `api-encapsulation.md` | API 封装规范 |
| `composition-api.md` | Composition API 规范 |
| `pinia-store.md` | Pinia 状态管理规范 |
| `typescript-constraints.md` | TypeScript 类型约束 |

### Experience（方法复盘）

| 文件 | 描述 |
|------|------|
| `api-type-architecture-refactor.md` | API 类型架构重构复盘 |
| `rule-engine-development-2026-04-03.md` | 规则引擎前端开发复盘 |
| `typescript-eslint-fix-2026-04-07.md` | TypeScript ESLint 配置复盘 |
| `typescript-param-extraction-2026-04-08.md` | TypeScript 参数提取复盘 |

---

## 常见陷阱速查

| 陷阱 | 后果 | 避免方法 |
|------|------|----------|
| reactive 直接解构 | 丢失响应性 | 使用 `toRefs()` |
| props 直接修改 | 破坏单向数据流 | 使用 emit 通知父组件 |
| async setup 中直接 await | 组件挂载前数据未就绪 | 使用 `onMounted` 或 Suspense |
| boolean JSON 序列化 | 前端接收为 string | 后端使用 `json.Bool` |
| 组件内直接调用 API | 职责混乱 | 封装到 `src/api/` |
| 忽略 TypeScript 类型推断 | 类型丢失 | 显式声明返回类型 |
| 路由 name 与 i18n key 不一致 | 国际化失效 | name 与 routeKey 保持一致 |

---

## 核心约定

| 约定 | 规范 |
|------|------|
| 文件命名 | `kebab-case.vue` |
| 组件命名 | `PascalCase`（模板中使用） |
| 组合式函数 | `use-*.ts` 前缀 |
| API 函数 | `fetch*` 前缀 |
| 响应式状态 | `ref()` / `reactive()` |
| 计算属性 | `computed()` |

---

## 参考资源

- 项目根目录 `.agents.md`：知识库总索引
- 项目根目录 `CLAUDE.md`：Claude Code 项目规则
- 后端知识库 `server/.knowledge/`：Go 后端开发知识

---

**最后更新**: 2026-04-19