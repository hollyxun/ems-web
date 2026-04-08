import { request } from '../request';

/**
 * Get captcha
 *
 */
export function fetchGetCaptcha() {
  return request<Api.Auth.CaptchaData>({
    url: '/api/v1/captcha',
    method: 'get'
  });
}

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 * @param captcha Captcha code
 * @param captchaId Captcha ID
 */
export function fetchLogin(userName: string, password: string, captcha?: string, captchaId?: string) {
  return request<Api.Auth.LoginToken>({
    url: '/api/v1/user/login',
    method: 'post',
    data: {
      username: userName,
      password,
      captcha,
      captchaId
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({
    url: '/api/v1/user/getUserInfo',
    method: 'get'
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/api/v1/user/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/api/v1/base/error', params: { code, msg } });
}

/**
 * 更新用户信息
 * @param data 用户信息
 */
export function fetchUpdateUserInfo(data: { nickName?: string; headerImg?: string; phone?: string; email?: string }) {
  return request<boolean>({
    url: '/api/v1/user/updateInfo',
    method: 'put',
    data
  });
}

/**
 * 修改密码（普通修改）
 * @param oldPassword 原密码
 * @param newPassword 新密码
 */
export function fetchChangePassword(oldPassword: string, newPassword: string) {
  return request<boolean>({
    url: '/api/v1/user/changePassword',
    method: 'post',
    data: { oldPassword, newPassword }
  });
}

// ============ Security Module API ============

/**
 * 解锁用户（管理员操作）
 * @param userId 用户 ID
 */
export function fetchUnlockUser(userId: number) {
  return request<boolean>({
    url: '/api/v1/security/unlockUser',
    method: 'post',
    data: { userId }
  });
}

/**
 * 获取锁定用户列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export function fetchGetLockedUsers(page: number = 1, pageSize: number = 10) {
  return request<Api.Common.PageResult<Api.Auth.LockedUser>>({
    url: '/api/v1/security/lockedUsers',
    method: 'get',
    params: { page, pageSize }
  });
}

/**
 * 获取当前用户密码状态
 */
export function fetchGetPasswordStatus() {
  return request<Api.Auth.PasswordStatus>({
    url: '/api/v1/security/passwordStatus',
    method: 'get'
  });
}

/**
 * 安全修改密码（支持密码过期强制修改）
 * @param data 密码参数
 */
export function fetchSecurityChangePassword(data: Api.Auth.SecurityChangePasswordParams) {
  return request<boolean>({
    url: '/api/v1/security/changePassword',
    method: 'post',
    data
  });
}

/**
 * 获取加密公钥
 */
export function fetchGetPublicKey() {
  return request<Api.Auth.PublicKeyResponse>({
    url: '/api/v1/security/publicKey',
    method: 'get'
  });
}
