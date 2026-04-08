/**
 * 安全模块错误码
 * 与后端 constants/security_errors.go 保持一致
 */
export const SecurityErrorCode = {
  // 登录相关错误码 (1xxx)
  USER_NOT_FOUND: 1001,
  PASSWORD_INCORRECT: 1002,
  USER_LOCKED: 1003,
  USER_DISABLED: 1004,
  CAPTCHA_INVALID: 1005,
  CAPTCHA_EXPIRED: 1006,

  // 密码相关错误码 (2xxx)
  PASSWORD_EXPIRED: 2001,
  PASSWORD_IN_HISTORY: 2002,
  PASSWORD_TOO_WEAK: 2003,
  OLD_PASSWORD_WRONG: 2004,

  // 解锁相关错误码 (3xxx)
  UNLOCK_FAILED: 3001,
  USER_NOT_LOCKED: 3002
} as const;

export type SecurityErrorCodeType = (typeof SecurityErrorCode)[keyof typeof SecurityErrorCode];

/**
 * 判断错误码是否为用户锁定
 */
export function isUserLocked(code: number): boolean {
  return code === SecurityErrorCode.USER_LOCKED;
}

/**
 * 判断错误码是否为密码错误
 */
export function isPasswordIncorrect(code: number): boolean {
  return code === SecurityErrorCode.PASSWORD_INCORRECT;
}

/**
 * 判断错误码是否为密码过期
 */
export function isPasswordExpired(code: number): boolean {
  return code === SecurityErrorCode.PASSWORD_EXPIRED;
}

/**
 * 判断错误码是否需要跳转密码修改页
 */
export function shouldRedirectToPasswordChange(code: number): boolean {
  return code === SecurityErrorCode.PASSWORD_EXPIRED;
}
