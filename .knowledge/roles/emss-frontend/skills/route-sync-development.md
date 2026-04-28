---
description: "route/menu 边界下的前端路由同步、校验与降级开发流程"
triggers:
  - "路由同步"
  - "use-route-sync"
  - "userAuthorizedRoutes"
  - "前端路由"
  - "白屏"
source:
  - "spec/route-menu-boundary/spec.md"
  - "spec/route-menu-boundary/plan.md"
  - "roles/emss-frontend/skills/route-sync-development.md"
---

# Route / Menu Boundary 下的前端开发流程

## Beta 状态约束（最高优先级）

**当前开发状态为 Beta，以下约束优先级高于所有其他章节：**

1. **不需要考虑历史兼容性**：任何旧代码、旧数据、旧链路的历史兼容性都不在本次改造范围内。
2. **不需要考虑数据兼容性**：任何历史 route/menu 数据、授权数据、缓存数据的迁移、兼容、平滑过渡都不在本次改造范围内。
3. **随时可以删除重建整个数据库**：数据库可以随时清空重建，不需要保留任何历史业务数据。
4. **默认数据来源是前端 async sync**：业务 route/menu 的唯一权威来源是前端 `generatedRoutes`，通过 `syncRoutesWithBackend()` 写入后端。
5. **不新增长期兼容补丁**：任何为了兼容旧脏数据、旧错误链路、旧 API 契约的补丁都不在本次改造范围内。

## 概述

当前前端 route 链路已经收口为：

`后端 route tree -> contract validate -> store 预处理 -> transform -> Vue Router 注册`

关键边界：

- `/route/userAuthorizedRoutes` 必须被视为纯 route tree 输入。
- validate 必须先于 transform。
- transform 只负责结构转换，不再承担脏数据修补。
- sync 失败或 route tree 非法时，前端必须降级，不能白屏。
- beta 重建场景下，不能再依赖“本地版本一致就跳过 sync”的旧假设。

## 当前真实链路

### 启动顺序

首次登录或路由未初始化时，顺序必须是：

1. `routeStore.syncRoutesWithBackend()`
2. `authStore.initUserInfoWithoutButtons()`
3. `routeStore.initAuthRoute()`
4. validate 后注册动态路由
5. 设置安全 `home`

守卫层要求：sync 没成功时，不要继续盲目初始化动态路由。

### sync 结果判断

`/route/sync` 不能再假设返回 `{ success: true }`。

当前 request 层只返回后端响应体中的 `data`，而该接口成功时 `data` 为 `null`。因此前端只能按请求层的 `error` 判断是否成功。

```ts
const { error } = await fetchSyncRoutes({
  version,
  routes,
  constantRoutes
});

if (!error) {
  safeLocalStorageSet(ROUTE_VERSION_KEY, version);
  return true;
}
```

### route 输入校验

后端 route tree 进入 transform 前，必须先经过 `route-contract.ts`：

- 校验 `name/path/component`
- 归一化 `meta.title`
- 自动补齐合理的 `i18nKey`
- 校验 `home` 是否真实存在于当前合法路由树中
- 过滤非法节点

### 降级规则

当发生以下任一情况时，前端必须进入安全降级：

- sync 失败
- `/route/userAuthorizedRoutes` 返回空数据
- validate 后无合法业务路由
- 后端返回的 `home` 非法

当前默认降级目标是 `403`，而不是继续进入一个不确定的空白页。

## 开发 Checklist

### 边界复核

- [ ] 先确认改动发生在 sync、validate、store 还是 transform
- [ ] 先确认当前输入是不是纯 route tree，而不是菜单树
- [ ] 先确认问题是否应在 validate 层解决，而不是在 transform 层打补丁

### API / typing

- [ ] `fetchSyncRoutes` 类型保持 `request<null>`
- [ ] route API 类型中 `name/path/component` 为必填
- [ ] route 与 menu 类型分离，不混用目录节点定义

### Store 层

- [ ] `syncRoutesWithBackend` 明确返回同步结果
- [ ] `initDynamicAuthRoute` 对异常输入有稳定降级
- [ ] `resolveRouteHome` 始终返回真实可访问页面名
- [ ] contract validate 统一处理 meta 和非法节点

### Router Guard

