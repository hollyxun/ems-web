import { request } from '../request';

// ============ 报表模块 ============

/**
 * 获取班组能耗日报
 * @param params 查询参数
 */
export function fetchDailyReport(params: Api.Energy.Report.DailyReportParams) {
  return request<Api.Energy.Report.DailyReportData>({
    url: '/api/v1/energy/report/daily',
    method: 'get',
    params
  });
}

/**
 * 获取班组能耗月报
 * @param params 查询参数
 */
export function fetchMonthlyReport(params: Api.Energy.Report.MonthlyReportParams) {
  return request<Api.Energy.Report.MonthlyReportData>({
    url: '/api/v1/energy/report/monthly',
    method: 'get',
    params
  });
}

/**
 * 获取排名报表数据
 * @param data 查询参数
 */
export function fetchRankingReportData(data: Api.Energy.Report.RankingReportParams) {
  return request<Api.Energy.Report.RankingReportData>({
    url: '/api/v1/energy/report/ranking',
    method: 'post',
    data
  });
}

/**
 * 获取对比报表数据
 * @param data 查询参数
 */
export function fetchComparisonReportData(data: Api.Energy.Report.ComparisonReportParams) {
  return request<Api.Energy.Report.ComparisonReportData>({
    url: '/api/v1/energy/report/comparison',
    method: 'post',
    data
  });
}

/**
 * 导出排名报表Excel
 * @param data 查询参数
 */
export async function exportRankingExcel(data: Api.Energy.Report.RankingReportParams) {
  const response = await request<Blob>({
    url: '/api/v1/energy/export/ranking/excel',
    method: 'post',
    data,
    responseType: 'blob'
  });

  downloadFile(response, `排名报表_${Date.now()}.xlsx`);
}

/**
 * 导出对比报表Excel
 * @param data 查询参数
 */
export async function exportComparisonExcel(data: Api.Energy.Report.ComparisonReportParams) {
  const response = await request<Blob>({
    url: '/api/v1/energy/export/comparison/excel',
    method: 'post',
    data,
    responseType: 'blob'
  });

  downloadFile(response, `对比报表_${Date.now()}.xlsx`);
}

/**
 * 导出日报PDF
 * @param params 查询参数
 */
export async function exportDailyPdf(params: Api.Energy.Report.DailyReportParams) {
  const response = await request<Blob>({
    url: '/api/v1/energy/export/daily/pdf',
    method: 'post',
    data: params,
    responseType: 'blob'
  });

  downloadFile(response, `日报_${params.date}_${Date.now()}.pdf`);
}

/**
 * 导出月报PDF
 * @param params 查询参数
 */
export async function exportMonthlyPdf(params: Api.Energy.Report.MonthlyReportParams) {
  const response = await request<Blob>({
    url: '/api/v1/energy/export/monthly/pdf',
    method: 'post',
    data: params,
    responseType: 'blob'
  });

  downloadFile(response, `月报_${params.month}_${Date.now()}.pdf`);
}

/**
 * 下载文件工具函数
 */
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ============ 能源介质 ============

/**
 * 创建能源介质
 * @param data 介质信息
 */
export function fetchCreateMedium(data: Api.Energy.Medium) {
  return request<Api.Energy.Medium>({
    url: '/api/v1/energy/medium/createMedium',
    method: 'post',
    data
  });
}

/**
 * 更新能源介质
 * @param data 介质信息
 */
export function fetchUpdateMedium(data: Api.Energy.Medium) {
  return request<Api.Energy.Medium>({
    url: '/api/v1/energy/medium/updateMedium',
    method: 'put',
    data
  });
}

/**
 * 删除能源介质
 * @param id 介质ID
 */
export function fetchDeleteMedium(id: number) {
  return request({
    url: '/api/v1/energy/medium/deleteMedium',
    method: 'delete',
    data: { id }
  });
}

/**
 * 根据ID获取能源介质
 * @param id 介质ID
 */
