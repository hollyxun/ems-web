<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElOption, ElTag } from 'element-plus';
import {
  fetchCleanupAuditLogs,
  fetchGetAuditActions,
  fetchGetAuditCategories,
  fetchGetAuditLogById,
  fetchGetAuditLogList
} from '@/service/api/audit';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'AuditLogManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.Audit.AuditLogSearchParams {
  return {
    page: 1,
    pageSize: 30,
    userId: undefined,
    username: undefined,
    action: undefined,
    category: undefined,
    module: undefined,
    startTime: undefined,
    endTime: undefined,
    ipAddress: undefined,
    status: undefined,
    requestPath: undefined
  };
}

const methodColorMap: Record<string, UI.ThemeColor> = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger',
  PATCH: 'info'
};

const categoryColorMap: Record<string, UI.ThemeColor | undefined> = {
  security: 'danger',
  operation: 'primary',
  compliance: 'warning'
};

const actionColorMap: Record<string, UI.ThemeColor | undefined> = {
  login: 'success',
  logout: 'info',
  create: 'primary',
  update: 'warning',
  delete: 'danger',
  export: 'info',
  import: 'info',
  view: undefined,
  execute: 'primary'
};

// 分类和操作类型选项
const categoryOptions = ref<Api.Audit.CategoryOption[]>([]);
const actionOptions = ref<Api.Audit.ActionOption[]>([]);

// 加载分类和操作类型选项
async function loadOptions() {
  const [catRes, actRes] = await Promise.all([fetchGetAuditCategories(), fetchGetAuditActions()]);
  if (!catRes.error && catRes.data) {
    categoryOptions.value = catRes.data;
  }
  if (!actRes.error && actRes.data) {
    actionOptions.value = actRes.data;
  }
}

loadOptions();

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetAuditLogList(searchParams.value),
  transform: response => defaultTransform(response as any),
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    {
      prop: 'category',
      label: '审计分类',
      width: 100,
      formatter: (row: Api.Audit.AuditLogItem) => {
        const color = categoryColorMap[row.category];
        const label = categoryOptions.value.find(c => c.value === row.category)?.label || row.category;
        return color ? <ElTag type={color}>{label}</ElTag> : <span>{label}</span>;
      }
    },
    {
      prop: 'action',
      label: '操作类型',
      width: 100,
      formatter: (row: Api.Audit.AuditLogItem) => {
        const color = actionColorMap[row.action];
        const label = actionOptions.value.find(a => a.value === row.action)?.label || row.action;
        return color ? <ElTag type={color}>{label}</ElTag> : <span>{label}</span>;
      }
    },
    { prop: 'username', label: '用户名', width: 120 },
    { prop: 'module', label: '业务模块', width: 100 },
    { prop: 'ipAddress', label: 'IP地址', width: 130 },
    {
      prop: 'requestMethod',
      label: '请求方法',
      width: 80,
      formatter: (row: Api.Audit.AuditLogItem) => {
        if (!row.requestMethod) return <span class="text-gray-400">-</span>;
        const color = methodColorMap[row.requestMethod] || 'info';
        return <ElTag type={color}>{row.requestMethod}</ElTag>;
      }
    },
    { prop: 'requestPath', label: '请求路径', minWidth: 200 },
    {
      prop: 'responseStatus',
      label: '响应状态',
      width: 80,
      formatter: (row: Api.Audit.AuditLogItem) => {
        if (!row.responseStatus) return <span class="text-gray-400">-</span>;
        const isSuccess = row.responseStatus >= 200 && row.responseStatus < 300;
        return <ElTag type={isSuccess ? 'success' : 'danger'}>{row.responseStatus}</ElTag>;
      }
    },
    {
      prop: 'latencyMs',
      label: '响应时间',
      width: 80,
      formatter: (row: Api.Audit.AuditLogItem) => {
        if (!row.latencyMs) return <span class="text-gray-400">-</span>;
        return <span>{row.latencyMs}ms</span>;
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 80,
      formatter: (row: Api.Audit.AuditLogItem) => {
        const isSuccess = row.status === 'success';
        return <ElTag type={isSuccess ? 'success' : 'danger'}>{isSuccess ? '成功' : '失败'}</ElTag>;
      }
    },
    {
      prop: 'createdAt',
      label: '操作时间',
      width: 300,
      formatter: (row: Api.Audit.AuditLogItem) => <span>{row.createdAt || '-'}</span>
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 80,
      formatter: (row: Api.Audit.AuditLogItem) => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => viewDetail(row)}>
            详情
          </ElButton>
        </div>
      )
    }
  ]
});

/** checked row keys */
const checkedRowKeys = ref<number[]>([]);

/** detail drawer */
const detailVisible = ref(false);
const detailData = ref<Api.Audit.AuditLogItem | null>(null);

async function viewDetail(row: Api.Audit.AuditLogItem) {
  // 获取完整详情
  const { error, data: detailResponse } = await fetchGetAuditLogById(row.id);
  if (!error && detailResponse) {
    detailData.value = detailResponse;
  } else {
    detailData.value = { ...row };
  }
  detailVisible.value = true;
}

