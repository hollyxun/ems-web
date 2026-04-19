<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElCard, ElProgress, ElTable, ElTableColumn, ElTag } from 'element-plus';
import { fetchGetReadStatistics } from '@/service/api/announcement';

defineOptions({ name: 'AnnouncementReadStatistics' });

const props = defineProps<{
  announcementId: number;
}>();

const loading = ref(false);
const statistics = ref<Api.Announcement.DetailedReadStatistics | null>(null);

// 阅读率
const readRate = computed(() => {
  if (!statistics.value) return 0;
  const total = statistics.value.readCount + statistics.value.unreadCount;
  if (total === 0) return 0;
  return Math.round((statistics.value.readCount / total) * 100);
});

// 加载统计数据
async function loadStatistics() {
  if (!props.announcementId) return;
  loading.value = true;
  const { data } = await fetchGetReadStatistics(props.announcementId);
  if (data) {
    statistics.value = data;
  }
  loading.value = false;
}

// 监听公告ID变化
watch(
  () => props.announcementId,
  () => {
    loadStatistics();
  },
  { immediate: true }
);
</script>

<template>
  <ElCard v-loading="loading" header="阅读统计">
    <div class="flex flex-col gap-4">
      <!-- 阅读率进度条 -->
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium">阅读率:</span>
        <ElProgress
          :percentage="readRate"
          :stroke-width="20"
          :text-inside="true"
          :color="readRate >= 80 ? '#67c23a' : readRate >= 50 ? '#e6a23c' : '#f56c6c'"
        />
        <span class="text-sm text-gray-500">
          {{ statistics?.readCount || 0 }}/{{ (statistics?.readCount || 0) + (statistics?.unreadCount || 0) }} 人已读
        </span>
      </div>

      <!-- 已读用户列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <ElTag type="success">已读用户</ElTag>
          <span class="text-xs text-gray-500">({{ statistics?.readCount || 0 }}人)</span>
        </div>
        <ElTable v-if="statistics?.readUsers?.length" :data="statistics.readUsers" size="small" border max-height="200">
          <ElTableColumn prop="username" label="用户名" width="150" />
          <ElTableColumn prop="nickname" label="昵称" width="150" />
          <ElTableColumn prop="firstReadAt" label="首次阅读" width="180" />
          <ElTableColumn prop="readAt" label="最后阅读" width="180" />
        </ElTable>
        <div v-else class="py-2 text-sm text-gray-400">暂无已读用户</div>
      </div>

      <!-- 未读用户列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <ElTag type="warning">未读用户</ElTag>
          <span class="text-xs text-gray-500">({{ statistics?.unreadCount || 0 }}人)</span>
        </div>
        <ElTable
          v-if="statistics?.unreadUsers?.length"
          :data="statistics.unreadUsers"
          size="small"
          border
          max-height="200"
        >
          <ElTableColumn prop="username" label="用户名" width="150" />
          <ElTableColumn prop="nickname" label="昵称" width="150" />
        </ElTable>
        <div v-else class="py-2 text-sm text-gray-400">暂无未读用户</div>
      </div>
    </div>
  </ElCard>
</template>
