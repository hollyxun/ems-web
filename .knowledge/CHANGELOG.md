# 变更日志

> 记录前端知识库内容的更新历史

---

## 2026-04-09

### 审计日志与策略管理模块

#### 新增页面

- **`src/views/manage/audit-log/index.vue`** - 审计日志管理页面
  - 日志列表展示（分页、筛选）
  - 按模块/操作类型/用户筛选
  - 日志详情查看
  - 过期日志清理

- **`src/views/manage/policy/`** - Casbin 策略管理页面
  - `index.vue` - 策略列表
  - `modules/policy-operate-drawer.vue` - 策略编辑抽屉
  - `modules/policy-search.vue` - 策略搜索组件

#### 新增 API 封装

- **`src/service/api/audit.ts`** - 审计日志 API
  - `fetchGetAuditLogList` - 获取日志列表
  - `fetchGetAuditLogById` - 获取日志详情
  - `fetchGetAuditStatistics` - 获取统计数据
  - `fetchCleanupAuditLogs` - 清理过期日志
  - `fetchGetAuditCategories` - 获取分类列表
  - `fetchGetAuditActions` - 获取操作类型列表
  - `fetchExportAuditLogs` - 导出日志

- **`src/service/api/casbin.ts`** - Casbin 策略 API
  - `fetchGetPolicyList` - 获取策略列表
  - `fetchCreatePolicy` - 创建策略
  - `fetchUpdatePolicy` - 更新策略
  - `fetchDeletePolicy` - 删除策略

#### 新增类型定义

- **`src/typings/api/audit.d.ts`** - 审计日志类型
- **`src/typings/api/casbin.d.ts`** - Casbin 策略类型

#### 移除废弃模块

- `src/views/manage/department/` - 部门管理（后端已删除）
- `src/views/manage/advanced-permission/` - 高级权限（由 Casbin 策略替代）
- `src/views/manage/operation-record/` - 操作记录（由审计日志替代）
- `src/service/api/advanced-permission.ts`
- `src/typings/api/advanced-permission.d.ts`

#### 国际化更新

- `src/locales/langs/zh-cn.ts` - 添加 audit-log/policy 相关翻译
- `src/locales/langs/en-us.ts` - 同步英文翻译

---

## 2026-04-08

### TypeScript 类型修复与参数抽离规范

**背景**：运行 `vue-tsc --noEmit` 发现第三方库类型错误和项目代码类型问题。

#### tsconfig.json 配置

添加 `skipLibCheck: true`，跳过第三方库类型检查，避免 `@amap/amap-jsapi-types`、`@antv/g-lite` 等库的类型定义问题影响构建。

#### API 参数类型抽离（CRITICAL）

**规范**：所有 API 参数类型必须在 `src/typings/api/*.d.ts` 中定义，使用 `declare namespace Api.Xxx` 风格。

**修复文件**：
- `src/typings/api/approval.d.ts` - 重构为 namespace 风格，添加所有参数类型
- `src/typings/api/dashboard.d.ts` - 添加看板相关参数类型
- `src/service/api/approval.ts` - 使用抽离的参数类型
- `src/service/api/dashboard.ts` - 使用抽离的参数类型

#### Vue 模板修复

**问题**：`vue-tsc` 解析模板中内联颜色值 `#xxxxxx` 时报 `TS1127 Invalid character`。

**修复**：将颜色值提取为变量，避免模板中的 `#` 字符解析问题。

**相关文件**：`src/views/dashboard/custom/components/device-status.vue`

#### 其他类型修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `analysis/comprehensive/index.vue` | `catch` 缺少参数 | 添加 `error` 参数 |
| `analysis/consumption/index.vue` | `catch` 缺少参数 | 添加 `error` 参数 |
| `approval/workspace/index.vue` | `TabPaneName` 类型不兼容 | 参数改为 `string \| number` |
| `dashboard/custom/index.vue` | `Object.keys()` 无法索引类型化对象 | 创建类型化数组 |
| `developer/function/*.vue` | 路由名称错误 | 改为 `developer_function_*` 格式 |

