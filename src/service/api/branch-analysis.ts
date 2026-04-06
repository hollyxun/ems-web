import axios from 'axios';
import { localStg } from '@/utils/storage';
import { request } from '../request';

// ============ 支路用能分析 ============

/**
 * 获取支路用能分析数据
 * @param params 查询参数
 */
export function fetchBranchAnalysis(params: Api.BranchAnalysis.BranchAnalysisQuery) {
  return request<Api.BranchAnalysis.BranchAnalysisVO>({
    url: '/branchanalysis/list',
    method: 'get',
    params
  });
}

/**
 * 获取支路用能分析列表（分页）
 * @param data 查询参数
 */
export function fetchBranchAnalysisList(data: Api.BranchAnalysis.BranchAnalysisListRequest) {
  return request<{ list: Api.BranchAnalysis.BranchAnalysisVO[]; total: number; page: number; pageSize: number }>({
    url: '/branchanalysis/listPage',
    method: 'post',
    data
  });
}

/**
 * 导出支路用能分析数据
 * @param data 导出参数
 */
export async function fetchExportBranchAnalysis(data: Api.BranchAnalysis.BranchAnalysisExportRequest) {
  const token = localStg.get('token');
  const response = await axios.post('/branchanalysis/export', data, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}