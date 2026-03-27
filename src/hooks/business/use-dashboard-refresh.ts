import { ref, onUnmounted } from 'vue';
import type { FlatResponseData } from '@sa/axios';

type DashboardData =
  | Api.Dashboard.GroupDashboardData
  | Api.Dashboard.FactoryDashboardData
  | Api.Dashboard.TeamDashboardData;

interface UseDashboardRefreshOptions<T extends DashboardData> {
  scope: 'group' | 'factory' | 'team';
  orgId: string;
  fetchInitial: () => Promise<FlatResponseData<any, T>>;
  onRefresh?: (data: T) => void;
  refreshInterval?: number;
}

/**
 * Dashboard refresh hook with polling
 */
export function useDashboardRefresh<T extends DashboardData>(options: UseDashboardRefreshOptions<T>) {
  const { fetchInitial, onRefresh, refreshInterval = 5000 } = options;

  const data = ref<T | null>(null) as { value: T | null };
  const loading = ref(true);
  const error = ref<Error | null>(null);
  const lastUpdate = ref<Date | null>(null);
  const isRefreshing = ref(false);
  const sseConnected = ref(false);

  let pollInterval: ReturnType<typeof setInterval> | null = null;

  async function poll() {
    if (isRefreshing.value) return;

    isRefreshing.value = true;
    try {
      const response = await fetchInitial();
      if (response.data) {
        data.value = response.data;
        lastUpdate.value = new Date();
        onRefresh?.(response.data);
      } else if (response.error) {
        error.value = response.error;
      }
    } catch (e) {
      error.value = e as Error;
    } finally {
      isRefreshing.value = false;
    }
  }

  function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(poll, refreshInterval);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Initial load
  async function initialize() {
    loading.value = true;
    try {
      await poll();
      startPolling();
    } finally {
      loading.value = false;
    }
  }

  // Lifecycle
  onUnmounted(() => {
    stopPolling();
  });

  initialize();

  return {
    data,
    loading,
    error,
    lastUpdate,
    isRefreshing,
    sseConnected,
    refresh: poll,
    startPolling,
    stopPolling
  };
}