#### 规范更新

- `principles/typescript-constraints.md` - 添加第 23-27 节（skipLibCheck、内联颜色值、catch 参数等）
- `principles/api-encapsulation.md` - 添加参数类型抽离规范章节
- `experience/typescript-param-extraction-2026-04-08.md` - 新建经验文档

---

### 路由菜单整合（重大变更）

**背景**：一级菜单过多（35+ 个），存在大量重复和分散的功能模块。

**整合结果**：一级菜单从 35+ 个整合为 18 个核心业务模块。

#### 视图目录重组

| 操作 | 源目录 | 目标目录 |
|------|--------|----------|
| 合并 | `benchmark` | `analysis/benchmark` |
| 合并 | `branchanalysis` | `analysis/branch` |
| 合并 | `comprehensivestatistics` | `analysis/comprehensive` |
| 合并 | `consumptionanalysis` | `analysis/consumption-detail` |
| 合并 | `energy-analysis` | `analysis/energy` |
| 合并 | `energy-indicators` | `analysis/indicators` |
| 合并 | `keyequipment` | `analysis/key-equipment` |
| 合并 | `productoutput` | `analysis/product-output` |
| 合并 | `statistical` | `analysis/statistical` |
| 合并 | `peakvalley` | `analysis/peak-valley` |
| 合并 | `peakvalley-analysis` | `analysis/peak-valley-detail` |
| 合并 | `spikesandvalleys` | `analysis/peak-valley-scheme` |
| 合并 | `process-energy` | `analysis/process-energy` |
| 合并 | `itemized` | `analysis/itemized` |
| 合并 | `itemizedenergyanalysis` | `analysis/itemized-detail` |
| 新建 | `saving` + `carbonemission` | `sustainability` |
| 新建 | `plugin` + `function` | `developer` |
| 删除 | `costmanagement` | 合并到 `cost` |
| 删除 | `processenergy` | 合并到 `analysis/process-energy` |

#### 最终一级菜单结构

| 序号 | 模块 | 说明 |
|------|------|------|
| 1 | home | 首页 |
| 2 | dashboard | 自定义仪表盘 |
| 3 | energy | 能源管理 |
| 4 | analysis | 能耗分析（整合 15 个子模块） |
| 5 | base-data | 基础数据 |
| 6 | alarm | 报警管理 |
| 7 | cost | 成本管理 |
| 8 | sustainability | 双碳管理（新建） |
| 9 | scheduling | 排班管理 |
| 10 | knowledge | 知识库 |
| 11 | approval | 审批管理 |
| 12 | gatewaysetting | 网关设置 |
| 13 | manage | 系统管理 |
| 14 | profile | 个人中心 |
| 15 | developer | 开发者（新建，合并 plugin+function） |
| 16 | about | 关于 |
| 17 | document | 外部文档（保留，iframe 嵌入） |
| 18 | exception | 异常页（隐藏菜单） |

#### 知识库更新

- **[experience/i18n-routekey-naming-fix.md]** - 补充路由开发规范
  - 新增路由命名约定（一级/二级/三级）
  - 新增 Icon 规范和常用一级菜单 Icon 对照表
  - 新增路由开发流程说明

#### 注意事项

1. 路由名称已变更，后端 `sys_route_menus` 表需同步更新
2. 后端权限系统需更新对应的路由权限配置
3. 代码中如有硬编码路由名称需检查更新

### 知识库清理

#### 更新

- **[questions.md]** - 同步 Q3 已解决状态
  - 动态路由缓存问题已验证并记录答案

- **[experience/elegant-router-parent-child-conflict.md]** - 更新示例路径
  - 添加 `status: archived` 标记
  - 更新 `statistical/` → `analysis/statistical/`

