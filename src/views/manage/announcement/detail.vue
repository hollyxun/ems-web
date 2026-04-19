<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetAnnouncementDetail, fetchMarkAnnouncementRead } from '@/service/api/announcement';
import { useRouterPush } from '@/hooks/common/router';

defineOptions({ name: 'AnnouncementDetail' });

const { routerPushByKey } = useRouterPush();

const loading = ref(false);
const announcement = ref<Api.Announcement.Announcement | null>(null);
const isRead = ref(false);
const announcementId = ref(0);

// 加载公告详情
async function loadDetail() {
  const idParam = new URLSearchParams(window.location.search).get('id');
  if (!idParam) {
    return;
  }

  announcementId.value = Number(idParam);
  if (announcementId.value <= 0) {
    return;
  }

  loading.value = true;
  const { data } = await fetchGetAnnouncementDetail(announcementId.value);
  if (data) {
    announcement.value = data.announcement;
    isRead.value = data.is_read;
  }
  loading.value = false;
}

// 标记已读
async function handleMarkRead() {
  if (announcementId.value <= 0) return;
  await fetchMarkAnnouncementRead(announcementId.value);
  isRead.value = true;
}

// 返回列表
function goBack() {
  routerPushByKey('manage_announcement');
}

// 状态映射
const statusMap: Record<number, { type: 'info' | 'success' | 'warning' | 'danger'; label: string }> = {
  1: { type: 'info', label: '草稿' },
  2: { type: 'success', label: '已发布' },
  3: { type: 'warning', label: '已撤回' },
  4: { type: 'danger', label: '已过期' }
};

const priorityMap: Record<number, { type: 'info' | 'warning' | 'danger'; label: string }> = {
  1: { type: 'info', label: '普通' },
  2: { type: 'warning', label: '重要' },
  3: { type: 'danger', label: '紧急' }
};

function getStatusInfo(status: Api.Announcement.Status) {
  return statusMap[status] || { type: 'info' as const, label: '未知' };
}

function getPriorityInfo(priority: Api.Announcement.Priority) {
  return priorityMap[priority] || { type: 'info' as const, label: '未知' };
}

onMounted(() => {
  loadDetail();
  // 进入详情页自动标记已读
  handleMarkRead();
});
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- 加载状态 -->
    <div v-if="loading" class="h-full flex items-center justify-center">
      <ElSpinner />
    </div>

    <!-- 公告内容 -->
    <div v-else-if="announcement" class="flex flex-col gap-4">
      <!-- 标题区 -->
      <div class="flex items-center gap-4">
        <ElButton size="small" @click="goBack">
          <template #icon>
            <ElIcon><ElIconArrowLeft /></ElIcon>
          </template>
          返回
        </ElButton>
        <h1 class="text-xl font-medium">{{ announcement.title }}</h1>
        <ElTag :type="getStatusInfo(announcement.status).type" size="small">
          {{ getStatusInfo(announcement.status).label }}
        </ElTag>
        <ElTag :type="getPriorityInfo(announcement.priority).type" size="small">
          {{ getPriorityInfo(announcement.priority).label }}
        </ElTag>
        <ElTag v-if="announcement.is_pinned" type="danger" size="small">置顶</ElTag>
      </div>

      <!-- 元信息区 -->
      <div class="flex items-center gap-6 text-sm text-gray-500">
        <span>发布时间: {{ announcement.publish_at || '-' }}</span>
        <span>过期时间: {{ announcement.expire_at || '-' }}</span>
        <span>创建时间: {{ announcement.created_at }}</span>
        <ElTag v-if="isRead" type="success" size="small">已读</ElTag>
        <ElTag v-else type="warning" size="small">未读</ElTag>
      </div>

      <!-- 内容区 -->
      <ElCard class="flex-1 overflow-hidden">
        <div class="announcement-content prose max-w-none overflow-auto" v-html="announcement.content"></div>
      </ElCard>
    </div>

    <!-- 无数据 -->
    <div v-else class="h-full flex items-center justify-center">
      <ElEmpty description="公告不存在或已被删除">
        <ElButton type="primary" @click="goBack">返回列表</ElButton>
      </ElEmpty>
    </div>
  </div>
</template>

<style scoped>
.announcement-content {
  padding: 16px;
  min-height: 200px;
}

/* WangEditor 富文本样式 */
.announcement-content :deep(h1) {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
}

.announcement-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 14px 0 6px;
}

.announcement-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 4px;
}

.announcement-content :deep(p) {
  margin: 8px 0;
}

.announcement-content :deep(ul),
.announcement-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.announcement-content :deep(li) {
  margin: 4px 0;
}

.announcement-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.announcement-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.announcement-content :deep(th),
.announcement-content :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
}

.announcement-content :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.announcement-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.announcement-content :deep(a:hover) {
  text-decoration: underline;
}

.announcement-content :deep(code) {
  background: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.announcement-content :deep(pre) {
  background: var(--el-fill-color);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.announcement-content :deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 16px;
  margin: 12px 0;
  color: var(--el-text-color-secondary);
}
</style>
