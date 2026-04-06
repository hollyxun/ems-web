import axios from 'axios';
import { localStg } from '@/utils/storage';
import { request } from '../request';

/**
 * 获取上游碳排放数据
 * @param params 查询参数
 */
export function fetchUpCarbonEmission(params: Api.CarbonEmission.QueryParams) {
  return request<Api.CarbonEmission.UpResponse>({
    url: '/carbonEmission/up',
    method: 'get',
    params
  });
}

/**
 * 获取中游碳排放数据
 * @param params 查询参数
 */
export function fetchMiddleCarbonEmission(params: Api.CarbonEmission.QueryParams) {
  return request<Api.CarbonEmission.MiddleResponse>({
    url: '/carbonEmission/middle',
    method: 'get',
    params
  });
}

/**
 * 导出碳排放数据
 * @param params 查询参数
 */
export async function fetchExportCarbonEmission(params: Api.CarbonEmission.QueryParams) {
  const token = localStg.get('token');
  const response = await axios.get('/carbonEmission/export', {
    params,
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}
