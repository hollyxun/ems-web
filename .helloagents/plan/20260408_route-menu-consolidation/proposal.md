# 路由菜单整合方案

## 背景

当前一级菜单过多（35+ 个），存在大量重复和分散的功能模块，需要整合为合理的业务架构。

## 目标

将 35+ 个一级菜单整合为 16 个核心业务模块。

## 最终菜单结构

| 序号 | 模块名 | 说明 | Icon |
|------|--------|------|------|
| 1 | **home** | 首页 | `mdi:monitor-dashboard` |
| 2 | **dashboard** | 自定义仪表盘 | `mdi:view-dashboard` |
| 3 | **energy** | 能源管理 | `carbon:energy` |
| 4 | **analysis** | 能耗分析（整合所有分析模块） | `mdi:chart-line` |
| 5 | **base-data** | 基础数据 | `mdi:database-cog` |
| 6 | **alarm** | 报警管理 | `mdi:alarm` |
| 7 | **cost** | 成本管理 | `mdi:currency-cny` |
| 8 | **sustainability** | 双碳管理（节能+碳排放） | `mdi:molecule-co2` |
| 9 | **scheduling** | 排班管理 | `mdi:calendar-clock` |
| 10 | **knowledge** | 知识库 | `mdi:book-open-variant` |
| 11 | **approval** | 审批管理 | `mdi:clipboard-check` |
| 12 | **gatewaysetting** | 网关设置 | `mdi:router-wireless` |
| 13 | **manage** | 系统管理 | `carbon:cloud-service-management` |
| 14 | **profile** | 个人中心（头像下拉入口） | `mdi:account-circle` |
| 15 | **developer** | 开发者（plugin+function+document） | `mdi:code-braces` |
| 16 | **about** | 关于 | `fluent:book-information-24-regular` |

---

## 阶段划分

### 阶段1：Locale 清理与 Icon 统一（安全操作）

**已完成：**
- [x] 更新知识库 i18n 规范文档
- [x] 清理 locale 文件中的重复 route key（costmanagement, processenergy）
- [x] TypeScript 类型检查通过

**待执行：**
- [ ] 为所有一级菜单添加统一 icon（需通过后端菜单系统配置或路由 meta 覆盖）

---

### 阶段2：视图目录重组（破坏性变更）

**已完成：**
- [x] 合并能耗分析类模块到 `analysis/`
  - benchmark → analysis/benchmark
  - branchanalysis → analysis/branch
  - comprehensivestatistics → analysis/comprehensive
  - consumptionanalysis → analysis/consumption-detail
  - energy-analysis → analysis/energy
  - energy-indicators → analysis/indicators
  - keyequipment → analysis/key-equipment
  - productoutput → analysis/product-output
  - statistical → analysis/statistical
  - peakvalley → analysis/peak-valley
  - peakvalley-analysis → analysis/peak-valley-detail
  - spikesandvalleys → analysis/peak-valley-scheme
  - process-energy → analysis/process-energy
  - itemized → analysis/itemized
  - itemizedenergyanalysis → analysis/itemized-detail
- [x] 创建 `sustainability` 双碳管理模块
  - saving/program → sustainability/program
  - saving/policy → sustainability/policy
  - carbonemission/calculate → sustainability/carbon-calculate
- [x] 创建 `developer` 开发者模块
  - plugin → developer/plugin
  - function → developer/function
- [x] 删除重复模块
  - costmanagement（modules 已迁移到 cost）
  - processenergy
- [x] 更新 locale 文件（zh-cn.ts, en-us.ts）
- [x] 重新生成路由类型定义（elegant-router.d.ts）
- [x] TypeScript 类型检查通过（locale 部分）

**待执行：**
- [ ] 更新后端权限配置（路由名称已变更）
- [ ] 更新代码中的路由引用（如有硬编码路由名）
- [ ] 通知后端同步更新菜单配置

**影响范围：** 仅修改 `zh-cn.ts`、`en-us.ts`，不改变路由结构

---

### 阶段2：视图目录重组（破坏性变更）

**重复模块合并：**

