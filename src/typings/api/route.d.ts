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
     * 与后端 RouteMeta 结构对应
     */
    interface RouteMeta {
      /** 路由标题 */
      title: string;
      /** 路由图标 */
      icon?: string;
      /** 排序 */
      order?: number;
      /** 是否隐藏菜单 */
      hideInMenu?: boolean;
      /** 是否缓存 */
      keepAlive?: boolean;
      /** 是否隐藏子菜单 */
      hideChildrenInMenu?: boolean;
    }

    /**
     * 后端返回的路由结构
     * 与后端 ElegantConstRoute 结构对应
     */
    interface BackendRoute {
      /** 路由ID */
      id?: string;
      /** 路由路径 */
      path: string;
      /** 路由名称 */
      name: string;
      /** 组件路径 */
      component?: string;
      /** 重定向 */
      redirect?: string;
      /** 路由元信息 */
      meta?: RouteMeta;
      /** 子路由 */
      children?: BackendRoute[];
      /** 其他属性 */
      properties?: Record<string, unknown>;
    }

    /**
     * 菜单路由（扩展自前端路由类型）
     */
    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    /**
     * 用户路由响应
     * 与后端 UserRouteResponse 结构对应
     */
    interface UserRoute {
      /** 用户可访问的路由列表 */
      routes: BackendRoute[];
      /** 首页路由名称 */
      home: LastLevelRouteKey;
    }
  }
}
