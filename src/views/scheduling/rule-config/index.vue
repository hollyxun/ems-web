<script setup lang="tsx">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElButton, ElMessage, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { fetchDeleteRuleConfig, fetchGetRuleConfigList } from '@/service/api/scheduling/rule-engine';
import RuleConfigOperateDrawer from './modules/rule-config-operate-drawer.vue';

defineOptions({ name: 'RuleConfigPage' });

const { bool: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean(false);

const loading = ref(false);
const tableData = ref<Api.Scheduling.RuleConfig[]>([]);
const total = ref(0);
const editingConfig = ref<Api.Scheduling.RuleConfig | null>(null);

const searchParams = reactive({
  page: 1,
  pageSize: 10,
  ruleCode: '',
  ruleName: '',
  ruleType: undefined as number | undefined,
  status: undefined as number | undefined
});

const ruleTypeOptions = [
  { label: '排班模式', value: 1 },
  { label: '日历映射', value: 2 },
  { label: '轮班算法', value: 3 }
];

const columns = computed(() => [
  { key: 'ruleCode', title: '规则编码', align: 'left', width: 150 },
  { key: 'ruleName', title: '规则名称', align: 'left', minWidth: 150 },
  {
    key: 'ruleType',
    title: '规则类型',
    align: 'center',
    width: 120,
    render: (row: Api.Scheduling.RuleConfig) => {
      const type = ruleTypeOptions.find(t => t.value === row.ruleType);
      const colorMap: Record<number, string> = {
        1: 'primary',
        2: 'success',
        3: 'warning'
      };
      return <ElTag type={colorMap[row.ruleType] || 'info'}>{type?.label || '未知'}</ElTag>;
    }
  },
  { key: 'category', title: '分类', align: 'center', width: 100 },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    width: 80,
    render: (row: Api.Scheduling.RuleConfig) => (
      <ElTag type={row.status === 1 ? 'success' : 'danger'}>{row.status === 1 ? '启用' : '禁用'}</ElTag>
    )
  },
  {
    key: 'description',
    title: '描述',
    align: 'left',
    minWidth: 200,
    ellipsis: { tooltip: true }
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    width: 180,
    render: (row: Api.Scheduling.RuleConfig) => (
      <div class="flex justify-center gap-2">
        <ElButton type="primary" text size="small" onClick={() => handleEdit(row)}>
          编辑
        </ElButton>
        <ElButton type="primary" text size="small" onClick={() => handleVersionHistory(row)}>
          版本
        </ElButton>
        <ElButton type="danger" text size="small" onClick={() => handleDelete(row)}>
          删除
        </ElButton>
      </div>
    )
  }
]);

async function loadData() {
  loading.value = true;
  try {
    const { data } = await fetchGetRuleConfigList(searchParams);
    if (data) {
      tableData.value = data.list || [];
      total.value = data.total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  searchParams.page = 1;
  loadData();
}

function handleReset() {
  searchParams.ruleCode = '';
  searchParams.ruleName = '';
  searchParams.ruleType = undefined;
  searchParams.status = undefined;
  searchParams.page = 1;
  loadData();
}

function handleAdd() {
  editingConfig.value = null;
  openDrawer();
}

function handleEdit(row: Api.Scheduling.RuleConfig) {
  editingConfig.value = { ...row };
  openDrawer();
}

function handleVersionHistory(row: Api.Scheduling.RuleConfig) {
  // 导航到版本管理页面
  window.$router?.push({
    path: '/scheduling/rule-version',
    query: { ruleId: row.id, ruleName: row.ruleName }
  });
}

async function handleDelete(row: Api.Scheduling.RuleConfig) {
  const confirmed = await window.$messageBox
    ?.confirm(`确定删除规则「${row.ruleName}」吗？`, '删除确认', {
      type: 'warning'
    })
    .catch(() => false);

  if (!confirmed) return;

  const { error } = await fetchDeleteRuleConfig(row.id);
  if (!error) {
    ElMessage.success('删除成功');
    loadData();
  } else {
    ElMessage.error(error.message || '删除失败');
  }
}

function handlePageChange(page: number) {
  searchParams.page = page;
  loadData();
}

function handlePageSizeChange(pageSize: number) {
  searchParams.pageSize = pageSize;
  searchParams.page = 1;
  loadData();
}

function handleDrawerSuccess() {
  closeDrawer();
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 搜索区域 -->
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" inline class="flex flex-wrap gap-4">
        <ElFormItem label="规则编码" class="mb-0">
          <ElInput v-model="searchParams.ruleCode" placeholder="请输入规则编码" clearable class="w-180px" />
        </ElFormItem>
        <ElFormItem label="规则名称" class="mb-0">
          <ElInput v-model="searchParams.ruleName" placeholder="请输入规则名称" clearable class="w-180px" />
        </ElFormItem>
        <ElFormItem label="规则类型" class="mb-0">
          <ElSelect v-model="searchParams.ruleType" placeholder="请选择" clearable class="w-150px">
            <ElOption v-for="item in ruleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态" class="mb-0">
          <ElSelect v-model="searchParams.status" placeholder="请选择" clearable class="w-120px">
            <ElOption label="启用" :value="1" />
            <ElOption label="禁用" :value="2" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="mb-0">
          <ElButton type="primary" @click="handleSearch">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard class="flex-1 card-wrapper">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold">规则配置列表</span>
          <ElButton type="primary" @click="handleAdd">新增规则</ElButton>
        </div>
      </template>

      <ElTable v-loading="loading" :data="tableData" stripe>
        <ElTableColumn v-for="col in columns" :key="col.key" v-bind="col">
          <template #default="{ row }">
            <component :is="col.render?.(row)" v-if="col.render" />
            <span v-else>{{ row[col.key] || '-' }}</span>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="searchParams.page"
          v-model:page-size="searchParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </ElCard>

    <!-- 编辑抽屉 -->
    <RuleConfigOperateDrawer v-model:visible="drawerVisible" :config="editingConfig" @success="handleDrawerSuccess" />
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow: auto;
}
</style>
