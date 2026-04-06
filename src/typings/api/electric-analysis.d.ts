/**
 * Electric Analysis types
 * 电力分析类型定义
 */
declare namespace Api {
  namespace ElectricLoad {
    /**
     * 负荷分析查询参数
     */
    interface Request {
      /** 节点ID */
      nodeId: string;
      /** 电表ID */
      meterId?: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 时间编码 */
      timeCode: string;
    }

    /**
     * 负荷分析数据项
     */
    interface Item {
      /** 时间编码 */
      timeCode: string;
      /** 图表时间编码 */
      timeCodeChart: string;
      /** 名称 */
      name: string;
      /** 最大值 */
      max: string;
      /** 最小值 */
      min: string;
      /** 平均值 */
      avg: string;
      /** 比率 */
      rate: string;
      /** 当前值 */
      value: string;
    }

    /**
     * 负荷分析详情
     */
    interface Detail {
      /** 最大值 */
      max: string;
      /** 最大值时间 */
      maxTime: string;
      /** 最小值 */
      min: string;
      /** 最小值时间 */
      minTime: string;
      /** 平均值 */
      avg: string;
      /** 比率 */
      rate: string;
    }

    /**
     * 负荷分析响应
     */
    interface Response {
      /** 数据列表 */
      itemList: Item[];
      /** 详情数据 */
      detail: Detail;
    }

    /**
     * 电表选项
     */
    interface MeterOption {
      /** 电表编码 */
      code: string;
      /** 电表名称 */
      label: string;
    }
  }

  namespace PowerFactor {
    /**
     * 功率因数分析查询参数
     */
    interface Request {
      /** 节点ID */
      nodeId: string;
      /** 电表ID */
      meterId?: string;
      /** 时间编码 */
      timeCode: string;
    }

    /**
     * 功率因数数据项
     */
    interface Item {
      /** 时间编码 */
      timeCode: string;
      /** 图表时间编码 */
      timeCodeChart: string;
      /** 名称 */
      name: string;
      /** 当前值 */
      value: string;
    }

    /**
     * 功率因数详情
     */
    interface Detail {
      /** 最大值 */
      max: string;
      /** 最大值时间 */
      maxTime: string;
      /** 最小值 */
      min: string;
      /** 最小值时间 */
      minTime: string;
      /** 平均值 */
      avg: string;
    }

    /**
     * 功率因数分析响应
     */
    interface Response {
      /** 数据列表 */
      itemList: Item[];
      /** 详情数据 */
      detail: Detail;
    }
  }

  namespace ThreePhase {
    /**
     * 三相不平衡分析查询参数
     */
    interface Request {
      /** 节点ID */
      nodeId: string;
      /** 电表ID */
      meterId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 时间编码 */
      timeCode: string;
      /** 请求类型：0=电压，1=电流 */
      requestType: '0' | '1';
    }

    /**
     * 三相不平衡数据项
     */
    interface Item {
      /** 时间编码 */
      timeCode: string;
      /** 图表时间编码 */
      timeCodeChart: string;
      /** 名称 */
      name: string;
      /** A相值 */
      phaseA: string;
      /** B相值 */
      phaseB: string;
      /** C相值 */
      phaseC: string;
      /** 不平衡率 */
      unbalanceRate: string;
    }

    /**
     * 三相不平衡详情
     */
    interface Detail {
      /** 最大不平衡度 */
      maxUnbalance: string;
      /** 最大不平衡度时间 */
      maxUnbalanceTime: string;
      /** 平均不平衡度 */
      avgUnbalance: string;
    }

    /**
     * 三相不平衡分析响应
     */
    interface Response {
      /** 数据列表 */
      itemList: Item[];
      /** 详情数据 */
      detail: Detail;
    }
  }

  namespace HistoricalData {
    /**
     * 历史数据查询参数
     */
    interface Request {
      /** 指标ID */
      indexId: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: 'DAY' | 'HOUR';
    }

    /**
     * 历史数据项
     */
    interface Item {
      /** 数据时间 */
      dataTime: string;
      /** 指标ID */
      indexId: string;
      /** 指标名称 */
      indexName: string;
      /** 数值 */
      value: string;
    }

    /**
     * 历史数据响应
     */
    interface Response {
      /** 指标ID */
      indexId: string;
      /** 指标名称 */
      indexName: string;
      /** 数据列表 */
      data: Item[];
    }
  }
}