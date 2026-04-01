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
      /** 国际化key */
      i18nKey?: App.I18n.I18nKey;
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
      /** 是否继承权限 */
      inheritPermission?: boolean;
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

    /**
     * 前端路由项
     * 用于向后端同步路由信息
     */
    interface FrontendRouteItem {
      /** 路由名称（唯一标识） */
      name: string;
      /** 路由路径 */
      path: string;
      /** 组件路径 */
      component?: string;
      /** 父路由名称（用于构建层级关系） */
      parentName?: string;
      /** 路由元信息 */
      meta?: Record<string, unknown>;
      /** 子路由列表 */
      children?: FrontendRouteItem[];
    }

    /**
     * 路由变更统计
     */
    interface RouteChanges {
      /** 新增路由数 */
      added: number;
      /** 标记废弃路由数 */
      obsoleted: number;
      /** 未变化路由数 */
      unchanged: number;
      /** 更新路由数 */
      updated?: number;
      /** 常量路由变更统计 */
      constantChanges?: RouteChanges;
    }

    /**
     * 路由同步请求
     */
    interface SyncRoutesRequest {
      /** 前端路由版本标识（hash） */
      version: string;
      /** 前端路由列表（排除常量路由） */
      routes: FrontendRouteItem[];
      /** 前端常量路由列表 */
      constantRoutes?: FrontendRouteItem[];
    }

    /**
     * 路由同步响应
     */
    interface SyncRoutesResponse {
      /** 同步是否成功 */
      success: boolean;
      /** 变更统计 */
      changes: RouteChanges;
      /** 后端确认的版本号 */
      version: string;
    }
  }
}
