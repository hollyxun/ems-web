<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchKnowledgeList,
  fetchDeleteKnowledge,
  fetchBatchDeleteKnowledge
} from '@/service/api/knowledge';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import KnowledgeSearch from './modules/knowledge-search.vue';
import KnowledgeDrawer from './modules/knowledge-drawer.vue';

defineOptions({ name: 'KnowledgeManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams() {
  return {
    page: 1,
    pageSize: 10,
    title: undefined,
    energyType: undefined
  } as Api.Knowledge.SearchParams;
}

const energyTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  0: { label: '电', type: 'warning' },
  1: { label: '水', type: 'primary' },
  2: { label: '天然气', type: 'success' },
  3: { label: '蒸汽', type: 'danger' }
};

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchKnowledgeList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage;
    searchParams.value.pageSize = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'title', label: '标题', minWidth: 200 },
    {
      prop: 'energyType',
      label: '能源类型',
      width: 100,
      align: 'center',
      formatter: row => {
        const item = energyTypeMap[row.energyType] || { label: '未知', type: 'info' };
        return <ElTag type={item.type}>{item.label}</ElTag>;
      }
    },
    {
      prop: 'content',
      label: '内容摘要',
      minWidth: 200,
      formatter: row => {
        const text = row.content?.replace(/<[^>]+>/g, '').slice(0, 50) || '-';
        return text + (row.content?.length > 50 ? '...' : '');
      }
    },
    { prop: 'createdAt', label: '创建时间', minWidth: 160 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 160,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.id)}>
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, checkedRowKeys, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteKnowledge(id);
  if (!error) {
    onDeleted();
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function edit(id: number) {
  handleEdit(id);
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <KnowledgeSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>知识库管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @refresh="getData"
          />
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
      <KnowledgeDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>
  </div>
</template>