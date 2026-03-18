import { useAuthStore } from '@/store/modules/auth';

/**
 * 按钮权限组合式函数
 * 用于在组件中检查和控制按钮权限
 */
export function useButtonPermission() {
  const authStore = useAuthStore();

  /**
   * 检查是否有指定按钮权限
   * @param buttonCode 按钮权限码
   */
  function hasPermission(buttonCode: string): boolean {
    // 超级管理员拥有所有权限
    if (authStore.isStaticSuper) {
      return true;
    }
    const { buttons } = authStore.userInfo;
    if (!buttons || buttons.length === 0) {
      return false;
    }
    return buttons.includes(buttonCode);
  }

  /**
   * 检查是否有任一按钮权限
   * @param buttonCodes 按钮权限码数组
   */
  function hasAnyPermission(buttonCodes: string[]): boolean {
    return buttonCodes.some(code => hasPermission(code));
  }

  /**
   * 检查是否有所有按钮权限
   * @param buttonCodes 按钮权限码数组
   */
  function hasAllPermissions(buttonCodes: string[]): boolean {
    return buttonCodes.every(code => hasPermission(code));
  }

  /**
   * 刷新用户按钮权限
   */
  async function refreshPermissions() {
    await authStore.fetchButtonPermissions();
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions
  };
}
