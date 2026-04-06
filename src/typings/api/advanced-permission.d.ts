/**
 * Advanced Permission types
 * 高级权限管理类型定义
 */
declare namespace Api {
  namespace AdvancedPermission {
    /**
     * 跨工厂权限配置
     */
    interface CrossFactoryPermission {
      /** 角色ID */
      roleId: number;
      /** 是否允许跨工厂访问 */
      allowed: boolean;
      /** 允许访问的工厂ID列表 */
      factoryIds: number[];
    }

    /**
     * 班次权限配置
     */
    interface ShiftPermission {
      /** 角色ID */
      roleId: number;
      /** 权限范围：own-仅自己 / all-所有 */
      scope: 'own' | 'all';
    }

    /**
     * 操作权限配置
     */
    interface OperationPermission {
      /** 角色ID */
      roleId: number;
      /** 模块名称 */
      module: string;
      /** 操作类型 */
      operation: 'view' | 'enter' | 'modify' | 'delete' | 'export';
      /** 是否允许 */
      allowed: boolean;
    }

    /**
     * 角色权限配置汇总
     */
    interface RolePermissionConfig {
      /** 角色ID */
      roleId: number;
      /** 角色名称 */
      roleName: string;
      /** 跨工厂权限 */
      crossFactory: CrossFactoryPermission;
      /** 班次权限 */
      shift: ShiftPermission;
      /** 操作权限列表 */
      operations: OperationPermission[];
    }
  }
}
