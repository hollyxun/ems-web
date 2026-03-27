declare namespace Api.Energy {
  /** 能源介质 */
  interface Medium {
    id: number;
    mediumCode: string;
    mediumName: string;
    mediumType: number;
    parentCode?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface MediumSearchParams {
    page?: number;
    pageSize?: number;
    mediumCode?: string;
    mediumName?: string;
    mediumType?: number;
    status?: number;
  }

  interface MediumList {
    list: Medium[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** 介质单位 */
  interface Unit {
    id: number;
    mediumId: number;
    mediumCode: string;
    unitCode: string;
    unitName: string;
    isStandard: boolean;
    conversionFactor: number;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface UnitView extends Unit {
    mediumName: string;
    mediumType: number;
  }

  interface UnitSearchParams {
    mediumId?: number;
    mediumCode?: string;
    status?: number;
  }

  /** 系数折算 */
  interface Coefficient {
    id: number;
    mediumId: number;
    mediumCode: string;
    coefficientType: number;
    coefficientPurpose: string;
    coefficientValue: number;
    unit: string;
    effectiveDate: string;
    expiryDate?: string;
    versionDesc?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface CoefficientView extends Coefficient {
    mediumName: string;
    mediumType: number;
  }

  interface CoefficientSearchParams {
    page?: number;
    pageSize?: number;
    mediumId?: number;
    coefficientType?: number;
    status?: number;
    effectiveDate?: string;
  }

  interface CoefficientList {
    list: CoefficientView[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** 介质台账 */
  interface Ledger {
    id: number;
    mediumCode: string;
    mediumName: string;
    mediumType: number;
    mediumTypeName: string;
    status: number;
    standardUnitCode?: string;
    standardUnitName?: string;
    coalCoefficient?: number;
    carbonCoefficient?: number;
    coefficientPurpose?: string;
  }

  interface LedgerSearchParams {
    page?: number;
    pageSize?: number;
    mediumCode?: string;
    mediumName?: string;
    mediumType?: number;
    status?: number;
    queryDate?: string;
  }

  interface LedgerList {
    list: Ledger[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** SSE实时数据命名空间 */
  namespace Realtime {
    /** SSE事件类型 */
    type SSEEventType = 'data_update' | 'meter_status' | 'alert' | 'heartbeat' | 'connection_ack';

    /** SSE消息结构 */
    interface SSEMessage<T = unknown> {
      eventType: SSEEventType;
      data: T;
      timestamp: string;
    }

    /** 通道范围 */
    interface ChannelScope {
      factoryId: number;
      workshopId?: number;
      channelId: string;
    }

    /** 计量点数据点 */
    interface MeterDataPoint {
      meterId: number;
      value: number;
      timestamp: string;
      energyMedium: string;
    }

    /** 计量点数据批次 */
    interface MeterDataBatch {
      channelId: string;
      meters: MeterDataPoint[];
      windowStart: string;
      windowEnd: string;
    }

    /** SSE连接状态 */
    type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

    /** 连接确认数据 */
    interface ConnectionAckData {
      connectionId: string;
      connectedAt: string;
      message: string;
    }

    /** 心跳数据 */
    interface HeartbeatData {
      timestamp: string;
    }

    /** 告警数据 */
    interface AlertData {
      alertId: number;
      alertType: string;
      meterId: number;
      level: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      value: number;
      threshold: number;
      timestamp: string;
    }
  }
}
