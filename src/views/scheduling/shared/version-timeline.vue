<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElButton, ElCard, ElCheckbox, ElTag, ElTimeline, ElTimelineItem, ElTooltip } from 'element-plus';
import { fetchGetVersionHistory } from '@/service/api/scheduling/rule-engine';

interface Props {
  ruleId: number;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
});

const emit = defineEmits<{
  (e: 'select', version: Api.Scheduling.RuleVersionResponse): void;
  (e: 'compare', versions: [number, number]): void;
}>();

const loading = ref(false);
const versions = ref<Api.Scheduling.RuleVersionResponse[]>([]);
const selectedForCompare = ref<number[]>([]);

const sortedVersions = computed(() => {
  return [...versions.value].sort((a, b) => b.versionNo - a.versionNo);
});

async function loadData() {
  if (!props.ruleId) return;

  loading.value = true;
  try {
    const { data } = await fetchGetVersionHistory(props.ruleId);
    versions.value = data || [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.ruleId,
  () => {
    if (props.visible) {
      loadData();
    }
  },
  { immediate: true }
);

watch(
  () => props.visible,
  visible => {
    if (visible && props.ruleId) {
      loadData();
    }
  }
);

function handleSelectVersion(version: Api.Scheduling.RuleVersionResponse) {
  emit('select', version);
}

function toggleCompareSelection(versionId: number) {
  const idx = selectedForCompare.value.indexOf(versionId);
  if (idx === -1) {
    if (selectedForCompare.value.length >= 2) {
      selectedForCompare.value.shift();
    }
    selectedForCompare.value.push(versionId);
  } else {
    selectedForCompare.value.splice(idx, 1);
  }
}

function handleCompare() {
  if (selectedForCompare.value.length === 2) {
    emit('compare', selectedForCompare.value as [number, number]);
    selectedForCompare.value = [];
  }
}

function getVersionColor(version: Api.Scheduling.RuleVersionResponse) {
  if (version.isActive) return 'primary';
  const daysSinceCreated = Math.floor((Date.now() - new Date(version.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated < 7) return 'success';
  if (daysSinceCreated < 30) return 'warning';
  return 'info';
}
</script>

<template>
  <ElCard v-if="visible" class="version-timeline-panel">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold">版本历史</span>
        <div class="flex gap-2">
          <ElButton v-if="selectedForCompare.length === 2" type="warning" size="small" @click="handleCompare">
            对比选中版本
          </ElButton>
          <ElButton size="small" :loading="loading" @click="loadData">刷新</ElButton>
        </div>
      </div>
    </template>

    <div v-if="!loading && versions.length === 0" class="py-4 text-center text-gray-400">暂无版本记录</div>

    <ElTimeline v-else>
      <ElTimelineItem
        v-for="version in sortedVersions"
        :key="version.id"
        :timestamp="version.createdAt"
        :color="getVersionColor(version)"
        placement="top"
      >
        <div class="flex items-center justify-between rounded bg-gray-50 p-2 transition-colors hover:bg-gray-100">
          <div class="flex items-center gap-2">
            <ElTag :type="version.isActive ? 'success' : 'info'" size="small">V{{ version.versionNo }}</ElTag>
            <span class="font-medium">{{ version.versionName || '未命名版本' }}</span>
            <ElTooltip v-if="version.effectiveFrom" :content="`生效时间: ${version.effectiveFrom}`" placement="top">
              <ElTag type="warning" size="small">生效中</ElTag>
            </ElTooltip>
          </div>

          <div class="flex items-center gap-2">
            <ElCheckbox
              :model-value="selectedForCompare.includes(version.id)"
              @change="toggleCompareSelection(version.id)"
            >
              对比
            </ElCheckbox>
            <ElButton type="primary" text size="small" @click="handleSelectVersion(version)">查看</ElButton>
          </div>
        </div>

        <div v-if="version.changeReason" class="mt-1 pl-2 text-sm text-gray-500">
          变更原因: {{ version.changeReason }}
        </div>
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<style scoped>
.version-timeline-panel {
  max-height: 500px;
  overflow-y: auto;
}
</style>
