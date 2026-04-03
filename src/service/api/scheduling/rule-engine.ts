import { request } from '../../request';

/**
 * Rule Config API
 */

/** get rule config list */
export function fetchGetRuleConfigList(params?: Api.Scheduling.RuleConfigSearchParams) {
  return request<Api.Scheduling.RuleConfigList>({
    url: '/api/v1/scheduling/rule-config/getRuleConfigList',
    method: 'get',
    params
  });
}

/** get all rule configs */
export function fetchGetAllRuleConfigs(ruleType?: number) {
  return request<Api.Scheduling.RuleConfig[]>({
    url: '/api/v1/scheduling/rule-config/getAllRuleConfigs',
    method: 'get',
    params: { ruleType }
  });
}

/** get rule config by id */
export function fetchGetRuleConfigById(id: number) {
  return request<Api.Scheduling.RuleConfig>({
    url: '/api/v1/scheduling/rule-config/getRuleConfigById',
    method: 'get',
    params: { id }
  });
}

/** create rule config */
export function fetchCreateRuleConfig(data: Partial<Api.Scheduling.RuleConfig>) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-config/createRuleConfig',
    method: 'post',
    data
  });
}

/** update rule config */
export function fetchUpdateRuleConfig(data: Partial<Api.Scheduling.RuleConfig> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-config/updateRuleConfig',
    method: 'put',
    data
  });
}

/** delete rule config */
export function fetchDeleteRuleConfig(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-config/deleteRuleConfig',
    method: 'delete',
    params: { id }
  });
}

/** validate config */
export function fetchValidateConfig(data: Api.Scheduling.ValidateConfigParams) {
  return request<Api.Scheduling.ValidateConfigResponse>({
    url: '/api/v1/scheduling/rule-config/validateConfig',
    method: 'post',
    data
  });
}

/**
 * Rule Version API
 */

/** create version */
export function fetchCreateVersion(data: Api.Scheduling.CreateVersionParams) {
  return request<Api.Scheduling.RuleVersion>({
    url: '/api/v1/scheduling/rule-version/createVersion',
    method: 'post',
    data
  });
}

/** activate version */
export function fetchActivateVersion(data: { ruleId: number; versionId: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-version/activateVersion',
    method: 'put',
    data
  });
}

/** rollback version */
export function fetchRollbackVersion(data: { ruleId: number; versionId: number }) {
  return request<Api.Scheduling.RuleVersion>({
    url: '/api/v1/scheduling/rule-version/rollbackVersion',
    method: 'put',
    data
  });
}

/** get version by id */
export function fetchGetVersionById(id: number) {
  return request<Api.Scheduling.RuleVersionResponse>({
    url: '/api/v1/scheduling/rule-version/getVersionById',
    method: 'get',
    params: { id }
  });
}

/** get version history */
export function fetchGetVersionHistory(ruleId: number) {
  return request<Api.Scheduling.RuleVersionResponse[]>({
    url: '/api/v1/scheduling/rule-version/getVersionHistory',
    method: 'get',
    params: { ruleId }
  });
}

/** get current version */
export function fetchGetCurrentVersion(ruleId: number) {
  return request<Api.Scheduling.RuleVersionResponse>({
    url: '/api/v1/scheduling/rule-version/getCurrentVersion',
    method: 'get',
    params: { ruleId }
  });
}

/** compare versions */
export function fetchCompareVersions(v1: number, v2: number) {
  return request<Api.Scheduling.VersionCompareResult>({
    url: '/api/v1/scheduling/rule-version/compareVersions',
    method: 'get',
    params: { v1, v2 }
  });
}

/**
 * Rule Template API
 */

/** get template list */
export function fetchGetTemplateList(params?: Api.Scheduling.RuleTemplateSearchParams) {
  return request<Api.Scheduling.RuleTemplateList>({
    url: '/api/v1/scheduling/rule-template/getTemplateList',
    method: 'get',
    params
  });
}

/** get public templates */
export function fetchGetPublicTemplates(ruleType?: number) {
  return request<Api.Scheduling.RuleTemplate[]>({
    url: '/api/v1/scheduling/rule-template/getPublicTemplates',
    method: 'get',
    params: { ruleType }
  });
}

/** get template by id */
export function fetchGetTemplateById(id: number) {
  return request<Api.Scheduling.RuleTemplate>({
    url: '/api/v1/scheduling/rule-template/getTemplateById',
    method: 'get',
    params: { id }
  });
}

/** create template */
export function fetchCreateTemplate(data: Partial<Api.Scheduling.RuleTemplate>) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-template/createTemplate',
    method: 'post',
    data
  });
}

/** update template */
export function fetchUpdateTemplate(id: number, data: Partial<Api.Scheduling.RuleTemplate>) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-template/updateTemplate',
    method: 'put',
    params: { id },
    data
  });
}

/** delete template */
export function fetchDeleteTemplate(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-template/deleteTemplate',
    method: 'delete',
    params: { id }
  });
}

/** import template */
export function fetchImportTemplate(data: { templateData: string; overwrite?: boolean }) {
  return request<Api.Scheduling.RuleTemplate>({
    url: '/api/v1/scheduling/rule-template/importTemplate',
    method: 'post',
    data
  });
}

/** export template */
export function fetchExportTemplate(id: number) {
  return request<string>({
    url: '/api/v1/scheduling/rule-template/exportTemplate',
    method: 'get',
    params: { id }
  });
}

/** create from template */
export function fetchCreateFromTemplate(params: { templateId: number; ruleCode: string; ruleName: string }) {
  return request<Api.Scheduling.RuleConfig>({
    url: '/api/v1/scheduling/rule-template/createFromTemplate',
    method: 'post',
    params
  });
}

/**
 * Rule Binding API
 */

/** get bindings by factory */
export function fetchGetBindingsByFactory(factoryId: number) {
  return request<Api.Scheduling.RuleBinding[]>({
    url: '/api/v1/scheduling/rule-binding/getBindingsByFactory',
    method: 'get',
    params: { factoryId }
  });
}

/** create binding */
export function fetchCreateBinding(data: Api.Scheduling.CreateBindingParams) {
  return request<Api.Scheduling.RuleBinding>({
    url: '/api/v1/scheduling/rule-binding/createBinding',
    method: 'post',
    data
  });
}

/** delete binding */
export function fetchDeleteBinding(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/rule-binding/deleteBinding',
    method: 'delete',
    params: { id }
  });
}

/** get rule list (alias for compatibility) */
export function fetchGetRuleList(params?: Api.Scheduling.RuleConfigSearchParams) {
  return request<Api.Scheduling.RuleConfigList>({
    url: '/api/v1/scheduling/rule-config/getRuleConfigList',
    method: 'get',
    params
  });
}

/** preview schedule */
export function fetchPreviewSchedule(data: Api.Scheduling.PreviewScheduleParams) {
  return request<Api.Scheduling.SchedulePreview>({
    url: '/api/v1/scheduling/rule-config/previewSchedule',
    method: 'post',
    data
  });
}
