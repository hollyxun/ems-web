<script setup lang="ts">
import { computed } from 'vue';
import { Monitor, Refresh } from '@element-plus/icons-vue';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
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
import pkg from '~/package.json';

defineOptions({ name: 'AboutPage' });

const appStore = useAppStore();

const column = computed(() => (appStore.isMobile ? 1 : 2));

interface PkgJson {
  name: string;
  version: string;
  dependencies: PkgVersionInfo[];
  devDependencies: PkgVersionInfo[];
}

interface PkgVersionInfo {
  name: string;
  version: string;
}

const { name, version, dependencies, devDependencies } = pkg;

function transformVersionData(tuple: [string, string]): PkgVersionInfo {
  const [$name, $version] = tuple;
  return {
    name: $name,
    version: $version
  };
}

const pkgJson: PkgJson = {
  name,
  version,
  dependencies: Object.entries(dependencies).map(item => transformVersionData(item)),
  devDependencies: Object.entries(devDependencies).map(item => transformVersionData(item))
};

const latestBuildTime = BUILD_TIME;

// Server status
const {
  loading,
  versionLoading,
  autoRefresh,
  status,
  version: serverVersion,
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
  <div class="about-page space-y-6">
    <!-- 服务器状态区域 -->
    <ElCard class="card-wrapper">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <ElIcon :size="24" class="text-primary">
              <Monitor />
            </ElIcon>
            <div>
              <h3 class="text-lg font-medium">服务器状态</h3>
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
            <ElButton type="primary" size="small" :loading="loading" @click="refreshAll">
              <ElIcon class="mr-1">
                <Refresh />
              </ElIcon>
              刷新
            </ElButton>
          </div>
        </div>
      </template>

      <ElSkeleton :rows="6" animated :loading="loading && !status">
        <template #default>
          <div v-if="status" class="space-y-6">
            <!-- 状态卡片网格 -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            <VersionInfo :loading="versionLoading" :version="serverVersion" @refresh="fetchVersion" />
          </div>

          <!-- 空状态 -->
          <ElEmpty v-else description="暂无服务器状态数据">
            <ElButton type="primary" @click="refreshAll">立即刷新</ElButton>
          </ElEmpty>
        </template>
      </ElSkeleton>
    </ElCard>

    <!-- 项目信息区域 -->
    <ElCard :header="$t('page.about.projectInfo.title')" size="small" class="card-wrapper">
      <ElDescriptions label-placement="left" border :column="column">
        <ElDescriptionsItem :label="$t('page.about.projectInfo.version')">
          <ElTag type="primary">{{ pkgJson.version }}</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.about.projectInfo.latestBuildTime')">
          <ElTag type="primary">{{ latestBuildTime }}</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.about.projectInfo.githubLink')">
          <a class="text-primary" :href="pkg.homepage" target="_blank" rel="noopener noreferrer">
            {{ $t('page.about.projectInfo.githubLink') }}
          </a>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.about.projectInfo.previewLink')">
          <a class="text-primary" :href="pkg.website" target="_blank" rel="noopener noreferrer">
            {{ $t('page.about.projectInfo.previewLink') }}
          </a>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <ElCard :header="$t('page.about.prdDep')" class="card-wrapper">
      <ElDescriptions label-placement="left" border :column="column">
        <ElDescriptionsItem v-for="item in pkgJson.dependencies" :key="item.name" :label="item.name">
          {{ item.version }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <ElCard :header="$t('page.about.devDep')" class="card-wrapper">
      <ElDescriptions label-placement="left" border :column="column">
        <ElDescriptionsItem v-for="item in pkgJson.devDependencies" :key="item.name" :label="item.name">
          {{ item.version }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
