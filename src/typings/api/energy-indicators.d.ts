/**
 * Energy Indicators types
 * 能源指标类型定义
 */
declare namespace Api {
  namespace EnergyIndicators {
    /**
     * 能源指标数据项
     */
    interface Item {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: string;
      /** 数据时间 */
      dataTime: string;
      /** 名称 */
      name: string;
      /** 数量 */
      number: number;
      /** 单位 */
      unit: string;
      /** 能源类型 */
      energyType: string;
      /** 指标类型 */
      indicatorsType: string;
      /** 节点名称 */
      nodeName: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 能源指标查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 节点ID */
      nodeId?: string;
      /** 时间类型 */
      timeType?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 名称 */
      name?: string;
      /** 能源类型 */
      energyType?: string;
      /** 指标类型 */
      indicatorsType?: string;
      /** 开始时间 */
      beginTime?: string;
      /** 结束时间 */
      endTime?: string;
    }

    /**
     * 能源指标创建参数
     */
    interface CreateParams {
      /** 节点ID */
      nodeId: string;
      /** 时间类型 */
      timeType: string;
      /** 数据时间 */
      dataTime: string;
      /** 名称 */
      name: string;
      /** 数量 */
      number?: number;
      /** 单位 */
      unit?: string;
      /** 能源类型 */
      energyType?: string;
      /** 指标类型 */
      indicatorsType?: string;
      /** 节点名称 */
      nodeName?: string;
    }

    /**
     * 能源指标更新参数
     */
    interface UpdateParams {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId?: string;
      /** 时间类型 */
      timeType?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 名称 */
      name?: string;
      /** 数量 */
      number?: number;
      /** 单位 */
      unit?: string;
      /** 能源类型 */
      energyType?: string;
      /** 指标类型 */
      indicatorsType?: string;
      /** 节点名称 */
      nodeName?: string;
    }
  }
}
