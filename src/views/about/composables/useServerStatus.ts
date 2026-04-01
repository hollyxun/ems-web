import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { ServerStatusResponse, VersionInfoResponse } from '@/typings/api/devtools';
import { fetchServerStatus, fetchVersionInfo } from '../api';

/** 历史数据点 */
export interface HistoryDataPoint {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
}

/** 服务器状态配置 */
export interface UseServerStatusOptions {
  /** 自动刷新间隔（毫秒） */
  refreshInterval?: number;
  /** 最大历史数据点数 */
  maxHistoryPoints?: number;
  /** 是否立即获取数据 */
  immediate?: boolean;
}

/**
 * 服务器状态管理 Composable
 * @param options 配置选项
 * @returns 服务器状态相关数据和方法
 */
export function useServerStatus(options: UseServerStatusOptions = {}) {
  const { refreshInterval = 5000, maxHistoryPoints = 60, immediate = true } = options;

  // 加载状态
  const loading = ref(false);
  const versionLoading = ref(false);

  // 自动刷新开关
  const autoRefresh = ref(true);

  // 数据状态
  const status = ref<ServerStatusResponse | null>(null);
  const version = ref<VersionInfoResponse | null>(null);

  // 历史数据（用于图表展示）
  const historyData = ref<HistoryDataPoint[]>([]);

  // 计算属性：CPU 使用率
  const cpuUsage = computed(() => {
    if (!status.value) return 0;
    return 100 - status.value.cpu.idle;
  });

  // 计算属性：内存使用率
  const memoryUsage = computed(() => {
    if (!status.value) return 0;
    return status.value.memory.usedPercent;
  });

  // 计算属性：系统健康状态
  const systemHealth = computed(() => {
    if (!status.value) return 'unknown';

    const cpu = cpuUsage.value;
    const mem = memoryUsage.value;

    if (cpu > 90 || mem > 90) return 'critical';
    if (cpu > 70 || mem > 70) return 'warning';
    return 'healthy';
  });

  // 计算属性：健康状态颜色
  const healthColor = computed(() => {
    const colors: Record<string, string> = {
      healthy: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
      unknown: '#6b7280'
    };
    return colors[systemHealth.value];
  });

  // 计算属性：格式化的运行时间
  const formattedUptime = computed(() => {
    if (!status.value) return '-';
    return status.value.uptime.formatted;
  });

  // 定时器引用
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * 添加历史数据点
   */
  const addHistoryPoint = () => {
    if (!status.value) return;

    const point: HistoryDataPoint = {
      timestamp: Date.now(),
      cpuUsage: cpuUsage.value,
      memoryUsage: memoryUsage.value
    };

    historyData.value.push(point);

    // 限制历史数据点数量
    if (historyData.value.length > maxHistoryPoints) {
      historyData.value.shift();
    }
  };

  /**
   * 获取服务器状态数据
   */
  const fetchData = async (silent = false) => {
    if (!silent) {
      loading.value = true;
    }

    try {
      const { data, error } = await fetchServerStatus();

      if (!error && data) {
        status.value = data;
        addHistoryPoint();
        return data;
      }
      if (!silent) {
        ElMessage.error('获取服务器状态失败');
      }
      return null;
    } catch {
      if (!silent) {
        ElMessage.error('获取服务器状态失败');
      }
      return null;
    } finally {
      if (!silent) {
        loading.value = false;
      }
    }
  };

  /**
   * 获取版本信息
   */
  const fetchVersion = async () => {
    versionLoading.value = true;
    try {
      const { data, error } = await fetchVersionInfo();

      if (!error && data) {
        version.value = data;
        return data;
      }
      ElMessage.error('获取版本信息失败');
      return null;
    } catch {
      ElMessage.error('获取版本信息失败');
      return null;
    } finally {
      versionLoading.value = false;
    }
  };

  /**
   * 刷新所有数据
   */
  const refreshAll = async () => {
    await Promise.all([fetchData(), fetchVersion()]);
    ElMessage.success('数据已刷新');
  };

  /**
   * 启动自动刷新
   */
  const startAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    refreshTimer = setInterval(() => {
      if (autoRefresh.value) {
        fetchData(true); // 静默刷新
      }
    }, refreshInterval);
  };

  /**
   * 停止自动刷新
   */
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  /**
   * 格式化内存大小
   * @param mb 兆字节
   * @returns 格式化后的字符串
   */
  const formatMemory = (mb: number): string => {
    if (mb >= 1024 * 1024) {
      return `${(mb / 1024 / 1024).toFixed(2)} TB`;
    }
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${Math.round(mb)} MB`;
  };

  /**
   * 获取操作系统图标
   * @param osType 操作系统类型
   * @returns 图标名称
   */
  const getOSIcon = (osType: string): string => {
    const icons: Record<string, string> = {
      windows: 'mdi:microsoft-windows',
      linux: 'mdi:linux',
      darwin: 'mdi:apple',
      freebsd: 'mdi:freebsd',
      openbsd: 'mdi:freebsd'
    };
    return icons[osType.toLowerCase()] || 'mdi:desktop-classic';
  };

  // 监听自动刷新开关
  watch(autoRefresh, val => {
    if (val) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });

  // 生命周期钩子
  onMounted(() => {
    if (immediate) {
      fetchData();
      fetchVersion();

      if (autoRefresh.value) {
        startAutoRefresh();
      }
    }
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    // 状态
    loading,
    versionLoading,
    autoRefresh,
    status,
    version,
    historyData,

    // 计算属性
    cpuUsage,
    memoryUsage,
    systemHealth,
    healthColor,
    formattedUptime,

    // 方法
    fetchData,
    fetchVersion,
    refreshAll,
    startAutoRefresh,
    stopAutoRefresh,
    formatMemory,
    getOSIcon
  };
}

export default useServerStatus;
