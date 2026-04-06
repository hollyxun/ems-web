import { request } from '../request';

/**
 * 获取分项能耗分析数据
 * @param params 查询参数
 */
export function fetchItemizedEnergyAnalysis(params: Api.ItemizedEnergyAnalysis.Request) {
  return request<Api.ItemizedEnergyAnalysis.Response>({
    url: '/itemizedEnergyAnalysis/list',
    method: 'get',
    params
  });
}

/**
 * 获取分项能耗列表（别名）
 * @param params 查询参数
 */
export const fetchItemizedEnergyList = fetchItemizedEnergyAnalysis;
