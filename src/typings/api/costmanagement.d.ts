/**
 * Cost Management types
 */
declare namespace Api {
  namespace CostManagement {
    // 电费录入
    interface ElectricityCost {
      id: string;
      organizationId: number;
      timeType: string; // DAY/MONTH/YEAR
      dataTime: string;
      totalElectricity: number;
      totalFee: number;
      sharpElectricity: number;
      peakElectricity: number;
      flatElectricity: number;
      valleyElectricity: number;
      sharpFee: number;
      peakFee: number;
      flatFee: number;
      valleyFee: number;
      powerFactor: number;
      remark: string;
      createdAt: string;
    }

    interface ElectricityCostSearchParams {
      page: number;
      pageSize: number;
      organizationId?: number;
      timeType?: string;
    }

    interface ElectricityCostListResponse {
      list: ElectricityCost[];
      total: number;
    }

    interface CreateElectricityCostParams {
      organizationId: number;
      timeType: string;
      dataTime: string;
      totalElectricity: number;
      totalFee: number;
      sharpElectricity: number;
      peakElectricity: number;
      flatElectricity: number;
      valleyElectricity: number;
      sharpFee: number;
      peakFee: number;
      flatFee: number;
      valleyFee: number;
      powerFactor: number;
      remark?: string;
    }

    interface UpdateElectricityCostParams extends CreateElectricityCostParams {
      id: string;
    }

    // 成本策略
    interface PriceTactics {
      id: string;
      tacticsNumber: string;
      tacticsName: string;
      energyType: number; // 1电/2水/3气/4热
      isLadder: boolean;
      description: string;
      status: number; // 1启用/2停用
      createdAt: string;
    }

    interface PriceTacticsSearchParams {
      page: number;
      pageSize: number;
      tacticsName?: string;
      energyType?: number;
    }

    interface PriceTacticsListResponse {
      list: PriceTactics[];
      total: number;
    }

    interface CreatePriceTacticsParams {
      tacticsNumber: string;
      tacticsName: string;
      energyType: number;
      isLadder: boolean;
      description?: string;
      status?: number;
    }

    interface UpdatePriceTacticsParams extends CreatePriceTacticsParams {
      id: string;
    }

    // 成本趋势
    interface CostTrendData {
      timeLabel: string;
      totalFee: number;
      electricFee: number;
      waterFee: number;
      gasFee: number;
      heatFee: number;
      electricAmount: number;
      waterAmount: number;
      gasAmount: number;
      heatAmount: number;
    }

    interface CostTrendParams {
      organizationId?: number;
      timeType: string;
      dataTime: string;
    }
  }
}