declare namespace Api {
  namespace Audit {
    /** 审计日志项 */
    interface AuditLogItem {
      id: number;
      userId: number;
      username: string;
      action: string;
      category: string;
      module: string;
      targetType: string;
      targetId: string;
      targetName: string;
      requestMethod: string;
      requestPath: string;
      requestBody: string;
      responseStatus: number;
      responseBody: string;
      latencyMs: number;
      ipAddress: string;
      userAgent: string;
      status: string;
      errorMessage: string;
      details: string;
      createdAt: string;
      retentionDays: number;
    }

    /** 审计日志搜索参数 */
    interface AuditLogSearchParams {
      page: number;
      pageSize: number;
      userId?: number;
      username?: string;
      action?: string;
      category?: string;
      module?: string;
      startTime?: string;
      endTime?: string;
      ipAddress?: string;
      status?: string;
      requestPath?: string;
    }

    /** 审计统计请求 */
    interface AuditStatisticsRequest {
      startTime?: string;
      endTime?: string;
      module?: string;
      category?: string;
    }

    /** 审计统计结果 */
    interface AuditStatisticsResult {
      totalLogs: number;
      successLogs: number;
      failedLogs: number;
      byCategory: Record<string, number>;
      byAction: Record<string, number>;
      byModule: Record<string, number>;
      topUsers: Array<{ userId: number; username: string; count: number }>;
      hourlyDistribution: Array<{ hour: number; count: number }>;
    }

    /** 清理请求 */
    interface CleanupRequest {
      retentionDays: number;
      dryRun: boolean;
    }

    /** 清理结果 */
    interface CleanupResult {
      deletedCount: number;
      retentionDays: number;
    }

    /** 分类选项 */
    interface CategoryOption {
      value: string;
      label: string;
    }

    /** 操作类型选项 */
    interface ActionOption {
      value: string;
      label: string;
    }
  }
}
