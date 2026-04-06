declare namespace Api.BaseData {
  /** 基础数据概览统计 */
  interface OverviewStatistics {
    /** 介质统计 */
    medium: MediumStatistics;
    /** 单位统计 */
    unit: UnitStatistics;
    /** 转换系数统计 */
    coefficient: CoefficientStatistics;
    /** 计量点统计 */
    meter: MeterStatistics;
    /** 虚拟计量点统计 */
    virtualMeter: VirtualMeterStatistics;
    /** 分时价格统计 */
    tou: TOUStatistics;
  }

  /** 介质统计 */
  interface MediumStatistics {
    /** 总数 */
    total: number;
    /** 启用数 */
    enabled: number;
    /** 停用数 */
    disabled: number;
    /** 按类型统计 */
    byType: Record<string, number>;
  }

  /** 单位统计 */
  interface UnitStatistics {
    /** 总数 */
    total: number;
    /** 标准单位数 */
    standard: number;
    /** 非标准单位数 */
    nonStandard: number;
  }

  /** 转换系数统计 */
  interface CoefficientStatistics {
    /** 总数 */
    total: number;
    /** 有效数 */
    effective: number;
    /** 失效数 */
    expired: number;
  }

  /** 计量点统计 */
  interface MeterStatistics {
    /** 总数 */
    total: number;
    /** 在线数 */
    online: number;
    /** 离线数 */
    offline: number;
    /** 故障数 */
    fault: number;
  }

  /** 虚拟计量点统计 */
  interface VirtualMeterStatistics {
    /** 总数 */
    total: number;
    /** 启用数 */
    enabled: number;
    /** 停用数 */
    disabled: number;
  }

  /** 分时价格统计 */
  interface TOUStatistics {
    /** 时段数 */
    periodCount: number;
    /** 电价数 */
    priceCount: number;
  }
}
