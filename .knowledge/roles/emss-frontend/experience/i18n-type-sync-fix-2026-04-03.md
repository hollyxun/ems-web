# i18n 类型定义与语言文件同步修复

## 问题描述

TypeScript 编译报错：语言文件（`zh-cn.ts`、`en-us.ts`）与 `app.d.ts` 中的 `I18n.Schema` 类型定义不一致。

```
src/locales/langs/zh-cn.ts: error TS2353: Object literal may only specify known properties
src/locales/langs/en-us.ts: error TS2353: Object literal may only specify known properties
```

## 根本原因

1. **缺失顶级结构**：`app.d.ts` 定义了完整的 `devtools` 命名空间（包含 `server` 和 `aiChat`），但两个语言文件都没有实现

2. **错误放置的结构**：`zh-cn.ts` 将 `server` 放在 `page.about` 下，但 `app.d.ts` 中 `page.about` 不包含 `server` 属性

3. **过时的路由键**：语言文件保留了已删除的路由键（如 `energy_base-data` 系列、`shift-schedule`），这些键不在 `elegant-router.d.ts` 的 `RouteKey` 类型中

## 修复方案

### 1. 补全缺失的 devtools 结构

在两个语言文件末尾添加完整的 `devtools` 翻译：

```typescript
devtools: {
  server: {
    title: '服务器状态',
    cpu: 'CPU',
    cpuCores: '核心数',
    // ... 其他 server 属性
  },
  aiChat: {
    title: 'AI 助手',
    config: { ... },
    session: { ... },
    chat: { ... }
  }
}
```

### 2. 移除错误放置的结构

从 `page.about` 中移除 `server`，将其迁移到正确的 `devtools.server` 位置。

### 3. 清理过时路由键

移除不在 `elegant-router.d.ts` 中的路由键：

```typescript
// 移除以下过时键：
'energy_base-data'           // 已迁移到独立的 'base-data' 模块
'energy_base-data_coefficient'
'energy_base-data_ledger'
'energy_base-data_medium'
'energy_base-data_unit'
'energy_base-data_meter'
'energy_base-data_tou'
'shift-schedule'             // 不存在于路由定义
```

## 相关文件

- `web/src/typings/app.d.ts` - i18n 类型定义（Schema）
- `web/src/locales/langs/zh-cn.ts` - 中文语言文件
- `web/src/locales/langs/en-us.ts` - 英文语言文件
- `web/src/typings/elegant-router.d.ts` - 路由类型定义（RouteKey）

## 类型同步检查方法

```bash
# 检查 i18n 类型错误
cd web && npx tsc --noEmit --skipLibCheck 2>&1 | grep "locales/langs"
```

## 预防措施

1. **路由变更时同步更新语言文件**：删除或重命名路由时，必须同步清理 `route` 命名空间中的对应键

2. **新增功能时补全翻译**：`app.d.ts` 新增类型定义后，必须在两个语言文件中同步添加翻译

3. **使用类型检查**：定期运行 `tsc --noEmit` 检查类型一致性

## 修复日期

2026-04-03