import type { RouteMeta } from 'vue-router';
import ElegantVueRouter from '@elegant-router/vue/vite';
import type { RouteKey } from '@elegant-router/types';

/**
 * 路由元信息配置
 * 为各路由模块定义 icon 和 order
 */
const routeMetaConfig: Partial<Record<RouteKey, { icon?: string; order?: number; hideInMenu?: boolean }>> = {
  // 一级菜单排序（order 从小到大）
  home: { icon: 'mdi:monitor-dashboard', order: 10 },
  dashboard: { icon: 'ant-design:dashboard-outlined', order: 15 },
  energy: { icon: 'ant-design:thunderbolt-outlined', order: 20 },
  scheduling: { icon: 'ant-design:schedule-outlined', order: 30 },
  'base-data': { icon: 'ant-design:database-outlined', order: 40 },
  alarm: { icon: 'mdi:alert-outline', order: 50 },
  cost: { icon: 'ant-design:dollar-outlined', order: 60 },
  sustainability: { icon: 'mdi:leaf', order: 70 },
  analysis: { icon: 'ant-design:bar-chart-outlined', order: 75 },
  approval: { icon: 'ant-design:audit-outlined', order: 80 },
  manage: { icon: 'carbon:settings', order: 90 },
  knowledge: { icon: 'mdi:book-open-page-variant', order: 100 },
  gatewaysetting: { icon: 'mdi:router-wireless', order: 110 },
  profile: { icon: 'ant-design:user-outlined', order: 120 },

  // energy 子菜单
  energy_dashboard: { icon: 'mdi:monitor-dashboard', order: 1 },
  energy_flow: { icon: 'mdi:chart-sankey', order: 2 },
  energy_comparison: { icon: 'carbon:compare', order: 3 },
  energy_ranking: { icon: 'carbon:chart-radar', order: 4 },
  energy_report: { icon: 'ant-design:file-text-outlined', order: 5 },
  'energy_electric-analysis': { icon: 'ant-design:flash-outlined', order: 6 },
  'energy_history-data': { icon: 'mdi:history', order: 7 },
  'energy_branch-analysis': { icon: 'ant-design:branches-outlined', order: 8 },

  // scheduling 子菜单
  scheduling_team: { icon: 'ant-design:team-outlined', order: 1 },
  scheduling_shift: { icon: 'ant-design:clock-circle-outlined', order: 2 },
  'scheduling_shift-pattern': { icon: 'ant-design:sync-outlined', order: 3 },
  scheduling_calendar: { icon: 'ant-design:calendar-outlined', order: 4 },
  'scheduling_factory-calendar': { icon: 'ant-design:calendar-outlined', order: 5 },
  'scheduling_rule-config': { icon: 'ant-design:setting-outlined', order: 6 },
  'scheduling_rule-version': { icon: 'ant-design:history-outlined', order: 7 },
  'scheduling_rule-template': { icon: 'ant-design:copy-outlined', order: 8 },

  // base-data 子菜单
  'base-data_home': { icon: 'ant-design:home-outlined', order: 0 },
  'base-data_medium': { icon: 'ant-design:appstore-outlined', order: 1 },
  'base-data_unit': { icon: 'ant-design:swap-outlined', order: 2 },
  'base-data_coefficient': { icon: 'ant-design:calculator-outlined', order: 3 },
  'base-data_meter': { icon: 'ant-design:dashboard-outlined', order: 4 },
  'base-data_tou': { icon: 'ant-design:clock-circle-outlined', order: 5 },
  'base-data_virtual-meter': { icon: 'ant-design:build-outlined', order: 6 },
  'base-data_power-distribution': { icon: 'ant-design:electrical-service-outlined', order: 7 },

  // alarm 子菜单
  alarm_item: { icon: 'mdi:bell-cog-outline', order: 1 },
  alarm_history: { icon: 'mdi:history', order: 2 },
  'alarm_limit-type': { icon: 'mdi:format-list-bulleted-type', order: 3 },

  // cost 子菜单
  cost_electricity: { icon: 'ant-design:flash-outlined', order: 1 },
  cost_tactics: { icon: 'ant-design:bulb-outlined', order: 2 },
  cost_trend: { icon: 'ant-design:line-chart-outlined', order: 3 },

  // sustainability 子菜单
  sustainability_program: { icon: 'mdi:lightbulb-outline', order: 1 },
  sustainability_policy: { icon: 'mdi:file-document-outline', order: 2 },
  'sustainability_carbon-calculate': { icon: 'mdi:molecule-co2', order: 3 },

  // analysis 子菜单
  analysis_benchmark: { icon: 'ant-design:aim-outlined', order: 1 },
  analysis_branch: { icon: 'ant-design:branches-outlined', order: 2 },
  analysis_comprehensive: { icon: 'ant-design:pie-chart-outlined', order: 3 },
  analysis_consumption: { icon: 'ant-design:line-chart-outlined', order: 4 },
  'analysis_consumption-detail': { icon: 'ant-design:file-search-outlined', order: 5, hideInMenu: true },
  analysis_indicators: { icon: 'ant-design:dashboard-outlined', order: 6 },
  analysis_itemized: { icon: 'ant-design:appstore-outlined', order: 7 },
  'analysis_itemized-detail': { icon: 'ant-design:file-search-outlined', order: 8, hideInMenu: true },
  'analysis_peak-valley': { icon: 'ant-design:rise-outlined', order: 9 },
  'analysis_peak-valley-detail': { icon: 'ant-design:file-search-outlined', order: 10, hideInMenu: true },
  'analysis_peak-valley-scheme': { icon: 'ant-design:setting-outlined', order: 11 },
  'analysis_product-output': { icon: 'ant-design:boxplot-outlined', order: 12 },
  'analysis_key-equipment': { icon: 'ant-design:dashboard-outlined', order: 13 },
  'analysis_process-energy': { icon: 'ant-design:cluster-outlined', order: 14 },
  analysis_energy: { icon: 'ant-design:pie-chart-outlined', order: 15 },
  analysis_statistical: { icon: 'ant-design:bar-chart-outlined', order: 16 },
  'analysis_statistical_cost': { icon: 'ant-design:dollar-outlined', order: 17 },
  'analysis_statistical_flow': { icon: 'ant-design:branches-outlined', order: 18 },
  'analysis_statistical_yoy-mom': { icon: 'ant-design:stock-outlined', order: 19 },

  // approval 子菜单
  'approval_flow-designer': { icon: 'ant-design:branches-outlined', order: 1 },
  approval_workspace: { icon: 'ant-design:desktop-outlined', order: 2 },

  // manage 子菜单
  manage_user: { icon: 'ic:round-manage-accounts', order: 1 },
  manage_role: { icon: 'carbon:user-role', order: 2 },
  manage_menu: { icon: 'material-symbols:route', order: 3 },
  manage_api: { icon: 'ant-design:api-outlined', order: 4 },
  'manage_audit-log': { icon: 'ant-design:file-text-outlined', order: 5 },
  manage_dictionary: { icon: 'ant-design:book-outlined', order: 6 },
  manage_organization: { icon: 'ant-design:apartment-outlined', order: 7 },
  'manage_password-change': { icon: 'ant-design:lock-outlined', order: 8 },
  'manage_user-lock': { icon: 'ant-design:user-delete-outlined', order: 9 },
  'manage_approval-definition': { icon: 'ant-design:audit-outlined', order: 10 },
  'manage_notification-center': { icon: 'ant-design:notification-outlined', order: 11 },
  manage_announcement: { icon: 'ant-design:notification-outlined', order: 12 },
  manage_policy: { icon: 'ant-design:safety-outlined', order: 13 },

  // profile 子菜单
  profile_info: { icon: 'ant-design:user-outlined', order: 1 },
  profile_password: { icon: 'ant-design:lock-outlined', order: 2 },

  // dashboard 子菜单
  dashboard_custom: { icon: 'ic:baseline-dashboard-customize', order: 1 },

  // 隐藏的详情页面（不显示在菜单中）
  'manage_user-detail': { hideInMenu: true },
  'analysis_energy_comprehensive_daily': { hideInMenu: true },
  'analysis_energy_comprehensive_monthly': { hideInMenu: true },
  'analysis_energy_comprehensive_statistics': { hideInMenu: true },
  'analysis_energy_comprehensive_year': { hideInMenu: true },
  'analysis_key-equipment_daily': { hideInMenu: true },
  'analysis_key-equipment_monthly': { hideInMenu: true },
  'analysis_key-equipment_year': { hideInMenu: true },
  'analysis_process-energy_statistics_daily': { hideInMenu: true },
  'analysis_process-energy_statistics_monthly': { hideInMenu: true },
  'analysis_process-energy_statistics_year': { hideInMenu: true },

  // 框架示例路由（隐藏）
  about: { hideInMenu: true },
  developer: { hideInMenu: true },
  'developer_function': { hideInMenu: true },
  'developer_plugin': { hideInMenu: true }
};

export function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: 'src/layouts/base-layout/index.vue',
      blank: 'src/layouts/blank-layout/index.vue'
    },
    customRoutes: {
      names: []
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName as RouteKey;

      if (key === 'login') {
        const modules: UnionKey.LoginModule[] = ['pwd-login', 'code-login', 'register', 'reset-pwd', 'bind-wechat'];

        const moduleReg = modules.join('|');

        return `/login/:module(${moduleReg})?`;
      }

      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName as RouteKey;

      const constantRoutes: RouteKey[] = ['login', '403', '404', '500'];

      const meta: Partial<RouteMeta> = {
        title: key,
        i18nKey: `route.${key}` as App.I18n.I18nKey
      };

      if (constantRoutes.includes(key)) {
        meta.constant = true;
        meta.hideInMenu = true;
      }

      // 从配置中获取 icon/order
      const config = routeMetaConfig[key];
      if (config) {
        if (config.icon) {
          meta.icon = config.icon;
        }
        if (config.order !== undefined) {
          meta.order = config.order;
        }
        if (config.hideInMenu) {
          meta.hideInMenu = true;
        }
      }

      return meta;
    }
  });
}