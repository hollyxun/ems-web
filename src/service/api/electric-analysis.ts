import axios from 'axios';
import { localStg } from '@/utils/storage';
import { request } from '../request';

/**
 * 获取负荷分析数据
 * @param params 查询参数
 */
export function fetchElectricLoadAnalysis(params: Api.ElectricLoad.Request) {
  return request<Api.ElectricLoad.Response>({
    url: '/energyMonitor/loadAnalysis',
    method: 'get',
    params
  });
}

/**
 * 获取电表列表
 * @param nodeId 节点ID
 */
export function fetchElectricityMeterList(nodeId: string) {
  return request<Api.ElectricLoad.MeterOption[]>({
    url: '/energyMonitor/listElectricMeter',
    method: 'get',
    params: { nodeId }
  });
}

/**
 * 获取功率因数分析数据
 * @param params 查询参数
 */
export function fetchPowerFactorAnalysis(params: Api.PowerFactor.Request) {
  return request<Api.PowerFactor.Response>({
    url: '/energyMonitor/powerFactor',
    method: 'get',
    params
  });
}

/**
 * 获取三相不平衡分析数据
 * @param params 查询参数
 */
export function fetchThreePhaseAnalysis(params: Api.ThreePhase.Request) {
  return request<Api.ThreePhase.Response>({
    url: '/energyMonitor/threePhase',
    method: 'get',
    params
  });
}

/**
 * 获取历史数据趋势
 * @param params 查询参数
 */
export function fetchHistoricalData(params: Api.HistoricalData.Request) {
  return request<Api.HistoricalData.Response>({
    url: '/history/dataTrend',
    method: 'get',
    params
  });
}

/**
 * 导出历史数据
 * @param params 查询参数
 */
export async function exportHistoricalData(params: Api.HistoricalData.Request) {
  const token = localStg.get('token');
  const response = await axios.get('/history/export', {
    params,
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}
