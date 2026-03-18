import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchGetUserButtons } from '@/service/api';

/**
 * 按钮权限 Store
 *
 * 支持多角色权限合并：
 * - 后端 GetUserButtonCodes 方法会自动合并用户所有角色的按钮权限（取并集）
 * - 超级管理员(roleId=1)返回通配符 "*"，拥有所有权限
 * - 前端无需额外处理多角色逻辑
 */
export const useButtonPermissionStore = defineStore('button-permission', () => {
  // 用户拥有的按钮权限列表（已合并多角色权限）
  const buttonPermissions = ref<string[]>([]);
  const loaded = ref(false);

  // 获取用户按钮权限（支持多角色合并）
  async function fetchButtons() {
    if (loaded.value) return;

    try {
      const { data } = await fetchGetUserButtons();
      buttonPermissions.value = data || [];
      loaded.value = true;
    } catch {
      buttonPermissions.value = [];
    }
  }

  // 检查是否有某个按钮权限
  function hasPermission(buttonCode: string): boolean {
    // 超级管理员默认拥有所有权限（后端返回通配符 "*"）
    if (buttonPermissions.value.includes('*')) {
      return true;
    }
    return buttonPermissions.value.includes(buttonCode);
  }

  // 检查是否有任一权限
  function hasAnyPermission(buttonCodes: string[]): boolean {
    return buttonCodes.some(code => hasPermission(code));
  }

  // 检查是否有所有权限
  function hasAllPermissions(buttonCodes: string[]): boolean {
    return buttonCodes.every(code => hasPermission(code));
  }

  // 重置权限（用于登出或角色变更）
  function reset() {
    buttonPermissions.value = [];
    loaded.value = false;
  }

  return {
    buttonPermissions,
    loaded,
    fetchButtons,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reset
  };
});
