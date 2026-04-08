/**
 * Knowledge types
 */
declare namespace Api {
  namespace Knowledge {
    interface Item {
      id: string;
      title: string;
      energyType: number; // 0-电 1-水 2-天然气 3-蒸汽
      content: string;
      createdAt: string;
      files?: File[];
    }

    interface File {
      id: string;
      knowledgeBaseId: number;
      url: string;
      fileName: string;
      fileSize: number;
      createdAt: string;
    }

    interface SearchParams {
      page: number;
      pageSize: number;
      title?: string;
      energyType?: number;
    }

    type ListResponse = Api.Common.PageResult<Item>;

    interface CreateParams {
      title: string;
      energyType: number;
      content: string;
      urls?: string[];
    }

    interface UpdateParams extends CreateParams {
      id: string;
    }
  }
}
