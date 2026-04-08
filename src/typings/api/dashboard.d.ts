/** Dashboard module types */

declare namespace Api.Dashboard {
  // ============ Consumption Types ============

  /** Consumption metric with auto-converted display */
  interface ConsumptionMetric {
    value: number;
    unit: string;
    displayValue: string;
    period: 'realtime' | 'hourly' | 'daily' | 'monthly';
  }

  /** Consumption target for comparison */
  interface ConsumptionTarget {
    value: number;
    unit: string;
    displayValue: string;
  }

  // ============ Group Dashboard Types ============

  /** Factory comparison item for group dashboard */
  interface FactoryComparisonItem {
    factoryId: string;
    factoryName: string;
    consumption: ConsumptionMetric;
    rank: number;
    trend: number;
    teams: TeamBrief[];
  }

  /** Team brief info */
  interface TeamBrief {
    teamId: string;
    teamName: string;
    consumption: ConsumptionMetric;
  }

  /** Group dashboard data */
  interface GroupDashboardData {
    totalConsumption: ConsumptionMetric;
    factoryComparison: FactoryComparisonItem[];
    updateTime: string;
    trendDirection: 'up' | 'down' | 'stable';
  }

  // ============ Factory Dashboard Types ============

  /** Workshop breakdown item */
  interface WorkshopBreakdownItem {
    workshopId: string;
    workshopName: string;
    consumption: ConsumptionMetric;
    percentage: number;
    teams: TeamBrief[];
  }

  /** Time range for peak hours */
  interface TimeRange {
    start: string;
    end: string;
    consumption?: number;
  }

  /** Factory dashboard data */
  interface FactoryDashboardData {
    factoryId: string;
    factoryName: string;
    totalConsumption: ConsumptionMetric;
    workshopBreakdown: WorkshopBreakdownItem[];
    peakHours: TimeRange[];
    alertCount: number;
  }

  // ============ Team Dashboard Types ============

  /** Shift information */
  interface ShiftInfo {
    shiftType: 'morning' | 'afternoon' | 'night';
    startTime: string;
    endTime: string;
    shiftName: string;
  }

  /** Shift progress */
  interface ShiftProgress {
    percentage: number;
    elapsedTime: number;
    remainingTime: number;
    estimatedCompletion: string;
    status: 'on_track' | 'ahead' | 'behind';
  }

  /** Team dashboard data */
  interface TeamDashboardData {
    teamId: string;
    teamName: string;
    currentShift: ShiftInfo;
    shiftProgress: ShiftProgress;
    consumption: ConsumptionMetric;
    target: ConsumptionTarget | null;
  }

  // ============ Trend Data Types ============

  /** Trend data for charts */
  interface TrendData {
    timestamps: string[];
    current: number[];
    yesterday: number[];
    unit: string;
  }

  /** Trend data query params */
  interface TrendDataParams {
    meterId?: string;
    orgId?: string;
    startTime: string;
    endTime: string;
  }

  // ============ Alert Types ============

  /** Alert item */
  interface AlertItem {
    id: string;
    type: 'over_limit' | 'offline' | 'fluctuation';
    severity: 'critical' | 'warning' | 'info';
    meterId: string;
    meterName: string;
    orgName: string;
    message: string;
    timestamp: string;
    status: 'active' | 'confirmed' | 'ignored';
    value: number;
    threshold: number;
  }

  /** Alert list response */
  interface AlertListResponse {
    total: number;
    items: AlertItem[];
  }

  /** Alert query params */
  interface AlertQueryParams {
    orgId?: string;
    status?: string;
    severity?: string;
    type?: string;
    page: number;
    pageSize: number;
  }

  // ============ 自定义看板类型 ============

  /** 保存看板配置请求 */
  interface SaveDashboardConfigParams {
    id?: number;
    code?: string;
    name?: string;
    layout?: string;
    owner_type?: string;
    owner_id?: string;
    is_default?: boolean;
  }

  /** 获取看板配置请求 */
  interface GetDashboardConfigParams {
    id?: number;
    code?: string;
    owner_type?: string;
    owner_id?: string;
  }

  /** 删除看板配置请求 */
  interface DeleteDashboardConfigParams {
    id: number;
  }

  /** 设为默认看板请求 */
  interface SetDefaultDashboardParams {
    id: number;
  }

  /** 看板配置列表查询参数 */
  interface DashboardConfigListParams {
    page?: number;
    pageSize?: number;
    owner_type?: string;
  }

  /** 看板数据代理请求 */
  interface DashboardDataParams {
    component_type: string;
    data_source: string;
  }

  // ============ Peak/Valley Distribution Types ============

  /** Distribution segment */
  interface DistributionSegment {
    value: number;
    percentage: number;
    unit: string;
    timeRanges: TimeRange[];
  }

  /** Peak/valley distribution */
  interface PeakValleyDistribution {
    peak: DistributionSegment;
    valley: DistributionSegment;
    flat: DistributionSegment;
    period: string;
  }

  // ============ SSE Event Types ============

  /** SSE dashboard event */
  interface SSEDashboardEvent {
    type: 'consumption_update' | 'alert_new' | 'alert_status_change';
    scope: 'group' | 'factory' | 'team';
    orgId: string;
    data: GroupDashboardData | FactoryDashboardData | TeamDashboardData | AlertItem;
    timestamp: string;
  }

  // ============ Breadcrumb Types ============

  /** Breadcrumb item for navigation */
  interface BreadcrumbItem {
    id: string;
    name: string;
    level: 'group' | 'factory' | 'workshop' | 'team';
  }
}
