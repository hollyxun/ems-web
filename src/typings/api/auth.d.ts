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
  }
}
