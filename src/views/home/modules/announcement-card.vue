<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetAnnouncementList, fetchGetAnnouncementUnreadCount } from '@/service/api/announcement';
import { useRouterPush } from '@/hooks/common/router';
import { useSSEConnection } from '@/hooks/business/use-sse-connection';

defineOptions({ name: 'AnnouncementCard' });

const { routerPushByKey } = useRouterPush();

const loading = ref(false);
const announcements = ref<Api.Announcement.Announcement[]>([]);
const unreadCount = ref<Api.Announcement.UnreadCount>({ total: 0, urgent: 0, important: 0, normal: 0 });

// 加载未读公告
async function loadUnreadAnnouncements() {
  loading.value = true;

  // 获取未读数量
  const { data: countData } = await fetchGetAnnouncementUnreadCount();
  if (countData) {
    unreadCount.value = countData;
  }

  // 获取最新公告（显示前3条已发布的）
  const { data: listData } = await fetchGetAnnouncementList({
    page: 1,
    pageSize: 3,
    status: 2 // 只显示已发布的
  });
  if (listData) {
    announcements.value = listData.list || [];
  }

  loading.value = false;
}

// 查看公告详情
function viewDetail(id: number) {
  routerPushByKey('manage_announcement', { query: { id: String(id) } });
}

// 查看更多
function viewMore() {
  routerPushByKey('manage_announcement');
}

// 优先级映射
const priorityMap: Record<number, { type: 'info' | 'warning' | 'danger'; label: string }> = {
  1: { type: 'info', label: '普通' },
  2: { type: 'warning', label: '重要' },
  3: { type: 'danger', label: '紧急' }
};

function getPriorityInfo(priority: Api.Announcement.Priority) {
  return priorityMap[priority] || { type: 'info' as const, label: '普通' };
}

// SSE 监听公告通知 - 使用默认工厂ID 1
const { isConnected } = useSSEConnection({
  factoryId: 1,
  onMessage: message => {
    // 收到公告通知时刷新列表
    if (message.eventType === 'announcement_notify') {
      loadUnreadAnnouncements();
    }
  }
});

onMounted(() => {
  loadUnreadAnnouncements();
});
</script>

<template>
  <ElCard v-loading="loading" class="card-wrapper">
    <template #header>
      <ElRow align="middle">
        <ElCol :span="16">
          <ElSpace>
            <span class="font-medium">公告通知</span>
            <ElBadge v-if="unreadCount.total > 0" :value="unreadCount.total" type="danger" />
            <ElIcon v-if="isConnected" class="text-green-500">
              <ElIconConnection />
            </ElIcon>
          </ElSpace>
        </ElCol>
        <ElCol :span="8" class="text-right">
          <ElButton link type="primary" @click="viewMore">查看更多</ElButton>
        </ElCol>
      </ElRow>
    </template>

    <!-- 未读统计 -->
    <div v-if="unreadCount.total > 0" class="mb-12px flex items-center gap-4">
      <ElTag type="danger" size="small">紧急 {{ unreadCount.urgent }}</ElTag>
      <ElTag type="warning" size="small">重要 {{ unreadCount.important }}</ElTag>
      <ElTag type="info" size="small">普通 {{ unreadCount.normal }}</ElTag>
    </div>

    <!-- 公告列表 -->
    <div v-if="announcements.length > 0" class="flex flex-col gap-8px">
      <div
        v-for="item in announcements"
        :key="item.id"
        class="flex cursor-pointer items-center gap-8px rounded p-8px transition-colors hover:bg-gray-50"
        @click="viewDetail(item.id)"
      >
        <ElTag v-if="item.is_pinned" type="danger" size="small">置顶</ElTag>
        <ElTag :type="getPriorityInfo(item.priority).type" size="small">
          {{ getPriorityInfo(item.priority).label }}
        </ElTag>
        <span class="flex-1 truncate">{{ item.title }}</span>
        <span class="text-xs text-gray-400">{{ item.publish_at?.slice(0, 10) }}</span>
      </div>
    </div>

    <!-- 无公告 -->
    <ElEmpty v-else description="暂无公告" :image-size="60" />
  </ElCard>
</template>

<style scoped>
.card-wrapper {
  height: 100%;
}
</style>
