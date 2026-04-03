<script setup lang="ts">
import { computed } from 'vue';
import { ElDrawer, ElInput } from 'element-plus';

interface Props {
  visible: boolean;
  version: Api.Scheduling.RuleVersionResponse | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
}>();

const configText = computed(() => {
  if (!props.version?.configValue) return '';
  try {
    return JSON.stringify(JSON.parse(props.version.configValue), null, 2);
  } catch {
    return props.version.configValue;
  }
});

function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <ElDrawer
    :model-value="visible"
    :title="`版本配置 - ${version?.versionName || ''}`"
    size="600px"
    @close="handleClose"
  >
    <div v-if="version" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <span class="text-gray-500">版本号：</span>
          <span>V{{ version.versionNo }}</span>
        </div>
        <div>
          <span class="text-gray-500">版本名称：</span>
          <span>{{ version.versionName }}</span>
        </div>
        <div>
          <span class="text-gray-500">生效时间：</span>
          <span>{{ version.effectiveFrom || '-' }}</span>
        </div>
        <div>
          <span class="text-gray-500">创建人：</span>
          <span>{{ version.createdBy || '-' }}</span>
        </div>
      </div>

      <div>
        <div class="mb-2 text-gray-500">配置内容：</div>
        <ElInput :model-value="configText" type="textarea" :rows="20" readonly class="font-mono" />
      </div>

      <div v-if="version.changeReason">
        <div class="mb-2 text-gray-500">变更原因：</div>
        <div class="rounded bg-gray-50 p-3">{{ version.changeReason }}</div>
      </div>
    </div>

    <ElEmpty v-else description="无版本数据" />
  </ElDrawer>
</template>
