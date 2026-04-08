<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElAvatar, ElBadge, ElButton, ElCard, ElEmpty, ElTag } from 'element-plus';

defineOptions({ name: 'ApprovalPendingCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const pendingCount = ref(0);
const pendingList = ref<{ id: number; title: string; assigner: string; urgency: string; createdAt: string }[]>([]);

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchMyPending({ pageSize: 5 })
  await new Promise(r => setTimeout(r, 300));
  pendingCount.value = 8;
  pendingList.value = [
    { id: 1, title: '设备采购申请', assigner: '张三', urgency: 'high', createdAt: '10分钟前' },
    { id: 2, title: '加班审批', assigner: '李四', urgency: 'normal', createdAt: '1小时前' },
    { id: 3, title: '请假申请', assigner: '王五', urgency: 'low', createdAt: '2小时前' },
    { id: 4, title: '费用报销', assigner: '赵六', urgency: 'normal', createdAt: '昨天' },
    { id: 5, title: '出差申请', assigner: '钱七', urgency: 'high', createdAt: '昨天' }
  ];
  loading.value = false;
}

const urgencyMap: Record<string, { type: 'danger' | 'warning' | 'info'; label: string }> = {
  high: { type: 'danger', label: '紧急' },
  normal: { type: 'warning', label: '普通' },
  low: { type: 'info', label: '低' }
};

function getUrgencyInfo(urgency: string) {
  return urgencyMap[urgency] || { type: 'info' as const, label: '普通' };
}

onMounted(loadData);

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <ElBadge :value="pendingCount" :max="99" class="mr-2">
          <span class="font-medium">审批待办</span>
        </ElBadge>
        <ElButton size="small" text type="primary">
          查看全部
          <icon-mdi:arrow-right class="ml-1" />
        </ElButton>
      </div>
    </template>
    <div v-if="!loading && pendingList.length" class="flex flex-col gap-3">
      <div
        v-for="item in pendingList"
        :key="item.id"
        class="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700"
      >
        <div class="flex items-center gap-3">
          <ElAvatar size="small" class="bg-blue-500">
            {{ item.assigner.charAt(0) }}
          </ElAvatar>
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ item.title }}</span>
            <span class="text-xs text-gray-400">{{ item.assigner }} · {{ item.createdAt }}</span>
          </div>
        </div>
        <ElTag :type="getUrgencyInfo(item.urgency).type" size="small">
          {{ getUrgencyInfo(item.urgency).label }}
        </ElTag>
      </div>
    </div>
    <ElEmpty v-else-if="!loading" description="暂无待办审批" :image-size="60" />
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>
