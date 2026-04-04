declare namespace Api {
  namespace BranchAnalysis {
    /**
     * 支路用能分析查询参数
     */
    interface BranchAnalysisQuery {
      /** 节点ID */
      nodeId: string;
      /** 时间字符串（YYYY-MM-DD/YYYY-MM/YYYY） */
      dataTime: string;
      /** 时间类型（day/month/year） */
      timeType: 'day' | 'month' | 'year';
      /** 能源类型（electric/water/gas/heat） */
      energyType?: string;
    }

    /**
     * 支路用能分析列表请求（分页）
     */
    interface BranchAnalysisListRequest {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 节点ID */
      nodeId?: string;
      /** 时间类型 */
      timeType?: 'day' | 'month' | 'year';
      /** 能源类型 */
      energyType?: string;
      /** 时间字符串 */
      dataTime?: string;
    }

    /**
     * 支路用能分析导出请求
     */
    interface BranchAnalysisExportRequest extends BranchAnalysisQuery {
      /** 导出格式 */
      exportFormat?: 'excel' | 'pdf';
    }

    /**
     * 支路用能分析结果
     */
    interface BranchAnalysisVO {
      /** 单位 */
      unit: string;
      /** 总能耗 */
      total: number;
      /** 节点ID */
      nodeId: string;
      /** 节点名称 */
      nodeName: string;
      /** 时间序列值数组 */
      values: number[];
    }

    /**
     * 时间类型选项
     */
    interface TimeTypeOption {
      value: 'day' | 'month' | 'year';
      label: string;
    }

    /**
     * 能源类型选项
     */
    interface EnergyTypeOption {
      value: string;
      label: string;
    }
  }
}