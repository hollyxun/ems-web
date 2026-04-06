/**
 * Alarm types
 */
declare namespace Api {
  namespace AlarmHistory {
    interface AlarmHistoryItem {
      id: string;
      indexCode: string;
      indexName: string;
      alarmItemId: string;
      limitingValue: number;
      alarmValue: number;
      beginTime: string;
      endTime: string;
      duration: number;
      content: string;
      alarmCode: string;
      handleStatus: string; // 0-未处理 1-已确认 2-已处理
      handler: string;
      handleTime: string;
      handleRemark: string;
      createdAt: string;
    }

    interface SearchParams {
      page: number;
      pageSize: number;
      indexCode?: string;
      nodeId?: string;
      handleStatus?: string;
      beginTime?: string;
      endTime?: string;
      alarmLevel?: string;
    }

    interface ListResponse {
      list: AlarmHistoryItem[];
      total: number;
    }

    interface HandleParams {
      id: string;
      handleRemark: string;
    }

    interface BatchHandleParams {
      ids: string[];
      handleRemark: string;
    }
  }

  namespace AlarmItem {
    interface Item {
      id: string;
      indexCode: string;
      startStop: string; // 1-启动 2-停止
      timeSlot: string;
      limitType: string; // 1-上限 2-下限
      limitVal: string;
      alarmLevel: string;
      alarmCode: string;
      nodeId: string;
      pointId: string;
      createdAt: string;
    }

    interface SearchParams {
      page: number;
      pageSize: number;
      indexCode?: string;
      nodeId?: string;
      pointId?: string;
      startStop?: string;
    }

    interface ListResponse {
      list: Item[];
      total: number;
    }

    interface CreateParams {
      indexCode: string;
      nodeId: string;
      pointId: string;
      timeSlot: string;
      limitType: string;
      limitVal: string;
      alarmLevel: string;
    }

    interface UpdateParams extends CreateParams {
      id: string;
    }
  }

  namespace AlarmLimitType {
    interface Item {
      id: number;
      limitName: string;
      limitCode: string;
      colorNumber: string;
      comparatorOperator: string;
      alarmType: string;
      sort: number;
      createdAt: string;
    }

    interface SearchParams {
      page: number;
      pageSize: number;
      limitName?: string;
    }

    interface ListResponse {
      list: Item[];
      total: number;
    }

    interface CreateParams {
      limitName: string;
      limitCode: string;
      colorNumber: string;
      comparatorOperator: string;
      alarmType: string;
      sort: number;
    }

    interface UpdateParams extends CreateParams {
      id: number;
    }
  }
}