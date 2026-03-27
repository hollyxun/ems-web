declare namespace Api.Energy {
  /** 能源介质 */
  interface Medium {
    id: number;
    mediumCode: string;
    mediumName: string;
    mediumType: number;
    parentCode?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
    /** 图标 */
    icon?: string;
    /** 颜色 */
    color?: string;
    /** 基准单位 */
    baseUnit?: string;
    /** 小数精度 */
    precision?: number;
  }

  interface MediumSearchParams {
    page?: number;
    pageSize?: number;
    mediumCode?: string;
    mediumName?: string;
    mediumType?: number;
    status?: number;
  }

  interface MediumList {
    list: Medium[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** 介质单位 */
  interface Unit {
    id: number;
    mediumId: number;
    mediumCode: string;
    unitCode: string;
    unitName: string;
    isStandard: boolean;
    conversionFactor: number;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface UnitView extends Unit {
    mediumName: string;
    mediumType: number;
  }

  interface UnitSearchParams {
    mediumId?: number;
    mediumCode?: string;
    status?: number;
  }

  /** 系数折算 */
  interface Coefficient {
    id: number;
    mediumId: number;
    mediumCode: string;
    coefficientType: number;
    coefficientPurpose: string;
    coefficientValue: number;
    unit: string;
    effectiveDate: string;
    expiryDate?: string;
    versionDesc?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface CoefficientView extends Coefficient {
    mediumName: string;
    mediumType: number;
  }

  interface CoefficientSearchParams {
    page?: number;
    pageSize?: number;
    mediumId?: number;
    coefficientType?: number;
    status?: number;
    effectiveDate?: string;
  }

  interface CoefficientList {
    list: CoefficientView[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** 介质台账 */
  interface Ledger {
    id: number;
    mediumCode: string;
    mediumName: string;
    mediumType: number;
    mediumTypeName: string;
    status: number;
    standardUnitCode?: string;
    standardUnitName?: string;
    coalCoefficient?: number;
    carbonCoefficient?: number;
    coefficientPurpose?: string;
  }

  interface LedgerSearchParams {
    page?: number;
    pageSize?: number;
    mediumCode?: string;
    mediumName?: string;
    mediumType?: number;
    status?: number;
    queryDate?: string;
  }

  interface LedgerList {
    list: Ledger[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** 计量点 */
  interface MeteringPoint {
    id: number;
    code: string;
    name: string;
    /** 类型: 1=总表, 2=分表, 3=设备表 */
    type: 1 | 2 | 3;
    organizationId: number;
    mediumId: number;
    location: string;
    deviceId?: number;
    /** 采集频率(分钟): 1, 5, 15, 60 */
    frequency: 1 | 5 | 15 | 60;
    influxTag: string;
    qrCode: string;
    installDate: string;
    /** 状态: 1=在线, 2=离线, 3=故障 */
    status: 1 | 2 | 3;
    lastHeartbeat?: string;
    description: string;
    organization?: Organization;
    medium?: Medium;
    createdAt?: string;
    updatedAt?: string;
  }

  interface MeterSearchParams {
    page?: number;
    pageSize?: number;
    code?: string;
    name?: string;
    type?: number;
    organizationId?: number;
    mediumId?: number;
    status?: number;
  }

  interface MeterList {
    list: MeteringPoint[];
    total: number;
    page: number;
    pageSize: number;
  }

  interface MeterTreeNode {
    meter: MeteringPoint;
    children: MeterTreeNode[];
  }

  interface BalanceResult {
    inputValue: number;
    outputValue: number;
    lossValue: number;
    balanceRate: number;
    childDetails: ChildBalance[];
  }

  interface ChildBalance {
    meterId: number;
    meterName: string;
    value: number;
    percentage: number;
  }

  interface MeterStatusLog {
    id: number;
    meterId: number;
    oldStatus: number;
    newStatus: number;
    reason?: string;
    operatorId?: number;
    operatorName?: string;
    createdAt: string;
  }

  /** 单位换算 */
  interface UnitConversion {
    id: number;
    mediumId: number;
    fromUnitId: number;
    toUnitId: number;
    factor: number;
    formula?: string;
    effectiveDate: string;
    expireDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface UnitConversionSearchParams {
    mediumId?: number;
    effectiveDate?: string;
  }

  /** 分时电价时段 */
  interface TouPeriod {
    id: number;
    name: string;
    /** 时段类型: 1=峰, 2=平, 3=谷 */
    periodType: 1 | 2 | 3;
    startTime: string;
    endTime: string;
    crossMidnight: boolean;
    factoryId?: number;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface TouPeriodSearchParams {
    factoryId?: number;
    periodType?: number;
  }

  /** 分时电价 */
  interface TouPrice {
    id: number;
    mediumId: number;
    periodType: 1 | 2 | 3;
    price: number;
    currency: string;
    effectiveDate: string;
    expireDate?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface TouPriceSearchParams {
    mediumId?: number;
    periodType?: number;
    effectiveDate?: string;
  }

  /** 工厂分时电价 */
  interface FactoryTouPrice {
    id: number;
    factoryId: number;
    mediumId: number;
    periodType: 1 | 2 | 3;
    price: number;
    currency: string;
    effectiveDate: string;
    expireDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface FactoryTouPriceSearchParams {
    factoryId?: number;
    mediumId?: number;
    periodType?: number;
  }

  /** 电费计算结果 */
  interface CostResult {
    totalCost: number;
    currency: string;
    periodDetails: PeriodCost[];
  }

  interface PeriodCost {
    periodType: number;
    periodName: string;
    consumption: number;
    price: number;
    cost: number;
    percentage: number;
  }

  /** SSE实时数据命名空间 */
  namespace Realtime {
    /** SSE事件类型 */
    type SSEEventType = 'data_update' | 'meter_status' | 'alert' | 'heartbeat' | 'connection_ack';

    /** SSE消息结构 */
    interface SSEMessage<T = unknown> {
      eventType: SSEEventType;
      data: T;
      timestamp: string;
    }

    /** 通道范围 */
    interface ChannelScope {
      factoryId: number;
      workshopId?: number;
      channelId: string;
    }

    /** 计量点数据点 */
    interface MeterDataPoint {
      meterId: number;
      value: number;
      timestamp: string;
      energyMedium: string;
    }

    /** 计量点数据批次 */
    interface MeterDataBatch {
      channelId: string;
      meters: MeterDataPoint[];
      windowStart: string;
      windowEnd: string;
    }

    /** SSE连接状态 */
    type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

    /** 连接确认数据 */
    interface ConnectionAckData {
      connectionId: string;
      connectedAt: string;
      message: string;
    }

    /** 心跳数据 */
    interface HeartbeatData {
      timestamp: string;
    }

    /** 告警数据 */
    interface AlertData {
      alertId: number;
      alertType: string;
      meterId: number;
      level: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      value: number;
      threshold: number;
      timestamp: string;
    }
  }

  /** 能量流 - Sankey图数据 */
  namespace EnergyFlow {
    /** 节点类型 */
    type NodeType = 'input' | 'workshop' | 'team' | 'loss';

    /** Sankey图节点 */
    interface SankeyNode {
      /** 唯一标识 */
      id: string;
      /** 显示名称 */
      name: string;
      /** 层级深度: 0=输入源, 1=车间, 2=班组 */
      depth: number;
      /** 能耗值 */
      value: number;
      /** 节点类型 */
      nodeType: NodeType;
      /** 组织ID */
      orgId: number;
      /** 可选附加信息 */
      metadata?: string;
    }

    /** Sankey图连线 */
    interface SankeyLink {
      /** 源节点ID */
      source: string;
      /** 目标节点ID */
      target: string;
      /** 能量流量 */
      value: number;
    }

    /** 时间范围 */
    interface TimeRange {
      startTime: string;
      endTime: string;
    }

    /** 能量流响应 */
    interface EnergyFlowResponse {
      /** 节点列表 */
      nodes: SankeyNode[];
      /** 连线列表 */
      links: SankeyLink[];
      /** 平衡率（百分比） */
      balanceRate: number;
      /** 是否平衡（balanceRate >= 95%） */
      isBalanced: boolean;
      /** 总损耗值 */
      lossTotal: number;
      /** 损耗占比（占总输入的百分比） */
      lossPercent: number;
      /** 统计时间段 */
      period: TimeRange;
    }

    /** 能量流查询参数 */
    interface EnergyFlowParams {
      /** 工厂ID */
      factoryId?: number;
      /** 车间ID */
      workshopId?: number;
      /** 开始时间 (RFC3339格式) */
      startTime: string;
      /** 结束时间 (RFC3339格式) */
      endTime: string;
      /** 能源介质类型（可选） */
      energyMedium?: string;
    }
  }

  /** 排名模块 */
  namespace Ranking {
    /** 时间维度 */
    type TimeDimension = 'daily' | 'weekly' | 'monthly';

    /** 排名指标 */
    type Metric = 'total_energy' | 'specific_consumption' | 'cost';

    /** 班组排名项 */
    interface TeamRankingItem {
      teamId: number;
      teamName: string;
      teamCode: string;
      factoryId: number;
      factoryName: string;
      workshopId: number;
      workshopName: string;
      energyMedium: string;
      totalEnergy: number;
      productionOutput: number;
      specificConsumption: number;
      cost: number;
      rank: number;
      rankChange: number;
      dataPoints: number;
      periodStart: string;
      periodEnd: string;
    }

    /** 排名响应 */
    interface TeamRankingResponse {
      items: TeamRankingItem[];
      total: number;
      page: number;
      pageSize: number;
    }

    /** 排名查询参数 */
    interface TeamRankingQuery {
      page?: number;
      pageSize?: number;
      timeDimension?: TimeDimension;
      metric?: Metric;
      factoryId?: number;
      workshopId?: number;
      teamId?: number;
      energyMedium?: string;
      periodStart?: string;
      periodEnd?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }

    /** 排名趋势数据点 */
    interface RankingTrendPoint {
      date: string;
      rank: number;
      metricValue: number;
    }

    /** 趋势查询参数 */
    interface RankingTrendQuery {
      teamId: number;
      days?: number;
      metric?: Metric;
    }
  }

  /** 对比模块 */
  namespace Comparison {
    /** 对比类型 */
    type ComparisonType = 'team_vs_team' | 'shift_vs_shift' | 'time_vs_time';

    /** 对比项 */
    interface ComparisonItem {
      id: string;
      name: string;
      totalEnergy: number;
      productionOutput: number;
      specificConsumption: number;
      cost: number;
      peakEnergy: number;
      valleyEnergy: number;
      flatEnergy: number;
      peakRatio: number;
      valleyRatio: number;
      flatRatio: number;
      periodStart?: string;
      periodEnd?: string;
    }

    /** 对比差异 */
    interface ComparisonDiff {
      metric: string;
      valueA: number;
      valueB: number;
      valueC?: number;
      difference: number;
      percentChange: number;
      isPositive: boolean;
    }

    /** 对比结果 */
    interface ComparisonResult {
      comparisonType: ComparisonType;
      itemA: ComparisonItem;
      itemB: ComparisonItem;
      itemC?: ComparisonItem;
      differences: ComparisonDiff[];
      summary: string;
    }

    /** 时间对比结果 */
    interface TimeComparisonResult {
      currentPeriod: ComparisonItem;
      previousPeriod: ComparisonItem;
      samePeriodLastYear: ComparisonItem;
      differences: Record<string, ComparisonDiff>;
      summary: string;
    }

    /** 班组对比查询 */
    interface TeamComparisonQuery {
      teamAId: number;
      teamBId: number;
      timeDimension?: 'daily' | 'weekly' | 'monthly';
      periodStart?: string;
      periodEnd?: string;
      energyMedium?: string;
    }

    /** 班次对比查询 */
    interface ShiftComparisonQuery {
      teamId: number;
      date?: string;
      shiftTypes?: string[];
      energyMedium?: string;
    }

    /** 时间对比查询 */
    interface TimeComparisonQuery {
      teamId: number;
      periodType?: 'daily' | 'weekly' | 'monthly';
      periodEnd?: string;
      energyMedium?: string;
    }
  }

  /** 报表模块 */
  namespace Report {
    /** 班次能耗数据 */
    interface ShiftEnergyData {
      shiftType: string;
      shiftName: string;
      startTime: string;
      endTime: string;
      teamId: number;
      teamName: string;
      energyValue: number;
      energyType: string;
      unit: string;
      cost: number;
      production: number;
      specificUsage: number;
      peakRatio: number;
      valleyRatio: number;
      flatRatio: number;
    }

    /** 日报数据 */
    interface DailyReportData {
      reportDate: string;
      teamId: number;
      teamName: string;
      workshopId: number;
      workshopName: string;
      factoryId: number;
      factoryName: string;
      shiftData: ShiftEnergyData[];
      totalEnergy: number;
      totalCost: number;
      totalProduction: number;
      avgSpecificUsage: number;
      prevDayEnergy: number;
      dayOverDay: number;
      peakTotal: number;
      valleyTotal: number;
      flatTotal: number;
    }

    /** 日报查询参数 */
    interface DailyReportParams {
      date: string;
      teamId?: number;
      factoryId?: number;
      energyType?: string;
    }

    /** 日汇总数据 */
    interface DailySummary {
      date: string;
      energyValue: number;
      cost: number;
      production: number;
    }

    /** 趋势数据点 */
    interface TrendPoint {
      date: string;
      value: number;
    }

    /** 能源类型分布 */
    interface EnergyTypeBreakdown {
      energyType: string;
      value: number;
      cost: number;
      percentage: number;
    }

    /** 月报数据 */
    interface MonthlyReportData {
      reportMonth: string;
      teamId: number;
      teamName: string;
      dailyData: DailySummary[];
      totalEnergy: number;
      totalCost: number;
      avgDailyEnergy: number;
      prevMonthEnergy: number;
      monthOverMonth: number;
      yoYEnergy: number;
      trendData: TrendPoint[];
      energyByType: EnergyTypeBreakdown[];
    }

    /** 月报查询参数 */
    interface MonthlyReportParams {
      month: string;
      teamId?: number;
      factoryId?: number;
      energyType?: string;
    }

    /** 排名报表行 */
    interface RankingRow {
      rank: number;
      teamId: number;
      teamName: string;
      workshopName: string;
      factoryName: string;
      energyValue: number;
      production: number;
      specificUsage: number;
      cost: number;
      change: number;
    }

    /** 排名报表数据 */
    interface RankingReportData {
      reportDate: string;
      dimension: string;
      filterInfo: string;
      rankings: RankingRow[];
      generatedAt: string;
    }

    /** 排名报表查询参数 */
    interface RankingReportParams {
      dateStart: string;
      dateEnd: string;
      dimension: 'energy' | 'specific' | 'cost';
      factoryId?: number;
      workshopId?: number;
      energyType?: string;
      topN?: number;
    }

    /** 对比项 */
    interface CompareItem {
      id: number;
      name: string;
      type: string;
    }

    /** 对比维度 */
    interface CompareDimension {
      name: string;
      valueA: number;
      valueB: number;
      diff: number;
      diffRatio: number;
    }

    /** 对比报表数据 */
    interface ComparisonReportData {
      reportTitle: string;
      compareType: string;
      itemA: CompareItem;
      itemB: CompareItem;
      dimensions: CompareDimension[];
      generatedAt: string;
    }

    /** 对比报表查询参数 */
    interface ComparisonReportParams {
      compareType: 'team' | 'shift' | 'time';
      teamAId?: number;
      teamBId?: number;
      shiftTypeA?: string;
      shiftTypeB?: string;
      teamId?: number;
      timeAStart?: string;
      timeAEnd?: string;
      timeBStart?: string;
      timeBEnd?: string;
      date?: string;
      energyType?: string;
      dimensions?: string[];
    }
  }
}
