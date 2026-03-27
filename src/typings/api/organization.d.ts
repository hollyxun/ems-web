declare namespace Api {
  /**
   * namespace Organization
   *
   * backend api module: "organization"
   */
  namespace Organization {
    /** Organization type constants */
    type OrgType = 1 | 2 | 3 | 4; // 1: Group, 2: Factory, 3: Workshop, 4: Team

    /** Organization item */
    interface OrganizationItem {
      /** record id */
      id: number;
      /** parent organization id (0 means root) */
      parentId: number;
      /** materialized path (e.g., /1/2/3/) */
      path: string;
      /** organization name */
      name: string;
      /** organization code (unique) */
      code: string;
      /** level (1: Group, 2: Factory, 3: Workshop, 4: Team) */
      level: number;
      /** organization type */
      type: OrgType;
      /** sort order */
      sort: number;
      /** status (1: enabled, 2: disabled) */
      status: number;
      /** children organizations */
      children?: OrganizationItem[];
      /** created at */
      createdAt?: string;
      /** updated at */
      updatedAt?: string;
    }

    /** Create organization request */
    interface CreateRequest {
      /** parent organization id (0 for root) */
      parentId: number;
      /** organization name */
      name: string;
      /** organization code (unique) */
      code: string;
      /** organization type */
      type: OrgType;
      /** sort order */
      sort?: number;
    }

    /** Update organization request */
    interface UpdateRequest {
      /** organization id */
      id: number;
      /** organization name */
      name?: string;
      /** sort order */
      sort?: number;
      /** status (1: enabled, 2: disabled) */
      status?: number;
    }

    /** Search organization request */
    interface SearchRequest {
      /** page number */
      page: number;
      /** page size */
      pageSize: number;
      /** organization name (fuzzy search) */
      name?: string;
      /** organization code */
      code?: string;
      /** organization type */
      type?: OrgType;
      /** status (1: enabled, 2: disabled) */
      status?: number;
      /** parent organization id */
      parentId?: number;
    }

    /** Organization list response */
    type OrganizationList = Common.PageResult<OrganizationItem>;
  }
}
