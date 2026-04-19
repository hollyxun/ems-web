<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElButton, ElEmpty, ElIcon, ElMessage, ElMessageBox, ElTag } from 'element-plus';
import { ArrowLeft, Document as ElIconDocument } from '@element-plus/icons-vue';
import {
  fetchGetAllAnnouncementCategories,
  fetchGetAnnouncementList,
  fetchPinAnnouncement,
  fetchPublishAnnouncement,
  fetchUnpinAnnouncement,
  fetchWithdrawAnnouncement
} from '@/service/api/announcement';
import { useRouterPush } from '@/hooks/common/router';
import AnnouncementCreateForm from './components/create-form.vue';
import AnnouncementReadStatistics from './components/read-statistics.vue';
import AnnouncementCommentSection from './components/comment-section.vue';

defineOptions({ name: 'AnnouncementManage' });

const route = useRoute();
const { routerPushByKey } = useRouterPush();

// 视图模式检测
const viewMode = computed(() => {
  const action = route.query.action;
  const id = route.query.id;
  if (action === 'create') return 'create';
  if (id) return 'detail';
  return 'list';
});

// 列表状态定义
const loading = ref(false);
const tableData = ref<Api.Announcement.Announcement[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const activeStatus = ref<Api.Announcement.Status | 0>(0);
const activePriority = ref<Api.Announcement.Priority | 0>(0);
const activeCategoryId = ref<number | 0>(0);
const categories = ref<Api.Announcement.Category[]>([]);

// 详情状态
const detailId = computed(() => Number(route.query.id) || 0);
const announcement = ref<Api.Announcement.Announcement | null>(null);
const isRead = ref(false);
const detailLoading = ref(false);
const attachments = ref<Api.Announcement.Attachment[]>([]);

// 导航函数
function goCreate() {
  routerPushByKey('manage_announcement', { query: { action: 'create' } });
}

function goDetail(row: Api.Announcement.Announcement) {
  routerPushByKey('manage_announcement', { query: { id: String(row.id) } });
}

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

// 加载公告列表
async function loadData() {
  loading.value = true;
  const { data } = await fetchGetAnnouncementList({
    page: currentPage.value,
    pageSize: pageSize.value,
    status: activeStatus.value || undefined,
    priority: activePriority.value || undefined,
    category_id: activeCategoryId.value || undefined,
    keyword: keyword.value || undefined
  });
  if (data) {
    tableData.value = data.list || [];
    total.value = data.total || 0;
  }
  loading.value = false;
}

// 加载分类列表
async function loadCategories() {
  const { data } = await fetchGetAllAnnouncementCategories();
  if (data) {
    categories.value = data;
  }
}

// 加载详情
async function loadDetail() {
  if (!detailId.value) return;
  detailLoading.value = true;
  const { fetchGetAnnouncementDetail, fetchMarkAnnouncementRead, fetchGetAnnouncementAttachments } =
    await import('@/service/api/announcement');
  const { data } = await fetchGetAnnouncementDetail(detailId.value);
  if (data) {
    announcement.value = data.announcement;
    isRead.value = data.is_read;
    // 自动标记已读
    await fetchMarkAnnouncementRead(detailId.value);
    isRead.value = true;
    // 加载附件列表
    const { data: attachmentData } = await fetchGetAnnouncementAttachments(detailId.value);
    if (attachmentData) {
      attachments.value = attachmentData;
    }
  }
  detailLoading.value = false;
}

// 下载附件
async function downloadAttachment(attachment: Api.Announcement.Attachment) {
  const { getAnnouncementAttachmentDownloadUrl } = await import('@/service/api/announcement');
  const url = getAnnouncementAttachmentDownloadUrl(attachment.id);
  window.open(url, '_blank');
}

// 发布公告
async function handlePublish(row: Api.Announcement.Announcement) {
  try {
    await ElMessageBox.confirm('确认发布公告？', '提示', { type: 'warning' });
    await fetchPublishAnnouncement(row.id);
    ElMessage.success('发布成功');
    loadData();
  } catch {
    // 取消操作
  }
}

// 撤回公告
async function handleWithdraw(row: Api.Announcement.Announcement) {
  try {
    await ElMessageBox.confirm('确认撤回公告？', '提示', { type: 'warning' });
    await fetchWithdrawAnnouncement(row.id);
    ElMessage.success('撤回成功');
    loadData();
  } catch {
    // 取消操作
  }
}

// 置顶/取消置顶
async function handlePin(row: Api.Announcement.Announcement) {
  if (row.is_pinned) {
    await fetchUnpinAnnouncement(row.id);
    ElMessage.success('取消置顶成功');
  } else {
    await fetchPinAnnouncement(row.id);
    ElMessage.success('置顶成功');
  }
  loadData();
}

// 筛选处理
function handleFilterChange() {
  currentPage.value = 1;
  loadData();
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

// 计算是否可发布
const canPublish = (row: Api.Announcement.Announcement) => row.status === 1;
const canWithdraw = (row: Api.Announcement.Announcement) => row.status === 2;

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 监听视图模式变化
watch(
  viewMode,
  mode => {
    if (mode === 'list') {
      loadCategories();
      loadData();
    } else if (mode === 'detail') {
      loadDetail();
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- 列表视图 -->
  <div v-if="viewMode === 'list'" class="h-full flex flex-col gap-4 p-4">
    <!-- 操作区 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <ElButton type="primary" @click="goCreate">新建公告</ElButton>
        <ElInput
          v-model="keyword"
          placeholder="搜索标题"
          clearable
          style="width: 200px"
          @keyup.enter="handleFilterChange"
          @clear="handleFilterChange"
        />
        <ElSelect
          v-model="activeStatus"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
          @change="handleFilterChange"
        >
          <ElOption :value="0" label="全部状态" />
          <ElOption :value="1" label="草稿" />
          <ElOption :value="2" label="已发布" />
          <ElOption :value="3" label="已撤回" />
          <ElOption :value="4" label="已过期" />
        </ElSelect>
        <ElSelect
          v-model="activePriority"
          placeholder="优先级筛选"
          clearable
          style="width: 120px"
          @change="handleFilterChange"
        >
          <ElOption :value="0" label="全部优先级" />
          <ElOption :value="1" label="普通" />
          <ElOption :value="2" label="重要" />
          <ElOption :value="3" label="紧急" />
        </ElSelect>
        <ElSelect
          v-model="activeCategoryId"
          placeholder="分类筛选"
          clearable
          style="width: 140px"
          @change="handleFilterChange"
        >
          <ElOption :value="0" label="全部分类" />
          <ElOption v-for="cat in categories" :key="cat.id" :value="cat.id" :label="cat.name" />
        </ElSelect>
        <ElButton @click="loadData">刷新</ElButton>
      </div>
    </div>

    <!-- 表格区 -->
    <ElTable v-loading="loading" :data="tableData" stripe>
      <ElTableColumn prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="flex items-center gap-2" :class="{ 'text-gray-400 italic': row.status === 4 }">
            <ElTag v-if="row.is_pinned" type="danger" size="small">置顶</ElTag>
            <ElTag v-if="row.status === 4" type="info" size="small">已过期</ElTag>
            {{ row.title }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="priority" label="优先级" width="100">
        <template #default="{ row }">
          <ElTag :type="getPriorityInfo(row.priority).type" size="small">
            {{ getPriorityInfo(row.priority).label }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="{ row }">
          <ElTag :type="getStatusInfo(row.status).type" size="small">
            {{ getStatusInfo(row.status).label }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="publish_at" label="发布时间" width="170">
        <template #default="{ row }">
          {{ row.publish_at || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="expire_at" label="过期时间" width="170">
        <template #default="{ row }">
          {{ row.expire_at || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="created_at" label="创建时间" width="170" />
      <ElTableColumn label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <ElButton type="primary" size="small" @click="goDetail(row)">查看</ElButton>
          <ElButton v-if="canPublish(row)" type="success" size="small" @click="handlePublish(row)">发布</ElButton>
          <ElButton v-if="canWithdraw(row)" type="warning" size="small" @click="handleWithdraw(row)">撤回</ElButton>
          <ElButton size="small" @click="handlePin(row)">
            {{ row.is_pinned ? '取消置顶' : '置顶' }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 分页 -->
    <div class="flex justify-end">
      <ElPagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>

  <!-- 详情视图 -->
  <div v-else-if="viewMode === 'detail'" v-loading="detailLoading" class="h-full flex flex-col gap-4 p-4">
    <!-- 公告内容 -->
    <div v-if="announcement" class="flex flex-col gap-4">
      <!-- 标题区 -->
      <div class="flex items-center gap-4">
        <ElButton size="small" :icon="ArrowLeft" @click="goBack">返回</ElButton>
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

      <!-- 附件区 -->
      <ElCard v-if="attachments.length > 0" header="附件">
        <div class="flex flex-col gap-2">
          <div
            v-for="att in attachments"
            :key="att.id"
            class="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <ElIcon size="20"><ElIconDocument /></ElIcon>
              <span class="text-sm">{{ att.file_name }}</span>
              <span class="text-xs text-gray-400">{{ formatFileSize(att.file_size) }}</span>
            </div>
            <ElButton type="primary" size="small" link @click="downloadAttachment(att)">下载</ElButton>
          </div>
        </div>
      </ElCard>

      <!-- 阅读统计面板（仅已发布公告显示） -->
      <AnnouncementReadStatistics v-if="announcement.status === 2" :announcement-id="announcement.id" />

      <!-- 评论区（仅已发布公告显示） -->
      <AnnouncementCommentSection
        v-if="announcement"
        :announcement-id="announcement.id"
        :published="announcement.status === 2"
      />
    </div>

    <!-- 无数据 -->
    <div v-else class="h-full flex items-center justify-center">
      <ElEmpty description="公告不存在或已被删除">
        <ElButton type="primary" @click="goBack">返回列表</ElButton>
      </ElEmpty>
    </div>
  </div>

  <!-- 创建视图 -->
  <div v-else-if="viewMode === 'create'" class="h-full flex flex-col gap-4 p-4">
    <!-- 标题区 -->
    <ElCard>
      <ElButton size="small" :icon="ArrowLeft" @click="goBack">返回列表</ElButton>
    </ElCard>

    <!-- 表单区 -->
    <ElCard>
      <AnnouncementCreateForm @success="goBack" />
    </ElCard>
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