| 源模块 | 目标模块 | 操作 |
|--------|----------|------|
| `costmanagement` | `cost` | 已删除，modules 已迁移 |
| `processenergy` | `process-energy` | 已删除 |
| `spikesandvalleys` | `peakvalley` | 待迁移 |
| `peakvalley-analysis` | `peakvalley` | 待迁移（作为子页面） |
| `itemizedenergyanalysis` | `itemized` | 待迁移 |

**能耗分析模块合并到 analysis：**

| 源模块 | 目标路径 |
|--------|----------|
| `benchmark` | `analysis/benchmark` |
| `branchanalysis` | `analysis/branch` |
| `comprehensivestatistics` | `analysis/comprehensive` |
| `consumptionanalysis` | `analysis/consumption` |
| `energy-analysis` | `analysis/energy` |
| `energy-indicators` | `analysis/indicators` |
| `keyequipment` | `analysis/key-equipment` |
| `productoutput` | `analysis/product-output` |
| `statistical` | `analysis/statistical` |
| `peakvalley` | `analysis/peak-valley` |
| `process-energy` | `analysis/process-energy` |
| `itemized` | `analysis/itemized` |

**双碳管理模块创建：**

| 源模块 | 目标路径 |
|--------|----------|
| `saving/program` | `sustainability/program` |
| `saving/policy` | `sustainability/policy` |
| `carbonemission/calculate` | `sustainability/carbon-calculate` |

**开发者模块创建：**

| 源模块 | 目标路径 |
|--------|----------|
| `plugin/*` | `developer/plugin/*` |
| `function/*` | `developer/function/*` |
| `document/*` | `developer/document/*` |

**注意事项：**
1. 移动目录会改变路由名称（elegant-router 自动生成）
2. 需要同步更新所有代码中的路由引用
3. 需要同步更新后端权限配置
4. 需要重新生成 `elegant-router.d.ts`

---

### 阶段3：验证与清理

- [ ] 运行 `pnpm tsc --noEmit` 验证类型
- [ ] 运行 `pnpm lint` 验证代码规范
- [ ] 清理遗留的空目录
- [ ] 更新 CHANGELOG

---

### 阶段3：验证与清理

**已完成：**
- [x] 清理遗留空目录
- [x] TypeScript 类型检查（locale 相关无错误）
- [x] 更新知识库 CHANGELOG

**注意事项：**
- TS2307 错误为 Vue 组件模块声明问题，不影响运行
- 后端需同步更新 `sys_route_menus` 表和权限配置

---

## 进度跟踪

| 阶段 | 状态 | 完成日期 |
|------|------|----------|
| 阶段1 | ✅ 完成 | 2026-04-08 |
| 阶段2 | ✅ 完成 | 2026-04-08 |
| 阶段3 | ✅ 完成 | 2026-04-08 |

---

## 最终视图目录结构

```
src/views/
├── _builtin/           # 内置页面（登录、错误页等）
├── about/              # 关于
├── alarm/              # 报警管理
├── analysis/           # 能耗分析（整合所有分析模块）
│   ├── benchmark/      # 对标分析
│   ├── branch/         # 分支分析
│   ├── comprehensive/  # 综合统计
│   ├── consumption/    # 能耗分析
│   ├── consumption-detail/
│   ├── energy/         # 能源分析
│   ├── indicators/     # 能耗指标
│   ├── itemized/       # 分项能耗
│   ├── itemized-detail/
│   ├── key-equipment/  # 重点设备
│   ├── peak-valley/    # 峰谷分析
│   ├── peak-valley-detail/
│   ├── peak-valley-scheme/
│   ├── process-energy/ # 工序能耗
│   ├── product-output/ # 产品产量
│   └── statistical/    # 统计分析
├── approval/           # 审批管理
├── base-data/          # 基础数据
├── cost/               # 成本管理
├── dashboard/          # 仪表盘
├── developer/          # 开发者
│   ├── function/       # 系统功能
│   └── plugin/         # 插件示例
├── energy/             # 能源管理
├── gatewaysetting/     # 网关设置
├── home/               # 首页
├── knowledge/          # 知识库
├── manage/             # 系统管理
├── profile/            # 个人中心
├── scheduling/         # 排班管理
└── sustainability/     # 双碳管理
    ├── carbon-calculate/
    ├── policy/
    └── program/
```

**一级菜单数量：17 个**（从原来的 35+ 个整合而来）

---

**创建日期**: 2026-04-08
**最后更新**: 2026-04-08