declare namespace Api.PowerDistribution {
  /** PowerDistribution 配电室 */
  interface PowerDistribution {
    id: number;
    name: string;
    code: string;
    principals?: string;
    principalsTel?: string;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  }

  /** PowerDistributionSearchParams 配电室搜索参数 */
  interface PowerDistributionSearchParams {
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    principals?: string;
    principalsTel?: string;
  }

  /** PowerDistributionList 配电室列表响应 */
  interface PowerDistributionList {
    list: PowerDistribution[];
    total: number;
    page: number;
    pageSize: number;
  }
}
