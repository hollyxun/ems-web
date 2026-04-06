<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElTag, ElPopconfirm } from 'element-plus';
import { fetchPolicyList, fetchDeletePolicy } from '@/service/api/saving';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PolicyDrawer from './modules/policy-drawer.vue';

defineOptions({ name: 'PolicyManage' });

const searchParams = ref({ page: 1, pageSize: 10, title: undefined as string | undefined, type: undefined as string | undefined });

const policyTypes = ['国家政策', '地方政策', '行业标准', '企业制度'];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchPolicyList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'title', label: '政策标题', minWidth: 200 },
    { prop: 'type', label: '政策类型', width: 100, formatter: row => <ElTag>{row.type}</ElTag> },
    { prop: 'dept', label: '印发部门', minWidth: 120 },
    { prop: 'issuingTime', label: '印发时间', minWidth: 120 },
    {
      prop: 'operate', label: $t('common.operate'), align: 'center', width: 160,
      formatter: row => {
        const handleConfirm = () => handleDelete(row.id);
        return (
          <div class="flex-center">
            <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>{$t('common.edit')}</ElButton>
            <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={handleConfirm}>
              <ElButton type="danger" plain size="small">{$t('common.delete')}</ElButton>
            </ElPopconfirm>
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, onDeleted } = useTableOperate(data, 'id', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeletePolicy(id);
  if (!error) onDeleted();
}

function edit(id: number) { handleEdit(id); }

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="标题" class="w-280px">
          <ElInput v-model="searchParams.title" placeholder="搜索政策标题" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem label="类型" class="w-280px">
          <ElSelect v-model="searchParams.type" placeholder="选择类型" clearable>
            <ElOption v-for="t in policyTypes" :key="t" :label="t" :value="t" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.title = undefined; searchParams.type = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>政策法规管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="handleAdd" @refresh="getData" />
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="id">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination v-if="mobilePagination.total" layout="total,prev,pager,next,sizes" v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']" @size-change="mobilePagination['size-change']" />
      </div>
      <PolicyDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="getDataByPage" />
    </ElCard>
  </div>
</template>