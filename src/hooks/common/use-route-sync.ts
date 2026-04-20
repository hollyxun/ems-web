import { computed, ref } from 'vue';
import SparkMD5 from 'spark-md5';
import type { ElegantConstRoute } from '@elegant-router/types';
import { fetchSyncRoutes } from '@/service/api/route';
import { useAuthStore } from '@/store/modules/auth';

const ROUTE_VERSION_KEY = 'ems_route_version';
const ROUTE_CACHE_KEY = 'ems_route_cache';

const isSyncing = ref(false);
const hasSynced = ref(false);

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_DELAY = 500;

export const routeHasSynced = computed(() => hasSynced.value);

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
 * Extract route info for hash calculation
 */
function extractRouteInfo(route: ElegantConstRoute): ElegantConstRoute {
  const info: ElegantConstRoute = {
    name: route.name,
    path: route.path,
    component: route.component || ''
  };
  if (route.meta?.constant) {
    info.meta = { ...route.meta };
  }
  if (route.children && route.children.length > 0) {
    info.children = route.children.map(extractRouteInfo).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }
  return info;
}

function calculateRouteHash(routes: ElegantConstRoute[]): string {
  const sortedRoutes = routes.map(extractRouteInfo).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const jsonStr = stableJsonStringify(sortedRoutes);
  return SparkMD5.hash(jsonStr);
}

function stableJsonStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return `[${obj.map(stableJsonStringify).join(',')}]`;
  }
  const objRecord = obj as Record<string, unknown>;
  const keys = Object.keys(objRecord).sort();
  return `{${keys.map(k => `"${k}":${stableJsonStringify(objRecord[k])}`).join(',')}}`;
}

/**
 * Flatten routes to flat structure (新架构)
 */
function flattenRoutes(routes: ElegantConstRoute[]): Api.Route.RouteSyncItem[] {
  const result: Api.Route.RouteSyncItem[] = [];

  for (const route of routes) {
    if (route.meta?.hideInMenu) continue;

    result.push({
      name: String(route.name),
      path: route.path,
      component: route.component,
      constant: route.meta?.constant ?? false
    });

    if (route.children && route.children.length > 0) {
      result.push(...flattenRoutes(route.children));
    }
  }

  return result;
}

async function fallbackToCachedRoutes(): Promise<boolean> {
  try {
    const cachedData = safeLocalStorageGet(ROUTE_CACHE_KEY);
    if (cachedData) {
      hasSynced.value = true;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function syncRoutes(): Promise<boolean> {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = null;
  }

  if (isSyncing.value || hasSynced.value) return true;

  const authStore = useAuthStore();
  if (!authStore.userInfo.id || authStore.userInfo.id === 0) return true;

  const roles = authStore.userInfo.roles || [];
  const isSuperAdmin = roles.some(role => typeof role === 'object' && 'authorityId' in role && role.authorityId === 1);
  if (!isSuperAdmin) return true;

  return new Promise(resolve => {
    syncDebounceTimer = setTimeout(async () => {
      syncDebounceTimer = null;
      resolve(await executeSync());
    }, SYNC_DEBOUNCE_DELAY);
  });
}

async function executeSync(): Promise<boolean> {
  isSyncing.value = true;

  try {
    const { generatedRoutes } = await import('@/router/elegant/routes');
    const version = calculateRouteHash(generatedRoutes);

    const cachedVersion = safeLocalStorageGet(ROUTE_VERSION_KEY);
    if (cachedVersion === version) {
      hasSynced.value = true;
      return true;
    }

    const allRoutes = flattenRoutes(generatedRoutes);
    const constantRoutes = allRoutes.filter(r => r.constant);
    const routes = allRoutes.filter(r => !r.constant);

    safeLocalStorageSet(ROUTE_CACHE_KEY, JSON.stringify({ version, routes }));

    const { data: response, error } = await fetchSyncRoutes({
      version,
      routes,
      constantRoutes
    });

    if (!error && response?.success) {
      safeLocalStorageSet(ROUTE_VERSION_KEY, version);
      hasSynced.value = true;
      return true;
    }

    return fallbackToCachedRoutes();
  } catch (error) {
    console.error('[RouteSync] Sync failed:', error);
    return fallbackToCachedRoutes();
  } finally {
    isSyncing.value = false;
  }
}

export function resetRouteSync() {
  hasSynced.value = false;
  isSyncing.value = false;
  safeLocalStorageRemove(ROUTE_VERSION_KEY);
  safeLocalStorageRemove(ROUTE_CACHE_KEY);
}

export function useRouteSync() {
  return {
    syncRoutes,
    resetRouteSync,
    isSyncing: computed(() => isSyncing.value),
    hasSynced: computed(() => hasSynced.value)
  };
}