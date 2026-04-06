/**
 * Peak Valley Analysis types
 * 峰谷分析类型定义
 */
declare namespace Api {
  namespace PeakValley {
    /**
     * 电价时间段
     */
    interface PriceDate {
      /** 主键ID */
      id: number;
      /** 开始日期 */
      beginDate: string;
      /** 结束日期 */
      endDate: string;
      /** 备注 */
      remark: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 电价明细
     */
    interface Price {
      /** 主键ID */
      id: number;
      /** 父级ID */
      parentId: string;
      /** 类型 */
      type: string;
      /** 开始时间 */
      startTime: string;
      /** 结束时间 */
      stopTime: string;
      /** 有效电价 */
      effectivityPrice: number;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 按小时统计结果
     */
    interface HourVO {
      /** 数据列表 */
      dataList: HourDataVO[];
      /** 折线图数据 */
      lineChat: LineChatVO[];
      /** 饼图数据 */
      pieChat: PieChatVO;
    }

    /**
     * 按天统计结果
     */
    interface DayVO {
      /** 电费列表 */
      costList: LineChatVO[];
      /** 功耗列表 */
      powerConsumptionList: LineChatVO[];
      /** 汇总数据 */
      totalVO: DayTotalVO;
    }

    /**
     * 按小时统计数据
     */
    interface HourDataVO {
      /** 时间 */
      time: string;
      /** 尖峰电费 */
      sharpFee: number;
      /** 尖峰功耗 */
      sharpPower: number;
      /** 峰电费 */
      peakFee: number;
      /** 峰功耗 */
      peakPower: number;
      /** 平电费 */
      flatFee: number;
      /** 平功耗 */
      flatPower: number;
      /** 谷电费 */
      valleyFee: number;
      /** 谷功耗 */
      valleyPower: number;
      /** 总电费 */
      totalFee: number;
      /** 总功耗 */
      totalPower: number;
    }

    /**
     * 折线图数据
     */
    interface LineChatVO {
      /** X轴数据 */
      xdata: string;
      /** 尖峰值 */
      ytip: number;
      /** 峰值 */
      ypeak: number;
      /** 平值 */
      yflat: number;
      /** 谷值 */
      ytrough: number;
    }

    /**
     * 饼图数据
     */
    interface PieChatVO {
      /** 峰占比 */
      peak: string;
      /** 平占比 */
      flat: string;
      /** 尖峰占比 */
      tip: string;
      /** 谷占比 */
      trough: string;
    }

    /**
     * 按天统计汇总数据
     */
    interface DayTotalVO {
      /** 峰电费 */
      peakPowerCost: number;
      /** 峰功耗 */
      peakPowerConsumption: number;
      /** 峰功耗占比 */
      peakPowerProportion: number;
      /** 峰电费占比 */
      peakPowerCostProportion: number;
      /** 平电费 */
      flatPowerCost: number;
      /** 平功耗 */
      flatPowerConsumption: number;
      /** 平功耗占比 */
      flatPowerProportion: number;
      /** 平电费占比 */
      flatPowerCostProportion: number;
      /** 尖峰电费 */
      tipPowerCost: number;
      /** 尖峰功耗 */
      tipPowerConsumption: number;
      /** 尖峰功耗占比 */
      tipPowerProportion: number;
      /** 尖峰电费占比 */
      tipPowerCostProportion: number;
      /** 谷电费 */
      troughPowerCost: number;
      /** 谷功耗 */
      troughPowerConsumption: number;
      /** 谷功耗占比 */
      troughPowerProportion: number;
      /** 谷电费占比 */
      troughPowerCostProportion: number;
      /** 总电费 */
      totalCost: number;
      /** 总功耗 */
      totalPowerConsumption: number;
    }

    /**
     * 峰谷分析查询参数
     */
    interface QueryParams {
      /** 模型编码 */
      modelCode: string;
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: string;
      /** 查询时间 */
      queryTime: string;
    }

    /**
     * 电价时间段查询参数
     */
    interface PriceDateSearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 备注 */
      remark?: string;
    }

    /**
     * 电价明细查询参数
     */
    interface PriceSearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 父级ID */
      parentId: string;
      /** 类型 */
      type?: string;
    }

    /**
     * 批量保存电价明细参数
     */
    interface PriceSaveParams {
      /** 父级ID */
      parentId: string;
      /** 电价列表 */
      list: PriceItem[];
    }

    /**
     * 电价项
     */
    interface PriceItem {
      /** 类型 */
      type: string;
      /** 开始时间 */
      startTime: string;
      /** 结束时间 */
      stopTime: string;
      /** 有效电价 */
      effectivityPrice: number;
    }
  }
}
