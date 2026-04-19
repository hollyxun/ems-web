<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus';
import {
  fetchCreateAnnouncement,
  fetchGetAnnouncementList,
  fetchPinAnnouncement,
  fetchPublishAnnouncement,
  fetchUnpinAnnouncement,
  fetchWithdrawAnnouncement
} from '@/service/api/announcement';

defineOptions({ name: 'AnnouncementManage' });

// 状态定义
const loading = ref(false);
const tableData = ref<Api.Announcement.Announcement[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const activeStatus = ref<Api.Announcement.Status | 0>(0);
const activePriority = ref<Api.Announcement.Priority | 0>(0);

// 创建弹窗状态
const createDialogVisible = ref(false);
const createForm = ref({
  title: '',
  content: '',
  priority: 1 as Api.Announcement.Priority,
  expire_at: ''
});

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
    keyword: keyword.value || undefined
  });
  if (data) {
    tableData.value = data.list || [];
    total.value = data.total || 0;
  }
  loading.value = false;
}

// 创建公告
async function handleCreate() {
  if (!createForm.value.title || !createForm.value.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  await fetchCreateAnnouncement({
    title: createForm.value.title,
    content: createForm.value.content,
    priority: createForm.value.priority,
    expire_at: createForm.value.expire_at || undefined
  });
  ElMessage.success('创建成功');
  createDialogVisible.value = false;
  createForm.value = { title: '', content: '', priority: 1, expire_at: '' };
  loadData();
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

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- 操作区 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <ElButton type="primary" @click="createDialogVisible = true">新建公告</ElButton>
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
        <ElButton @click="loadData">刷新</ElButton>
      </div>
    </div>

    <!-- 表格区 -->
    <ElTable v-loading="loading" :data="tableData" stripe>
      <ElTableColumn prop="title" label="标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="flex items-center gap-2">
            <ElTag v-if="row.is_pinned" type="danger" size="small">置顶</ElTag>
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
      <ElTableColumn label="操作" width="180" fixed="right">
        <template #default="{ row }">
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

    <!-- 创建弹窗 -->
    <ElDialog v-model="createDialogVisible" title="新建公告" width="500px">
      <ElForm label-width="80px">
        <ElFormItem label="标题" required>
          <ElInput v-model="createForm.title" maxlength="200" show-word-limit />
        </ElFormItem>
        <ElFormItem label="内容" required>
          <ElInput v-model="createForm.content" type="textarea" :rows="5" />
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElRadioGroup v-model="createForm.priority">
            <ElRadio :value="1">普通</ElRadio>
            <ElRadio :value="2">重要</ElRadio>
            <ElRadio :value="3">紧急</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="过期时间">
          <ElDatePicker
            v-model="createForm.expire_at"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleCreate">创建</ElButton>
      </template>
    </ElDialog>
  </div>
</template>
