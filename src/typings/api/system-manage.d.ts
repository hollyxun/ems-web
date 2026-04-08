declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    type Role = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** role id */
      authorityId: number;
      /** parent role id (兼容旧数据，RBAC-1使用parentIds) */
      parentId: string;
      /** parent role ids (RBAC-1: 多父角色ID数组) */
      parentIds?: number[];
      /** role name */
      roleName: string;
      /** authority name */
      authorityName: string;
      /** role code - same as authorityId but as string for display */
      roleCode: string;
      /** role description */
      roleDesc: string;
      /** default router */
      defaultRouter: string;
      /** data scope */
      dataScope: string;
      /** inherit permission (RBAC-1已废弃，使用parentIds替代) */
      inheritPermission?: number;
      /** status (1: enabled, 2: disabled) */
      status: number;
      /** children roles */
      children?: Role[];
      /** hierarchy depth (RBAC-1: 层级深度) */
      depth?: number;
    };

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<{
      authorityName?: string;
      page: number;
      pageSize: number;
    }>;

    /** role list response */
    type RoleList = Common.PageResult<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'authorityId' | 'roleName' | 'roleCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = {
      /** record id */
      id: number;
      /** user uuid */
      uuid: string;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** user name */
      username?: string;
      userName?: string;
      /** user nick name */
      nickName: string;
      /** user avatar */
      headerImg: string;
      /** user phone */
      phone?: string;
      userPhone?: string;
      /** user email */
      email?: string;
      userEmail?: string;
      /** user gender */
      userGender?: UserGender;
      /** user status (1: enabled, 2: disabled) */
      enabled?: number;
      status?: number;
      /** department id */
      departmentId: number;
      /** department info */
      department?: Department;
      /** organization id for data scoping */
      organizationId?: number;
      /** organization info */
      organization?: Organization.OrganizationItem;
      /** user roles (multi-role) */
      roles?: Role[];
      userRoles?: Role[];
    };

    /** user search params */
    type UserSearchParams = {
      page?: number;
      pageSize?: number;
      current?: number;
      size?: number;
      username?: string;
      userName?: string;
      nickName?: string;
      phone?: string;
      userPhone?: string;
      email?: string;
      userEmail?: string;
      enabled?: number;
      status?: number;
      userGender?: UserGender;
      /** filter by organization id */
      organizationId?: number;
    };

    /** user list response */
    type UserList = Common.PageResult<User>;

    /** department */
    type Department = {
      /** record id */
      id: number;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** parent department id */
      parentId: number;
      /** department name */
      name: string;
      /** leader id */
      leaderId: number;
      /** phone */
      phone: string;
      /** email */
      email: string;
      /** sort order */
      sort: number;
      /** status (1: enabled, 2: disabled) */
      status: number;
      /** children departments */
      children?: Department[];
    };

    /** department search params */
    type DepartmentSearchParams = CommonType.RecordNullable<{
      name?: string;
      status?: number;
      page: number;
      pageSize: number;
    }>;

    /** department list response */
    type DepartmentList = Common.PageResult<Department>;

    /** data scope type */
    type DataScopeType = '1' | '2' | '3' | '4' | '5';

    /**
     * menu type
     *
     * - "dir": directory
     * - "menu": menu
     * - "button": button
     */
    type MenuType = 'dir' | 'menu' | 'button';

    type MenuButton = {
      /** button id */
      id: number;
      /** button name */
      name: string;
      /** button description */
      desc: string;
      /** menu id */
      menuId: number;
      /** button label */
      label?: string;
      /** button title */
      title?: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    /** menu */
    type Menu = {
      /** record id */
      id: number;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** menu level */
      menuLevel: number;
      /** parent menu id */
      parentId: string;
      /** route path */
      path: string;
      /** route name */
      name: string;
      /** hidden status (0: visible, 1: hidden) */
      hidden: number;
      /** component path */
      component: string;
      /** sort order */
      sort: number;
      /** keep alive (0: no, 1: yes) */
      keepAlive: number;
      /** menu title */
      title: string;
      /** menu icon */
      icon: string;
      /** menu type (dir/menu/button) */
      menuType: string;
      /** is frame (0: no, 1: yes) */
      isFrame: number;
      /** single layout */
      singleLayout?: string;
      /** parameters */
      parameters: string;
      /** status (1: enabled, 2: disabled) */
      status: number;
      /** children menus */
      children?: Menu[];
      /** buttons on this menu */
      buttons?: MenuButton[];
    };

    /** menu list response */
    type MenuList = Common.PageResult<Menu>;

    /** menu tree node */
    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };

    /** api */
    type ApiItem = {
      /** record id */
      id: number;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** api path */
      path: string;
      /** api description */
      description: string;
      /** api group */
      apiGroup: string;
      /** request method */
      method: string;
      /** status (1: enabled, 2: disabled) */
      status: number;
    };

    /** api search params */
    type ApiSearchParams = {
      page: number;
      pageSize: number;
      path?: string;
      apiGroup?: string;
      method?: string;
    };

    /** api list response */
    type ApiList = Common.PageResult<ApiItem>;

    /** operation record */
    type OperationRecord = {
      /** record id */
      id: number;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** ip address */
      ip: string;
      /** request method */
      method: string;
      /** request path */
      path: string;
      /** response status code */
      status: number;
      /** response time in ms */
      latency: number;
      /** user agent */
      agent: string;
      /** error message */
      errorMessage: string;
      /** request body */
      body: string;
      /** response body */
      resp: string;
      /** user id */
      userId: number;
    };

    /** operation record search params */
    type OperationRecordSearchParams = {
      page: number;
      pageSize: number;
      path?: string;
      method?: string;
      status?: number;
    };

    /** operation record list response */
    type OperationRecordList = Common.PageResult<OperationRecord>;

    /** dictionary */
    type Dictionary = {
      /** record id */
      id: number;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** dictionary name */
      name: string;
      /** dictionary type */
      type: string;
      /** status (1: enabled, 2: disabled) */
      status: number;
      /** description */
      description: string;
      /** dictionary data items */
      dictionaryData?: DictionaryData[];
    };

    /** dictionary data */
    type DictionaryData = {
      /** record id */
      id: number;
      /** created at */
      createdAt: string;
      /** updated at */
      updatedAt: string;
      /** dictionary id */
      dictionaryId: number;
      /** label */
      label: string;
      /** value */
      value: string;
      /** status (1: enabled, 2: disabled) */
      status: number;
      /** sort order */
      sort: number;
      /** remark */
      remark: string;
    };

    /** dictionary search params */
    type DictionarySearchParams = {
      page: number;
      pageSize: number;
      name?: string;
      type?: string;
      status?: number;
    };

    /** dictionary list response */
    type DictionaryList = Common.PageResult<Dictionary>;

    /**
     * Role Inheritance (RBAC-1)
     */

    /** role inheritance node */
    type RoleInheritanceNode = {
      /** role id */
      roleId: number;
      /** authority name */
      authorityName: string;
    };

    /** batch set parent roles params */
    type BatchSetParentRolesParams = {
      /** role id list */
      roleIds: number[];
      /** parent role id list */
      parentIds: number[];
    };

    /** check circular reference params */
    type CheckCircularParams = {
      /** role id */
      roleId: number;
      /** parent role id list to check */
      parentIds: number[];
    };

    /** role detail with parents */
    type RoleDetail = {
      /** role info */
      authority: Role;
      /** parent role ids */
      parentIds: number[];
    };

    /** set role menus params (RBAC-1: support effect) */
    type SetRoleMenusParams = {
      /** role id */
      roleId: number;
      /** menu ids */
      menuIds: number[];
      /** default home route */
      home?: string;
      /** permission effect: allow/deny (default: allow) */
      effect?: 'allow' | 'deny';
    };

    /** set role buttons params (RBAC-1: support effect) */
    type SetRoleButtonsParams = {
      /** role id */
      roleId: number;
      /** button ids */
      buttonIds: number[];
      /** permission effect: allow/deny (default: allow) */
      effect?: 'allow' | 'deny';
    };

    /** permission source info (RBAC-1: show where permission comes from) */
    type PermissionSource = {
      /** menu/button id */
      id: number;
      /** permission name */
      name: string;
      /** source type: self | inherited */
      sourceType: 'self' | 'inherited';
      /** source role id (if inherited) */
      sourceRoleId?: number;
      /** source role name (if inherited) */
      sourceRoleName?: string;
      /** permission effect: allow | deny */
      effect: 'allow' | 'deny';
    };

    /** permission source list */
    type PermissionSourceList = PermissionSource[];
  }
}
