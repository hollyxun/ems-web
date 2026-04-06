/**
 * Benchmark types
 * 标杆管理类型定义
 */
declare namespace Api {
  namespace Benchmark {
    /**
     * 标杆数据项
     */
    interface Item {
      /** 主键ID */
      id: number;
      /** 标杆编码 */
      code: string;
      /** 标杆类型 */
      type: string;
      /** 等级 */
      grade: string;
      /** 标杆值 */
      value: string;
      /** 国标编号 */
      nationalNum: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 标杆编码（模糊查询） */
      code?: string;
      /** 标杆类型 */
      type?: string;
      /** 等级 */
      grade?: string;
    }

    /**
     * 创建参数
     */
    interface CreateParams {
      /** 标杆编码 */
      code: string;
      /** 标杆类型 */
      type: string;
      /** 等级 */
      grade?: string;
      /** 标杆值 */
      value?: string;
      /** 国标编号 */
      nationalNum?: string;
    }

    /**
     * 更新参数
     */
    interface UpdateParams {
      /** 主键ID */
      id: number;
      /** 标杆编码 */
      code?: string;
      /** 标杆类型 */
      type?: string;
      /** 等级 */
      grade?: string;
      /** 标杆值 */
      value?: string;
      /** 国标编号 */
      nationalNum?: string;
    }
  }
}