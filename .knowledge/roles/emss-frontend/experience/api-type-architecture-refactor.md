---
description: "API 类型架构混乱问题复盘：typings 和 service 类型定义重复不一致"
triggers:
  - "API 类型重复"
  - "typings service 不一致"
  - "namespace 冲突"
date: "2026-04-06"
updated: "2026-04-08"
notes: "2026-04-08 路由菜单整合后，部分视图目录已变更，但 API 类型文件位置不变"
---

# API 类型架构混乱问题复盘

## 问题发现

用户反馈：`typings/api` 和 `service/api` 存在类型定义混合问题。

## 问题现象

| 位置 | 内容 | 问题 |
|------|------|------|
| `typings/api/alarm.d.ts` | `Api.AlarmHistory.AlarmHistoryItem` | 全局类型声明 |
| `service/api/alarm.ts` | `AlarmHistory.AlarmHistoryItem` | 本地导出的 namespace |

两边的类型定义：
- **重复**：同一类型定义两次
- **不一致**：字段类型可能不同
- **混乱**：使用时不知道用哪个

## 根因分析

1. **历史遗留**：项目初期没有统一的架构规范
2. **渐进腐化**：新增 API 时随意放置类型定义
3. **缺乏约束**：没有代码规范文档约束

## 解决方案

**统一架构：typings 统一使用 `Api` 命名空间**

```
typings/api/*.d.ts  →  类型定义
                      declare namespace Api { ... }

service/api/*.ts    →  请求函数
                      引用 Api.* 类型
```

## 重构进度

### 已完成（21 个模块）

| 模块 | typings | service | 备注 |
|------|---------|---------|------|
| alarm | ✅ | ✅ | 告警管理 |
| saving | ✅ | ✅ | 节能管理 |
| knowledge | ✅ | ✅ | 知识库 |
| carbonemission | ✅ | ✅ | 碳排放 |
| costmanagement | ✅ | ✅ | 成本管理 |
| statistical | ✅ | ✅ | 统计分析 |
| advanced-permission | ✅ | ✅ | 高级权限 |
| benchmark | ✅ | ✅ | 标杆管理 |
| comprehensive | ✅ | ✅ | 综合能耗统计 |
| consumption-analysis | ✅ | ✅ | 能耗分析 |
| electric-analysis | ✅ | ✅ | 电力分析 |
| energy-indicators | ✅ | ✅ | 能源指标 |
| energy-meter | ✅ | ✅ | 计量点管理（类型在 energy.d.ts） |
| energy-tou | ✅ | ✅ | 分时电价（类型在 energy.d.ts） |
| gatewaysetting | ✅ | ✅ | 网关设置 |
| itemized-energy-analysis | ✅ | ✅ | 分项能耗分析 |
| keyequipment | ✅ | ✅ | 重点设备能耗 |
| peakvalley | ✅ | ✅ | 峰谷分析 |
| productoutput | ✅ | ✅ | 产品产量 |
| spikesandvalleys | ✅ | ✅ | 尖峰平谷方案 |
| virtual-meter | ✅ | ✅ | 虚拟计量点（类型在 energy.d.ts） |

### 修复的问题

| 问题 | 解决方案 |
|------|----------|
| `PageResult` 未定义 | 改用 `Api.Common.PageResult<T>` |
| 函数重名 `fetchGetEnergyRanking` | 重命名为 `fetchConsumptionEnergyRanking` |
| `responseType: 'blob'` 类型错误 | 改用 axios 直接请求 |
| `Organization` 类型未定义 | 移除未使用的类型引用 |
| `.d.ts` 中 `const` 声明 | 移除，仅保留 `type` 声明 |

### typings/api 目录结构

```
src/typings/api/
├── common.d.ts              # 通用类型：PageResult, SelectOption
├── alarm.d.ts               # 告警管理
├── advanced-permission.d.ts # 高级权限
├── benchmark.d.ts           # 标杆管理
├── branch-analysis.d.ts     # 支路用能分析
├── carbonemission.d.ts      # 碳排放
├── comprehensive.d.ts       # 综合能耗统计
├── consumption-analysis.d.ts # 能耗分析
├── costmanagement.d.ts      # 成本管理
├── electric-analysis.d.ts   # 电力分析（负荷/功率因数/三相不平衡）
├── energy.d.ts              # 能源核心类型（介质/计量点/分时电价/虚拟计量点/SSE/能流图/排名/对比/报表）
├── energy-indicators.d.ts   # 能源指标
├── gatewaysetting.d.ts      # 网关设置
├── itemized-energy-analysis.d.ts # 分项能耗分析
├── keyequipment.d.ts        # 重点设备能耗
├── knowledge.d.ts           # 知识库
├── organization.d.ts        # 组织架构
├── peakvalley.d.ts          # 峰谷分析
├── productoutput.d.ts       # 产品产量
├── rule-engine.d.ts         # 规则引擎
├── saving.d.ts              # 节能管理
├── spikesandvalleys.d.ts    # 尖峰平谷方案
├── statistical.d.ts         # 统计分析
└── system-manage.d.ts       # 系统管理
```

## 预防措施

1. **新增 API 模块时**：检查 `skills/api-type-architecture.md`
2. **Code Review**：检查类型定义是否放在正确位置
3. **知识库索引**：AGENTS.md 中添加了技能文档引用
4. **JSDoc 规范**：所有类型和函数必须有注释

## 相关文件

- 架构规范：`skills/api-type-architecture.md`
- 已重构文件：`src/typings/api/*.d.ts`, `src/service/api/*.ts`

---

**最后更新**: 2026-04-06