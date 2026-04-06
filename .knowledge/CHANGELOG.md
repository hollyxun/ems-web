# 变更日志

> 记录前端知识库内容的更新历史

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