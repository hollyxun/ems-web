<script setup lang="ts">
import { computed } from 'vue';
import { Document, Folder, InfoFilled, Link, Monitor, Refresh, Setting } from '@element-plus/icons-vue';
import type { DependencyInfo, VersionInfoResponse } from '@/typings/api/devtools';

interface Props {
  loading: boolean;
  version: VersionInfoResponse | null;
}

const props = defineProps<Props>();

defineEmits<{
  refresh: [];
}>();

const backendDeps = computed<DependencyInfo[]>(() => {
  return props.version?.backend?.dependencies ?? [];
});

const frontendDeps = computed<DependencyInfo[]>(() => {
  return props.version?.frontend?.dependencies ?? [];
});
</script>

<template>
  <ElCard class="version-card" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <ElIcon :size="20" class="text-purple-600">
            <Folder />
          </ElIcon>
          <div>
            <span class="font-medium">版本信息</span>
            <div class="text-xs text-gray-500">前后端依赖版本详情</div>
          </div>
        </div>
        <ElButton :loading="loading" size="small" @click="$emit('refresh')">
          <ElIcon class="mr-1">
            <Refresh />
          </ElIcon>
          刷新
        </ElButton>
      </div>
    </template>

    <ElSkeleton :rows="8" animated :loading="loading">
      <div v-if="version" class="space-y-6">
        <!-- 系统版本 -->
        <div class="rounded-lg bg-purple-50 p-4">
          <div class="mb-3 flex items-center gap-2">
            <ElIcon :size="18" class="text-purple-600">
              <InfoFilled />
            </ElIcon>
            <span class="font-medium">系统版本</span>
          </div>
          <ElDescriptions :column="3" size="small" border>
            <ElDescriptionsItem label="版本号">{{ version.system.version }}</ElDescriptionsItem>
            <ElDescriptionsItem label="构建时间">{{ version.system.buildTime }}</ElDescriptionsItem>
            <ElDescriptionsItem label="Go版本">{{ version.system.goVersion }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <ElRow :gutter="16">
          <!-- 后端依赖 -->
          <ElCol :xs="24" :lg="12">
            <div class="dep-section">
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ElIcon :size="18" class="text-blue-600">
                    <Setting />
                  </ElIcon>
                  <span class="font-medium">后端依赖</span>
                </div>
                <ElTag size="small" type="info">{{ backendDeps.length }}</ElTag>
              </div>
              <div class="dep-list">
                <div v-for="dep in backendDeps" :key="dep.name" class="dep-item">
                  <div class="flex items-center gap-2">
                    <ElIcon :size="14" class="text-gray-400">
                      <Document />
                    </ElIcon>
                    <span class="text-sm">{{ dep.name }}</span>
                  </div>
                  <ElTag size="small" type="primary">{{ dep.version }}</ElTag>
                </div>
                <ElEmpty v-if="backendDeps.length === 0" description="暂无依赖数据" class="py-4" />
              </div>
            </div>
          </ElCol>

          <!-- 前端依赖 -->
          <ElCol :xs="24" :lg="12" class="mt-4 lg:mt-0">
            <div class="dep-section">
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ElIcon :size="18" class="text-green-600">
                    <Monitor />
                  </ElIcon>
                  <span class="font-medium">前端依赖</span>
                </div>
                <ElTag size="small" type="info">{{ frontendDeps.length }}</ElTag>
              </div>
              <div class="dep-list">
                <div v-for="dep in frontendDeps" :key="dep.name" class="dep-item">
                  <div class="flex items-center gap-2">
                    <ElIcon :size="14" class="text-gray-400">
                      <Link />
                    </ElIcon>
                    <span class="text-sm">{{ dep.name }}</span>
                  </div>
                  <ElTag size="small" type="success">{{ dep.version }}</ElTag>
                </div>
                <ElEmpty v-if="frontendDeps.length === 0" description="暂无依赖数据" class="py-4" />
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
      <ElEmpty v-else description="暂无版本信息" class="py-12" />
    </ElSkeleton>
  </ElCard>
</template>

<style scoped>
.dep-section {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
}

.dep-list {
  max-height: 200px;
  overflow-y: auto;
}

.dep-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.dep-item:last-child {
  border-bottom: none;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.space-y-6 > * + * {
  margin-top: 24px;
}
</style>
