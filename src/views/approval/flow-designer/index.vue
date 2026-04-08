<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import {
  ElButton,
  ElCard,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag
} from 'element-plus';
import {
  fetchActivateDefinition,
  fetchCreateDefinition,
  fetchDefinitionList,
  fetchDeleteDefinition,
  fetchUpdateDefinition
} from '@/service/api/approval';
import {
  type ApprovalFlowData,
  type ApprovalNodeData,
  type ApprovalNodeType,
  useApprovalFlow
} from './modules/use-approval-flow';

defineOptions({ name: 'ApprovalFlowDesigner' });

// 列表状态
const loading = ref(false);
const definitions = ref<Api.Approval.Definition[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 编辑状态
const editingDefinition = ref<Api.Approval.Definition | null>(null);
const editorVisible = ref(false);
const editorMode = ref<'list' | 'design'>('list');
const saving = ref(false);

// 流程设计状态
const containerRef = ref<HTMLElement | null>(null);
const flowHandle = shallowRef<ReturnType<typeof useApprovalFlow> | null>(null);
const flowData = ref<ApprovalFlowData>({ nodes: [], edges: [] });
const selectedNode = ref<ApprovalNodeData | null>(null);
const nodeConfigVisible = ref(false);

// 节点类型配置
const nodeTypes: { type: ApprovalNodeType; name: string; color: string }[] = [
  { type: 'start', name: '开始节点', color: '#10B981' },
  { type: 'end', name: '结束节点', color: '#EF4444' },
  { type: 'approval', name: '审批节点', color: '#3B82F6' },
  { type: 'condition', name: '条件节点', color: '#F59E0B' },
  { type: 'parallel', name: '并行网关', color: '#8B5CF6' }
];

// 加载流程定义列表
async function loadDefinitions() {
  loading.value = true;
  const { data } = await fetchDefinitionList({ page: currentPage.value, pageSize: pageSize.value });
  if (data) {
    definitions.value = data.list || [];
    total.value = data.total || 0;
  }
  loading.value = false;
}

// 新建流程
function handleCreate() {
  editingDefinition.value = null;
  flowData.value = {
    nodes: [
      { id: 'start_1', name: '开始', type: 'start' },
      { id: 'end_1', name: '结束', type: 'end' }
    ],
    edges: []
  };
  editorVisible.value = true;
  editorMode.value = 'design';
}

// 编辑流程
async function handleEdit(row: Api.Approval.Definition) {
  editingDefinition.value = row;
  try {
    const parsed = JSON.parse(row.definition_json);
    flowData.value = parsed;
  } catch {
    flowData.value = { nodes: [], edges: [] };
  }
  editorVisible.value = true;
  editorMode.value = 'design';
}

// 激活流程
async function handleActivate(id: number) {
  await fetchActivateDefinition({ id });
  ElMessage.success('已激活');
  loadDefinitions();
}

// 删除流程
async function handleDelete(id: number) {
  await fetchDeleteDefinition({ id });
  ElMessage.success('已删除');
  loadDefinitions();
}

// 添加节点
function handleAddNodeType(type: ApprovalNodeType) {
  const typeInfo = nodeTypes.find(t => t.type === type);
  if (!typeInfo) return;

  const id = `${type}_${Date.now()}`;
  const _maxX = flowData.value.nodes.reduce((max, n) => Math.max(max, (n as any).position?.x || 0), 0);

  const newNode: ApprovalNodeData = {
    id,
    name: typeInfo.name,
    type,
    config: type === 'approval' ? { approval_mode: 'or_sign', assignee_type: 'user', assignee_id: '' } : {}
  };
  flowData.value.nodes.push(newNode);

  // 刷新画布
  refreshCanvas();
}

// 刷新画布
function refreshCanvas() {
  if (containerRef.value && editorVisible.value) {
    setTimeout(() => {
      initFlow();
    }, 100);
  }
}

// 初始化流程图
function initFlow() {
  if (!containerRef.value) return;

  if (flowHandle.value) {
    flowHandle.value = null;
  }

  flowHandle.value = useApprovalFlow({
    container: containerRef.value,
    data: flowData.value,
    editable: true,
    onNodeClick: node => {
      selectedNode.value = node;
      nodeConfigVisible.value = true;
    },
    onCanvasClick: () => {
      selectedNode.value = null;
    }
  });
}

// 保存流程定义
async function handleSave() {
  if (!flowData.value.nodes.some(n => n.type === 'start')) {
    ElMessage.warning('流程必须包含开始节点');
    return;
  }
  if (!flowData.value.nodes.some(n => n.type === 'end')) {
    ElMessage.warning('流程必须包含结束节点');
    return;
  }

  saving.value = true;
  try {
    const definitionJson = JSON.stringify(flowData.value);
    if (editingDefinition.value?.id) {
      await fetchUpdateDefinition({
        id: editingDefinition.value.id,
        definition_json: definitionJson
      });
      ElMessage.success('更新成功');
    } else {
      const name = `流程_${Date.now()}`;
      const code = `flow_${Date.now()}`;
      await fetchCreateDefinition({
        name,
        code,
        category: 'general',
        definition_json: definitionJson
      });
      ElMessage.success('创建成功');
    }
    editorVisible.value = false;
    loadDefinitions();
  } finally {
    saving.value = false;
  }
}

// 关闭编辑器
function handleCloseEditor() {
  editorVisible.value = false;
  flowHandle.value = null;
}

// 监听容器尺寸
useResizeObserver(containerRef, () => {
  // G6 会自动处理 resize
});

onMounted(() => {
  loadDefinitions();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 流程定义列表 -->
    <ElCard v-if="!editorVisible" shadow="never" class="h-full">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">流程定义管理</span>
          <ElButton type="primary" @click="handleCreate">
            <icon-mdi:plus class="mr-1" />
            新建流程
          </ElButton>
        </div>
      </template>

      <ElTable v-loading="loading" :data="definitions" stripe>
        <ElTableColumn prop="name" label="流程名称" min-width="150" />
        <ElTableColumn prop="code" label="编码" width="180" />
        <ElTableColumn prop="category" label="分类" width="120" />
        <ElTableColumn prop="version" label="版本" width="80" align="center" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag
              :type="row.status === 'active' ? 'success' : row.status === 'draft' ? 'warning' : 'info'"
              size="small"
            >
              {{ row.status === 'active' ? '已激活' : row.status === 'draft' ? '草稿' : '已废弃' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updated_at" label="更新时间" width="170" />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton size="small" @click="handleEdit(row)">编辑</ElButton>
            <ElButton v-if="row.status !== 'active'" type="success" size="small" @click="handleActivate(row.id)">
              激活
            </ElButton>
            <ElButton type="danger" size="small" @click="handleDelete(row.id)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadDefinitions"
        />
      </div>
    </ElCard>

    <!-- 流程设计器 -->
    <div v-if="editorVisible" class="h-full flex flex-col" style="background: #1e2028">
      <!-- 工具栏 -->
      <div class="flex items-center justify-between border-b px-4 py-3" style="border-color: rgba(255, 255, 255, 0.06)">
        <div class="flex items-center gap-4">
          <ElButton text @click="handleCloseEditor">
            <icon-mdi:arrow-left class="mr-1" />
            返回列表
          </ElButton>
          <span class="text-gray-300">{{ editingDefinition?.name || '新建流程' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- 添加节点 -->
          <ElDropdown trigger="click" @command="handleAddNodeType">
            <ElButton size="small" type="primary">
              <icon-mdi:plus class="mr-1" />
              添加节点
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-for="nt in nodeTypes" :key="nt.type" :command="nt.type">
                  <span :style="{ color: nt.color }">●</span>
                  {{ nt.name }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          <ElButton size="small" type="success" :loading="saving" @click="handleSave">保存</ElButton>
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="relative flex-1 overflow-hidden">
        <div ref="containerRef" class="h-full w-full"></div>
        <ElEmpty
          v-if="flowData.nodes.length === 0"
          description="点击「添加节点」开始设计流程"
          class="absolute inset-0 flex-center"
        />
      </div>
    </div>

    <!-- 节点配置抽屉 -->
    <ElDrawer v-model="nodeConfigVisible" title="节点配置" :size="360">
      <ElForm v-if="selectedNode" label-position="top">
        <ElFormItem label="节点名称">
          <ElInput v-model="selectedNode.name" />
        </ElFormItem>
        <ElFormItem label="节点类型">
          <ElTag>{{ nodeTypes.find(t => t.type === selectedNode?.type)?.name }}</ElTag>
        </ElFormItem>
        <template v-if="selectedNode?.type === 'approval'">
          <ElFormItem label="审批模式">
            <ElSelect v-model="selectedNode.config!.approval_mode">
              <ElOption label="或签（任一人通过即可）" value="or_sign" />
              <ElOption label="会签（所有人都需通过）" value="and_sign" />
              <ElOption label="逐级审批" value="sequential" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="指派人类型">
            <ElSelect v-model="selectedNode.config!.assignee_type">
              <ElOption label="指定用户" value="user" />
              <ElOption label="指定角色" value="role" />
              <ElOption label="指定部门" value="department" />
              <ElOption label="发起人上级" value="initiator_leader" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="指派人ID">
            <ElInput v-model="selectedNode.config!.assignee_id" placeholder="用户ID/角色ID/部门ID" />
          </ElFormItem>
        </template>
      </ElForm>
    </ElDrawer>
  </div>
</template>

<style scoped>
:deep(.g6-tooltip) {
  background: #1e2028 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>
