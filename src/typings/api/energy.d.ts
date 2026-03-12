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
}
