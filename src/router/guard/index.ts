import type { Router } from 'vue-router';
import { routeHasSynced, syncRoutes } from '@/hooks/common/use-route-sync';
import { createRouteGuard } from './route';
import { createProgressGuard } from './progress';
import { createDocumentTitleGuard } from './title';

/**
 * Create route sync guard
 * Syncs frontend routes to backend for super admin users
 *
 * @param router - Router instance
 */
export function createRouteSyncGuard(router: Router) {
  router.beforeEach(async () => {
    // Route sync (only for super admin, and not already synced)
    // Use flag to avoid duplicate sync
    if (!routeHasSynced.value) {
      // Don't wait for sync completion, execute asynchronously
      // Sync failure should not affect route navigation
      syncRoutes().catch(err => {
        console.warn('[RouteSync] Sync failed:', err);
      });
    }
  });
}

/**
 * Router guard
 *
 * @param router - Router instance
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  createRouteSyncGuard(router);
  createRouteGuard(router);
  createDocumentTitleGuard(router);
}