- [ ] 先 sync，再 initAuthRoute
- [ ] sync 失败时直接进入降级路径
- [ ] 不要在失败后继续重复初始化导致竞态

### Transform

- [ ] 只做结构映射
- [ ] 不再吞掉输入错误并“猜测修复”
- [ ] 仅接收 validate 后的合法 route tree

## 关键代码规则

### 1. validate 必须先于 transform

```ts
const validRoutes = validateBackendRoutes(data.routes ?? []);
const safeHome = resolveRouteHome(validRoutes, data.home);
```

只有合法 route tree 才能进入 transform。

### 2. home 必须先校验再使用

```ts
export function resolveRouteHome(routes: Api.Route.BackendRoute[], home?: string): Api.Route.LastLevelRouteKey {
  if (home && hasRouteName(routes, home)) {
    return home as Api.Route.LastLevelRouteKey;
  }

  const fallbackHome = getFirstAccessibleRouteName(routes) || '403';
  return fallbackHome as Api.Route.LastLevelRouteKey;
}
```

规则：

- 后端给的 `home` 合法就用
- 不合法时，取第一条可访问业务路由
- 再不行就降级到 `403`

### 3. sync 失败时停止继续初始化

```ts
const [syncResult] = await Promise.all([
  routeStore.syncRoutesWithBackend(),
  authStore.initUserInfoWithoutButtons()
]);

if (!syncResult.skipped && !syncResult.synced) {
  const location: RouteLocationRaw = {
    name: '403'
  };

  return location;
}

await routeStore.initAuthRoute();
```

这一步是避免首页白屏的关键断点。

### 4. 动态路由初始化失败必须降级到 403

```ts
if (error || !data) {
  addAuthRoutes([]);
  handleConstantAndAuthRoutes();
  setRouteHome('403');
  handleUpdateRootRouteRedirect('403');
  setIsInitAuthRoute(true);
  return;
}
```

### 5. transform 只做结构映射

```ts
function transformBackendRoutesToElegantRoutes(
  backendRoutes: Api.Route.BackendRoute[],
  isConstant: boolean = false
): ElegantConstRoute[] {
  return backendRoutes.map(route => ({
    path: route.path,
    name: route.name as never,
    component: route.component,
    redirect: route.redirect,
    meta: {
      ...route.meta,
      title: route.meta?.title || route.name,
      constant: isConstant
    },
    children: route.children ? transformBackendRoutesToElegantRoutes(route.children, isConstant) : undefined
  }));
}
```

transform 不负责：

- 推测缺失的 `component`
- 把目录菜单节点强行转成页面路由
- 修补非法 `home`
- 隐式吞掉后端契约错误

## Beta 重建注意事项

在 beta 空库重建场景下：

- 前端 generated async routes 是业务导航默认来源
- 登录后必须重新执行 sync，不能仅根据本地缓存版本跳过
- 本地 `ROUTE_VERSION_KEY` 只能表示“本地曾同步过某版本”，不能证明后端数据库当前仍有业务 route/menu 数据

因此，遇到清库、重建、初始化后首次登录场景时，必须优先信任服务端重建结果，而不是本地缓存命中。

## 禁止事项

- 禁止在 transform 层继续叠加白屏补丁
- 禁止把 menu tree 当作 route tree 传给 route store
- 禁止继续使用 `response.success` 判断 `/route/sync` 成功
- 禁止用“本地版本一致”直接跳过 beta 重建后的首次 sync
- 禁止把非法 `home` 原样写入 store

## 排查优先级

当出现“登录后白屏 / 菜单有了但页面打不开 / 登录页 layout 错误”时，按以下顺序排查：

1. `/route/constantRoutes` 是否返回 blank layout 协议
2. `syncRoutesWithBackend()` 是否真的成功，而不是被错误类型判断拦截
3. `/route/userAuthorizedRoutes` 是否返回纯 route tree
4. `validateBackendRoutes` 是否过滤掉了非法节点
5. `resolveRouteHome` 是否把非法首页降级为可访问页面或 `403`
6. 守卫是否在 sync 失败后仍继续执行 `initAuthRoute`

## Escalate to questions if

- 需要支持更细粒度的前端 sync 重试策略
- 需要把 403 降级改成可观测的专用错误页或提示流程
- 后端 route meta 字段不足以支撑前端 i18n 或菜单展示规则
