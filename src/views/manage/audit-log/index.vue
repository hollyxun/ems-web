<script setup lang="tsx">
import { ref, reactive, onMounted } from 'vue';
import { ElButton, ElTag, ElInput } from 'element-plus';
import { fetchGetAuditLogs, fetchGetAuditLogDetail } from '@/service/api/audit-log';
import type { AuditLog } from '@/service/api/audit-log';

defineOptions({ name: 'AuditLogManage' });

const loading = ref(false);
const data = ref<AuditLog[]>([]);
const total = ref(0);

const searchParams = reactive({
  page: 1,
  pageSize: 20,
  userId: undefined as number | undefined,
  method: '',
  path: '',
  startTime: '',
  endTime: ''
});

const actionColors: Record<string, UI.ThemeColor> = {
  login: 'success',
  logout: 'info',
  create: 'primary',
  update: 'warning',
  delete: 'danger',
  export: '',
  permission_change: 'danger'
};

const detailVisible = ref(false);
const detailData = ref<AuditLog | null>(null);

// Load logs
async function getData() {
  loading.value = true;
  try {
    const res = await fetchGetAuditLogs(searchParams);
    data.value = res.data?.list || [];
    total.value = res.data?.total || 0;
  } catch (error) {
    console.error('Load audit logs failed:', error);
  } finally {
    loading.value = false;
  }
}

// View log detail
async function viewDetail(id: number) {
  try {
    const res = await fetchGetAuditLogDetail(id);
    detailData.value = res.data;
    detailVisible.value = true;
  } catch (error) {
    console.error('Load log detail failed:', error);
  }
}

// Handle search
function handleSearch() {
  searchParams.page = 1;
  getData();
}

// Handle reset
function handleReset() {
  searchParams.userId = undefined;
  searchParams.method = '';
  searchParams.path = '';
  searchParams.startTime = '';
  searchParams.endTime = '';
  handleSearch();
}

// Handle page change
function handlePageChange(page: number) {
  searchParams.page = page;
  getData();
}

// Handle page size change
function handleSizeChange(size: number) {
  searchParams.pageSize = size;
  searchParams.page = 1;
  getData();
}

// Format time
function formatTime(time: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'userId', label: '用户ID', width: 80 },
  {
    prop: 'action',
    label: '操作类型',
    width: 100,
    formatter: (row: AuditLog) => {
      const color = actionColors[row.action] || '';
      return <ElTag type={color} size="small">{row.action || row.method}</ElTag>;
    }
  },
  { prop: 'module', label: '模块', width: 100 },
  { prop: 'path', label: '路径', minWidth: 200 },
  { prop: 'ip', label: 'IP', width: 130 },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    formatter: (row: AuditLog) => {
      const isSuccess = row.status >= 200 && row.status < 300;
      return <ElTag type={isSuccess ? 'success' : 'danger'} size="small">{row.status}</ElTag>;
    }
  },
  {
    prop: 'latency',
    label: '耗时(ms)',
    width: 90,
    formatter: (row: AuditLog) => <span>{row.latency}</span>
  },
  {
    prop: 'createdAt',
    label: '时间',
    width: 170,
    formatter: (row: AuditLog) => <span>{formatTime(row.createdAt)}</span>
  },
  {
    prop: 'operate',
    label: '操作',
    width: 80,
    fixed: 'right',
    formatter: (row: AuditLog) => (
      <ElButton type="primary" link size="small" onClick={() => viewDetail(row.id)}>
        详情
      </ElButton>
    )
  }
];

onMounted(getData);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem title="搜索" name="audit-log-search">
          <ElForm :model="searchParams" label-position="right" :label-width="80">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="用户ID" prop="userId">
                  <ElInput v-model.number="searchParams.userId" placeholder="用户ID" clearable />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="操作类型" prop="method">
                  <ElSelect v-model="searchParams.method" placeholder="全部" clearable>
                    <ElOption label="登录" value="login" />
                    <ElOption label="创建" value="create" />
                    <ElOption label="修改" value="update" />
                    <ElOption label="删除" value="delete" />
                    <ElOption label="导出" value="export" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="路径" prop="path">
                  <ElInput v-model="searchParams.path" placeholder="路径关键词" clearable />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="开始日期" prop="startTime">
                  <ElDatePicker
                    v-model="searchParams.startTime"
                    type="date"
                    placeholder="开始日期"
                    value-format="YYYY-MM-DD"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="结束日期" prop="endTime">
                  <ElDatePicker
                    v-model="searchParams.endTime"
                    type="date"
                    placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="24" :sm="24">
                <ElSpace class="w-full justify-end" alignment="end">
                  <ElButton @click="handleReset">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    重置
                  </ElButton>
                  <ElButton type="primary" plain @click="handleSearch">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    查询
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
          <p>操作日志</p>
          <ElButton @click="getData">
            <template #icon>
              <icon-ic-round-refresh class="text-icon" />
            </template>
            刷新
          </ElButton>
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
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-model:current-page="searchParams.page"
          v-model:page-size="searchParams.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <!-- Detail Dialog -->
    <ElDialog v-model="detailVisible" title="日志详情" width="600px">
      <ElDescriptions v-if="detailData" :column="2" border>
        <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户ID">{{ detailData.userId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作类型">{{ detailData.action || detailData.method }}</ElDescriptionsItem>
        <ElDescriptionsItem label="模块">{{ detailData.module }}</ElDescriptionsItem>
        <ElDescriptionsItem label="路径" :span="2">{{ detailData.path }}</ElDescriptionsItem>
        <ElDescriptionsItem label="IP">{{ detailData.ip }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">{{ detailData.status }}</ElDescriptionsItem>
        <ElDescriptionsItem label="耗时">{{ detailData.latency }}ms</ElDescriptionsItem>
        <ElDescriptionsItem label="时间">{{ formatTime(detailData.createdAt) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="User-Agent" :span="2">{{ detailData.agent }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求体" :span="2">
          <ElInput :model-value="detailData.body" type="textarea" :rows="5" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="detailData.errorMessage" label="错误信息" :span="2">
          <ElText type="danger">{{ detailData.errorMessage }}</ElText>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
</style>