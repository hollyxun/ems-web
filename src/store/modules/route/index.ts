import { computed, nextTick, ref, shallowRef } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { defineStore } from 'pinia';
import { useBoolean } from '@sa/hooks';
import type {
  CustomRoute,
  ElegantConstRoute,
  GeneratedRoute,
  LastLevelRouteKey,
  RouteKey,
  RouteMap
} from '@elegant-router/types';
import { router } from '@/router';
import {
  fetchGetConstantRoutes,
  fetchGetRouteVersion,
  fetchGetUserAuthorizedRoutes,
  fetchIsRouteExist,
  fetchSyncRoutes
} from '@/service/api';
import { SetupStoreId } from '@/enum';
import { createStaticRoutes, getAuthVueRoutes } from '@/router/routes';
import { ROOT_ROUTE } from '@/router/routes/builtin';
import { getRouteName, getRoutePath } from '@/router/elegant/transform';
import { generatedRoutes } from '@/router/elegant/routes';
import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';
import {
  filterAuthRoutesByRoles,
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  isRouteExistByRouteName,
  sortRoutesByOrder,
  transformMenuToSearchMenus,
  updateLocaleOfGlobalMenus
} from './shared';

/**
 * 将后端路由格式转换为前端路由格式
 * @param backendRoutes 后端返回的路由数据
 * @param isConstant 是否为常量路由（无需登录即可访问）
 * @returns 前端路由数据
 */
function transformBackendRoutesToElegantRoutes(
  backendRoutes: Api.Route.BackendRoute[],
  isConstant: boolean = false
): ElegantConstRoute[] {
  return backendRoutes.map(route => {
    // 自动生成 i18nKey：如果 title 看起来像路由名称（非中文），则生成 route.xxx 格式的 i18nKey
    const generateI18nKey = (title: string, name: string): App.I18n.I18nKey | undefined => {
      // 如果 title 是中文，说明已经是翻译后的文本，不需要 i18nKey
      if (title && /[\u4E00-\u9FA5]/.test(title)) {
        return undefined;
      }
      // 否则使用 route.{name} 格式的 i18nKey
      return `route.${name}` as App.I18n.I18nKey;
    };

    const i18nKey = route.meta?.i18nKey || generateI18nKey(route.meta?.title || '', route.name);

    const elegantRoute: ElegantConstRoute = {
      path: route.path,
      name: route.name as never,
      component: route.component,
      redirect: route.redirect,
      meta: route.meta
        ? {
            title: route.meta.title,
            i18nKey,
            icon: route.meta.icon,
            order: route.meta.order,
            hideInMenu: route.meta.hideInMenu,
            keepAlive: route.meta.keepAlive,
            constant: isConstant
          }
        : { title: route.name || '', i18nKey: `route.${route.name}` as App.I18n.I18nKey, constant: isConstant },
      children: route.children ? transformBackendRoutesToElegantRoutes(route.children, isConstant) : undefined
    };
    return elegantRoute;
  });
}

/**
 * 收集路由并按类型分类（常量路由 vs 动态路由）
 * @param routes 路由列表
 * @returns 分类后的路由数据
 */
interface CollectedRoutes {
  routes: Api.Route.FrontendRouteItem[];
  constantRoutes: Api.Route.FrontendRouteItem[];
}

