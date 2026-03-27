import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * 实时能源数据Store
 * 使用Map存储实现O(1)计量点查找
 */
export const useRealtimeDataStore = defineStore('realtime-data', () => {
  // State - 使用Map实现O(1)计量点查找
  const meterDataMap = ref<Map<number, Api.Energy.Realtime.MeterDataPoint>>(new Map());
  const connectionStatus = ref<Api.Energy.Realtime.SSEConnectionStatus>('disconnected');
  const lastUpdateTime = ref<string | null>(null);
  const subscribedChannels = ref<string[]>([]);

  // Getters
  const meterCount = computed(() => meterDataMap.value.size);
  const isConnected = computed(() => connectionStatus.value === 'connected');

  /**
   * 根据ID获取计量点数据 - O(1)查找
   * @param meterId 计量点ID
   */
  const getMeterData = (meterId: number) => meterDataMap.value.get(meterId);

  /**
   * 获取指定能源类型的所有计量点
   * @param energyMedium 能源介质类型
   */
  const getMetersByType = (energyMedium: string) => {
    const meters: Api.Energy.Realtime.MeterDataPoint[] = [];
    meterDataMap.value.forEach(meter => {
      if (meter.energyMedium === energyMedium) {
        meters.push(meter);
      }
    });
    return meters;
  };

  /**
   * 获取所有计量点数据
   */
  const getAllMeters = () => {
    return Array.from(meterDataMap.value.values());
  };

  // Actions
  /**
   * 更新计量点数据
   * @param data 计量点数据数组
   */
  const updateMeterData = (data: Api.Energy.Realtime.MeterDataPoint[]) => {
    data.forEach(meter => {
      meterDataMap.value.set(meter.meterId, meter);
    });
    lastUpdateTime.value = new Date().toISOString();
  };

  /**
   * 设置连接状态
   * @param status 连接状态
   */
  const setConnectionStatus = (status: Api.Energy.Realtime.SSEConnectionStatus) => {
    connectionStatus.value = status;
  };

  /**
   * 添加订阅通道
   * @param channelId 通道ID
   */
  const addSubscribedChannel = (channelId: string) => {
    if (!subscribedChannels.value.includes(channelId)) {
      subscribedChannels.value.push(channelId);
    }
  };

  /**
   * 移除订阅通道
   * @param channelId 通道ID
   */
  const removeSubscribedChannel = (channelId: string) => {
    subscribedChannels.value = subscribedChannels.value.filter(id => id !== channelId);
  };

  /**
   * 清除所有数据
   */
  const clearAllData = () => {
    meterDataMap.value.clear();
    lastUpdateTime.value = null;
  };

  /**
   * 重置Store状态
   */
  const reset = () => {
    meterDataMap.value.clear();
    connectionStatus.value = 'disconnected';
    lastUpdateTime.value = null;
    subscribedChannels.value = [];
  };

  return {
    // State
    meterDataMap,
    connectionStatus,
    lastUpdateTime,
    subscribedChannels,
    // Getters
    meterCount,
    isConnected,
    getMeterData,
    getMetersByType,
    getAllMeters,
    // Actions
    updateMeterData,
    setConnectionStatus,
    addSubscribedChannel,
    removeSubscribedChannel,
    clearAllData,
    reset
  };
});
