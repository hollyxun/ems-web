declare namespace Api {
  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;
    type LastLevelRouteKey = import('@elegant-router/types').LastLevelRouteKey;

    /**
     * 路由元信息
     */
    interface RouteMeta {
      title: string;
      i18nKey?: App.I18n.I18nKey;
      icon?: string;
      order?: number;
      hideInMenu?: boolean;
      keepAlive?: boolean;
      hideChildrenInMenu?: boolean;
      inheritPermission?: boolean;
    }

    /**
     * 后端返回的路由结构
     */
    interface BackendRoute {
      id?: string;
      path: string;
      name: string;
      component: string;
      redirect?: string;
      meta?: RouteMeta;
      children?: BackendRoute[];
      properties?: Record<string, unknown>;
    }

    /**
     * 菜单路由
     */
    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    /**
     * 用户路由响应
     */
    interface UserRoute {
      routes: BackendRoute[];
      home: LastLevelRouteKey;
    }

    /**
     * 前端路由项（用于路由收集）
     */
    interface FrontendRouteItem {
      name: string;
      path: string;
      component?: string;
      parentName?: string;
      sort?: number;
      title?: string;
      icon?: string;
      meta?: Record<string, unknown>;
    }

    /**
     * 路由同步请求（新架构）
     */
    interface RouteSyncRequest {
      version: string;
      routes: RouteSyncItem[];
      constantRoutes: RouteSyncItem[];
    }

    /**
     * 路由同步项（扁平结构）
     */
    interface RouteSyncItem {
      name: string;
      path: string;
      component?: string;
      constant?: boolean;
      parentName?: string;
      sort?: number;
      title?: string;
      icon?: string;
    }

    /**
     * 路由同步变更结果
     */
    interface RouteSyncChanges {
      added: number;
      updated: number;
      obsoleted: number;
      unchanged: number;
    }

    /**
     * 路由同步响应
     */
    interface RouteSyncResponse extends RouteSyncChanges {
      success: boolean;
      message?: string;
    }
  }
}
