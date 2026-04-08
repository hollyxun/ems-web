/**
 * Comprehensive Analysis types
 * 综合能耗分析类型定义
 */
declare namespace Api {
  namespace Comprehensive {
    /**
     * 图表数据项
     */
    interface ChartDataItem {
      /** X轴标签 */
      xdata: string;
      /** 当前值 */
      yvalue: number;
      /** 对比值 */
      ycompareValue: number;
      /** 环比值 */
      yqoq: number;
    }

    /**
     * 能源占比
     */
    interface EnergyProportion {
      /** 能源名称 */
      energyName: string;
      /** 数量 */
      count: number;
      /** 占比百分比 */
      percentage: number;
    }

    /**
     * 综合能耗列表项
     */
    interface ComprehensiveListItem {
      /** 当前时间 */
      currentTime: string;
      /** 当前值 */
      currentValue: number;
    }

    /**
     * 综合能耗统计响应
     */
    interface ComprehensiveResponse {
      /** 图表数据列表 */
      chartDataList: ChartDataItem[];
      /** 能源占比 */
      energyProportion: EnergyProportion[];
      /** 数据列表 */
      dataList: ComprehensiveListItem[];
    }

    /**
     * 同比环比数据
     */
    interface YoYData {
      /** 当前时间 */
      currentTime: string;
      /** 当前值 */
      currentValue: number;
      /** 对比时间 */
      compareTime: string;
      /** 对比值 */
      compareValue: number;
      /** 变化比率 */
      ratio: number;
    }

    /**
     * 同比环比响应
     */
    interface YoYResponse {
      /** 同比数据 */
      tongbi: YoYData;
      /** 环比数据 */
      huanbi: YoYData;
    }

    /**
     * 能耗排名
     */
    interface EnergyRanking {
      /** 节点名称 */
      nodeName: string;
      /** 能耗值 */
      energyConsumption: number;
    }

    /**
     * 综合统计数据
     */
    interface ComprehensiveStatistics {
      /** 主键ID */
      id: number;
      /** 计量点ID */
      pointId: string;
      /** 指标编码 */
      indexCode: string;
      /** 指标名称 */
      indexName: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: string;
      /** 数值 */
      value: number;
      /** 单位 */
      unit: string;
      /** 标煤当量 */
      coalEquivalent: number;
      /** 设施名称 */
      facilityName: string;
      /** 名称 */
      name: string;
      /** 指标类型 */
      indexType: string;
    }

    /**
     * 日综合指标数据
     */
    interface DailyComprehensive {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: string;
      /** 能源类型 */
      energyType: string;
      /** 当前值 */
      value: number;
      /** 对比值 */
      compareValue: number;
      /** 环比值 */
      qoqValue: number;
    }

    /**
     * 月综合指标数据
     */
    interface MonthlyComprehensive {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: string;
      /** 能源类型 */
      energyType: string;
      /** 当前值 */
      value: number;
      /** 对比值 */
      compareValue: number;
      /** 环比值 */
      qoqValue: number;
      /** 数量 */
      count?: number;
    }

    /**
     * 月综合指标列表响应
     */
    interface MonthlyComprehensiveListResponse {
      /** 表头 */
      tablehead: Record<string, string>[];
      /** 表格数据 */
      tabledata: MonthlyComprehensive[];
    }

    /**
     * 年综合指标数据
     */
    interface YearComprehensive {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId: string;
      /** 数据时间 */
      dataTime: string;
      /** 能源类型 */
      energyType: string;
      /** 当前值 */
      value: number;
      /** 对比值 */
      compareValue: number;
    }

    /**
     * 综合能耗查询参数
     */
    interface ComprehensiveQuery {
      /** 指标类型 */
      indexType?: string;
      /** 指标编码 */
      indexCode?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 时间类型 */
      timeType?: string;
      /** 开始时间 */
      beginTime?: string;
      /** 结束时间 */
      endTime?: string;
      /** 节点ID */
      nodeId?: string;
      /** 能源类型 */
      energyType?: string;
    }

    /**
     * 日综合指标查询参数
     */
    interface DailyComprehensiveQuery {
      /** 指标编码 */
      indexCode?: string;
      /** 指标ID */
      indexId?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 时间类型 */
      timeType?: string;
      /** 能源类型 */
      energyType?: string;
      /** 开始时间 */
      beginTime?: string;
      /** 结束时间 */
      endTime?: string;
    }

    /**
     * 月综合指标查询参数
     */
    type MonthlyComprehensiveQuery = DailyComprehensiveQuery;

    /**
     * 年综合指标查询参数
     */
    interface YearComprehensiveQuery {
      /** 指标编码 */
      indexCode?: string;
      /** 指标ID */
      indexId?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 能源类型 */
      energyType?: string;
      /** 开始时间 */
      beginTime?: string;
      /** 结束时间 */
      endTime?: string;
    }
  }
}
