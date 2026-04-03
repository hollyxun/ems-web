<script setup lang="tsx">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElButton, ElMessage, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { fetchDeleteTemplate, fetchExportTemplate, fetchGetTemplateList } from '@/service/api/scheduling/rule-engine';
import TemplateOperateDrawer from './modules/template-operate-drawer.vue';

defineOptions({ name: 'RuleTemplatePage' });

const { bool: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean(false);

const loading = ref(false);
const tableData = ref<Api.Scheduling.RuleTemplate[]>([]);
const total = ref(0);
const editingTemplate = ref<Api.Scheduling.RuleTemplate | null>(null);

const searchParams = reactive({
  page: 1,
  pageSize: 10,
  templateCode: '',
  templateName: '',
  ruleType: undefined as number | undefined,
  isPublic: true
});

const ruleTypeOptions = [
  { label: '排班模式', value: 1 },
  { label: '日历映射', value: 2 },
  { label: '轮班算法', value: 3 }
];

const columns = computed(() => [
  { key: 'templateCode', title: '模板编码', align: 'left', width: 150 },
  { key: 'templateName', title: '模板名称', align: 'left', minWidth: 150 },
  {
    key: 'ruleType',
    title: '规则类型',
    align: 'center',
    width: 120,
    render: (row: Api.Scheduling.RuleTemplate) => {
      const type = ruleTypeOptions.find(t => t.value === row.ruleType);
      const colorMap: Record<number, string> = {
        1: 'primary',
        2: 'success',
        3: 'warning'
      };
      return <ElTag type={colorMap[row.ruleType] || 'info'}>{type?.label || '未知'}</ElTag>;
    }
  },
  {
    key: 'isPublic',
    title: '可见性',
    align: 'center',
    width: 80,
    render: (row: Api.Scheduling.RuleTemplate) => (
      <ElTag type={row.isPublic ? 'success' : 'warning'}>{row.isPublic ? '公共' : '私有'}</ElTag>
    )
  },
  { key: 'applicableScope', title: '适用范围', align: 'center', width: 120 },
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
    width: 200,
    render: (row: Api.Scheduling.RuleTemplate) => (
      <div class="flex justify-center gap-2">
        <ElButton type="primary" text size="small" onClick={() => handleEdit(row)}>
          编辑
        </ElButton>
        <ElButton type="primary" text size="small" onClick={() => handleExport(row)}>
          导出
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
    const { data } = await fetchGetTemplateList(searchParams);
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
  searchParams.templateCode = '';
  searchParams.templateName = '';
  searchParams.ruleType = undefined;
  searchParams.page = 1;
  loadData();
}

function handleAdd() {
  editingTemplate.value = null;
  openDrawer();
}

function handleEdit(row: Api.Scheduling.RuleTemplate) {
  editingTemplate.value = { ...row };
  openDrawer();
}

async function handleExport(row: Api.Scheduling.RuleTemplate) {
  const { data, error } = await fetchExportTemplate(row.id);
  if (!error && data) {
    // 复制到剪贴板
    await navigator.clipboard.writeText(data);
    ElMessage.success('模板已复制到剪贴板');
  } else {
    ElMessage.error(error?.message || '导出失败');
  }
}

async function handleDelete(row: Api.Scheduling.RuleTemplate) {
  const confirmed = await window.$messageBox
    ?.confirm(`确定删除模板「${row.templateName}」吗？`, '删除确认', {
      type: 'warning'
    })
    .catch(() => false);

  if (!confirmed) return;

  const { error } = await fetchDeleteTemplate(row.id);
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
        <ElFormItem label="模板编码" class="mb-0">
          <ElInput v-model="searchParams.templateCode" placeholder="请输入模板编码" clearable class="w-180px" />
        </ElFormItem>
        <ElFormItem label="模板名称" class="mb-0">
          <ElInput v-model="searchParams.templateName" placeholder="请输入模板名称" clearable class="w-180px" />
        </ElFormItem>
        <ElFormItem label="规则类型" class="mb-0">
          <ElSelect v-model="searchParams.ruleType" placeholder="请选择" clearable class="w-150px">
            <ElOption v-for="item in ruleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <span class="text-lg font-bold">规则模板列表</span>
          <ElButton type="primary" @click="handleAdd">新增模板</ElButton>
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
        />
      </div>
    </ElCard>

    <!-- 编辑抽屉 -->
    <TemplateOperateDrawer v-model:visible="drawerVisible" :template="editingTemplate" @success="handleDrawerSuccess" />
  </div>
</template>
