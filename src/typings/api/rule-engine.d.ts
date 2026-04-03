declare namespace Api.Scheduling {
  // ==================== Rule Config ====================

  /** 规则配置 */
  interface RuleConfig {
    id: number;
    ruleCode: string;
    ruleName: string;
    ruleType: number;
    category?: string;
    configSchema: string;
    defaultConfig: string;
    description?: string;
    validatorExpr?: string;
    status: number;
    createdAt?: string;
    updatedAt?: string;
  }

  interface RuleConfigSearchParams {
    page?: number;
    pageSize?: number;
    ruleCode?: string;
    ruleName?: string;
    ruleType?: number;
    category?: string;
    status?: number;
  }

  interface RuleConfigList {
    list: RuleConfig[];
    total: number;
    page: number;
    pageSize: number;
  }

  // ==================== Rule Version ====================

  /** 规则版本 */
  interface RuleVersion {
    id: number;
    ruleId: number;
    versionNo: number;
    versionName: string;
    configValue: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    isActive: boolean;
    changeReason?: string;
    createdAt?: string;
    createdBy?: string;
  }

  interface RuleVersionResponse extends RuleVersion {
    ruleCode: string;
    ruleName: string;
  }

  interface CreateVersionParams {
    ruleId: number;
    versionName?: string;
    configValue: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    changeReason?: string;
  }

  interface VersionCompareResult {
    version1: {
      id: number;
      versionNo: number;
      versionName: string;
      config: Record<string, unknown>;
    };
    version2: {
      id: number;
      versionNo: number;
      versionName: string;
      config: Record<string, unknown>;
    };
    diff: VersionDiff[];
  }

  interface VersionDiff {
    field: string;
    type: 'added' | 'removed' | 'modified';
    oldValue?: unknown;
    newValue?: unknown;
  }

  // ==================== Rule Template ====================

  /** 规则模板 */
  interface RuleTemplate {
    id: number;
    templateCode: string;
    templateName: string;
    ruleType: number;
    configValue: string;
    applicableScope?: string;
    description?: string;
    isPublic: boolean;
    factoryId?: number;
    createdAt?: string;
  }

  interface RuleTemplateSearchParams {
    page?: number;
    pageSize?: number;
    templateCode?: string;
    templateName?: string;
    ruleType?: number;
    isPublic?: boolean;
  }

  interface RuleTemplateList {
    list: RuleTemplate[];
    total: number;
    page: number;
    pageSize: number;
  }

  // ==================== Validate ====================

  interface ValidateConfigParams {
    ruleType: number;
    configValue: string;
    ruleId?: number;
  }

  interface ValidateConfigResponse {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    checkedAt?: string;
  }

  interface ValidationError {
    field: string;
    message: string;
    code?: string;
  }

  interface ValidationWarning {
    field: string;
    message: string;
    code?: string;
  }

  // ==================== Rule Binding ====================

  interface RuleBinding {
    id: number;
    ruleId: number;
    ruleName: string;
    ruleType: number;
    factoryId: number;
    bindingScope: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
  }

  interface CreateBindingParams {
    ruleId: number;
    factoryId: number;
    bindingScope?: string;
    description?: string;
  }

  // ==================== Schedule Preview ====================

  interface PreviewScheduleParams {
    ruleType: number;
    configValue: string;
    factoryId: number;
    previewDays?: number;
  }

  interface SchedulePreview {
    factoryId: number;
    previewDays: number;
    generatedShifts: GeneratedShift[];
    generatedDates: GeneratedDate[];
    naturalMonthMapping: NaturalMonthMapping[];
  }

  interface GeneratedShift {
    date: string;
    teamId: number;
    teamName: string;
    shiftId: number;
    shiftName: string;
    shiftType: string;
    startTime: string;
    endTime: string;
  }

  interface GeneratedDate {
    date: string;
    isWorkDay: boolean;
    cycleDay: number;
  }

  interface NaturalMonthMapping {
    cycleDate: string;
    naturalMonth: string;
    boundaryType: 'same_year' | 'cross_year';
  }

  // ==================== Rule Execution ====================

  interface RuleExecutionResult {
    success: boolean;
    output: Record<string, unknown>;
    errors: string[];
    duration: number;
  }

  // ==================== Rule Type Constants ====================

  type RuleType = 1 | 2 | 3;
  const RuleType = {
    SchedulingPattern: 1 as const,
    CalendarMapping: 2 as const,
    RotationAlgorithm: 3 as const
  };

  type ChangeType = 1 | 2 | 3 | 4;
  const ChangeType = {
    Create: 1 as const,
    Modify: 2 as const,
    Derive: 3 as const,
    Rollback: 4 as const
  };
}
