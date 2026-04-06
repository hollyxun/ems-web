/**
 * Product Output types
 * 产品产量类型定义
 */
declare namespace Api {
  namespace ProductOutput {
    /**
     * 产品产量数据项
     */
    interface Item {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId: string;
      /** 节点名称 */
      nodeName: string;
      /** 时间类型 */
      timeType: string;
      /** 数据时间 */
      dataTime: string;
      /** 产品名称 */
      name: string;
      /** 数量 */
      number: number;
      /** 单位 */
      unit: string;
      /** 数据类型 */
      dataType: string;
      /** 产品类型 */
      productType: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
      /** 创建人 */
      createdBy: string;
      /** 更新人 */
      updatedBy: string;
    }

    /**
     * 产品产量查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 节点ID */
      nodeId?: string;
      /** 产品名称 */
      name?: string;
      /** 时间类型 */
      timeType?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 数据类型 */
      dataType?: string;
      /** 产品类型 */
      productType?: string;
      /** 开始时间 */
      beginTime?: string;
      /** 结束时间 */
      endTime?: string;
    }

    /**
     * 产品产量创建参数
     */
    interface CreateParams {
      /** 节点ID */
      nodeId: string;
      /** 节点名称 */
      nodeName?: string;
      /** 时间类型 */
      timeType: string;
      /** 数据时间 */
      dataTime: string;
      /** 产品名称 */
      name: string;
      /** 数量 */
      number: number;
      /** 单位 */
      unit?: string;
      /** 数据类型 */
      dataType: string;
      /** 产品类型 */
      productType?: string;
    }

    /**
     * 产品产量更新参数
     */
    interface UpdateParams {
      /** 主键ID */
      id: number;
      /** 节点ID */
      nodeId?: string;
      /** 节点名称 */
      nodeName?: string;
      /** 时间类型 */
      timeType?: string;
      /** 数据时间 */
      dataTime?: string;
      /** 产品名称 */
      name?: string;
      /** 数量 */
      number?: number;
      /** 单位 */
      unit?: string;
      /** 数据类型 */
      dataType?: string;
      /** 产品类型 */
      productType?: string;
    }

    /**
     * 批量删除参数
     */
    interface BatchDeleteParams {
      /** ID数组 */
      ids: number[];
    }
  }
}
