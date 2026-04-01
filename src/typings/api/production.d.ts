/**
 * Production data types
 */
declare namespace Api {
  namespace Production {
    /** Production data status */
    type ProductionStatus = 1 | 2 | 3; // 1: pending, 2: confirmed, 3: corrected

    /** Production data record */
    interface ProductionData {
      /** record id */
      id: number;
      /** team id */
      teamId: number;
      /** team name */
      teamName?: string;
      /** team code */
      teamCode?: string;
      /** shift schedule id */
      shiftScheduleId: number;
      /** shift type name */
      shiftTypeName?: string;
      /** production date */
      productionDate: string;
      /** product type */
      productType: string;
      /** quantity */
      quantity: number;
      /** unit */
      unit: string;
      /** quality grade */
      qualityGrade: string;
      /** shift attribution id */
      shiftAttributionId: number;
      /** specific consumption (energy/quantity) */
      specificConsumption: number;
      /** status */
      status: ProductionStatus;
      /** source */
      source: string;
      /** remark */
      remark: string;
      /** approved by */
      approvedBy: number;
      /** approved at */
      approvedAt: string;
      /** created at */
      createdAt: string;
      /** created by */
      createdBy: string;
    }

    /** Create production data params */
    interface CreateProductionDataParams {
      teamId: number;
      shiftScheduleId: number;
      productionDate: string;
      productType?: string;
      quantity: number;
      unit?: string;
      qualityGrade?: string;
      remark?: string;
    }

    /** Update production data params */
    interface UpdateProductionDataParams {
      id: number;
      productType?: string;
      quantity?: number;
      unit?: string;
      qualityGrade?: string;
      remark?: string;
    }

    /** Search params */
    interface ProductionSearchParams {
      page?: number;
      pageSize?: number;
      teamId?: number;
      startDate?: string;
      endDate?: string;
      status?: number;
      productType?: string;
    }

    /** Production summary */
    interface ProductionSummary {
      teamId: number;
      teamName: string;
      totalQuantity: number;
      totalEnergy: number;
      avgSpecificConsumption: number;
      shiftCount: number;
      recordCount: number;
    }
  }
}
