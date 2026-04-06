/**
 * Gateway Setting types
 * 网关设置类型定义
 */
declare namespace Api {
  namespace GatewaySetting {
    /**
     * 网关配置数据项
     */
    interface Item {
      /** 主键ID */
      id: number;
      /** 网关编号 */
      gatewayNum: string;
      /** 网关名称 */
      gatewayName: string;
      /** 规格型号 */
      specsModel: string;
      /** 安装位置 */
      installLocation: string;
      /** IP地址 */
      ipAdd: string;
      /** 运行状态 */
      runStatus: string;
      /** 心跳时间 */
      hbtTime: string;
      /** 设备数量 */
      deviceNum: number;
      /** PT数量 */
      ptNum: number;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 网关配置查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 网关编号 */
      gatewayNum?: string;
      /** 网关名称 */
      gatewayName?: string;
      /** 运行状态 */
      runStatus?: string;
      /** 安装位置 */
      installLocation?: string;
    }

    /**
     * 网关配置创建参数
     */
    interface CreateParams {
      /** 网关编号 */
      gatewayNum: string;
      /** 网关名称 */
      gatewayName: string;
      /** 规格型号 */
      specsModel?: string;
      /** 安装位置 */
      installLocation?: string;
      /** IP地址 */
      ipAdd?: string;
      /** 运行状态 */
      runStatus?: string;
      /** 心跳时间 */
      hbtTime?: string;
      /** 设备数量 */
      deviceNum?: number;
      /** PT数量 */
      ptNum?: number;
    }

    /**
     * 网关配置更新参数
     */
    interface UpdateParams {
      /** 主键ID */
      id: number;
      /** 网关编号 */
      gatewayNum?: string;
      /** 网关名称 */
      gatewayName?: string;
      /** 规格型号 */
      specsModel?: string;
      /** 安装位置 */
      installLocation?: string;
      /** IP地址 */
      ipAdd?: string;
      /** 运行状态 */
      runStatus?: string;
      /** 心跳时间 */
      hbtTime?: string;
      /** 设备数量 */
      deviceNum?: number;
      /** PT数量 */
      ptNum?: number;
    }
  }
}