/** 清理过期日志 */
const cleanupVisible = ref(false);
const cleanupDays = ref(90);
const cleanupDryRun = ref(true);
const cleanupResult = ref<{ dryRun: boolean; wouldDelete?: number; deletedCount?: number } | null>(null);

async function handleCleanup() {
  const { error, data: cleanupResponse } = await fetchCleanupAuditLogs({
    retentionDays: cleanupDays.value,
    dryRun: cleanupDryRun.value
  });
  if (!error && cleanupResponse) {
    cleanupResult.value = cleanupResponse as any;
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem :title="$t('common.search')" name="audit-search">
          <ElForm :model="searchParams" label-position="right" :label-width="80">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="用户名" prop="username">
                  <ElInput v-model="searchParams.username" placeholder="请输入用户名" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="审计分类" prop="category">
                  <ElSelect v-model="searchParams.category" clearable placeholder="请选择分类">
                    <ElOption
                      v-for="item in categoryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="操作类型" prop="action">
                  <ElSelect v-model="searchParams.action" clearable placeholder="请选择操作类型">
                    <ElOption v-for="item in actionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="请求路径" prop="requestPath">
                  <ElInput v-model="searchParams.requestPath" placeholder="请输入请求路径" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="IP地址" prop="ipAddress">
                  <ElInput v-model="searchParams.ipAddress" placeholder="请输入IP地址" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="执行状态" prop="status">
                  <ElSelect v-model="searchParams.status" clearable placeholder="请选择状态">
                    <ElOption label="成功" value="success" />
                    <ElOption label="失败" value="failed" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="24" :sm="24">
                <ElSpace class="w-full justify-end" alignment="end">
                  <ElButton @click="resetSearchParams">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    {{ $t('common.reset') }}
                  </ElButton>
                  <ElButton type="primary" plain @click="() => getDataByPage()">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </ElButton>
                </ElSpace>
              </ElCol>
            </ElRow>
          </ElForm>
        </ElCollapseItem>
      </ElCollapse>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>审计日志</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="true"
            :loading="loading"
            :show-add="false"
            :show-delete="false"
            @refresh="getData"
          >
            <template #prefix>
              <ElButton type="warning" plain @click="cleanupVisible = true">
                <template #icon>
                  <icon-ic-round-delete-sweep class="text-icon" />
                </template>
                清理过期日志
              </ElButton>
            </template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable
          v-loading="loading"
          height="100%"
          border
          class="sm:h-full"
          :data="data"
          row-key="id"
          @selection-change="checkedRowKeys = $event"
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
    </ElCard>

    <!-- Detail Drawer -->
    <ElDrawer v-model="detailVisible" title="审计日志详情" :size="600">
      <ElDescriptions v-if="detailData" :column="2" border>
        <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户">{{ detailData.username }} (ID: {{ detailData.userId }})</ElDescriptionsItem>
        <ElDescriptionsItem label="审计分类">{{ detailData.category }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作类型">{{ detailData.action }}</ElDescriptionsItem>
        <ElDescriptionsItem label="业务模块">{{ detailData.module || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="IP地址">{{ detailData.ipAddress }}</ElDescriptionsItem>
        <ElDescriptionsItem label="目标类型">{{ detailData.targetType || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="目标名称">{{ detailData.targetName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求方法">{{ detailData.requestMethod || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="响应状态">{{ detailData.responseStatus || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求路径" :span="2">{{ detailData.requestPath || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="响应时间">{{ detailData.latencyMs }}ms</ElDescriptionsItem>
        <ElDescriptionsItem label="执行状态">
          <ElTag :type="detailData.status === 'success' ? 'success' : 'danger'">
            {{ detailData.status === 'success' ? '成功' : '失败' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="User-Agent" :span="2">{{ detailData.userAgent || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作时间" :span="2">{{ detailData.createdAt }}</ElDescriptionsItem>
        <ElDescriptionsItem v-if="detailData.errorMessage" label="错误信息" :span="2">
          <ElText type="danger">{{ detailData.errorMessage }}</ElText>
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="detailData.requestBody" label="请求Body" :span="2">
          <ElInput :model-value="detailData.requestBody" type="textarea" :rows="5" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="detailData.responseBody" label="响应Body" :span="2">
          <ElInput :model-value="detailData.responseBody" type="textarea" :rows="5" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="detailData.details" label="额外详情" :span="2">
          <ElInput :model-value="detailData.details" type="textarea" :rows="3" readonly />
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDrawer>

    <!-- Cleanup Dialog -->
    <ElDialog v-model="cleanupVisible" title="清理过期日志" width="400">
      <ElForm label-position="right" :label-width="100">
        <ElFormItem label="保留天数">
          <ElInputNumber v-model="cleanupDays" :min="30" :max="365" />
        </ElFormItem>
        <ElFormItem label="预览模式">
          <ElSwitch v-model="cleanupDryRun" active-text="预览" inactive-text="执行" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="cleanupVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleCleanup">执行</ElButton>
      </template>
      <ElAlert v-if="cleanupResult" :type="cleanupResult.dryRun ? 'info' : 'success'" :closable="false">
        <template #title>
          {{
            cleanupResult.dryRun
              ? `预估删除 ${cleanupResult.wouldDelete} 条日志`
              : `已删除 ${cleanupResult.deletedCount} 条日志`
          }}
        </template>
      </ElAlert>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
