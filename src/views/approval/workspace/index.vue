<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag
} from 'element-plus';
import {
  fetchApproveInstance,
  fetchCancelInstance,
  fetchMyDone,
  fetchMyInitiated,
  fetchMyPending,
  fetchRejectInstance
} from '@/service/api/approval';
import ApprovalDetailDrawer from './modules/approval-detail-drawer.vue';

defineOptions({ name: 'ApprovalWorkspace' });

const activeTab = ref('pending');
const loading = ref(false);
const pendingData = ref<Api.Approval.Task[]>([]);
const doneData = ref<Api.Approval.Task[]>([]);
const initiatedData = ref<Api.Approval.Instance[]>([]);
const pendingTotal = ref(0);
const doneTotal = ref(0);
const initiatedTotal = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 详情抽屉状态
const detailVisible = ref(false);
const detailInstanceId = ref<number | null>(null);

async function loadPending() {
  loading.value = true;
  const { data } = await fetchMyPending({ page: currentPage.value, pageSize: pageSize.value });
  if (data) {
    pendingData.value = data.list || [];
    pendingTotal.value = data.total || 0;
  }
  loading.value = false;
}

async function loadDone() {
  loading.value = true;
  const { data } = await fetchMyDone({ page: currentPage.value, pageSize: pageSize.value });
  if (data) {
    doneData.value = data.list || [];
    doneTotal.value = data.total || 0;
  }
  loading.value = false;
}

async function loadInitiated() {
  loading.value = true;
  const { data } = await fetchMyInitiated({ page: currentPage.value, pageSize: pageSize.value });
  if (data) {
    initiatedData.value = data.list || [];
    initiatedTotal.value = data.total || 0;
  }
  loading.value = false;
}

function handleTabChange(tab: string | number) {
  currentPage.value = 1;
  const tabStr = String(tab);
  if (tabStr === 'pending') loadPending();
  else if (tabStr === 'done') loadDone();
  else if (tabStr === 'initiated') loadInitiated();
}

function handleViewDetail(instanceId: number) {
  detailInstanceId.value = instanceId;
  detailVisible.value = true;
}

async function handleApprove(taskId: number) {
  const { value: comment } = await ElMessageBox.prompt('请输入审批意见（可选）', '审批通过', {
    confirmButtonText: '确认通过',
    cancelButtonText: '取消',
    inputPlaceholder: '审批意见'
  }).catch(() => ({ value: '' }));
  if (comment === null) return;
  await fetchApproveInstance({ task_id: taskId, comment: comment || '同意' });
  ElMessage.success('审批通过');
  loadPending();
}

async function handleReject(taskId: number) {
  const { value: comment } = await ElMessageBox.prompt('请输入驳回原因', '驳回', {
    confirmButtonText: '确认驳回',
    cancelButtonText: '取消',
    inputPlaceholder: '驳回原因（必填）',
    inputValidator: (val: string) => (val ? true : '请输入驳回原因')
  }).catch(() => ({ value: '' }));
  if (!comment) return;
  await fetchRejectInstance({ task_id: taskId, comment });
  ElMessage.success('已驳回');
  loadPending();
}

async function handleCancel(instanceId: number) {
  await ElMessageBox.confirm('确认撤回此审批？', '撤回确认');
  await fetchCancelInstance({ instance_id: instanceId });
  ElMessage.success('已撤回');
  loadInitiated();
}

function getStatusTag(status: string) {
  const map: Record<string, { type: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
    running: { type: 'warning', label: '进行中' },
    completed: { type: 'success', label: '已完成' },
    cancelled: { type: 'info', label: '已撤回' },
    rejected: { type: 'danger', label: '已驳回' },
    pending: { type: 'warning', label: '待审批' },
    approved: { type: 'success', label: '已通过' },
    transferred: { type: 'info', label: '已转办' }
  };
  return map[status] || { type: 'info' as const, label: status };
}

onMounted(() => {
  loadPending();
});
</script>

<template>
  <div class="h-full p-4">
    <ElTabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 我的待办 -->
      <ElTabPane label="我的待办" name="pending">
        <ElTable v-loading="loading" :data="pendingData" stripe>
          <ElTableColumn prop="instance_title" label="审批标题" min-width="200">
            <template #default="{ row }">
              <span class="cursor-pointer hover:text-blue-500" @click="handleViewDetail(row.instance_id)">
                {{ row.instance_title }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="node_name" label="审批节点" width="120" />
          <ElTableColumn prop="assignee_name" label="指派人" width="100" />
          <ElTableColumn prop="approval_mode" label="审批模式" width="100">
            <template #default="{ row }">
              <ElTag size="small">
                {{ row.approval_mode === 'or_sign' ? '或签' : row.approval_mode === 'and_sign' ? '会签' : '逐级' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="created_at" label="创建时间" width="170" />
          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <ElButton size="small" @click="handleViewDetail(row.instance_id)">详情</ElButton>
              <ElButton type="success" size="small" @click="handleApprove(row.id)">通过</ElButton>
              <ElButton type="danger" size="small" @click="handleReject(row.id)">驳回</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="pendingTotal"
            layout="total, prev, pager, next"
            @current-change="loadPending"
          />
        </div>
      </ElTabPane>

      <!-- 我的已办 -->
      <ElTabPane label="我的已办" name="done">
        <ElTable v-loading="loading" :data="doneData" stripe>
          <ElTableColumn prop="instance_title" label="审批标题" min-width="200">
            <template #default="{ row }">
              <span class="cursor-pointer hover:text-blue-500" @click="handleViewDetail(row.instance_id)">
                {{ row.instance_title }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="node_name" label="审批节点" width="120" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="getStatusTag(row.status).type" size="small">{{ getStatusTag(row.status).label }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="comment" label="审批意见" min-width="150" show-overflow-tooltip />
          <ElTableColumn prop="completed_at" label="处理时间" width="170" />
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <ElButton size="small" @click="handleViewDetail(row.instance_id)">详情</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="doneTotal"
            layout="total, prev, pager, next"
            @current-change="loadDone"
          />
        </div>
      </ElTabPane>

      <!-- 我发起的 -->
      <ElTabPane label="我发起的" name="initiated">
        <ElTable v-loading="loading" :data="initiatedData" stripe>
          <ElTableColumn prop="title" label="审批标题" min-width="200">
            <template #default="{ row }">
              <span class="cursor-pointer hover:text-blue-500" @click="handleViewDetail(row.id)">
                {{ row.title }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="business_type" label="业务类型" width="120" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="getStatusTag(row.status).type" size="small">{{ getStatusTag(row.status).label }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="started_at" label="发起时间" width="170" />
          <ElTableColumn prop="completed_at" label="完成时间" width="170" />
          <ElTableColumn label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <ElButton size="small" @click="handleViewDetail(row.id)">详情</ElButton>
              <ElButton v-if="row.status === 'running'" type="warning" size="small" @click="handleCancel(row.id)">
                撤回
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="initiatedTotal"
            layout="total, prev, pager, next"
            @current-change="loadInitiated"
          />
        </div>
      </ElTabPane>
    </ElTabs>

    <!-- 审批详情抽屉 -->
    <ApprovalDetailDrawer
      :visible="detailVisible"
      :instance-id="detailInstanceId"
      @close="
        detailVisible = false;
        detailInstanceId = null;
      "
      @refresh="loadPending"
    />
  </div>
</template>
