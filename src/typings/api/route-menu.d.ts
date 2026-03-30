/**
 * Namespace Api.RouteMenu
 *
 * Backend api module: "route-menu"
 * 路由菜单管理相关类型定义
 */
declare namespace Api {
  namespace RouteMenu {
    /**
     * 路由菜单状态枚举
     * - 1: 启用
     * - 2: 禁用
     * - 3: 废弃
     */
    type RouteMenuStatus = 1 | 2 | 3;

    /**
     * 路由菜单项（数据库模型）
     * 与后端 RouteMenu 结构对应
     */
    interface RouteMenu {
      /** 菜单ID */
      id: number;
      /** 菜单名称 */
      name: string;
      /** 路由路径 */
      path: string;
      /** 组件路径 */
      component?: string;
      /** 父级路由名称 */
      parentName?: string;
      /** 元信息JSON字符串 */
      metaJson?: string;
      /** 标题 */
      title?: string;
      /** 图标 */
      icon?: string;
      /** 排序 */
      sort: number;
      /** 是否为常量路由 */
      isConstant: boolean;
      /** 状态 */
      status: RouteMenuStatus;
      /** 版本标识 */
      version?: string;
      /** 废弃时间 */
      obsoleteAt?: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
      /** 子菜单 */
      children?: RouteMenu[];
    }

    /**
     * 路由同步请求项
     * 用于前端向后端同步路由信息
     */
    interface RouteSyncItem {
      /** 路由名称 */
      name: string;
      /** 路由路径 */
      path: string;
      /** 组件路径 */
      component?: string;
      /** 路由元信息 */
      meta?: RouteSyncMeta;
      /** 父级路由名称 */
      parentName?: string;
      /** 子路由 */
      children?: RouteSyncItem[];
    }

    /**
     * 路由同步元信息
     * 用于同步请求中的路由元数据
     */
    interface RouteSyncMeta {
      /** 标题 */
      title?: string;
      /** 图标 */
      icon?: string;
      /** 排序 */
      order?: number;
      /** 是否隐藏菜单 */
      hideInMenu?: boolean;
      /** 是否缓存 */
      keepAlive?: boolean;
      /** 是否为常量路由 */
      constant?: boolean;
      /** 外链地址 */
      href?: string;
    }

    /**
     * 路由同步请求
     * 与后端 RouteSyncRequest 结构对应
     */
    interface RouteSyncRequest {
      /** 版本标识（前端路由hash） */
      version: string;
      /** 路由列表 */
      routes: RouteSyncItem[];
    }

    /**
     * 路由变更统计
     */
    interface RouteSyncChanges {
      /** 新增路由数 */
      added: number;
      /** 更新路由数 */
      updated: number;
      /** 废弃路由数 */
      obsoleted: number;
      /** 未变化路由数 */
      unchanged: number;
    }

    /**
     * 路由同步响应
     * 与后端 RouteSyncResponse 结构对应
     */
    interface RouteSyncResponse {
      /** 同步是否成功 */
      success: boolean;
      /** 变更统计 */
      changes: RouteSyncChanges;
      /** 后端确认的版本号 */
      version: string;
      /** 提示消息 */
      message: string;
    }

    /**
     * 用户路由菜单项
     * 用于用户权限范围内的路由展示
     */
    interface RouteMenuItem {
      /** 路由名称 */
      name: string;
      /** 路由路径 */
      path: string;
      /** 组件路径 */
      component?: string;
      /** 路由元信息 */
      meta?: RouteSyncMeta;
      /** 子路由 */
      children?: RouteMenuItem[];
    }

    /**
     * 用户路由响应
     * 与后端 UserRouteResponse 结构对应
     */
    interface UserRouteResponse {
      /** 用户可访问的路由列表 */
      routes: RouteMenuItem[];
      /** 首页路由名称 */
      home: string;
    }

    /**
     * 废弃路由项
     * 用于展示已废弃但未删除的路由信息
     */
    interface RouteObsoleteItem {
      /** 菜单ID */
      id: number;
      /** 路由名称 */
      name: string;
      /** 路由路径 */
      path: string;
      /** 标题 */
      title?: string;
      /** 废弃时间 */
      obsoleteAt: string;
      /** 已废弃天数 */
      daysObsolete: number;
    }

    /**
     * 批量分配路由请求
     * 用于批量将路由分配给角色
     */
    interface RouteBatchAssignRequest {
      /** 角色ID */
      roleId: number;
      /** 分配模式 */
      mode: 'module' | 'ids';
      /** 模块路由名称列表（mode='module'时使用） */
      moduleRouteNames?: string[];
      /** 路由菜单ID列表（mode='ids'时使用） */
      routeMenuIds?: number[];
      /** 操作类型 */
      action: 'add' | 'remove';
    }

    /**
     * 绑定角色请求
     * 用于将路由菜单绑定到角色
     */
    interface RouteBindRoleRequest {
      /** 角色ID */
      roleId: number;
      /** 路由菜单ID列表 */
      routeMenuIds: number[];
    }

    /**
     * 路由菜单查询参数
     */
    interface RouteMenuSearchParams extends Common.CommonSearchParams {
      /** 路由名称（模糊搜索） */
      name?: string;
      /** 路由路径（模糊搜索） */
      path?: string;
      /** 状态过滤 */
      status?: RouteMenuStatus;
      /** 是否为常量路由 */
      isConstant?: boolean;
    }

    /**
     * 路由菜单创建请求
     */
    interface RouteMenuCreateRequest {
      /** 菜单名称 */
      name: string;
      /** 路由路径 */
      path: string;
      /** 组件路径 */
      component?: string;
      /** 父级路由名称 */
      parentName?: string;
      /** 标题 */
      title?: string;
      /** 图标 */
      icon?: string;
      /** 排序 */
      sort?: number;
      /** 是否为常量路由 */
      isConstant?: boolean;
      /** 状态 */
      status?: RouteMenuStatus;
    }

    /**
     * 路由菜单更新请求
     */
    interface RouteMenuUpdateRequest {
      /** 菜单ID */
      id: number;
      /** 菜单名称 */
      name?: string;
      /** 路由路径 */
      path?: string;
      /** 组件路径 */
      component?: string;
      /** 父级路由名称 */
      parentName?: string;
      /** 标题 */
      title?: string;
      /** 图标 */
      icon?: string;
      /** 排序 */
      sort?: number;
      /** 是否为常量路由 */
      isConstant?: boolean;
      /** 状态 */
      status?: RouteMenuStatus;
    }

    /**
     * 路由菜单树节点
     * 用于构建菜单树结构
     */
    interface RouteMenuTreeNode {
      /** 菜单ID */
      id: number;
      /** 路由名称 */
      name: string;
      /** 路由路径 */
      path: string;
      /** 标题 */
      title?: string;
      /** 图标 */
      icon?: string;
      /** 状态 */
      status: RouteMenuStatus;
      /** 子节点 */
      children?: RouteMenuTreeNode[];
    }
  }
}