export function fetchGetMediumById(id: number) {
  return request<Api.Energy.Medium>({
    url: '/api/v1/energy/medium/getMediumById',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取能源介质列表
 * @param params 查询参数
 */
export function fetchGetMediumList(params: Api.Energy.MediumSearchParams) {
  return request<Api.Energy.MediumList>({
    url: '/api/v1/energy/medium/getMediumList',
    method: 'get',
    params
  });
}

/**
 * 获取所有能源介质
 */
export function fetchGetAllMediums() {
  return request<Api.Energy.Medium[]>({
    url: '/api/v1/energy/medium/getAllMediums',
    method: 'get'
  });
}

/**
 * 修改能源介质状态
 * @param id 介质ID
 * @param status 状态
 */
export function fetchChangeMediumStatus(id: number, status: number) {
  return request({
    url: '/api/v1/energy/medium/changeMediumStatus',
    method: 'put',
    data: { id, status }
  });
}

// ============ 介质单位 ============

/**
 * 创建介质单位
 * @param data 单位信息
 */
export function fetchCreateUnit(data: Api.Energy.Unit) {
  return request<Api.Energy.Unit>({
    url: '/api/v1/energy/unit/createUnit',
    method: 'post',
    data
  });
}

/**
 * 更新介质单位
 * @param data 单位信息
 */
export function fetchUpdateUnit(data: Api.Energy.Unit) {
  return request<Api.Energy.Unit>({
    url: '/api/v1/energy/unit/updateUnit',
    method: 'put',
    data
  });
}

/**
 * 删除介质单位
 * @param id 单位ID
 */
export function fetchDeleteUnit(id: number) {
  return request({
    url: '/api/v1/energy/unit/deleteUnit',
    method: 'delete',
    data: { id }
  });
}

/**
 * 根据ID获取介质单位
 * @param id 单位ID
 */
export function fetchGetUnitById(id: number) {
  return request<Api.Energy.UnitView>({
    url: '/api/v1/energy/unit/getUnitById',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取介质单位列表
 * @param params 查询参数
 */
export function fetchGetUnitList(params: Api.Energy.UnitSearchParams) {
  return request<{ list: Api.Energy.UnitView[]; total: number }>({
    url: '/api/v1/energy/unit/getUnitList',
    method: 'get',
    params
  });
}

/**
 * 获取指定介质的所有单位
 * @param mediumId 介质ID
 */
export function fetchGetUnitsByMedium(mediumId: number) {
  return request<Api.Energy.Unit[]>({
    url: '/api/v1/energy/unit/getUnitsByMedium',
    method: 'get',
    params: { mediumId }
  });
}

/**
 * 设置标准单位
 * @param id 单位ID
 */
export function fetchSetStandardUnit(id: number) {
  return request({
    url: '/api/v1/energy/unit/setStandardUnit',
    method: 'put',
    data: { id }
  });
}

// ============ 系数折算 ============

/**
 * 创建系数折算
 * @param data 系数信息
 */
export function fetchCreateCoefficient(data: Api.Energy.Coefficient) {
  return request<Api.Energy.Coefficient>({
    url: '/api/v1/energy/coefficient/createCoefficient',
    method: 'post',
    data
  });
}

/**
 * 更新系数折算
 * @param data 系数信息
 */
export function fetchUpdateCoefficient(data: Api.Energy.Coefficient) {
  return request<Api.Energy.Coefficient>({
    url: '/api/v1/energy/coefficient/updateCoefficient',
    method: 'put',
    data
  });
}

/**
 * 删除系数折算
 * @param id 系数ID
 */
export function fetchDeleteCoefficient(id: number) {
  return request({
    url: '/api/v1/energy/coefficient/deleteCoefficient',
    method: 'delete',
    data: { id }
  });
}

/**
 * 根据ID获取系数折算
 * @param id 系数ID
 */
export function fetchGetCoefficientById(id: number) {
  return request<Api.Energy.CoefficientView>({
    url: '/api/v1/energy/coefficient/getCoefficientById',
    method: 'get',
    params: { id }
  });
}

/**
 * 获取系数折算列表
 * @param params 查询参数
 */
export function fetchGetCoefficientList(params: Api.Energy.CoefficientSearchParams) {
  return request<Api.Energy.CoefficientList>({
    url: '/api/v1/energy/coefficient/getCoefficientList',
    method: 'get',
    params
  });
}

/**
 * 获取有效系数
 * @param mediumId 介质ID
 * @param coefficientType 系数类型
 * @param queryDate 查询日期
 */
export function fetchGetEffectiveCoefficient(mediumId: number, coefficientType: number, queryDate?: string) {
  return request<Api.Energy.Coefficient>({
    url: '/api/v1/energy/coefficient/getEffectiveCoefficient',
    method: 'get',
    params: { mediumId, coefficientType, queryDate }
  });
}

// ============ 介质台账 ============

/**
 * 获取介质台账列表
 * @param params 查询参数
 */
export function fetchGetLedgerList(params: Api.Energy.LedgerSearchParams) {
  return request<Api.Energy.LedgerList>({
    url: '/api/v1/energy/ledger/getLedgerList',
    method: 'get',
    params
  });
}

/**
 * 获取介质台账详情
 * @param mediumId 介质ID
 * @param queryDate 查询日期
 */
export function fetchGetLedgerDetail(mediumId: number, queryDate?: string) {
  return request<Api.Energy.Ledger>({
    url: '/api/v1/energy/ledger/getLedgerDetail',
    method: 'get',
    params: { mediumId, queryDate }
  });
}

// ============ SSE实时数据 ============

/**
 * 获取SSE服务状态
 */
export function fetchSSEStatus() {
  return request<{ connectionCount: number; channelCount: number; status: string }>({
    url: '/api/v1/energy/sse/status',
    method: 'get'
  });
}

/**
 * 注册计量点到SSE通道
 * @param data 注册请求
 */
export function fetchRegisterMeter(data: { meterId: number; factoryId: number; workshopId?: number }) {
  return request<{ message: string }>({
    url: '/api/v1/energy/sse/register-meter',
    method: 'post',
    data
  });
}

/**
 * 取消SSE订阅
 * @param data 通道范围
 */
export function fetchUnsubscribeSSE(data: Api.Energy.Realtime.ChannelScope) {
  return request<{ message: string }>({
    url: '/api/v1/energy/sse/unsubscribe',
    method: 'post',
    data
  });
}

// ============ 排名模块 ============

/**
 * 获取班组能效排名
 * @param data 查询参数
 */
export function fetchTeamRanking(data: Api.Energy.Ranking.TeamRankingQuery) {
  return request<Api.Energy.Ranking.TeamRankingResponse>({
    url: '/api/v1/ranking/team',
    method: 'post',
    data
  });
}

/**
 * 获取班组排名趋势
 * @param data 查询参数
 */
export function fetchRankingTrend(data: Api.Energy.Ranking.RankingTrendQuery) {
  return request<Api.Energy.Ranking.RankingTrendPoint[]>({
    url: '/api/v1/ranking/trend',
    method: 'post',
    data
  });
}

// ============ 对比模块 ============

/**
 * 班组对比分析
 * @param data 查询参数
 */
export function fetchCompareTeams(data: Api.Energy.Comparison.TeamComparisonQuery) {
  return request<Api.Energy.Comparison.ComparisonResult>({
    url: '/api/v1/comparison/teams',
    method: 'post',
    data
  });
}

/**
 * 班次对比分析
 * @param data 查询参数
 */
export function fetchCompareShifts(data: Api.Energy.Comparison.ShiftComparisonQuery) {
  return request<Api.Energy.Comparison.ComparisonResult>({
    url: '/api/v1/comparison/shifts',
    method: 'post',
    data
  });
}

/**
 * 时间对比分析
 * @param data 查询参数
 */
export function fetchCompareTime(data: Api.Energy.Comparison.TimeComparisonQuery) {
  return request<Api.Energy.Comparison.TimeComparisonResult>({
    url: '/api/v1/comparison/time',
    method: 'post',
    data
  });
}

// ============ 能量流 ============

/**
 * 获取工厂级能量流数据
 * @param params 查询参数
 */
export function fetchFactoryFlow(params: Api.Energy.EnergyFlow.EnergyFlowParams) {
  return request<Api.Energy.EnergyFlow.EnergyFlowResponse>({
    url: '/api/v1/energyFlow/factory',
    method: 'get',
    params
  });
}

/**
 * 获取车间级能量流数据
 * @param params 查询参数
 */
export function fetchWorkshopFlow(params: Api.Energy.EnergyFlow.EnergyFlowParams) {
  return request<Api.Energy.EnergyFlow.EnergyFlowResponse>({
    url: '/api/v1/energyFlow/workshop',
    method: 'get',
    params
  });
}
