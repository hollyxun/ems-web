import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { fetchGetUserButtons, fetchGetUserInfo, fetchLogin } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

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
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param captcha Captcha code
   * @param captchaId Captcha ID
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, captcha?: string, captchaId?: string, redirect = true) {
    startLoading();

    const { data: loginToken, error } = await fetchLogin(userName, password, captcha, captchaId);

    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          message: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    } else {
      resetStore();
    }

    endLoading();
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
    resetStore,
    login,
    initUserInfo,
    initDebugUser,
    fetchButtonPermissions
  };
});
