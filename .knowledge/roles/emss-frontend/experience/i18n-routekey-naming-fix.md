---
description: "i18n route key 命名规则：Locale key 必须与 RouteKey 类型定义保持一致"
triggers:
  - "i18n"
  - "locale"
  - "route key"
  - "RouteKey"
  - "TS2561"
  - "gatewaySetting"
date: "2026-04-06"
files:
  - "src/locales/langs/zh-cn.ts"
  - "src/locales/langs/en-us.ts"
---

# i18n Route Key 命名规则

## 问题现象

TypeScript 报错：
```
TS2561: Object literal may only specify known properties, 
but 'gatewaySetting' does not exist in type 'Record<I18nRouteKey, string>'. 
Did you mean to write 'gatewaysetting'?
```

## 问题代码

```typescript
// zh-cn.ts - ❌ 错误写法（驼峰）
route: {
  gatewaySetting: '网关设置',
  'gatewaySetting_manage': '网关配置管理'
}
```

## 根因分析

前端路由类型 `RouteKey` 由 `elegant-router.d.ts` 自动生成，使用 **全小写命名**：

```typescript
// elegant-router.d.ts（自动生成）
export type RouteMap = {
  "gatewaysetting": "/gatewaysetting";  // 注意：全小写
  // ...
};
export type RouteKey = keyof RouteMap;
```

Locale 文件的 `route` section 类型为 `Record<I18nRouteKey, string>`，其中 `I18nRouteKey` 派生自 `RouteKey`。

如果 locale key 与 RouteKey 不一致，TypeScript 会报类型错误。

## 前端路由 vs 后端 API 路径

**重要区分**：前端路由 key 与后端 API url 是两个不同的概念：

| 概念 | 来源 | 命名规则 | 示例 |
|------|------|----------|------|
| 前端 RouteKey | elegant-router.d.ts | 全小写（kebab-case） | `gatewaysetting` |
| 后端 API url | 后端 Router | 按后端约定 | `/gatewaySetting/...` |

**Locale route key 必须匹配前端 RouteKey（小写）**
**前端 API url 必须匹配后端 Router（驼峰或按后端约定）**

## 解决方案

```typescript
// zh-cn.ts - ✅ 正确写法（全小写，与 RouteKey 一致）
route: {
  gatewaysetting: '网关设置'
}
```

删除无效的 key：如果 RouteKey 中没有对应的子路由，locale 也不应定义。

## 验证方法

**关键检查命令**：
```bash
# 检查 locale 类型错误
npx tsc --noEmit 2>&1 | grep -E "TS2353|TS2740|TS2561"

# 如果输出为空，则 locale key 正确
```

**常见错误码**：
- TS2353: Object literal may only specify known properties
- TS2740: Type is missing properties from type 'Record<I18nRouteKey, string>'
- TS2561: Did you mean to write 'xxx'?

## 关键要点

1. **Locale route key 必须与 RouteKey 一致**（全小写）
2. **不要混淆前端路由和后端 API**：它们有不同的命名约定
3. **无效的子路由 key 应删除**：如 `gatewaySetting_manage` 无对应路由
4. **elegant-router.d.ts 是 RouteKey 的唯一真实来源**

## 相关文件

- RouteKey 定义：`src/typings/elegant-router.d.ts`
- Locale 文件：`src/locales/langs/zh-cn.ts`, `src/locales/langs/en-us.ts`
- I18n 类型：`src/typings/app.d.ts`（`I18nRouteKey` 定义）

---

**最后更新**: 2026-04-06