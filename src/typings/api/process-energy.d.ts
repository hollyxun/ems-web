declare namespace Api {
  namespace ProcessEnergy {
    // ============ 通用类型 ============

    /** 时间类型 */
    type TimeType = 'hour' | 'day' | 'month';

    /** 图表数据点 */
    interface ChartData {
      indexId: string;
      indexName: string;
      unitId: string;
      value: number;
      dataTime: string;
      timeType: string;
      timeCode: string;
    }

    // ============ 日工序能耗 ============

    /** 日工序能耗查询参数 */
    interface DailyQuery {
      indexCode: string;
      dataTime: string;
      timeType?: TimeType;
      energyType?: string;
    }

    /** 图表查询参数 */
    interface ChartQuery {
      indexId: string;
      dataTime: string;
      timeType?: TimeType;
      energyType?: string;
    }

    /** 日工序能耗数据（24小时维度） */
    interface DailyList {
      indexId: string;
      indexName: string;
      unitId: string;
      timeType: string;
      value0: number;
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
    }

    // ============ 月工序能耗 ============

    /** 月工序能耗查询参数 */
    interface MonthlyQuery {
      indexCode: string;
      dataTime: string;
      timeType?: TimeType;
      energyType?: string;
    }

    /** 月工序能耗数据（31日维度） */
    interface MonthlyList {
      indexId: string;
      indexName: string;
      unitId: string;
      timeType: string;
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

    // ============ 年工序能耗 ============

    /** 年工序能耗查询参数 */
    interface YearQuery {
      indexCode: string;
      dataTime: string;
      timeType?: TimeType;
      energyType?: string;
    }

    /** 年工序能耗数据（12月维度） */
    interface YearList {
      indexId: string;
      indexName: string;
      unitId: string;
      timeType: string;
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
  }
}