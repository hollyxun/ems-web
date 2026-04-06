/**
 * Spikes and Valleys types
 * 尖峰平谷方案管理类型定义
 */
declare namespace Api {
  namespace SpikesAndValleys {
    /**
     * 方案基础信息
     */
    interface Scheme {
      /** 主键ID */
      id: number;
      /** 方案名称 */
      schemeName: string;
      /** 执行时间 */
      executeTime: string;
      /** 类型 */
      type: string;
      /** 备注 */
      remark: string;
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
     * 时段明细
     */
    interface Item {
      /** 主键ID */
      id: number;
      /** 方案ID */
      schemeId: number;
      /** 时段类型 */
      time: string;
      /** 电价 */
      electrovalency: number;
      /** 开始时间 */
      startTime: string;
      /** 结束时间 */
      endTime: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 方案VO（包含时段明细）
     */
    interface SchemeVO {
      /** 主键ID */
      id: number;
      /** 方案名称 */
      schemeName: string;
      /** 执行时间 */
      executeTime: string;
      /** 类型 */
      type: string;
      /** 备注 */
      remark: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
      /** 创建人 */
      createdBy: string;
      /** 更新人 */
      updatedBy: string;
      /** 时段明细列表 */
      itemList: Item[];
    }

    /**
     * 方案查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 方案名称 */
      schemeName?: string;
      /** 类型 */
      type?: string;
    }

    /**
     * 时段创建项
     */
    interface ItemCreate {
      /** 时段类型 */
      time: string;
      /** 电价 */
      electrovalency: number;
      /** 开始时间 */
      startTime: string;
      /** 结束时间 */
      endTime: string;
    }

    /**
     * 方案创建参数
     */
    interface CreateParams {
      /** 方案名称 */
      schemeName: string;
      /** 执行时间 */
      executeTime: string;
      /** 类型 */
      type: string;
      /** 备注 */
      remark?: string;
      /** 时段明细列表 */
      itemList: ItemCreate[];
    }

    /**
     * 方案更新参数
     */
    interface UpdateParams {
      /** 主键ID */
      id: number;
      /** 方案名称 */
      schemeName: string;
      /** 执行时间 */
      executeTime: string;
      /** 类型 */
      type: string;
      /** 备注 */
      remark?: string;
      /** 时段明细列表 */
      itemList: ItemCreate[];
    }
  }
}
