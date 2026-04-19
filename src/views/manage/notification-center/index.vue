<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElTag } from 'element-plus';
import {
  fetchHandleNotification,
  fetchNotificationList,
  fetchReadNotification,
  fetchUnreadCount
} from '@/service/api/notification';

defineOptions({ name: 'NotificationCenter' });

const loading = ref(false);
const tableData = ref<Api.Notification.Delivery[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const unreadCount = ref<Api.Notification.UnreadCount>({ total: 0, approval: 0, system: 0, urgent: 0 });
const activeStatus = ref<'unread' | 'read' | 'handled' | ''>('');
const activeType = ref<'approval' | 'system' | ''>('');

async function loadUnreadCount() {
  const { data } = await fetchUnreadCount();
  if (data) {
    unreadCount.value = data;
  }
}

async function loadData() {
  loading.value = true;
  const { data } = await fetchNotificationList({
    page: currentPage.value,
    pageSize: pageSize.value,
    status: activeStatus.value || undefined,
    type: activeType.value || undefined
  });
  if (data) {
    tableData.value = data.list || [];
    total.value = data.total || 0;
  }
  loading.value = false;
}

async function handleRead(row: Api.Notification.Delivery) {
  await fetchReadNotification({ delivery_ids: [row.id] });
  ElMessage.success('已标记已读');
  loadData();
  loadUnreadCount();
}

async function handleHandle(row: Api.Notification.Delivery) {
  await fetchHandleNotification({ delivery_id: row.id });
  ElMessage.success('已标记处理');
  loadData();
  loadUnreadCount();
}

function handleStatusChange() {
  currentPage.value = 1;
  loadData();
}

function handleTypeChange() {
  currentPage.value = 1;
  loadData();
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

function goToLink(row: Api.Notification.Delivery) {
  if (row.message?.link) {
    window.location.hash = row.message.link;
  }
}

const statusTagMap: Record<string, { type: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
  unread: { type: 'danger', label: '未读' },
  read: { type: 'warning', label: '已读' },
  handled: { type: 'success', label: '已处理' }
};

function getStatusInfo(status: string) {
  return statusTagMap[status] || { type: 'info' as const, label: status };
}

const levelTagMap: Record<string, { type: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
  info: { type: 'info', label: '普通' },
  warning: { type: 'warning', label: '警告' },
  urgent: { type: 'danger', label: '紧急' }
};

function getLevelInfo(level: string) {
  return levelTagMap[level] || { type: 'info' as const, label: level };
}

onMounted(() => {
  loadData();
  loadUnreadCount();
});
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- 统计区 -->
    <div class="flex items-center gap-6 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-lg font-medium">未读总数：</span>
        <ElTag type="danger" size="large">{{ unreadCount.total }}</ElTag>
      </div>
      <div class="flex items-center gap-2">
        <span>审批通知：</span>
        <ElTag type="primary">{{ unreadCount.approval }}</ElTag>
      </div>
      <div class="flex items-center gap-2">
        <span>系统通知：</span>
        <ElTag type="info">{{ unreadCount.system }}</ElTag>
      </div>
      <div class="flex items-center gap-2">
        <span>紧急：</span>
        <ElTag type="warning">{{ unreadCount.urgent }}</ElTag>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="flex items-center gap-4">
      <ElRadioGroup v-model="activeStatus" @change="handleStatusChange">
        <ElRadioButton value="">全部</ElRadioButton>
        <ElRadioButton value="unread">未读</ElRadioButton>
        <ElRadioButton value="read">已读</ElRadioButton>
        <ElRadioButton value="handled">已处理</ElRadioButton>
      </ElRadioGroup>
      <ElRadioGroup v-model="activeType" @change="handleTypeChange">
        <ElRadioButton value="">全部类型</ElRadioButton>
        <ElRadioButton value="approval">审批通知</ElRadioButton>
        <ElRadioButton value="system">系统通知</ElRadioButton>
      </ElRadioGroup>
      <ElButton @click="loadData">刷新</ElButton>
    </div>

    <!-- 表格区 -->
    <ElTable v-loading="loading" :data="tableData" stripe>
      <ElTableColumn prop="message.title" label="标题" min-width="200">
        <template #default="{ row }">
          <span class="cursor-pointer hover:text-blue-500" @click="goToLink(row)">
            {{ row.message?.title }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="message.type" label="类型" width="100">
        <template #default="{ row }">
          <ElTag :type="row.message?.type === 'approval' ? 'primary' : 'info'" size="small">
            {{ row.message?.type === 'approval' ? '审批' : '系统' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="message.level" label="级别" width="80">
        <template #default="{ row }">
          <ElTag :type="getLevelInfo(row.message?.level || '').type" size="small">
            {{ getLevelInfo(row.message?.level || '').label }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" label="状态" width="80">
        <template #default="{ row }">
          <ElTag :type="getStatusInfo(row.status).type" size="small">{{ getStatusInfo(row.status).label }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="message.content" label="内容" min-width="200" show-overflow-tooltip />
      <ElTableColumn prop="created_at" label="接收时间" width="170" />
      <ElTableColumn prop="read_at" label="已读时间" width="170" />
      <ElTableColumn label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <ElButton v-if="row.status === 'unread'" type="primary" size="small" @click="handleRead(row)">已读</ElButton>
          <ElButton v-if="row.status === 'read'" type="success" size="small" @click="handleHandle(row)">
            已处理
          </ElButton>
          <ElButton v-if="row.message?.link" size="small" @click="goToLink(row)">查看</ElButton>
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
</template>
