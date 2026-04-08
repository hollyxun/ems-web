/**
 * Saving types
 */
declare namespace Api {
  namespace Saving {
    namespace Program {
      interface Item {
        id: number;
        plan: string;
        liablePerson: string;
        completionTime: string;
        implementationPlan: string;
        currentWork: string;
        savingAmount: string;
        remark: string;
        createdAt: string;
      }

      interface SearchParams {
        page: number;
        pageSize: number;
        plan?: string;
      }

      type ListResponse = Api.Common.PageResult<Item>;

      interface CreateParams {
        plan: string;
        liablePerson: string;
        completionTime: string;
        implementationPlan: string;
        currentWork: string;
        savingAmount: string;
        remark?: string;
      }

      interface UpdateParams extends CreateParams {
        id: number;
      }
    }

    namespace Policy {
      interface Item {
        id: number;
        title: string;
        type: string;
        dept: string;
        issuingTime: string;
        url: string;
        createdAt: string;
      }

      interface SearchParams {
        page: number;
        pageSize: number;
        title?: string;
        type?: string;
      }

      type ListResponse = Api.Common.PageResult<Item>;

      interface CreateParams {
        title: string;
        type: string;
        dept: string;
        issuingTime: string;
        url: string;
      }

      interface UpdateParams extends CreateParams {
        id: number;
      }
    }
  }
}
