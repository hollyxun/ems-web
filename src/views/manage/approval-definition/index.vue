<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchActivateDefinition,
  fetchDefinitionList,
  fetchDeleteDefinition,
  fetchGetDefinition
} from '@/service/api/approval';

defineOptions({ name: 'ApprovalDefinitionManage' });

const loading = ref(false);
const tableData = ref<Api.Approval.Definition[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');

async function loadData() {
  loading.value = true;
  const { data } = await fetchDefinitionList({
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value
  });
  if (data) {
    tableData.value = data.list || [];
    total.value = data.total || 0;
  }
  loading.value = false;
}

async function handleActivate(row: Api.Approval.Definition) {
  await fetchActivateDefinition({ id: row.id });
  ElMessage.success('已激活');
  loadData();
}

async function handleDelete(row: Api.Approval.Definition) {
  await fetchDeleteDefinition({ id: row.id });
  ElMessage.success('已删除');
  loadData();
}

function handleSearch() {
  currentPage.value = 1;
  loadData();
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadData();
}

const statusTagMap: Record<string, { type: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
  draft: { type: 'info', label: '草稿' },
  active: { type: 'success', label: '已激活' },
  deprecated: { type: 'warning', label: '已废弃' }
};

function getStatusInfo(status: string) {
  return statusTagMap[status] || { type: 'info' as const, label: status };
}

loadData();
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- 搜索区 -->
    <div class="flex items-center gap-4">
      <ElInput
        v-model="searchKeyword"
        placeholder="搜索流程名称/编码"
        clearable
        class="w-300px"
        @keyup.enter="handleSearch"
      />
      <ElButton type="primary" @click="handleSearch">搜索</ElButton>
      <ElButton @click="loadData">刷新</ElButton>
    </div>

    <!-- 表格区 -->
    <ElTable v-loading="loading" :data="tableData" stripe>
      <ElTableColumn prop="id" label="ID" width="80" />
      <ElTableColumn prop="name" label="流程名称" min-width="150" />
      <ElTableColumn prop="code" label="流程编码" width="120" />
      <ElTableColumn prop="category" label="分类" width="100" />
      <ElTableColumn prop="version" label="版本" width="80" />
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="{ row }">
          <ElTag :type="getStatusInfo(row.status).type" size="small">{{ getStatusInfo(row.status).label }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="created_at" label="创建时间" width="170" />
      <ElTableColumn prop="updated_at" label="更新时间" width="170" />
      <ElTableColumn label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <ElButton v-if="row.status !== 'active'" type="success" size="small" @click="handleActivate(row)">
            激活
          </ElButton>
          <ElPopconfirm title="确认删除？" @confirm="handleDelete(row)">
            <template #reference>
              <ElButton type="danger" size="small">删除</ElButton>
            </template>
          </ElPopconfirm>
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
