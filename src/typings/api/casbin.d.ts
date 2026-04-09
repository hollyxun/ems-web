declare namespace Api {
  namespace Casbin {
    /** 策略项 */
    interface PolicyItem {
      /** 主体（角色ID） */
      sub: string;
      /** 资源 */
      obj: string;
      /** 操作 */
      act: string;
      /** 效果：allow/deny */
      effect?: string;
      /** JSON上下文 */
      ctx?: string;
    }

    /** 策略搜索参数 */
    interface PolicySearchParams {
      /** 页码 */
      page?: number;
      /** 每页大小 */
      pageSize?: number;
      /** 主体（角色ID） */
      sub?: string;
      /** 资源 */
      obj?: string;
      /** 操作 */
      act?: string;
    }

    /** 创建策略请求 */
    interface CreatePolicyRequest {
      /** 主体（角色ID） */
      sub: string;
      /** 资源 */
      obj: string;
      /** 操作 */
      act: string;
      /** 效果：allow/deny */
      effect?: string;
      /** JSON上下文 */
      ctx?: string;
    }

    /** 更新策略请求 */
    interface UpdatePolicyRequest {
      /** 旧策略 */
      oldSub: string;
      oldObj: string;
      oldAct: string;
      oldEffect?: string;
      oldCtx?: string;
      /** 新策略 */
      newSub: string;
      newObj: string;
      newAct: string;
      newEffect?: string;
      newCtx?: string;
    }

    /** 删除策略请求 */
    interface DeletePolicyRequest {
      sub: string;
      obj: string;
      act: string;
      effect?: string;
      ctx?: string;
    }

    /** 批量创建策略请求 */
    interface BatchCreatePoliciesRequest {
      policies: PolicyItem[];
    }

    /** 批量删除策略请求 */
    interface BatchDeletePoliciesRequest {
      policies: PolicyItem[];
    }

    /** 权限测试请求 */
    interface TestEnforceRequest {
      /** 主体（角色ID） */
      sub: string;
      /** 资源 */
      obj: string;
      /** 操作 */
      act: string;
      /** JSON上下文 */
      ctx?: string;
    }

    /** 清除缓存请求 */
    interface ClearCacheRequest {
      /** 用户ID（指定用户） */
      userId?: number;
      /** 角色ID（指定角色下所有用户） */
      roleId?: number;
    }

    /** 角色继承关系 */
    interface GroupingPolicy {
      /** 子角色 */
      child: string;
      /** 父角色 */
      parent: string;
    }

    /** 策略列表结果 */
    type PolicyListResult = Common.PageResult<PolicyItem>;
  }
}
