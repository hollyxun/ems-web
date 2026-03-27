declare namespace Api.DataCollection {
  // Manual Entry Types
  type EntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';
  type EntryType = 'new' | 'correct' | 'supplement';

  interface ManualEntry {
    id: number;
    meterId: number;
    entryType: EntryType;
    status: EntryStatus;
    value: number;
    originalValue?: number;
    timestamp: string;
    energyMedium: string;
    orgPath: string;
    reason: string;
    remark?: string;
    submittedAt?: string;
    submittedBy?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewComment?: string;
    validationInfo?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  }

  interface ManualEntryCreate {
    meterId: number;
    entryType: EntryType;
    value: number;
    originalValue?: number;
    timestamp: string;
    energyMedium?: string;
    orgPath?: string;
    reason: string;
    remark?: string;
  }

  interface ManualEntryUpdate {
    id: number;
    value: number;
    reason: string;
    remark?: string;
  }

  interface ManualEntryQuery {
    page?: number;
    pageSize?: number;
    meterId?: number;
    status?: EntryStatus;
    entryType?: EntryType;
    startDate?: string;
    endDate?: string;
  }

  interface ApprovalRequest {
    entryId: number;
    action: 'approve' | 'reject';
    comment?: string;
  }

  interface EntryAuditLog {
    id: number;
    entryId: number;
    action: string;
    oldStatus: string;
    newStatus: string;
    operatorId: string;
    operatorName: string;
    comment: string;
    createdAt: string;
  }

  // Validation Rule Types
  type ValidationSeverity = 1 | 2; // 1=warning, 2=critical

  interface ValidationRule {
    id: number;
    meterId: number;
    energyMedium: string;
    ruleType: string;
    minValue?: number;
    maxValue?: number;
    fluctuationRate?: number;
    timeWindow?: number;
    severity: ValidationSeverity;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface ValidationResult {
    meterId: number;
    timestamp: string;
    value: number;
    ruleType: string;
    severity: ValidationSeverity;
    message: string;
    suggestion: string;
  }

  interface ValidationRuleRequest {
    id?: number;
    meterId: number;
    energyMedium: string;
    ruleType: string;
    minValue?: number;
    maxValue?: number;
    fluctuationRate?: number;
    timeWindow?: number;
    severity: ValidationSeverity;
    enabled: boolean;
  }

  // Data Query Types
  interface RealTimeQueryRequest {
    meterIds: number[];
    startTime: string;
    endTime: string;
    mediaType?: string;
    limit?: number;
  }

  interface DataPoint {
    meterId: number;
    value: number;
    timestamp: string;
    quality: number;
    sourceType?: string;
    energyMedium?: string;
  }

  interface AggregatedPoint {
    timestamp: string;
    value: number;
    count: number;
  }

  interface AggregatedTimeSeries {
    meterId: number;
    interval: string;
    function: string;
    dataPoints: AggregatedPoint[];
  }

  interface MultiMeterStats {
    meterId: number;
    total: number;
    average: number;
    maximum: number;
    minimum: number;
    dataCount: number;
  }

  interface AggregationQueryRequest {
    meterIds: number[];
    startTime: string;
    endTime: string;
    interval?: string;
    aggregation?: string;
    mediaType?: string;
  }
}
