<script setup lang="ts">
import { computed } from 'vue';
import { Monitor, Refresh } from '@element-plus/icons-vue';
import { useServerStatus } from './composables';
import {
  CpuStatusCard,
  MemoryStatusCard,
  OSInfoCard,
  PerformanceChart,
  PortStatusCard,
  SystemOverviewCard,
  UptimeCard,
  VersionInfo
} from './components';

const {
  loading,
  versionLoading,
  autoRefresh,
  status,
  version,
  historyData,
  cpuUsage,
  memoryUsage,
  systemHealth,
  formattedUptime,
  fetchVersion,
  refreshAll
} = useServerStatus({
  refreshInterval: 5000,
  maxHistoryPoints: 60,
  immediate: true
});

const healthText = computed(() => {
  const texts: Record<string, string> = {
    healthy: '运行正常',
    warning: '性能警告',
    critical: '资源紧张',
    unknown: '未知状态'
  };
  return texts[systemHealth.value];
});

const healthTagType = computed(() => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    healthy: 'success',
    warning: 'warning',
    critical: 'danger',
    unknown: 'info'
  };
  return types[systemHealth.value];
});
</script>

<template>
  <div class="server-status-page p-6">
    <!-- 页面头部 -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <ElIcon :size="32" class="text-primary">
          <Monitor />
        </ElIcon>
        <div>
          <h1 class="text-xl font-medium">服务器状态</h1>
          <p class="text-sm text-gray-500">实时监控服务器运行状态</p>
        </div>
        <ElTag v-if="systemHealth !== 'unknown'" :type="healthTagType" size="small">
          {{ healthText }}
        </ElTag>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">自动刷新</span>
          <ElSwitch v-model="autoRefresh" />
        </div>
        <ElButton type="primary" :loading="loading" @click="refreshAll">
          <ElIcon class="mr-1">
            <Refresh />
          </ElIcon>
          刷新
        </ElButton>
      </div>
    </div>

    <!-- 主要内容 -->
    <ElSkeleton :rows="12" animated :loading="loading && !status">
      <template #default>
        <div v-if="status" class="space-y-6">
          <!-- 状态卡片网格 -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <CpuStatusCard :cpu="status.cpu" />
            <MemoryStatusCard :memory="status.memory" />
            <OSInfoCard :os="status.os" />
            <UptimeCard :uptime="status.uptime" />
            <PortStatusCard :ports="status.ports" />
            <SystemOverviewCard :cpu-usage="cpuUsage" :memory-usage="memoryUsage" :uptime="formattedUptime" />
          </div>

          <!-- 性能趋势图表 -->
          <PerformanceChart :data="historyData" />

          <!-- 版本信息 -->
          <VersionInfo :loading="versionLoading" :version="version" @refresh="fetchVersion" />
        </div>

        <!-- 空状态 -->
        <ElEmpty v-else description="暂无服务器状态数据">
          <ElButton type="primary" @click="refreshAll">立即刷新</ElButton>
        </ElEmpty>
      </template>
    </ElSkeleton>
  </div>
</template>

<style scoped>
.server-status-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