function collectRoutesByType(routes: GeneratedRoute[]): CollectedRoutes {
  const result: CollectedRoutes = { routes: [], constantRoutes: [] };

  function collect(items: GeneratedRoute[], parentName: string = '') {
    items.forEach(item => {
      const routeItem: Api.Route.FrontendRouteItem = {
        name: item.name,
        path: item.path,
        component: item.component,
        parentName: parentName || undefined,
        meta: item.meta as Record<string, unknown> | undefined
      };

      // 根据 meta.constant 分类
      if (item.meta?.constant) {
        result.constantRoutes.push(routeItem);
      } else {
        result.routes.push(routeItem);
      }

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

/**
 * 计算路由版本号（基于路由内容 hash）
 * @param routes 路由列表
 * @returns 版本号字符串
 */
function calculateRouteVersion(routes: Api.Route.FrontendRouteItem[]): string {
  // 使用路由名称列表生成简单 hash
  const routeNames = routes.map(r => r.name).sort();
  const content = JSON.stringify(routeNames);

  // 使用简单字符串累加算法（避免位操作）
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    const char = content.charCodeAt(i);
    hash = Math.imul(31, hash) + char;
  }

  // 转换为正数的十六进制字符串
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * 从 localStorage 获取缓存的版本号
 * @returns 缓存的版本号
 */
function getCachedRouteVersion(): string {
  return localStorage.getItem('ems_route_version') || '';
}

/**
 * 缓存版本号到 localStorage
 * @param version 版本号
 */
function setCachedRouteVersion(version: string): void {
  localStorage.setItem('ems_route_version', version);
}

export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const authStore = useAuthStore();
  const tabStore = useTabStore();
  const { bool: isInitConstantRoute, setBool: setIsInitConstantRoute } = useBoolean();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();

  /**
   * Auth route mode
   *
   * It recommends to use static mode in the development environment, and use dynamic mode in the production
   * environment, if use static mode in development environment, the auth routes will be auto generated by plugin
   * "@elegant-router/vue"
   */
  const authRouteMode = ref(import.meta.env.VITE_AUTH_ROUTE_MODE);

  /** Home route key */
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME);

  /**
   * Set route home
   *
   * @param routeKey Route key
   */
  function setRouteHome(routeKey: LastLevelRouteKey) {
    routeHome.value = routeKey;
  }

  /** constant routes */
  const constantRoutes = shallowRef<ElegantConstRoute[]>([]);

  function addConstantRoutes(routes: ElegantConstRoute[]) {
    const constantRoutesMap = new Map<string, ElegantConstRoute>([]);

    routes.forEach(route => {
      constantRoutesMap.set(route.name, route);
    });

    constantRoutes.value = Array.from(constantRoutesMap.values());
  }

  /** auth routes */
  const authRoutes = shallowRef<ElegantConstRoute[]>([]);

  function addAuthRoutes(routes: ElegantConstRoute[]) {
    const authRoutesMap = new Map<string, ElegantConstRoute>([]);

    routes.forEach(route => {
      authRoutesMap.set(route.name, route);
    });

    authRoutes.value = Array.from(authRoutesMap.values());
  }

  const removeRouteFns: (() => void)[] = [];

  /** Global menus */
  const menus = ref<App.Global.Menu[]>([]);
  const searchMenus = computed(() => transformMenuToSearchMenus(menus.value));

  /** Get global menus */
  function getGlobalMenus(routes: ElegantConstRoute[]) {
    menus.value = getGlobalMenusByAuthRoutes(routes);
  }

  /** Update global menus by locale */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  /** Cache routes */
  const cacheRoutes = ref<RouteKey[]>([]);

  /**
   * Exclude cache routes
   *
   * for reset route cache
   */
  const excludeCacheRoutes = ref<RouteKey[]>([]);

  /**
   * Get cache routes
   *
   * @param routes Vue routes
   */
  function getCacheRoutes(routes: RouteRecordRaw[]) {
    cacheRoutes.value = getCacheRouteNames(routes);
  }

  /**
   * Reset route cache
   *
   * @default router.currentRoute.value.name current route name
   * @param routeKey
   */
  async function resetRouteCache(routeKey?: RouteKey) {
    const routeName = routeKey || (router.currentRoute.value.name as RouteKey);

    excludeCacheRoutes.value.push(routeName);

    await nextTick();

    excludeCacheRoutes.value = [];
  }

  /** Global breadcrumbs */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  /** Reset store */
  async function resetStore() {
    const routeStore = useRouteStore();

    routeStore.$reset();

    resetVueRoutes();

    // after reset store, need to re-init constant route
    await initConstantRoute();
  }

  /** Reset vue routes */
  function resetVueRoutes() {
    removeRouteFns.forEach(fn => fn());
    removeRouteFns.length = 0;
  }

  /** init constant route */
  async function initConstantRoute() {
    if (isInitConstantRoute.value) return;

    const staticRoute = createStaticRoutes();

    if (authRouteMode.value === 'static') {
      addConstantRoutes(staticRoute.constantRoutes);
    } else {
      const { data, error } = await fetchGetConstantRoutes();

      if (!error && data && data.length > 0) {
        // 将后端路由格式转换为前端路由格式（常量路由）
        const convertedRoutes = transformBackendRoutesToElegantRoutes(data, true);
        addConstantRoutes(convertedRoutes);
      } else {
        // if fetch constant routes failed or empty, use static constant routes
        addConstantRoutes(staticRoute.constantRoutes);
      }
    }

    handleConstantAndAuthRoutes();

    setIsInitConstantRoute(true);

    tabStore.initHomeTab();
  }

  /**
   * 收集并同步前端路由到后端
   * 在应用初始化时调用，用于自动注册前端路由
   *
   * P0-fix: 此函数必须在 initAuthRoute 之前调用
   * 原因：数据库重置后路由表为空，需要先同步才能获取用户路由
   */
  async function syncRoutesWithBackend(): Promise<void> {
    // 仅在动态路由模式下执行同步
    if (authRouteMode.value !== 'dynamic') {
      return;
    }

    try {
      // 1. 使用新函数收集路由（包含常量路由和动态路由）
      const { routes, constantRoutes: collectedConstantRoutes } = collectRoutesByType(generatedRoutes);

      if (routes.length === 0 && collectedConstantRoutes.length === 0) {
        console.warn('[RouteSync] No routes to sync');
        return;
      }

      // 2. 计算版本号（基于两类路由）
      const allRoutes = [...routes, ...collectedConstantRoutes];
      const currentVersion = calculateRouteVersion(allRoutes);

      // 3. 检查本地缓存版本
      const cachedVersion = getCachedRouteVersion();
      if (cachedVersion === currentVersion) {
        console.log('[RouteSync] Version match, skip sync');
        return;
      }

      // 4. 获取后端版本号
      const { data: backendVersion, error: versionError } = await fetchGetRouteVersion();

      if (versionError) {
        console.warn('[RouteSync] Failed to get backend version:', versionError);
        // 继续执行同步，不阻塞流程
      }

      // 5. 如果版本一致，跳过同步
      if (backendVersion === currentVersion) {
        console.log('[RouteSync] Backend version match, skip sync');
        setCachedRouteVersion(currentVersion);
        return;
      }

      // 6. 执行同步（包含常量路由）
      console.log('[RouteSync] Syncing routes...');
      const { data: syncResult, error: syncError } = await fetchSyncRoutes({
        version: currentVersion,
        routes,
        constantRoutes: collectedConstantRoutes
      });

      if (syncError) {
        console.error('[RouteSync] Sync failed:', syncError);
        // 同步失败不影响正常使用
        return;
      }

      if (syncResult) {
        // syncResult 直接是 RouteSyncChanges: { added, updated, obsoleted, unchanged }
        console.log('[RouteSync] Sync completed:', {
          added: syncResult.added || 0,
          updated: syncResult.updated || 0,
          obsoleted: syncResult.obsoleted || 0,
          unchanged: syncResult.unchanged || 0
        });
        // 更新本地缓存版本
        setCachedRouteVersion(currentVersion);
      }
    } catch (error) {
      // 同步失败不影响正常使用，仅记录日志
      console.error('[RouteSync] Unexpected error:', error);
    }
  }

  /** Init auth route */
  async function initAuthRoute() {
    // check if user info is initialized
    if (!authStore.userInfo.userId) {
      await authStore.initUserInfo();
    }

    if (authRouteMode.value === 'static') {
      initStaticAuthRoute();
    } else {
      await initDynamicAuthRoute();
    }

    tabStore.initHomeTab();
  }

  /** Init static auth route */
  function initStaticAuthRoute() {
    const { authRoutes: staticAuthRoutes } = createStaticRoutes();

    if (authStore.isStaticSuper) {
      addAuthRoutes(staticAuthRoutes);
    } else {
      // Convert Authority[] to string[] for role-based filtering
      const roleStrings = (authStore.userInfo.roles || []).map(role => String(role.authorityId));
      const filteredAuthRoutes = filterAuthRoutesByRoles(staticAuthRoutes, roleStrings);

      addAuthRoutes(filteredAuthRoutes);
    }

    handleConstantAndAuthRoutes();

    setIsInitAuthRoute(true);
  }

  /** Init dynamic auth route */
  async function initDynamicAuthRoute() {
    // 使用新的基于 Casbin 的授权路由接口
    const { data, error } = await fetchGetUserAuthorizedRoutes();

    if (!error) {
      const { routes, home } = data;

      // 将后端路由格式转换为前端路由格式
      const convertedRoutes = transformBackendRoutesToElegantRoutes(routes);
      addAuthRoutes(convertedRoutes);

      handleConstantAndAuthRoutes();

      setRouteHome(home);

      handleUpdateRootRouteRedirect(home);

      setIsInitAuthRoute(true);
    } else {
      // if fetch user routes failed, reset store
      authStore.resetStore();
    }
  }

  /** handle constant and auth routes */
  function handleConstantAndAuthRoutes() {
    const allRoutes = [...constantRoutes.value, ...authRoutes.value];

    const sortRoutes = sortRoutesByOrder(allRoutes);

    const vueRoutes = getAuthVueRoutes(sortRoutes);

    resetVueRoutes();

    addRoutesToVueRouter(vueRoutes);

    getGlobalMenus(sortRoutes);

    getCacheRoutes(vueRoutes);
  }

  /**
   * Add routes to vue router
   *
   * @param routes Vue routes
   */
  function addRoutesToVueRouter(routes: RouteRecordRaw[]) {
    routes.forEach(route => {
      const removeFn = router.addRoute(route);
      addRemoveRouteFn(removeFn);
    });
  }

  /**
   * Add remove route fn
   *
   * @param fn
   */
  function addRemoveRouteFn(fn: () => void) {
    removeRouteFns.push(fn);
  }

  /**
   * Update root route redirect when auth route mode is dynamic
   *
   * @param redirectKey Redirect route key
   */
  function handleUpdateRootRouteRedirect(redirectKey: LastLevelRouteKey) {
    const redirect = getRoutePath(redirectKey);

    if (redirect) {
      const rootRoute: CustomRoute = { ...ROOT_ROUTE, redirect };

      router.removeRoute(rootRoute.name);

      const [rootVueRoute] = getAuthVueRoutes([rootRoute]);

      router.addRoute(rootVueRoute);
    }
  }

  /**
   * Get is auth route exist
   *
   * @param routePath Route path
   */
  async function getIsAuthRouteExist(routePath: RouteMap[RouteKey]) {
    const routeName = getRouteName(routePath);

    if (!routeName) {
      return false;
    }

    if (authRouteMode.value === 'static') {
      const { authRoutes: staticAuthRoutes } = createStaticRoutes();
      return isRouteExistByRouteName(routeName, staticAuthRoutes);
    }

    const { data } = await fetchIsRouteExist(routeName);

    return data;
  }

  /**
   * Get selected menu key path
   *
   * @param selectedKey Selected menu key
   */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }

  async function onRouteSwitchWhenLoggedIn() {
    await authStore.initUserInfo();
  }

  async function onRouteSwitchWhenNotLoggedIn() {
    // some global init logic if it does not need to be logged in
  }

  return {
    resetStore,
    routeHome,
    menus,
    searchMenus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    excludeCacheRoutes,
    resetRouteCache,
    breadcrumbs,
    initConstantRoute,
    isInitConstantRoute,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getIsAuthRouteExist,
    getSelectedMenuKeyPath,
    onRouteSwitchWhenLoggedIn,
    onRouteSwitchWhenNotLoggedIn,
    syncRoutesWithBackend
  };
});
