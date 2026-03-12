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
 * 修改密码
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
