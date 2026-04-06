/**
 * Key Equipment types
 * 重点设备能耗分析类型定义
 */
declare namespace Api {
  namespace KeyEquipment {
    /**
     * 日能耗数据
     */
    interface DailyData {
      /** 主键ID */
      id: number;
      /** 指标ID */
      indexId: string;
      /** 指标名称 */
      indexName: string;
      /** 数值 */
      value: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: string;
      /** 时间编码 */
      timeCode: string;
      /** 单位ID */
      unitId: string;
      /** 小时值0 */
      value0: number;
      /** 小时值1 */
      value1: number;
      /** 小时值2 */
      value2: number;
      /** 小时值3 */
      value3: number;
      /** 小时值4 */
      value4: number;
      /** 小时值5 */
      value5: number;
      /** 小时值6 */
      value6: number;
      /** 小时值7 */
      value7: number;
      /** 小时值8 */
      value8: number;
      /** 小时值9 */
      value9: number;
      /** 小时值10 */
      value10: number;
      /** 小时值11 */
      value11: number;
      /** 小时值12 */
      value12: number;
      /** 小时值13 */
      value13: number;
      /** 小时值14 */
      value14: number;
      /** 小时值15 */
      value15: number;
      /** 小时值16 */
      value16: number;
      /** 小时值17 */
      value17: number;
      /** 小时值18 */
      value18: number;
      /** 小时值19 */
      value19: number;
      /** 小时值20 */
      value20: number;
      /** 小时值21 */
      value21: number;
      /** 小时值22 */
      value22: number;
      /** 小时值23 */
      value23: number;
    }

    /**
     * 月能耗数据
     */
    interface MonthlyData {
      /** 主键ID */
      id: number;
      /** 指标ID */
      indexId: string;
      /** 指标名称 */
      indexName: string;
      /** 数值 */
      value: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: string;
      /** 时间编码 */
      timeCode: string;
      /** 单位ID */
      unitId: string;
      /** 数量 */
      count: number;
      /** 日值1-31 */
      value1: number;
      value2: number;
      value3: number;
      value4: number;
      value5: number;
      value6: number;
      value7: number;
      value8: number;
      value9: number;
      value10: number;
      value11: number;
      value12: number;
      value13: number;
      value14: number;
      value15: number;
      value16: number;
      value17: number;
      value18: number;
      value19: number;
      value20: number;
      value21: number;
      value22: number;
      value23: number;
      value24: number;
      value25: number;
      value26: number;
      value27: number;
      value28: number;
      value29: number;
      value30: number;
      value31: number;
    }

    /**
     * 年能耗数据
     */
    interface YearData {
      /** 主键ID */
      id: number;
      /** 指标ID */
      indexId: string;
      /** 指标名称 */
      indexName: string;
      /** 数值 */
      value: string;
      /** 数据时间 */
      dataTime: string;
      /** 时间类型 */
      timeType: string;
      /** 时间编码 */
      timeCode: string;
      /** 单位ID */
      unitId: string;
      /** 月值1-12 */
      value1: number;
      value2: number;
      value3: number;
      value4: number;
      value5: number;
      value6: number;
      value7: number;
      value8: number;
      value9: number;
      value10: number;
      value11: number;
      value12: number;
    }

    /**
     * 设备信息
     */
    interface Device {
      /** 主键ID */
      id: number;
      /** 设备名称 */
      name: string;
      /** 设备编码 */
      code: string;
      /** 设备类型 */
      type: string;
      /** 设备状态 */
      status: string;
      /** 计量点ID */
      pointId: string;
      /** 计量点名称 */
      pointName: string;
    }

    /**
     * 查询参数
     */
    interface QueryParams {
      /** 指标编码 */
      indexCode?: string;
      /** 指标ID */
      indexId?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 开始时间 */
      beginTime?: string;
      /** 结束时间 */
      endTime?: string;
      /** 时间类型 */
      timeType?: string;
      /** 能源类型 */
      energyType?: string;
    }
  }
}