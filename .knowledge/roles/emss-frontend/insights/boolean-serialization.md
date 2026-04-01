---
description: "布尔值序列化的常见陷阱，避免 false 被错误转换"
triggers:
  - "布尔值转换"
  - "Boolean()"
  - "hideInMenu"
  - "keepAlive"
source:
  - "roles/emss-frontend/experience/route-sync-fix-2026-03-30.md"
---

# 布尔值序列化陷阱

## 核心问题

**`Boolean(value) || undefined` 会把 `false` 变成 `undefined`**

```typescript
// 问题代码
const result = Boolean(route.meta.hideInMenu) || undefined;
// 当 hideInMenu = false 时，Boolean(false) = false
// false || undefined = undefined（错误！）

// 正确代码
const result = route.meta.hideInMenu === true ? true :
               route.meta.hideInMenu === false ? false : undefined;
```

## 原因分析

1. `Boolean(false)` 返回 `false`
2. `false || undefined` 由于 `false` 是 falsy 值，返回右侧 `undefined`
3. 结果：原本想表达"隐藏菜单"的 `false` 变成了"未设置"的 `undefined`

## 影响范围

- `hideInMenu`: 菜单隐藏标记
- `keepAlive`: 页面缓存标记
- `constant`: 常量路由标记
- 任何需要区分 `false` 和 `undefined/null` 的布尔字段

## 正确模式

### 模式1：显式三目

```typescript
const value = data.field === true ? true :
              data.field === false ? false : undefined;
```

### 模式2：nullish coalescing（仅当原始值是 boolean 或 null/undefined）

```typescript
// 仅当 field 类型是 boolean | null | undefined 时有效
const value: boolean | undefined = data.field ?? undefined;
```

### 模式3：保留原始值

```typescript
// 如果不需要转换，直接保留
const value = typeof data.field === 'boolean' ? data.field : undefined;
```

## Escalate to experience if

- 布尔字段值与预期不符
- `false` 值被丢失或转换
- JSON 序列化后字段缺失