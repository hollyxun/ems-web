export interface RouteContractIssue {
  routeName: string;
  routePath?: string;
  component?: string;
  reason: string;
}

interface RouteContractResult {
  routes: Api.Route.BackendRoute[];
  issues: RouteContractIssue[];
}

const LAYOUT_PREFIX = 'layout.';
const SINGLE_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

function buildRouteMeta(meta: Api.Route.RouteMeta | undefined, routeName: string): Api.Route.RouteMeta {
  const title = meta?.title || routeName;
  const i18nKey =
    meta?.i18nKey || (/[\u4E00-\u9FA5]/.test(title) ? undefined : (`route.${routeName}` as App.I18n.I18nKey));

  return {
    ...meta,
    title,
    i18nKey
  };
}

function pushRouteIssue(route: Api.Route.BackendRoute, reason: string, issues: RouteContractIssue[]) {
  issues.push({
    routeName: route.name || '(unknown)',
    routePath: route.path,
    component: route.component,
    reason
  });
}

function isLayoutComponent(component: string): boolean {
  return component.startsWith(LAYOUT_PREFIX);
}

function isSingleLevelLayoutRoute(route: Api.Route.BackendRoute): boolean {
  if (!route.name || !route.component) {
    return false;
  }

  const hasChildren = Array.isArray(route.children) && route.children.length > 0;
  if (hasChildren) {
    return false;
  }

  return (
    !route.name.includes('_') &&
    isLayoutComponent(route.component) &&
    !route.component.includes(SINGLE_LEVEL_ROUTE_COMPONENT_SPLIT)
  );
}

function validateRouteNode(route: Api.Route.BackendRoute, issues: RouteContractIssue[]): Api.Route.BackendRoute | null {
  if (!route.name) {
    pushRouteIssue(route, 'missing name', issues);
    return null;
  }

  if (!route.path) {
    pushRouteIssue(route, 'missing path', issues);
    return null;
  }

  if (!route.component) {
    pushRouteIssue(route, 'missing component', issues);
    return null;
  }

  const children = route.children
    ?.map(child => validateRouteNode(child, issues))
    .filter((child): child is Api.Route.BackendRoute => Boolean(child));

  const normalizedRoute: Api.Route.BackendRoute = {
    ...route,
    meta: buildRouteMeta(route.meta, route.name),
    children: children && children.length > 0 ? children : undefined
  };

  if (isSingleLevelLayoutRoute(normalizedRoute)) {
    pushRouteIssue(normalizedRoute, 'layout route missing children', issues);
    return null;
  }

  return normalizedRoute;
}

function hasRouteName(routes: Api.Route.BackendRoute[], targetName: string): boolean {
  return routes.some(route => {
    if (route.name === targetName) {
      return true;
    }

    if (route.children?.length) {
      return hasRouteName(route.children, targetName);
    }

    return false;
  });
}

function getFirstAccessibleRouteName(routes: Api.Route.BackendRoute[]): string {
  for (const route of routes) {
    if (route.children?.length) {
      const childHome = getFirstAccessibleRouteName(route.children);
      if (childHome) {
        return childHome;
      }
    }

    if (route.name) {
      return route.name;
    }
  }

  return '';
}

export function validateBackendRoutes(routes: Api.Route.BackendRoute[]): RouteContractResult {
  const issues: RouteContractIssue[] = [];
  const validRoutes = routes
    .map(route => validateRouteNode(route, issues))
    .filter((route): route is Api.Route.BackendRoute => Boolean(route));

  return {
    routes: validRoutes,
    issues
  };
}

export function resolveRouteHome(routes: Api.Route.BackendRoute[], home?: string): Api.Route.LastLevelRouteKey {
  if (home && hasRouteName(routes, home)) {
    return home as Api.Route.LastLevelRouteKey;
  }

  const fallbackHome = getFirstAccessibleRouteName(routes) || '403';
  return fallbackHome as Api.Route.LastLevelRouteKey;
}
