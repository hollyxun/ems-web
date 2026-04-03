<script setup lang="tsx">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElButton, ElMessage, ElTag } from 'element-plus';
import {
  fetchActivateVersion,
  fetchGetVersionHistory,
  fetchRollbackVersion
} from '@/service/api/scheduling/rule-engine';
import VersionHistoryDrawer from './modules/version-history-drawer.vue';
import CreateVersionDrawer from './modules/create-version-drawer.vue';

defineOptions({ name: 'RuleVersionPage' });

const loading = ref(false);
const tableData = ref<Api.Scheduling.RuleVersionResponse[]>([]);
const currentRuleId = ref<number>(0);
const currentRuleName = ref('');

// 抽屉控制
const historyVisible = ref(false);
const createVisible = ref(false);
const selectedVersion = ref<Api.Scheduling.RuleVersionResponse | null>(null);

const searchParams = reactive({
  ruleId: undefined as number | undefined
});

const columns = computed(() => [
  { key: 'versionNo', title: '版本号', align: 'center', width: 80 },
  { key: 'versionName', title: '版本名称', align: 'left', width: 150 },
  {
    key: 'isActive',
    title: '状态',
    align: 'center',
    width: 100,
    render: (row: Api.Scheduling.RuleVersionResponse) => (
      <ElTag type={row.isActive ? 'success' : 'info'}>{row.isActive ? '当前激活' : '历史版本'}</ElTag>
    )
  },
  { key: 'effectiveFrom', title: '生效时间', align: 'center', width: 160 },
  { key: 'changeReason', title: '变更原因', align: 'left', minWidth: 200, ellipsis: { tooltip: true } },
  { key: 'createdBy', title: '创建人', align: 'center', width: 100 },
  { key: 'createdAt', title: '创建时间', align: 'center', width: 160 },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    width: 200,
    render: (row: Api.Scheduling.RuleVersionResponse) => (
      <div class="flex justify-center gap-2">
        {!row.isActive && (
          <ElButton type="primary" text size="small" onClick={() => handleActivate(row)}>
            激活
          </ElButton>
        )}
        {!row.isActive && (
          <ElButton type="warning" text size="small" onClick={() => handleRollback(row)}>
            回滚
          </ElButton>
        )}
        <ElButton type="primary" text size="small" onClick={() => handleViewConfig(row)}>
          查看配置
        </ElButton>
      </div>
    )
  }
]);

async function loadData() {
  if (!searchParams.ruleId) {
    tableData.value = [];
    return;
  }

  loading.value = true;
  try {
    const { data } = await fetchGetVersionHistory(searchParams.ruleId);
    if (data) {
      tableData.value = data;
    }
  } finally {
    loading.value = false;
  }
}

function handleRuleChange(ruleId: number, ruleName: string) {
  searchParams.ruleId = ruleId;
  currentRuleId.value = ruleId;
  currentRuleName.value = ruleName;
  loadData();
}

async function handleActivate(row: Api.Scheduling.RuleVersionResponse) {
  const confirmed = await window.$messageBox
    ?.confirm(`确定激活版本「${row.versionName}」吗？当前激活版本将被替换。`, '激活确认', { type: 'warning' })
    .catch(() => false);

  if (!confirmed) return;

  const { error } = await fetchActivateVersion({
    ruleId: row.ruleId,
    versionId: row.id
  });

  if (!error) {
    ElMessage.success('激活成功');
    loadData();
  } else {
    ElMessage.error(error.message || '激活失败');
  }
}

async function handleRollback(row: Api.Scheduling.RuleVersionResponse) {
  const confirmed = await window.$messageBox
    ?.confirm(`确定回滚到版本「${row.versionName}」吗？将创建新版本作为回滚记录。`, '回滚确认', { type: 'warning' })
    .catch(() => false);

  if (!confirmed) return;

  const { error } = await fetchRollbackVersion({
    ruleId: row.ruleId,
    versionId: row.id
  });

  if (!error) {
    ElMessage.success('回滚成功');
    loadData();
  } else {
    ElMessage.error(error.message || '回滚失败');
  }
}

function handleViewConfig(row: Api.Scheduling.RuleVersionResponse) {
  selectedVersion.value = row;
  historyVisible.value = true;
}

function handleCreateVersion() {
  if (!searchParams.ruleId) {
    ElMessage.warning('请先选择规则');
    return;
  }
  createVisible.value = true;
}

function handleCreateSuccess() {
  createVisible.value = false;
  loadData();
}

// 暴露方法供路由参数使用
defineExpose({ handleRuleChange });

onMounted(() => {
  // 从路由参数获取规则ID
  const route = window.$router?.currentRoute?.value;
  if (route?.query?.ruleId) {
    const ruleId = Number(route.query.ruleId);
    const ruleName = String(route.query.ruleName || '');
    handleRuleChange(ruleId, ruleName);
  }
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 头部 -->
    <ElCard class="card-wrapper">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-lg font-bold">版本管理</span>
          <ElTag v-if="currentRuleName" type="primary">{{ currentRuleName }}</ElTag>
        </div>
        <ElButton type="primary" :disabled="!searchParams.ruleId" @click="handleCreateVersion">创建新版本</ElButton>
      </div>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard class="flex-1 card-wrapper">
      <ElTable v-loading="loading" :data="tableData" stripe>
        <ElTableColumn v-for="col in columns" :key="col.key" v-bind="col">
          <template #default="{ row }">
            <component :is="col.render?.(row)" v-if="col.render" />
            <span v-else>{{ row[col.key] || '-' }}</span>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElEmpty v-if="!loading && tableData.length === 0" description="请从规则配置页面选择规则查看版本历史" />
    </ElCard>

    <!-- 查看配置抽屉 -->
    <VersionHistoryDrawer v-model:visible="historyVisible" :version="selectedVersion" />

    <!-- 创建版本抽屉 -->
    <CreateVersionDrawer v-model:visible="createVisible" :rule-id="currentRuleId" @success="handleCreateSuccess" />
  </div>
</template>
