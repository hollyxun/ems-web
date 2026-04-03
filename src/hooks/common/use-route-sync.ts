import { computed, ref } from 'vue';
import SparkMD5 from 'spark-md5';
import { fetchSyncRoutes } from '@/service/api/route-menu';
import { useAuthStore } from '@/store/modules/auth';

const ROUTE_VERSION_KEY = 'ems_route_version';
const ROUTE_CACHE_KEY = 'ems_route_cache';

// Global state to avoid duplicate sync
const isSyncing = ref(false);
const hasSynced = ref(false);

// Debounce state
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_DELAY = 500; // 500ms debounce

// Export hasSynced computed for use in router guard
export const routeHasSynced = computed(() => hasSynced.value);

/**
 * 安全的 localStorage 操作
 * P1-16: 添加 try-catch 包装
 */
function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('[RouteSync] localStorage.getItem failed:', error);
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('[RouteSync] localStorage.setItem failed:', error);
    return false;
  }
}

function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('[RouteSync] localStorage.removeItem failed:', error);
  }
}

/**
 * Recursively extract route key information for stable sorting
 * Includes all meta fields that affect route behavior
 * P1-14: 使用具体类型替代 any
 */
function extractRouteInfo(route: App.Route.RouteConfig): App.Route.RouteConfig {
  const info: App.Route.RouteConfig = {
    name: route.name,
    path: route.path,
    component: route.component || '',
    parentName: route.parentName || ''
  };
  if (route.meta) {
    // Extract all relevant meta fields with correct types
    info.meta = {
      title: route.meta.title || '',
      icon: route.meta.icon || '',
      // Ensure order is number type (default 0 if undefined)
      order: typeof route.meta.order === 'number' ? route.meta.order : 0,
      // Ensure boolean types with defaults
      hideInMenu: Boolean(route.meta.hideInMenu),
      keepAlive: Boolean(route.meta.keepAlive),
      constant: Boolean(route.meta.constant),
      // Include href if present
      href: route.meta.href || ''
    };
  }
  // Recursively process children with stable sorting
  if (route.children && Array.isArray(route.children) && route.children.length > 0) {
    info.children = route.children.map(extractRouteInfo).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
  return info;
}

/**
 * Calculate MD5 hash of route configuration
 * Uses stable sorting and deterministic JSON serialization
 * to ensure same configuration produces same hash
 * P1-14: 使用具体类型替代 any
 */
function calculateRouteHash(routes: App.Route.RouteConfig[]): string {
  // Sort routes by name for stable hash calculation
  const sortedRoutes = routes.map(extractRouteInfo).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Use deterministic JSON serialization with sorted keys
  const jsonStr = stableJsonStringify(sortedRoutes);
  return SparkMD5.hash(jsonStr);
}

/**
 * Deterministic JSON serialization with sorted keys
 * Recursively sorts object keys to ensure stable output
 * P1-14: 使用具体类型替代 any
 */
function stableJsonStringify(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const items = obj.map(item => stableJsonStringify(item));
    return `[${items.join(',')}]`;
  }

  // Sort keys alphabetically for stable output
  const objRecord = obj as Record<string, unknown>;
  const keys = Object.keys(objRecord).sort();
  const pairs = keys.map(key => {
    const value = stableJsonStringify(objRecord[key]);
    return `"${key}":${value}`;
  });
  return `{${pairs.join(',')}}`;
}

/**
 * Flatten nested routes from elegant-router format
 * elegant-router uses 'children' array for parent-child relationship,
 * not 'parent' or 'parentName' property
 * P1-14: 使用具体类型替代 any
 */
function flattenRoutes(routes: App.Route.RouteConfig[], parentName = ''): Api.RouteMenu.RouteSyncItem[] {
  const result: Api.RouteMenu.RouteSyncItem[] = [];

  for (const route of routes) {
    // Build meta object with correct types for backend
    // P0-12: Ensure boolean values are correctly converted
    // Boolean(false) || undefined returns undefined, which is wrong
    // We need to preserve true/false values, only omit when undefined
    const meta: Api.RouteMenu.RouteSyncMeta | undefined = route.meta
      ? {
          title: route.meta.title,
          icon: route.meta.icon,
          // Ensure order is number type
          order: typeof route.meta.order === 'number' ? route.meta.order : undefined,
          // Preserve boolean values correctly: true stays true, false stays false, undefined stays undefined
          hideInMenu: route.meta.hideInMenu ?? undefined,
          keepAlive: route.meta.keepAlive ?? undefined,
          constant: route.meta.constant ?? undefined,
          href: route.meta.href
        }
      : undefined;

    // Create flat route item
    // elegant-router routes don't have 'parentName' property, use passed parentName
    const flatRoute: Api.RouteMenu.RouteSyncItem = {
      name: route.name,
      path: route.path,
      component: route.component,
      // elegant-router doesn't have 'parent' property, use recursive parentName
      parentName: parentName || undefined,
      meta
    };
    result.push(flatRoute);

    // Recursively process children, passing current route name as parentName
    if (route.children && Array.isArray(route.children) && route.children.length > 0) {
      const childRoutes = flattenRoutes(route.children, route.name);
      result.push(...childRoutes);
    }
  }

  return result;
}

/**
 * P1-17: 从缓存恢复路由数据作为降级方案
 */
