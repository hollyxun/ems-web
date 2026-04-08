<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElCard, ElButton, ElEmpty, ElText } from 'element-plus';

defineOptions({ name: 'QuickActionsCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(false);

const actions = [
  { icon: 'mdi:file-document', label: '生成日报', action: 'generate-report' },
  { icon: 'mdi:download', label: '导出数据', action: 'export-data' },
  { icon: 'mdi:refresh', label: '刷新看板', action: 'refresh-dashboard' },
  { icon: 'mdi:cog', label: '系统设置', action: 'settings' },
  { icon: 'mdi:bell', label: '查看告警', action: 'view-alerts' },
  { icon: 'mdi:account-group', label: '班组管理', action: 'team-manage' }
];

function handleAction(action: string) {
  // 实际应调用相应功能
  console.log('Action:', action);
}

onMounted(() => {
  // 快捷操作无需加载远程数据
});

defineExpose({ refresh: () => {} });
</script>

<template>
  <ElCard shadow="never" class="h-full">
    <template #header>
      <span class="font-medium">快捷操作</span>
    </template>
    <div class="grid grid-cols-2 gap-3">
      <ElButton
        v-for="item in actions"
        :key="item.action"
        class="h-48px flex items-center justify-center gap-2"
        @click="handleAction(item.action)"
      >
        <icon-mdi:file-document v-if="item.icon === 'mdi:file-document'" />
        <icon-mdi:download v-if="item.icon === 'mdi:download'" />
        <icon-mdi:refresh v-if="item.icon === 'mdi:refresh'" />
        <icon-mdi:cog v-if="item.icon === 'mdi:cog'" />
        <icon-mdi:bell v-if="item.icon === 'mdi:bell'" />
        <icon-mdi:account-group v-if="item.icon === 'mdi:account-group'" />
        <ElText size="small">{{ item.label }}</ElText>
      </ElButton>
    </div>
  </ElCard>
</template>