- **[experience/typescript-eslint-fix-2026-04-07.md]** - 添加路径变更说明
  - 标注 `views/statistical/` → `views/analysis/statistical/`
  - 标注 `views/saving/` → `views/sustainability/`
  - 标注 `views/processenergy/` 已删除

- **[experience/api-type-architecture-refactor.md]** - 添加更新说明

- **[roles/emss-frontend/AGENTS.md]** - 更新知识索引
  - 新增 `typescript-eslint-fix-2026-04-07.md` 索引
  - 添加路由变更注意事项

---

## 2026-04-06

### 新增

- **[skills/api-type-architecture.md]** - API 类型定义架构规范
  - 规定 typings/api 统一使用 `Api` 命名空间
  - service/api 仅放请求函数，引用 `Api.*` 类型
  - 包含正确架构示例、错误模式、重构检查清单
  - 触发场景：新增/重构 API 模块时

- **[experience/api-type-architecture-refactor.md]** - API 类型架构混乱问题复盘
  - 问题：typings 和 service 类型定义重复不一致
  - 解决：统一到 typings/api 使用 Api 命名空间
  - 重构进度：已完成 21 个模块

- **[typings/api/*.d.ts]** - 新增 15 个类型定义文件
  - electric-analysis.d.ts - 负荷分析/功率因数/三相不平衡/历史数据
  - energy-indicators.d.ts - 能源指标
  - gatewaysetting.d.ts - 网关设置
  - itemized-energy-analysis.d.ts - 分项能耗分析
  - keyequipment.d.ts - 重点设备能耗
  - peakvalley.d.ts - 峰谷分析
  - productoutput.d.ts - 产品产量
  - spikesandvalleys.d.ts - 尖峰平谷方案

- **[constants/security-errors.ts]** - 安全错误码常量
  - 与后端 `constants/security_errors.go` 同步
  - 登录错误码 (1xxx)、密码错误码 (2xxx)、解锁错误码 (3xxx)
  - 辅助函数：`isUserLocked()`, `isPasswordIncorrect()`, `isPasswordExpired()`

- **[utils/encryption.ts]** - 前端加密工具
  - AES-256-GCM 数据加密（Web Crypto API）
  - RSA-2048 密钥加密
  - 加密配置初始化

- **[views/manage/password-change/index.vue]** - 密码修改页面
  - 支持强制修改模式（密码过期）
  - 密码历史提示
  - 过期警告显示

- **[views/manage/user-lock/index.vue]** - 用户锁定管理页面
  - 锁定用户列表
  - 管理员解锁操作

### 修改

- **[store/modules/auth/index.ts]** - 认证 store 改造
  - `login()` 返回 `{ code, message, data }` 对象
  - 密码过期时跳转到修改页面
  - 密码状态检查集成

- **[views/_builtin/login/modules/pwd-login.vue]** - 登录页面改造
  - 使用 switch 语句处理错误码
  - 显示锁定提示、剩余尝试次数
  - 密码错误/账户锁定 UI 反馈

### 路由

- 自动生成路由 `manage_password-change` → `/manage/password-change`
- 自动生成路由 `manage_user-lock` → `/manage/user-lock`
- i18n 翻译已添加到 zh-cn.ts 和 en-us.ts

---

## 2026-04-04
  - energy.d.ts 扩展 - 虚拟计量点类型

- **[experience/vue-returntype-trap-fix.md]** - Vue ReturnType 类型陷阱修复
  - 问题：使用 `ReturnType<typeof computed>` 或 `ReturnType<typeof ref>` 导致 TypeScript 类型错误
  - 原因：ReturnType 返回的是简化类型，缺少 Vue 内部符号（如 `[WritableComputedRefSymbol]`）
  - 解决：直接使用 Vue 导出的 `ComputedRef<T>` 和 `Ref<T>` 类型
  - 文件：`src/hooks/business/use-sse-connection.ts`

- **[experience/echarts-shallowref-fix-2026-04-06.md]** - ECharts 实例 shallowRef 修复复盘
  - 问题：使用 ref 存储 ECharts 实例导致 TypeScript 类型错误
  - 原因：Vue 的 ref 对对象进行深度响应式转换
  - 解决：使用 shallowRef 替代 ref

- **[insights/third-party-instance-storage.md]** - 第三方库实例存储规范
  - 规定存储第三方库实例必须使用 shallowRef
  - 涵盖 ECharts、WebSocket、Map/Set、IntersectionObserver 等场景
  - 性能考量说明

### 更新

- **[AGENTS.md]** - 新增核心原则第 6 条：代码修改后必检规范
  - 每次编写或修改文件后必须执行 TypeScript 和 ESLint 检查
  - 包含检查时机、检查命令、验证标准

- **[principles/typescript-constraints.md]** - 新增第 11 节：代码修改后必检规范
  - 强制要求：每次编写或修改文件后执行 TS + ESLint 检查
  - 检查流程：`npx tsc --noEmit` + `pnpm lint`
  - 验证标准：源码文件无错误输出

- **[skills/api-type-architecture.md]** - 补充 JSDoc 注释规范和检查清单
  - 新增 JSDoc 注释规范
  - 新增分页响应 `Api.Common.PageResult<T>` 使用说明
  - 新增无返回值请求处理方式（禁止 `request<void>`）
  - 新增函数重名冲突解决方案
  - 重构检查清单新增 TypeScript + ESLint 检查步骤

- **[AGENTS.md]** - 更新知识索引和常见陷阱速查表
  - 新增 experience/echarts-shallowref-fix-2026-04-06.md 索引
  - 新增 insights/third-party-instance-storage.md 索引
  - 常见陷阱速查表新增"使用 ref 存储第三方库实例"陷阱
  - 删除不存在的索引引用（typescript-generic.md 等）

- **[skills/api-type-architecture.md]** - 补充 JSDoc 注释规范和特殊场景处理
  - 新增 JSDoc 注释规范
  - 新增分页响应 `Api.Common.PageResult<T>` 使用说明
  - 新增文件导出（Blob 响应）处理方式
  - 新增函数重名冲突解决方案

### 删除

- **[components/rule-engine/]** - 删除未使用的规则引擎组件目录
  - rule-editor.vue、rule-expression-editor.vue、rule-preview.vue、version-timeline.vue
  - 原因：功能已在 `views/scheduling/shared/` 下独立实现

- **[components/custom/energy-metric-card.vue]** - 删除未使用的能源指标卡片组件
  - 原因：已定义但未被任何页面引用

- **[src/views/alova/]** - 删除 alova 示例页面目录
  - 原因：仅用于演示 alova 功能，非生产代码

- **[src/service-alova/]** - 删除 alova 服务层目录
  - 原因：仅用于 alova 示例页面，无其他引用

- **[packages/alova/]** - 删除 alova 工作区包
  - 原因：无生产使用

- **[相关配置文件]** - 清理 alova 相关配置
  - package.json: 移除 `@sa/alova` 依赖
  - routes/index.ts: 移除 `document_alova` 路由
  - build/plugins/router.ts: 移除 `document_alova` 自定义路由
  - locales/langs/*.ts: 移除 alova 相关翻译

### 修复

- **[API 类型架构重构]** - 统一 API 类型定义到 typings/api
  - 问题：typings/api 和 service/api 存在重复且不一致的类型定义
  - 修复：service/api 删除 namespace 定义，统一引用 Api.* 类型
  - 已重构：21 个模块全部完成
  - 修复问题：`PageResult` 未定义、函数重名、`responseType: 'blob'` 类型错误

- **[src/hooks/business/use-sse-connection.ts]** - ReturnType 类型定义修复
  - 问题：使用 `ReturnType<typeof computed>` 导致 TS2741 类型错误
  - 修复：改用 Vue 导出的 `ComputedRef<T>` 和 `Ref<T>` 类型

- **[src/locales/langs/zh-cn.ts, en-us.ts]** - i18n route key 完整性修复
  - 问题：locale route key 不完整，部分 key 与 RouteKey 类型不匹配
  - 修复：补全所有缺失的 route key 翻译，删除无效的 key（如 `energy_branch`）
  - 规则：Locale route key 必须与 elegant-router.d.ts 中的 RouteKey 完全一致
  - 验证：`npx tsc --noEmit` 无 TS2353/TS2740/TS2561 错误

- **[src/views/statistical/index.vue]** - 删除冲突的路由视图文件
  - 问题：`statistical/` 同时有 `index.vue` 和子目录，导致 elegant-router 生成类型不匹配
  - 现象：TS2322 - `component: 'layout.base'` 不可分配给 `'layout.base$view.statistical'`
  - 修复：删除 `statistical/index.vue`，使 `statistical` 成为纯父级路由
  - 规则：父级路由目录不应有 `index.vue`，子页面放在子目录中

- **[typings/api/rule-engine.d.ts]** - 移除 ambient context 中的 const 声明
  - 问题：`.d.ts` 中 `const` 初始化必须是字符串/数字字面量
  - 修复：移除 `RuleType` 和 `ChangeType` 的 const 对象，仅保留 type 声明

- **[service/api/*.ts]** - ESLint `@typescript-eslint/no-invalid-void-type` 修复
  - 问题：`request<void>` 使用 `void` 作为泛型参数，ESLint 报错
  - 修复：无返回值请求直接使用 `request({...})`，不指定泛型参数
  - 受影响文件：benchmark.ts, energy-indicators.ts, gatewaysetting.ts, peakvalley.ts, productoutput.ts, spikesandvalleys.ts

- **[typings/api/comprehensive.d.ts]** - ESLint `@typescript-eslint/no-empty-object-type` 修复
  - 问题：空接口 `MonthlyComprehensiveQuery extends DailyComprehensiveQuery {}` 警告
  - 修复：改用类型别名 `type MonthlyComprehensiveQuery = DailyComprehensiveQuery`

---

## 2026-04-04

### 新增

- **[src/service/api/electric-analysis.ts]** - 电力分析 API 封装
  - ElectricLoad 命名空间: 负荷分析类型定义
  - PowerFactor 命名空间: 功率因数类型定义
  - ThreePhase 命名空间: 三相不平衡类型定义
  - HistoricalData 命名空间: 历史数据类型定义
  - fetchElectricLoadAnalysis: 负荷分析查询
  - fetchElectricityMeterList: 电表列表查询
  - fetchPowerFactorAnalysis: 功率因数查询
  - fetchThreePhaseAnalysis: 三相不平衡查询
  - fetchHistoricalData: 历史数据查询
  - exportHistoricalData: 历史数据导出

- **[src/views/energy/electric-analysis/]** - 电力分析页面
  - load-analysis.vue: 负荷分析页面（ECharts 折线图 + 汇总卡片）
  - power-factor-analysis.vue: 功率因数分析页面
  - three-phase-analysis.vue: 三相不平衡分析页面
  - index.vue: 入口页面（Tab 切换）

- **[src/router/routes/modules/electric-analysis.ts]** - 电力分析路由配置
  - /electric-analysis/load: 负荷分析
  - /electric-analysis/power-factor: 功率因数
  - /electric-analysis/three-phase: 三相不平衡

---

## 变更类型说明

| 类型 | 说明 |
|------|------|
| 新增 | 新创建的知识文件 |
| 更新 | 已有知识文件的修改 |
| 删除 | 废弃的知识文件 |
| 重构 | 知识结构重组 |

---

**最后更新**: 2026-04-06