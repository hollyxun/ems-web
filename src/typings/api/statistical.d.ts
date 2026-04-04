declare namespace Api.Statistical {
  /** 能流图分析 */
  namespace FlowCharts {
    /** 时间类型 */
    type TimeType = 'DAY' | 'MONTH' | 'YEAR';

    /** 能流图查询参数 */
    interface FlowChartsParams {
      /** 时间类型 */
      timeType?: TimeType;
      /** 查询时间 */
      queryTime: string;
      /** 能源类型 */
      energyType: string;
      /** 节点ID */
      nodeId?: string;
      /** 模型编码 */
      modelCode: string;
    }

    /** 能流图节点项 */
    interface FlowChartsItem {
      /** 源头 */
      source: string;
      /** 目标 */
      target: string;
      /** 值 */
      value: number;
    }

    /** 能流图响应 */
    interface FlowChartsResponse {
      /** 总累积量 */
      totalAccumulatedAmount: number;
      /** 子节点累积量 */
      childNodeAccumulatedAmount: number;
      /** 差值 */
      difference: number;
      /** 能耗损失比例 */
      energyLossRatio: number;
      /** 子节点列表 */
      itemVOList: FlowChartsItem[];
    }
  }

  /** 同比/环比分析 */
  namespace Comparison {
    /** 时间类型 */
    type TimeType = 'HOUR' | 'DAY' | 'MONTH' | 'YEAR';

    /** 同比/环比分析查询参数 */
    interface CompareParams {
      /** 统计开始时间 */
      beginTime: string;
      /** 统计结束时间 */
      endTime: string;
      /** 时间类型 */
      timeType: TimeType;
      /** 模型节点ID */
      nodeId: string;
    }

    /** 同比分析响应 */
    interface YoYResponse {
      /** 单位 */
      unit: string;
      /** 用能单元名称 */
      energyUnitName: string;
      /** 本期值 */
      currentValue: number;
      /** 同期值 */
      oldValue: number;
      /** 同比值（百分比） */
      ratio: number;
    }

    /** 环比分析响应 */
    interface MoMResponse {
      /** 单位 */
      unit: string;
      /** 用能单元名称 */
      energyUnitName: string;
      /** 本期值 */
      currentValue: number;
      /** 上期值 */
      oldValue: number;
      /** 环比值（百分比） */
      ratio: number;
    }

    /** 能源类型对比查询参数 */
    interface QueryCompareParams {
      /** 时间类型 */
      timeType: string;
      /** 时间编码 */
      timeCode: string;
      /** 节点ID */
      nodeId: string;
      /** 能源类型（多个用/分隔） */
      energyType?: string;
    }

    /** 能源类型对比响应 */
    interface EnergyTypeContrastedResponse {
      /** 能源类型 */
      energyType: string;
      /** 能源类型名称 */
      energyTypeName: string;
      /** 本期值 */
      currentValue: number;
      /** 对比值 */
      contrastedValue: number;
      /** 变化率 */
      changeRate: number;
      /** 单位 */
      unit: string;
    }
  }

  /** 成本趋势分析 */
  namespace CostTrend {
    /** 时间类型 */
    type TimeType = 'DAY' | 'MONTH' | 'YEAR';

    /** 成本趋势查询参数 */
    interface CostTrendParams {
      /** 页码 */
      pageNo?: number;
      /** 每页数量 */
      pageSize?: number;
      /** 时间编码 */
      timeCode?: string;
      /** 时间类型 */
      timeType?: TimeType;
      /** 能源类型 */
      energyType?: string;
      /** 模型编码 */
      modelCode: string;
    }

    /** 成本趋势详情查询参数 */
    interface CostTrendDetailParams {
      /** 时间编码 */
      timeCode: string;
      /** 时间类型 */
      timeType: TimeType;
      /** 模型编码 */
      modelCode: string;
      /** 能源类型 */
      energyType?: string;
    }

    /** 成本趋势能源类型项 */
    interface CostTrendEnergyTypeItem {
      /** 能源类型 */
      energyType: string;
      /** 能源类型名称 */
      energyTypeName: string;
      /** 费用 */
      cost: number;
      /** 占比 */
      percentage: number;
    }

    /** 成本趋势项 */
    interface CostTrendItem {
      /** 用能单元ID */
      energyUnitId: string;
      /** 用能单元名称 */
      energyUnitName: string;
      /** 总费用 */
      total: number;
      /** 时间 */
      dateCode: string;
      /** 能源类型列表 */
      itemList: CostTrendEnergyTypeItem[];
    }

    /** 成本趋势分页响应 */
    interface CostTrendResponse {
      /** 数据列表 */
      list: CostTrendItem[];
      /** 总数 */
      total: number;
      /** 当前页 */
      page: number;
      /** 每页数量 */
      pageSize: number;
    }
  }
}