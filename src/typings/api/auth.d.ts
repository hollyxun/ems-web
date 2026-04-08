declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken?: string;
      user?: UserInfo;
      expiresAt?: number;
    }

    interface UserInfo {
      id: number;
      uuid: string;
      username: string;
      nickName: string;
      headerImg: string;
      phone: string;
      email: string;
      enabled: number;
      roles?: Authority[]; // User's roles (multi-role support)
      departmentId?: number;
      department?: Department;
      /** Organization ID for data scoping */
      organizationId?: number;
      /** Organization info */
      organization?: Organization.OrganizationItem;
      /** Button permission codes */
      buttons: string[];
      userId: string;
      userName: string;
    }

    interface Authority {
      authorityId: number;
      authorityName: string;
      parentId?: string;
      defaultRouter?: string;
      dataScope?: string;
      status?: number;
    }

    interface Department {
      id: number;
      name: string;
      parentId?: number;
    }

    interface CaptchaData {
      captchaId: string;
      captchaImage: string;
    }

    // ============ Security Module Types ============

    /** 锁定用户信息（与后端 SysUser 结构对应） */
    interface LockedUser {
      /** 用户ID */
      id: number;
      /** 用户名 */
      username: string;
      /** 昵称 */
      nickName: string;
      /** 锁定时间 */
      lockedAt: string;
      /** 登录失败次数 */
      loginFailCount: number;
      /** 是否锁定 */
      isLocked: boolean;
    }

    /** 密码状态 */
    interface PasswordStatus {
      /** 密码是否已过期 */
      expired: boolean;
      /** 密码剩余有效天数 */
      daysRemaining: number;
      /** 是否需要警告提示 */
      warning: boolean;
      /** 密码最后修改时间 */
      changedAt: string;
      /** 是否为强制修改模式 */
      forceChange: boolean;
    }

    /** 安全修改密码参数 */
    interface SecurityChangePasswordParams {
      /** 旧密码（可选，强制修改时可为空） */
      oldPassword?: string;
      /** 新密码 */
      newPassword: string;
    }

    /** 加密公钥响应 */
    interface PublicKeyResponse {
      /** 加密功能是否启用 */
      enabled: boolean;
      /** RSA 公钥（Base64 PEM 格式） */
      publicKey?: string;
      /** 当前加密算法 */
      algorithm?: string;
      /** 未启用时的提示消息 */
      message?: string;
    }

    /** 加密请求结构 */
    interface EncryptionPayload {
      /** 加密的数据（Base64） */
      encryptedData: string;
      /** 加密的 AES 密钥（Base64） */
      encryptedKey?: string;
      /** 随机数（Base64） */
      nonce: string;
    }
  }
}
