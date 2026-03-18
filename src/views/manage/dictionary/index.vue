<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchCreateDictionary,
  fetchDeleteDictionary,
  fetchGetDictionaryByType,
  fetchGetDictionaryList,
  fetchUpdateDictionary
} from '@/service/api';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import DictionaryOperateDrawer from './modules/dictionary-operate-drawer.vue';

defineOptions({ name: 'DictionaryManage' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.DictionarySearchParams {
  return {
    page: 1,
    pageSize: 30,
    name: undefined,
    type: undefined,
    status: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetDictionaryList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage ?? 1;
    searchParams.value.pageSize = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'name', label: '字典名称', minWidth: 120 },
    { prop: 'type', label: '字典类型', minWidth: 120 },
    { prop: 'description', label: '描述', minWidth: 150 },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: row => {
        const isSuccess = row.status === 1;
        return <ElTag type={isSuccess ? 'success' : 'danger'}>{isSuccess ? '启用' : '禁用'}</ElTag>;
      }
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      width: 250
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 200,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => viewData(row)}>
            数据
          </ElButton>
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

/** dictionary data drawer */
const dataDrawerVisible = ref(false);
const dictionaryData = ref<Api.SystemManage.DictionaryData[]>([]);
const currentDictionary = ref<Api.SystemManage.Dictionary | null>(null);

async function viewData(row: Api.SystemManage.Dictionary) {
  currentDictionary.value = row;
  const { data: result } = await fetchGetDictionaryByType(row.type);
  dictionaryData.value = result?.dictionaryData || [];
  dataDrawerVisible.value = true;
}

async function handleBatchDelete() {
  // 批量删除字典需要单独实现
  window.$message?.warning('请逐个删除字典');
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteDictionary(id);
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
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem :title="$t('common.search')" name="dict-search">
          <ElForm :model="searchParams" label-position="right" :label-width="80">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="字典名称" prop="name">
                  <ElInput v-model="searchParams.name" placeholder="请输入字典名称" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="字典类型" prop="type">
                  <ElInput v-model="searchParams.type" placeholder="请输入字典类型" />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="状态" prop="status">
                  <ElSelect v-model="searchParams.status" clearable placeholder="请选择状态">
                    <ElOption label="启用" :value="1" />
                    <ElOption label="禁用" :value="2" />
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
          <p>字典管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @delete="handleBatchDelete"
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
      <DictionaryOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>

    <!-- Dictionary Data Drawer -->
    <ElDrawer v-model="dataDrawerVisible" :title="`字典数据 - ${currentDictionary?.name || ''}`" :size="600">
      <ElTable :data="dictionaryData" border>
        <ElTableColumn prop="label" label="标签" />
        <ElTableColumn prop="value" label="值" />
        <ElTableColumn prop="sort" label="排序" width="80" />
        <ElTableColumn prop="remark" label="备注" />
        <ElTableColumn prop="status" label="状态" width="80">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDrawer>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
