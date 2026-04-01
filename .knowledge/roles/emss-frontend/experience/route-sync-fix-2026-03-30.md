# 前端路由同步 P0/P1 修复复盘

日期: 2026-03-30

## Triggers
- "路由同步"
- "use-route-sync"
- "route-menu"
- "布尔值转换"
- "localStorage"
- "指数退避重试"

## 背景

路由同步功能实现前端路由与后端权限表同步，代码审查发现多个 P0/P1 问题。

## 关键修复点

### 1. 布尔值转换错误（P0-12）

**问题**：`Boolean(route.meta.hideInMenu) || undefined` 导致 false 被转为 undefined。

**修复**：
```typescript
hideInMenu: route.meta.hideInMenu === true ? true :
            route.meta.hideInMenu === false ? false : undefined
```

### 2. 用户信息加载顺序（P0-9）

**问题**：依赖 `useAuthStore` 的 `userInfo`，未加载完成时无法判断超级管理员。

**修复**：改用 `id === 0` 判断未加载状态（id 为 number 类型更直接）。

### 3. 指数退避重试逻辑（P1-13）

**实现**：
```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

function calculateDelay(attempt: number): number {
  const delay = Math.min(RETRY_CONFIG.baseDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);
  return delay + Math.random() * 1000; // 添加抖动避免惊群
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, calculateDelay(i)));
      }
    }
  }
  throw lastError;
}
```

### 4. localStorage 安全封装（P1-16）

**实现**：
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

function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
```

### 5. 同步失败降级逻辑（P1-17）

**实现**：
```typescript
const ROUTE_CACHE_KEY = 'route_sync_cache';

function fallbackToCachedRoutes(): RouteConfig[] | null {
  const cached = safeLocalStorageGet(ROUTE_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
}

// 同步前缓存当前路由
safeLocalStorageSet(ROUTE_CACHE_KEY, JSON.stringify(currentRoutes));

// 同步失败时降级
try {
  const result = await fetchSyncRoutes(syncData);
  // ...
} catch (error) {
  const cachedRoutes = fallbackToCachedRoutes();
  if (cachedRoutes) {
    console.warn('[RouteSync] Using cached routes due to sync failure');
    // 使用缓存路由
  }
}
```

### 6. 防抖机制（P1-15）

**实现**：
```typescript
const SYNC_DEBOUNCE_DELAY = 500;
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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

## TypeScript 类型严格化（P1-14）

**新增命名空间**：
```typescript
declare namespace App.Route {
  interface RouteMeta {
    title?: string;
    icon?: string;
    order?: number;
    hideInMenu?: boolean;
    keepAlive?: boolean;
    constant?: boolean;
    href?: string;
  }

  interface RouteConfig {
    name: string;
    path: string;
    component?: string;
    parentName?: string;
    meta?: RouteMeta;
    children?: RouteConfig[];
  }
}
```

## 结果

- P0 修复：全部完成
- P1 修复：全部完成
- TypeScript 类型定义：已严格化

## 沉淀

- **skill**: `roles/emss-frontend/skills/route-sync-development.md`（路由同步开发流程）
- **insight**: `roles/emss-frontend/insights/boolean-serialization.md`（布尔值序列化陷阱）