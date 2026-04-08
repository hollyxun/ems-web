import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { defineStore } from 'pinia';
import type { AxiosError } from 'axios';
import { useLoading } from '@sa/hooks';
import { fetchGetPasswordStatus, fetchGetUserButtons, fetchGetUserInfo, fetchLogin } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const router = useRouter();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  // 密码状态
  const passwordStatus = ref<Api.Auth.PasswordStatus | null>(null);
  const passwordExpired = computed(() => passwordStatus.value?.expired ?? false);
  const passwordWarning = computed(() => passwordStatus.value?.warning ?? false);

  // 登录错误状态
  const loginErrorCode = ref<number | null>(null);
  const loginErrorData = ref<Record<string, unknown> | null>(null);

  /** Check if debug mode is enabled */
  const isDebugMode = computed(() => {
    const { VITE_DEBUG_MODE } = import.meta.env;
    return VITE_DEBUG_MODE === 'Y' || VITE_DEBUG_MODE === 'true';
  });

  const userInfo: Api.Auth.UserInfo = reactive({
    id: 0,
    uuid: '',
    username: '',
    nickName: '',
    headerImg: '',
    phone: '',
    email: '',
    enabled: 1,
    roles: [],
    buttons: [],
    userId: '',
    userName: ''
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE } = import.meta.env;

    // Check if any role has authorityId === 1 (super admin)
    const hasSuperRole = (userInfo.roles || []).some(
      role => typeof role === 'object' && 'authorityId' in role && role.authorityId === 1
    );

    return VITE_AUTH_ROUTE_MODE === 'static' && hasSuperRole;
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    clearAuthStorage();

    // 直接清空 token，不依赖 $reset（$reset 使用初始化时的克隆状态，可能包含旧 token）
    token.value = '';
    userInfo.id = 0;
    userInfo.uuid = '';
    userInfo.username = '';
    userInfo.nickName = '';
    userInfo.headerImg = '';
    userInfo.phone = '';
    userInfo.email = '';
    userInfo.enabled = 1;
    userInfo.roles = [];
    userInfo.buttons = [];
    userInfo.userId = '';
    userInfo.userName = '';

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      return true;
    }

    return false;
  }

  /**
   * Handle password expired scenario
   * Redirect to password change page with force mode
   */
  function handlePasswordExpired() {
    window.$notification?.warning({
      title: '密码已过期',
      message: '您的密码已过期，请修改后继续使用系统',
      duration: 5000
    });
    router.push({ name: 'manage_password-change', query: { force: 'true' } });
    endLoading();
  }

  /**
   * Show password expiration warning notification
   */
  function showPasswordExpirationWarning() {
    if (passwordWarning.value && !passwordExpired.value) {
      window.$notification?.warning({
        title: '密码即将过期',
        message: `您的密码将在 ${passwordStatus.value?.daysRemaining ?? 0} 天后过期，建议尽快修改`,
        duration: 8000
      });
    }
  }

  /**
   * Handle successful login
   */
  async function handleLoginSuccess(redirect: boolean) {
    await checkPasswordStatus();

    // If password expired, redirect to password change page
    if (passwordExpired.value) {
      handlePasswordExpired();
      return { handled: true, result: null };
    }

    // Check if the tab needs to be cleared
    const isClear = checkTabClear();
    const needRedirect = isClear ? false : redirect;
    await redirectFromLogin(needRedirect);

    // Show password warning if within warning period
    showPasswordExpirationWarning();

    window.$notification?.success({
      title: $t('page.login.common.loginSuccess'),
      message: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
      duration: 4500
    });
    endLoading();
    return { handled: true, result: null };
  }

  /**
   * Extract error info from axios error response
   */
  function extractLoginErrorInfo(error: AxiosError<unknown> | null): {
    code: number;
    message: string;
    data?: Record<string, unknown>;
  } {
    const responseData = error?.response?.data as
      | { code?: number; msg?: string; data?: Record<string, unknown> }
      | undefined;
    return {
      code: responseData?.code ?? 500,
      message: responseData?.msg || error?.message || '登录失败',
      data: responseData?.data
    };
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param captcha Captcha code
   * @param captchaId Captcha ID
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   * @returns Error code and data if login failed, null if success
   */
  async function login(
    userName: string,
    password: string,
    captcha?: string,
    captchaId?: string,
    redirect = true
  ): Promise<{ code: number; message: string; data?: Record<string, unknown> } | null> {
    startLoading();
    loginErrorCode.value = null;
    loginErrorData.value = null;

    const { data: loginToken, error } = await fetchLogin(userName, password, captcha, captchaId);

    // Login success
    if (!error) {
      const pass = await loginByToken(loginToken);
      if (pass) {
        const { result } = await handleLoginSuccess(redirect);
        return result;
      }
    }

    // Login failed - extract error code from response
    const errorInfo = extractLoginErrorInfo(error as AxiosError<unknown> | null);

    // Store error info
    loginErrorCode.value = errorInfo.code;
    loginErrorData.value = errorInfo.data ?? null;

    resetStore();
    endLoading();
    return { code: errorInfo.code, message: errorInfo.message, data: errorInfo.data };
  }

  /**
   * Logout user
   */
  async function logout() {
    await resetStore();
  }

  /**
   * Check password status after login
   */
  async function checkPasswordStatus() {
    try {
      const { data, error } = await fetchGetPasswordStatus();
      if (!error && data) {
        passwordStatus.value = data;
      }
    } catch {
      // Silently ignore password status check errors
    }
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);

    // 2. if user info is returned from login, use it directly
    if (loginToken.user) {
      // Convert backend user format to frontend format
      // Check if user has super admin role (authorityId === 1)
      const info: Api.Auth.UserInfo = {
        ...loginToken.user,
        userId: String(loginToken.user.id),
        userName: loginToken.user.username,
        buttons: []
      };
      Object.assign(userInfo, info);

      // 3. fetch button permissions
      await fetchButtonPermissions();

      token.value = loginToken.token;
      return true;
    }

    // 3. otherwise, get user info from API
    const pass = await getUserInfo();

    if (pass) {
      // 4. fetch button permissions
      await fetchButtonPermissions();

      token.value = loginToken.token;

      return true;
    }

    return false;
  }

  /**
   * Fetch user button permissions
   */
  async function fetchButtonPermissions() {
    try {
      const { data: buttons, error } = await fetchGetUserButtons();
      if (!error && buttons) {
        userInfo.buttons = buttons;
      }
    } catch {
      // Silently ignore button permission fetch errors
    }
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // update store - keep the roles from backend
      Object.assign(userInfo, {
        ...info,
        userId: String(info.id),
        userName: info.username
      });

      return true;
    }

    return false;
  }

  async function initUserInfo() {
    const hasToken = getToken();

    if (hasToken) {
      const pass = await getUserInfo();

      if (pass) {
        // Fetch button permissions on page refresh
        await fetchButtonPermissions();
      } else {
        resetStore();
      }
    }
  }

  /** Initialize debug user for automated testing */
  function initDebugUser() {
    if (!isDebugMode.value) return false;

    // Set mock token
    const mockToken = `debug-mock-token-${Date.now()}`;
    localStg.set('token', mockToken);
    token.value = mockToken;

    // Set mock user info with super admin role
    Object.assign(userInfo, {
      id: 1,
      uuid: 'debug-user-uuid',
      username: 'debug-user',
      nickName: 'Debug User',
      headerImg: '',
      phone: '',
      email: 'debug@test.com',
      enabled: 1,
      roles: [{ authorityId: 1, authorityName: '超级管理员' }],
      buttons: [],
      userId: '1',
      userName: 'debug-user'
    });

    return true;
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    isDebugMode,
    passwordStatus,
    passwordExpired,
    passwordWarning,
    loginErrorCode,
    loginErrorData,
    resetStore,
    logout,
    login,
    initUserInfo,
    initDebugUser,
    fetchButtonPermissions,
    checkPasswordStatus
  };
});
