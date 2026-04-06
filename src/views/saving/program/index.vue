<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchProgramList, fetchDeleteProgram } from '@/service/api/saving';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ProgramDrawer from './modules/program-drawer.vue';

defineOptions({ name: 'EnergySavingProgram' });

const searchParams = ref({ page: 1, pageSize: 10, plan: undefined as string | undefined });

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchProgramList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'plan', label: '总体计划', minWidth: 200 },
    { prop: 'liablePerson', label: '项目组长', minWidth: 100 },
    { prop: 'completionTime', label: '完成时间', minWidth: 120 },
    { prop: 'savingAmount', label: '节约量', minWidth: 120 },
    { prop: 'currentWork', label: '当前工作', minWidth: 200 },
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
  const { error } = await fetchDeleteProgram(id);
  if (!error) onDeleted();
}

function edit(id: number) { handleEdit(id); }

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="计划" class="w-280px">
          <ElInput v-model="searchParams.plan" placeholder="搜索总体计划" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.plan = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>节能项目管理</p>
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
      <ProgramDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="getDataByPage" />
    </ElCard>
  </div>
</template>