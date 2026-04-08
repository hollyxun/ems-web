// 看板组件索引
// 所有内置组件统一注册，用于组件选择器

import EnergyOverview from './energy-overview.vue';
import TeamRanking from './team-ranking.vue';
import ApprovalPending from './approval-pending.vue';
import DeviceStatus from './device-status.vue';
import RealtimeMetrics from './realtime-metrics.vue';
import ScheduleCalendar from './schedule-calendar.vue';
import AlertTimeline from './alert-timeline.vue';
import EnergyTrend from './energy-trend.vue';
import QuickStats from './quick-stats.vue';
import TopUsers from './top-users.vue';
import QuickActions from './quick-actions.vue';

// 组件类型定义
export interface DashboardComponentType {
  id: string;
  name: string;
  component: any;
  icon: string;
  category: 'energy' | 'device' | 'approval' | 'schedule' | 'other';
  defaultSize: { w: number; h: number };
  description: string;
}

// 内置组件注册表
export const builtinComponents: DashboardComponentType[] = [
  {
    id: 'energy-overview',
    name: '能源概览',
    component: EnergyOverview,
    icon: 'mdi:chart-bar',
    category: 'energy',
    defaultSize: { w: 4, h: 3 },
    description: '显示总能耗、能耗趋势图和能源类型占比'
  },
  {
    id: 'team-ranking',
    name: '班组排名',
    component: TeamRanking,
    icon: 'mdi:trophy',
    category: 'energy',
    defaultSize: { w: 3, h: 2 },
    description: '班组能效排名和能耗对比'
  },
  {
    id: 'approval-pending',
    name: '审批待办',
    component: ApprovalPending,
    icon: 'mdi:clipboard-check',
    category: 'approval',
    defaultSize: { w: 2, h: 2 },
    description: '当前用户待处理的审批任务'
  },
  {
    id: 'device-status',
    name: '设备状态',
    component: DeviceStatus,
    icon: 'mdi:server',
    category: 'device',
    defaultSize: { w: 2, h: 2 },
    description: '设备在线率、健康率和告警统计'
  },
  {
    id: 'realtime-metrics',
    name: '实时指标',
    component: RealtimeMetrics,
    icon: 'mdi:gauge',
    category: 'energy',
    defaultSize: { w: 2, h: 2 },
    description: '电压、电流、功率、频率实时仪表盘'
  },
  {
    id: 'schedule-calendar',
    name: '排班日历',
    component: ScheduleCalendar,
    icon: 'mdi:calendar',
    category: 'schedule',
    defaultSize: { w: 3, h: 2 },
    description: '班组排班计划和事件日历'
  },
  {
    id: 'alert-timeline',
    name: '告警时间线',
    component: AlertTimeline,
    icon: 'mdi:bell-ring',
    category: 'device',
    defaultSize: { w: 2, h: 2 },
    description: '今日告警事件时间线展示'
  },
  {
    id: 'energy-trend',
    name: '能耗趋势',
    component: EnergyTrend,
    icon: 'mdi:chart-line',
    category: 'energy',
    defaultSize: { w: 4, h: 2 },
    description: '能耗时序趋势图，支持多时间范围'
  },
  {
    id: 'quick-stats',
    name: '快速统计',
    component: QuickStats,
    icon: 'mdi:speedometer',
    category: 'energy',
    defaultSize: { w: 2, h: 2 },
    description: '今日能耗、月度进度、节能率'
  },
  {
    id: 'top-users',
    name: '能耗 Top5',
    component: TopUsers,
    icon: 'mdi:account-star',
    category: 'energy',
    defaultSize: { w: 2, h: 2 },
    description: '本周能耗最高的 5 个用户'
  },
  {
    id: 'quick-actions',
    name: '快捷操作',
    component: QuickActions,
    icon: 'mdi:lightning-bolt',
    category: 'other',
    defaultSize: { w: 2, h: 2 },
    description: '常用操作快捷入口'
  }
];

// 组件类别类型
export type ComponentCategory = 'energy' | 'device' | 'approval' | 'schedule' | 'other';

// 按类别分组
export const componentsByCategory: Record<ComponentCategory, DashboardComponentType[]> = {
  energy: builtinComponents.filter(c => c.category === 'energy'),
  device: builtinComponents.filter(c => c.category === 'device'),
  approval: builtinComponents.filter(c => c.category === 'approval'),
  schedule: builtinComponents.filter(c => c.category === 'schedule'),
  other: builtinComponents.filter(c => c.category === 'other')
};

// 获取组件
export function getComponent(id: string) {
  return builtinComponents.find(c => c.id === id);
}

// 组件类别名称映射
export const categoryNames: Record<string, string> = {
  energy: '能源监控',
  device: '设备状态',
  approval: '审批流程',
  schedule: '排班管理',
  other: '其他'
};
