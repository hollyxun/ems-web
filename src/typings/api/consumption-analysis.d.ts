/**
 * Consumption Analysis types
 * 能耗分析类型定义
 */
declare namespace Api {
  namespace ConsumptionAnalysis {
    /**
     * 能耗分析数据项
     */
    interface ConsumptionAnalysisData {
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
     * 图表数据
     */
    interface ChartData {
      /** X轴数据 */
      xData: string;
      /** 当前值 */
      yValue: number;
      /** 对比值 */
      yCompareValue: number;
      /** 环比值 */
      yQOQ: number;
    }

    /**
     * 能源占比
     */
    interface EnergyProportion {
      /** 能源编码 */
      energyNo: string;
      /** 能源名称 */
      energyName: string;
      /** 数量 */
      count: number;
      /** 占比百分比 */
      percentage: number;
    }

    /**
     * 能耗分析响应
     */
    interface ConsumptionAnalysisVO {
      /** 数据列表 */
      dataList: ConsumptionAnalysisData[];
      /** 图表数据列表 */
      chartDataList: ChartData[];
      /** 能源占比 */
      energyProportion: EnergyProportion[];
      /** 同比数据 */
      tongbi: ConsumptionAnalysisData;
      /** 环比数据 */
      huanbi: ConsumptionAnalysisData;
      /** 计划数量 */
      planCount: number;
      /** 产量数量 */
      prodCount: number;
    }

    /**
     * 能耗排名数据
     */
    interface RankingEnergyData {
      /** 节点ID */
      nodeId: string;
      /** 节点名称 */
      nodeName: string;
      /** 能源类型编码 */
      energyTypeNo: string;
      /** 能源类型名称 */
      energyTypeName: string;
      /** 能耗值 */
      energyConsumption: number;
    }

    /**
     * 排名数据响应
     */
    interface RankingDataVO {
      /** 节点ID */
      nodeId: string;
      /** 节点名称 */
      nodeName: string;
      /** 能耗数据 */
      data: RankingEnergyData[];
    }

    /**
     * 产品单耗分析数据
     */
    interface ProductEnergyAnalysisData {
      /** 日期时间 */
      dateTime: string;
      /** 产品数量 */
      productCount: number;
      /** 能耗数量 */
      energyCount: number;
      /** 平均值 */
      average: number;
    }

    /**
     * 产品单耗分析响应
     */
    interface ProductEnergyAnalysisVO {
      /** 图表数据 */
      chart: ProductEnergyAnalysisData[];
      /** 平均能耗 */
      averageEnergy: number;
      /** 总能耗 */
      totalEnergy: number;
      /** 总产量 */
      totalProduct: number;
      /** 同比 */
      tongbi: number;
      /** 环比 */
      huanbi: number;
    }

    /**
     * 科室能耗分析查询参数
     */
    interface GetByAreaParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime?: string;
      /** 能源类型 */
      energyType: string;
      /** 分析类型 */
      analysisType?: 'YOY' | 'QOQ';
    }

    /**
     * 科室能耗排名查询参数
     */
    interface GetByDepartmentParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
    }

    /**
     * 综合能耗查询参数
     */
    interface GetComprehensiveEnergyParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
      /** 能源类型 */
      energyType?: string;
    }

    /**
     * 同比环比查询参数
     */
    interface GetYOYParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
      /** 能源类型 */
      energyType?: string;
    }

    /**
     * 能耗排名查询参数
     */
    interface GetEnergyRankingParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
    }

    /**
     * 计划产量查询参数
     */
    interface GetPlanAndProdCountParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
      /** 能源类型 */
      energyType: string;
    }

    /**
     * 产品单耗查询参数
     */
    interface GetProdEnergyParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
      /** 能源类型 */
      energyType: string;
      /** 产品类型 */
      prodType?: string;
    }
  }
}
