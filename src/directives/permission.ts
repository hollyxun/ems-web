import type { Directive, DirectiveBinding } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

/**
 * 权限指令
 * 用于控制按钮级别的权限显示
 *
 * 使用方式：
 * v-permission="'user:create'" - 单个权限
 * v-permission="['user:create', 'user:edit']" - 多个权限（满足任一即可）
 * v-permission.all="['user:create', 'user:edit']" - 多个权限（需全部满足）
 */

/**
 * 检查是否有权限
 * @param value 权限值或权限数组
 * @param type 检查类型：'some' 满足任一，'every' 全部满足
 */
function checkPermission(value: string | string[], type: 'some' | 'every' = 'some'): boolean {
  const authStore = useAuthStore();
  const { buttons } = authStore.userInfo;

  // 如果没有权限数据，返回 false
  if (!buttons || buttons.length === 0) {
    return false;
  }

  // 超级管理员拥有所有权限
  if (authStore.isStaticSuper) {
    return true;
  }

  // 处理权限值
  const permissions = Array.isArray(value) ? value : [value];

  // 检查权限
  if (type === 'every') {
    return permissions.every(permission => buttons.includes(permission));
  }

  return permissions.some(permission => buttons.includes(permission));
}

/**
 * 处理指令绑定
 */
function handleDirective(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
  const { value, modifiers } = binding;

  // 检查权限类型
  const type = modifiers.all ? 'every' : 'some';

  // 检查是否有权限
  const hasPermission = checkPermission(value, type);

  // 如果没有权限，移除元素
  if (!hasPermission) {
    el.parentNode?.removeChild(el);
  }
}

/**
 * 权限指令
 */
export const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    handleDirective(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    handleDirective(el, binding);
  }
};

/**
 * 注册权限指令
 * @param app Vue应用实例
 */
export function setupPermissionDirective(app: import('vue').App) {
  app.directive('permission', permission);
}

export default permission;
