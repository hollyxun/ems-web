# 路由初始化顺序问题修复

## 问题描述

重置数据库后启动服务，前端访问返回 404，`/api/v1/route/constantRoutes` 返回空数组。

## 根本原因

路由初始化顺序错误：

```
错误流程：
1. initConstantRoute() → 后端返回空 → 使用静态常量路由（正常）
2. initAuthRoute() → 后端返回空路由 → 用户看不到任何页面
3. syncRoutesWithBackend() → 同步路由到后端（太晚了！）

正确流程：
1. initConstantRoute() → 后端返回空 → 使用静态常量路由
2. syncRoutesWithBackend() → 同步路由到后端（先同步！）
3. initAuthRoute() → 后端返回正确的路由数据
```

## 修复方案

调整 `web/src/router/guard/route.ts` 中的执行顺序：

```typescript
// 修复前
if (!routeStore.isInitAuthRoute) {
  await routeStore.initAuthRoute();           // 先初始化
  await routeStore.syncRoutesWithBackend();   // 后同步
  ...
}

// 修复后
if (!routeStore.isInitAuthRoute) {
  await routeStore.syncRoutesWithBackend();   // 先同步
  await routeStore.initAuthRoute();           // 后初始化
  ...
}
```

## 相关文件

- `web/src/router/guard/route.ts` - 路由守卫，调整执行顺序
- `web/src/store/modules/route/index.ts` - 路由 store，添加注释说明

## 预防措施

1. 数据库重置后应清除 localStorage 中的路由缓存
2. 或者后端版本返回空时，前端应自动触发同步

## 修复日期

2026-04-03