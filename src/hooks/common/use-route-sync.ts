import { computed, ref } from 'vue';
import SparkMD5 from 'spark-md5';
import { fetchSyncRoutes } from '@/service/api/route-menu';
import { useAuthStore } from '@/store/modules/auth';

const ROUTE_VERSION_KEY = 'ems_route_version';

// Global state to avoid duplicate sync
const isSyncing = ref(false);
const hasSynced = ref(false);

// Export hasSynced computed for use in router guard
export const routeHasSynced = computed(() => hasSynced.value);

/**
 * Recursively extract route key information for stable sorting
 */
function extractRouteInfo(route: any): any {
  const info: any = {
    name: route.name,
    path: route.path,
    component: route.component,
    parentName: route.parentName || ''
  };
  if (route.meta) {
    info.meta = {
      title: route.meta.title,
      icon: route.meta.icon,
      order: route.meta.order,
      constant: route.meta.constant || false
    };
  }
  if (route.children && route.children.length > 0) {
    info.children = route.children
      .map(extractRouteInfo)
      .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
  }
  return info;
}

/**
 * Calculate MD5 hash of route configuration
 */
function calculateRouteHash(routes: any[]): string {
  const sortedRoutes = routes.map(extractRouteInfo).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const jsonStr = JSON.stringify(sortedRoutes);
  return SparkMD5.hash(jsonStr);
}

/**
 * Flatten nested routes
 */
function flattenRoutes(routes: any[], parentName = ''): Api.RouteMenu.RouteSyncItem[] {
  const result: Api.RouteMenu.RouteSyncItem[] = [];

  for (const route of routes) {
    const flatRoute: Api.RouteMenu.RouteSyncItem = {
      name: route.name,
      path: route.path,
      component: route.component,
      parentName: route.parentName || parentName,
      meta: route.meta
    };
    result.push(flatRoute);

    if (route.children && route.children.length > 0) {
      const childRoutes = flattenRoutes(route.children, route.name);
      result.push(...childRoutes);
    }
  }

  return result;
}

/**
 * Execute route sync
 * Only triggered for super admin users
 */
export async function syncRoutes(): Promise<boolean> {
  // Prevent duplicate sync
  if (isSyncing.value || hasSynced.value) {
    return true;
  }

  const authStore = useAuthStore();

  // Only super admin triggers sync
  const roles = authStore.userInfo?.roles || [];
  const isSuperAdmin = roles.some(role => typeof role === 'object' && 'authorityId' in role && role.authorityId === 1);

  if (!isSuperAdmin) {
    return true;
  }

  isSyncing.value = true;

  try {
    // Dynamic import of route configuration
    const { generatedRoutes } = await import('@/router/elegant/routes');

    // Calculate version number
    const version = calculateRouteHash(generatedRoutes);

    // Check cached version in localStorage
    const cachedVersion = localStorage.getItem(ROUTE_VERSION_KEY);
    if (cachedVersion === version) {
      hasSynced.value = true;
      return true;
    }

    // Flatten routes (exclude constant routes, handled separately by backend)
    const flatRoutes = flattenRoutes(generatedRoutes).filter(r => !r.meta?.constant);

    // Call sync API
    const { data: response, error } = await fetchSyncRoutes({
      version,
      routes: flatRoutes
    });

    if (!error && response?.success) {
      // Cache version number
      localStorage.setItem(ROUTE_VERSION_KEY, version);
      hasSynced.value = true;

      console.log('[RouteSync] Sync completed:', response.changes);
      return true;
    }

    console.warn('[RouteSync] Sync failed:', error || response?.message);
    return false;
  } catch (error) {
    console.error('[RouteSync] Sync failed:', error);
    return false;
  } finally {
    isSyncing.value = false;
  }
}

/**
 * Reset sync state (used after logout to re-sync)
 */
export function resetRouteSync() {
  hasSynced.value = false;
  isSyncing.value = false;
  localStorage.removeItem(ROUTE_VERSION_KEY);
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
