import type { RouteComponent } from 'vue-router';
import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { generatedRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 *
 * Note: Custom routes 'exception' and 'document' are disabled as they don't exist
 * in the generated elegant-router types and are not used by EMS application.
 */
const customRoutes: CustomRoute[] = [
  // {
  //   name: 'exception',
  //   path: '/exception',
  //   component: 'layout.base',
  //   meta: {
  //     title: 'exception',
  //     i18nKey: 'route.exception',
  //     icon: 'ant-design:exception-outlined',
  //     order: 7
  //   },
  //   children: [...]
  // },
  // {
  //   name: 'document',
  //   path: '/document',
  //   component: 'layout.base',
  //   ...
  // }
];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  [...customRoutes, ...generatedRoutes].forEach(item => {
    if (item.meta?.constant) {
      constantRoutes.push(item as ElegantRoute);
    } else {
      authRoutes.push(item as ElegantRoute);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(
    routes,
    layouts,
    views as Record<string, RouteComponent | (() => Promise<RouteComponent>)>
  );
}
