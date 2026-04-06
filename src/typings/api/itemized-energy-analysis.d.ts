/**
 * Itemized Energy Analysis types
 * 分项能耗分析类型定义
 */
declare namespace Api {
  namespace ItemizedEnergyAnalysis {
    /**
     * 分项能耗数据项
     */
    interface Item {
      /** 节点ID */
      nodeId: string;
      /** 节点名称 */
      nodeName: string;
      /** 总值 */
      total: number;
      /** 分项值0 */
      value0?: number;
      /** 分项值1 */
      value1?: number;
      /** 分项值2 */
      value2?: number;
      /** 分项值3 */
      value3?: number;
      /** 分项值4 */
      value4?: number;
      /** 分项值5 */
      value5?: number;
      /** 分项值6 */
      value6?: number;
      /** 分项值7 */
      value7?: number;
      /** 分项值8 */
      value8?: number;
      /** 分项值9 */
      value9?: number;
      /** 分项值10 */
      value10?: number;
      /** 分项值11 */
      value11?: number;
      /** 分项值12 */
      value12?: number;
      /** 分项值13 */
      value13?: number;
      /** 分项值14 */
      value14?: number;
      /** 分项值15 */
      value15?: number;
      /** 分项值16 */
      value16?: number;
      /** 分项值17 */
      value17?: number;
      /** 分项值18 */
      value18?: number;
      /** 分项值19 */
      value19?: number;
      /** 分项值20 */
      value20?: number;
      /** 分项值21 */
      value21?: number;
      /** 分项值22 */
      value22?: number;
      /** 分项值23 */
      value23?: number;
      /** 分项值24 */
      value24?: number;
      /** 分项值25 */
      value25?: number;
      /** 分项值26 */
      value26?: number;
      /** 分项值27 */
      value27?: number;
      /** 分项值28 */
      value28?: number;
      /** 分项值29 */
      value29?: number;
      /** 分项值30 */
      value30?: number;
    }

    /**
     * 分项能耗分析响应
     */
    interface Response {
      /** 总值 */
      total: string;
      /** 最大值 */
      max: string;
      /** 最小值 */
      min: string;
      /** 平均值 */
      avg: string;
      /** 单位 */
      unit: string;
      /** 数据列表 */
      dataList: Item[];
    }

    /**
     * 分项能耗分析查询参数
     */
    interface Request {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: 'DAY' | 'MONTH' | 'YEAR';
      /** 数据时间 */
      dataTime: string;
      /** 能源类型 */
      energyType?: string;
    }
  }
}
