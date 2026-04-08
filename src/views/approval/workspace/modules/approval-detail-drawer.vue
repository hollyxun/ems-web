<script setup lang="ts">
import { ref, watch, computed, shallowRef } from 'vue';
import { ElDrawer, ElTimeline, ElTimelineItem, ElCard, ElTag, ElDescriptions, ElDescriptionsItem, ElButton, ElEmpty, ElMessage } from 'element-plus';
import { fetchGetInstance } from '@/service/api/approval';
import { useApprovalFlow, type ApprovalNodeData, type ApprovalFlowData } from '../../flow-designer/modules/use-approval-flow';
import type { Graph } from '@antv/g6';

const props = defineProps<{
  visible: boolean;
  instanceId: number | null;
}>();

const emit = defineEmits<{
  close: [];
  refresh: [];
}>();

const loading = ref(false);
const instanceData = ref<ApprovalInstance | null>(null);
const flowContainerRef = ref<HTMLElement | null>(null);
const flowHandle = shallowRef<ReturnType<typeof useApprovalFlow> | null>(null);

// 流程追踪数据
const flowNodes = computed<ApprovalNodeData[]>(() => {
  if (!instanceData.value?.current_nodes) return [];
  try {
    const nodes = JSON.parse(instanceData.value.current_nodes);
    return nodes.map((n: any) => ({
      id: n.id,
      name: n.name,
      type: n.type || 'approval',
      status: n.status
    }));
  } catch {
    return [];
  }
});

// 审批记录
const approvalHistory = computed(() => {
  if (!instanceData.value?.history) return [];
  try {
    return JSON.parse(instanceData.value.history);
  } catch {
    return [];
  }
});

const statusMap: Record<string, { type: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  pending: { type: 'warning', label: '待审批' },
  approved: { type: 'success', label: '已通过' },
  rejected: { type: 'danger', label: '已驳回' },
  transferred: { type: 'info', label: '已转办' },
  cancelled: { type: 'info', label: '已撤回' },
  running: { type: 'warning', label: '进行中' },
  completed: { type: 'success', label: '已完成' }
};

function getStatusInfo(status: string) {
  return statusMap[status] || { type: 'info' as const, label: status };
}

async function loadInstance() {
  if (!props.instanceId) return;
  loading.value = true;
  const { data } = await fetchGetInstance({ id: props.instanceId });
  if (data) {
    instanceData.value = data;
    // 渲染流程图
    renderFlowGraph();
  }
  loading.value = false;
}

function renderFlowGraph() {
  if (!flowContainerRef.value || !instanceData.value) return;

  // 解析流程定义
  let flowData: ApprovalFlowData = { nodes: [], edges: [] };
  try {
    const definition = JSON.parse(instanceData.value.definition_snapshot);
    flowData = definition;
  } catch {
    return;
  }

  // 标记已完成节点
  const completedNodeIds = approvalHistory.value
    .filter((h: any) => h.status === 'approved')
    .map((h: any) => h.node_id);

  // 标记当前节点
  const currentNodes = flowNodes.value.map(n => n.id);

  flowHandle.value = useApprovalFlow({
    container: flowContainerRef.value,
    data: flowData,
    editable: false,
    onNodeClick: (node) => {
      // 可以显示节点详情
    }
  });

  // 设置节点状态（高亮已完成/当前节点）
  setTimeout(() => {
    if (flowHandle.value?.graph) {
      completedNodeIds.forEach((id: string) => {
        flowHandle.value!.graph.setElementState(id, ['completed']);
      });
      currentNodes.forEach((id: string) => {
        flowHandle.value!.graph.setElementState(id, ['current']);
      });
    }
  }, 100);
}

watch(() => props.visible, (val) => {
  if (val) loadInstance();
  else {
    flowHandle.value = null;
    instanceData.value = null;
  }
});

function handleClose() {
  emit('close');
}
</script>

<template>
  <ElDrawer
    v-model="props.visible"
    title="审批详情"
    :size="720"
    @close="handleClose"
  >
    <div v-loading="loading" class="h-full flex flex-col gap-4">
      <!-- 基本信息 -->
      <ElCard shadow="never" header="基本信息">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="审批标题">{{ instanceData?.title }}</ElDescriptionsItem>
          <ElDescriptionsItem label="业务类型">{{ instanceData?.business_type }}</ElDescriptionsItem>
          <ElDescriptionsItem label="发起人">{{ instanceData?.initiator_name }}</ElDescriptionsItem>
          <ElDescriptionsItem label="发起时间">{{ instanceData?.started_at }}</ElDescriptionsItem>
          <ElDescriptionsItem label="当前状态">
            <ElTag :type="getStatusInfo(instanceData?.status || '').type">
              {{ getStatusInfo(instanceData?.status || '').label }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="完成时间">{{ instanceData?.completed_at || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 流程追踪图 -->
      <ElCard shadow="never" header="流程追踪">
        <div ref="flowContainerRef" class="w-full h-200px bg-dark-800 rounded-lg overflow-hidden">
          <ElEmpty v-if="!flowNodes.length" description="流程图加载中..." />
        </div>
      </ElCard>

      <!-- 审批记录 -->
      <ElCard shadow="never" header="审批记录">
        <ElTimeline v-if="approvalHistory.length">
          <ElTimelineItem
            v-for="record in approvalHistory"
            :key="record.id"
            :timestamp="record.completed_at"
            :type="getStatusInfo(record.status).type"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ record.node_name }}</span>
              <ElTag :type="getStatusInfo(record.status).type" size="small">
                {{ getStatusInfo(record.status).label }}
              </ElTag>
              <span class="text-gray-400">— {{ record.operator_name }}</span>
            </div>
            <div v-if="record.comment" class="mt-1 text-sm text-gray-500">
              {{ record.comment }}
            </div>
          </ElTimelineItem>
        </ElTimeline>
        <ElEmpty v-else description="暂无审批记录" />
      </ElCard>
    </div>
  </ElDrawer>
</template>

<style scoped>
:deep(.g6-tooltip) {
  background: #1E2028 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>