async function fallbackToCachedRoutes(): Promise<boolean> {
  try {
    const cachedData = safeLocalStorageGet(ROUTE_CACHE_KEY);
    if (cachedData) {
      console.log('[RouteSync] Using cached routes as fallback');
      // 解析缓存数据
      const cached = JSON.parse(cachedData) as { version: string; routes: Api.RouteMenu.RouteSyncItem[] };
      // 标记为已同步（使用缓存版本）
      hasSynced.value = true;
      console.log('[RouteSync] Fallback successful, cached routes:', cached.routes.length);
      return true;
    }
    console.warn('[RouteSync] No cached routes available for fallback');
    return false;
  } catch (error) {
    console.error('[RouteSync] Fallback parsing failed:', error);
    return false;
  }
}

/**
 * Execute route sync with debounce
 * Only triggered for super admin users after userInfo is loaded
 * P1-15: 添加防抖机制
 * P1-16: localStorage 异常处理
 * P1-17: 同步失败降级逻辑
 */
export async function syncRoutes(): Promise<boolean> {
  // P1-15: 防抖机制 - 如果已有定时器等待中，清除并重新计时
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = null;
    console.log('[RouteSync] Debounce: clearing previous timer');
  }

  // 如果正在同步或已完成，直接返回
  if (isSyncing.value || hasSynced.value) {
    return true;
  }

  const authStore = useAuthStore();

  // P0-9: Check if userInfo is loaded (id must be > 0 indicating data from backend)
  // userInfo.id initial value is 0, after login it becomes the actual user ID
  // If userInfo is not loaded yet, skip sync to avoid false negative
  if (!authStore.userInfo.id || authStore.userInfo.id === 0) {
    console.log('[RouteSync] UserInfo not loaded yet (id=0), skipping sync');
    return true;
  }

  // Only super admin triggers sync
  const roles = authStore.userInfo.roles || [];
  const isSuperAdmin = roles.some(role => typeof role === 'object' && 'authorityId' in role && role.authorityId === 1);

  if (!isSuperAdmin) {
    console.log('[RouteSync] User is not super admin, skipping sync');
    return true;
  }

  // P1-15: 设置防抖定时器
  return new Promise(resolve => {
    syncDebounceTimer = setTimeout(async () => {
      syncDebounceTimer = null;
      const result = await executeSync();
      resolve(result);
    }, SYNC_DEBOUNCE_DELAY);
  });
}

/**
 * 实际执行同步逻辑（从 syncRoutes 提取）
 */
async function executeSync(): Promise<boolean> {
  isSyncing.value = true;

  try {
    // Dynamic import of route configuration
    const { generatedRoutes } = await import('@/router/elegant/routes');

    // Calculate version number with stable hash
    const version = calculateRouteHash(generatedRoutes as App.Route.RouteConfig[]);

    // P1-16: 使用安全 localStorage 操作检查缓存版本
    const cachedVersion = safeLocalStorageGet(ROUTE_VERSION_KEY);
    if (cachedVersion === version) {
      hasSynced.value = true;
      console.log('[RouteSync] Version unchanged, skipping sync');
      return true;
    }

    // Flatten routes (exclude constant routes, handled separately by backend)
    // elegant-router routes use 'children' for parent-child relationship
    const flatRoutes = flattenRoutes(generatedRoutes as App.Route.RouteConfig[]).filter(r => !r.meta?.constant);

    console.log('[RouteSync] Syncing routes:', {
      version,
      routeCount: flatRoutes.length,
      sampleRoutes: flatRoutes.slice(0, 3)
    });

    // 缓存当前路由数据用于降级（P1-17）
    safeLocalStorageSet(ROUTE_CACHE_KEY, JSON.stringify({ version, routes: flatRoutes }));

    // Call sync API（带重试，P1-13）
    const { data: response, error } = await fetchSyncRoutes({
      version,
      routes: flatRoutes
    });

    // P0-10: Handle backend response format
    // Backend returns {added, updated, obsoleted, unchanged} directly via OkWithData
    // The request wrapper returns {data: response, error}
    if (!error && response) {
      // Backend returns map[string]int: {added, updated, obsoleted, unchanged}
      // Check if unchanged is -1 (version unchanged signal from backend)
      const changes = response as Api.RouteMenu.RouteSyncChanges;
      if (changes.unchanged === -1) {
        // Version match at backend, cache locally
        safeLocalStorageSet(ROUTE_VERSION_KEY, version);
        hasSynced.value = true;
        console.log('[RouteSync] Backend version match, sync skipped');
        return true;
      }

      // Sync completed successfully
      safeLocalStorageSet(ROUTE_VERSION_KEY, version);
      hasSynced.value = true;

      console.log('[RouteSync] Sync completed:', {
        added: changes.added || 0,
        updated: changes.updated || 0,
        obsoleted: changes.obsoleted || 0,
        unchanged: changes.unchanged || 0
      });
      return true;
    }

    // P1-17: 同步失败时使用缓存降级
    console.warn('[RouteSync] Sync failed:', error || 'Unknown error');
    return fallbackToCachedRoutes();
  } catch (error) {
    console.error('[RouteSync] Sync failed:', error);
    // P1-17: 异常时使用缓存降级
    return fallbackToCachedRoutes();
  } finally {
    isSyncing.value = false;
  }
}

/**
 * Reset sync state (used after logout to re-sync)
 * P1-16: 使用安全 localStorage 操作
 */
export function resetRouteSync() {
  hasSynced.value = false;
  isSyncing.value = false;
  safeLocalStorageRemove(ROUTE_VERSION_KEY);
  safeLocalStorageRemove(ROUTE_CACHE_KEY);
}

/**
 * Route sync composable
 */
export function useRouteSync() {
  return {
    syncRoutes,
    resetRouteSync,
    isSyncing: computed(() => isSyncing.value),
    hasSynced: computed(() => hasSynced.value)
  };
}
