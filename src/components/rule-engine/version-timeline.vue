<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElTag,
  ElTimeline,
  ElTimelineItem
} from 'element-plus';
import dayjs from 'dayjs';

/**
 * 版本时间线组件
 * 可视化展示规则版本历史
 */

interface VersionItem {
  id: number;
  versionNo: number;
  versionName: string;
  configValue: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive: boolean;
  changeReason?: string;
  createdAt?: string;
  createdBy?: string;
}

interface Props {
  versions: VersionItem[];
  currentVersionId?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentVersionId: 0,
  loading: false
});

const emit = defineEmits<{
  (e: 'activate', version: VersionItem): void;
  (e: 'rollback', version: VersionItem): void;
  (e: 'compare', v1: number, v2: number): void;
  (e: 'view', version: VersionItem): void;
}>();

// 选中用于比较的版本
const compareVersionId = ref<number | null>(null);

// 排序后的版本列表（按版本号降序）
const sortedVersions = computed(() => {
  return [...props.versions].sort((a, b) => b.versionNo - a.versionNo);
});

// 版本类型标记
function getVersionType(version: VersionItem) {
  if (version.isActive) return 'primary';
  if (version.versionNo === Math.max(...props.versions.map(v => v.versionNo))) return 'success';
  return 'info';
}

// 版本状态文本
function getVersionStatus(version: VersionItem) {
  if (version.isActive) return '当前激活';
  return `V${version.versionNo}`;
}

// 处理激活
function handleActivate(version: VersionItem) {
  emit('activate', version);
}

// 处理回滚
function handleRollback(version: VersionItem) {
  emit('rollback', version);
}

// 处理比较
function handleCompare(version: VersionItem) {
  if (compareVersionId.value === null) {
    compareVersionId.value = version.id;
  } else if (compareVersionId.value !== version.id) {
    emit('compare', compareVersionId.value, version.id);
    compareVersionId.value = null;
  } else {
    compareVersionId.value = null;
  }
}

// 处理查看
function handleView(version: VersionItem) {
  emit('view', version);
}

// 格式化日期
function formatDate(date?: string) {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

// 解析配置摘要
function getConfigSummary(configValue: string) {
  try {
    const config = JSON.parse(configValue);
    const keys = Object.keys(config).slice(0, 3);
    return keys.map(k => `${k}: ${config[k]}`).join(', ');
  } catch {
    return `${configValue.slice(0, 50)}...`;
  }
}
</script>

<template>
  <div class="version-timeline">
    <ElEmpty v-if="!versions.length" description="暂无版本历史" />

    <ElTimeline v-else>
      <ElTimelineItem
        v-for="version in sortedVersions"
        :key="version.id"
        :timestamp="formatDate(version.createdAt)"
        :type="getVersionType(version)"
        :hollow="!version.isActive"
        placement="top"
      >
        <ElCard shadow="hover" :class="{ 'is-active': version.isActive }">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <ElTag :type="getVersionType(version)" size="large">
                  {{ getVersionStatus(version) }}
                </ElTag>
                <span class="font-medium">{{ version.versionName || `版本 ${version.versionNo}` }}</span>
              </div>
              <div class="flex gap-1">
                <ElButton v-if="!version.isActive" type="primary" text size="small" @click="handleActivate(version)">
                  激活
                </ElButton>
                <ElButton v-if="!version.isActive" type="warning" text size="small" @click="handleRollback(version)">
                  回滚
                </ElButton>
                <ElButton
                  type="info"
                  text
                  size="small"
                  :class="{ 'is-comparing': compareVersionId === version.id }"
                  @click="handleCompare(version)"
                >
                  {{ compareVersionId === version.id ? '取消比较' : '比较' }}
                </ElButton>
                <ElButton type="default" text size="small" @click="handleView(version)">查看</ElButton>
              </div>
            </div>
          </template>

          <ElDescriptions :column="2" size="small" border>
            <ElDescriptionsItem label="版本号">V{{ version.versionNo }}</ElDescriptionsItem>
            <ElDescriptionsItem label="创建人">
              {{ version.createdBy || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="生效时间" :span="2">
              {{ formatDate(version.effectiveFrom) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="配置摘要" :span="2">
              <span class="text-xs text-gray-600 font-mono">
                {{ getConfigSummary(version.configValue) }}
              </span>
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="version.changeReason" label="变更原因" :span="2">
              {{ version.changeReason }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElTimelineItem>
    </ElTimeline>

    <!-- 比较提示 -->
    <div v-if="compareVersionId" class="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-600">
      请点击另一个版本进行比较
    </div>
  </div>
</template>

<style lang="scss" scoped>
.version-timeline {
  :deep(.el-card) {
    transition: all 0.3s;

    &.is-active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
    }

    &:hover {
      transform: translateX(4px);
    }
  }

  .is-comparing {
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
