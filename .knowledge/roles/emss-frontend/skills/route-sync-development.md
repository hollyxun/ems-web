---
description: "前端路由同步功能开发流程和最佳实践"
triggers:
  - "路由同步"
  - "use-route-sync"
  - "route-menu"
  - "前端路由"
source:
  - "roles/emss-frontend/experience/route-sync-fix-2026-03-30.md"
---

# 路由同步开发流程

## 概述

前端路由同步功能实现前端路由定义与后端权限表的自动同步，确保路由状态一致性。

## 开发 Checklist

### API 层

- [ ] 添加指数退避重试逻辑
- [ ] 类型定义严格化（避免 any）
- [ ] 错误处理完善

### Hooks 层

- [ ] 防抖机制防止重复同步
- [ ] localStorage 异常处理
- [ ] 同步失败降级逻辑
- [ ] MD5 版本号计算稳定性

### 类型定义

- [ ] 定义 `App.Route.RouteConfig` 接口
- [ ] 定义 `App.Route.RouteMeta` 接口
- [ ] 与后端类型对应

## 关键代码模式

### 布尔值正确转换

```typescript
// 错误：Boolean(value) || undefined 会把 false 变成 undefined
// 正确：显式检查
hideInMenu: route.meta.hideInMenu === true ? true :
            route.meta.hideInMenu === false ? false : undefined
```

### parentName 传递（关键）

```typescript
// 扁平化路由时必须传递 parentName
function collectRoutesByType(routes: GeneratedRoute[]): CollectedRoutes {
  const result: CollectedRoutes = { routes: [], constantRoutes: [] };

  function collect(items: GeneratedRoute[], parentName: string = '') {
    items.forEach(item => {
      const routeItem: Api.Route.FrontendRouteItem = {
        name: item.name,
        path: item.path,
        component: item.component,
        parentName: parentName || undefined, // 关键：传递父级名称
        meta: item.meta as Record<string, unknown> | undefined
      };
      // 分类处理...
      
      // 递归处理子路由，传递当前路由名称作为父级
      const children = (item as ElegantConstRoute).children;
      if (children && children.length > 0) {
        collect(children as unknown as GeneratedRoute[], item.name as string);
      }
    });
  }

  collect(routes);
  return result;
}
```

### i18nKey 自动生成

```typescript
// 后端返回的路由可能没有 i18nKey，需要自动生成
function transformBackendRoutesToElegantRoutes(
  backendRoutes: Api.Route.BackendRoute[],
  isConstant: boolean = false
): ElegantConstRoute[] {
  return backendRoutes.map(route => {
    // 自动生成 i18nKey
    const generateI18nKey = (title: string, name: string): string | undefined => {
      // 如果 title 是中文，不需要 i18nKey
      if (title && /[\u4e00-\u9fa5]/.test(title)) {
        return undefined;
      }
      // 使用 route.{name} 格式
      return `route.${name}`;
    };

    const i18nKey = route.meta?.i18nKey || generateI18nKey(route.meta?.title || '', route.name);

    return {
      path: route.path,
      name: route.name as never,
      component: route.component,
      meta: route.meta ? {
        title: route.meta.title,
        i18nKey,
        // ...
      } : { title: route.name || '', i18nKey: `route.${route.name}` }
    };
  });
}
```

### 指数退避重试

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));
      }
    }
  }
  throw lastError;
}
```

### localStorage 安全封装

```typescript
function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
```

### 防抖同步

```typescript
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_DELAY = 500;

function syncRoutes(): Promise<void> {
  return new Promise((resolve) => {
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
    }
    syncDebounceTimer = setTimeout(() => {
      executeSync().then(resolve);
    }, SYNC_DEBOUNCE_DELAY);
  });
}
```

## Escalate to experience if

- 同步后路由状态异常
- 布尔值序列化结果与预期不符
- localStorage 访问异常