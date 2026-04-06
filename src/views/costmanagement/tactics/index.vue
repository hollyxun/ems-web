<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElTag, ElPopconfirm } from 'element-plus';
import { fetchPriceTacticsList, fetchDeletePriceTactics } from '@/service/api/costmanagement';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TacticsDrawer from './modules/tactics-drawer.vue';

defineOptions({ name: 'CostPriceTactics' });

const searchParams = ref({ page: 1, pageSize: 10, tacticsName: undefined as string | undefined, energyType: undefined as number | undefined });

const energyTypes = [
  { label: '电', value: 1 },
  { label: '水', value: 2 },
  { label: '气', value: 3 },
  { label: '热', value: 4 }
];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchPriceTacticsList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'tacticsNumber', label: '策略编码', minWidth: 120 },
    { prop: 'tacticsName', label: '策略名称', minWidth: 150 },
    { prop: 'energyType', label: '能源类型', width: 100, formatter: row => {
      const type = energyTypes.find(t => t.value === row.energyType);
      return <ElTag>{type?.label || '-'}</ElTag>;
    }},
    { prop: 'isLadder', label: '阶梯价格', width: 100, formatter: row => <ElTag type={row.isLadder ? 'success' : 'info'}>{row.isLadder ? '是' : '否'}</ElTag> },
    { prop: 'status', label: '状态', width: 80, formatter: row => <ElTag type={row.status === 1 ? 'success' : 'danger'}>{row.status === 1 ? '启用' : '停用'}</ElTag> },
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
  const { error } = await fetchDeletePriceTactics(id);
  if (!error) onDeleted();
}

function edit(id: number) { handleEdit(id); }

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="策略名称" class="w-280px">
          <ElInput v-model="searchParams.tacticsName" placeholder="搜索策略名称" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem label="能源类型" class="w-280px">
          <ElSelect v-model="searchParams.energyType" placeholder="选择能源类型" clearable>
            <ElOption v-for="t in energyTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.tacticsName = undefined; searchParams.energyType = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>成本策略管理</p>
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
      <TacticsDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="getDataByPage" />
    </ElCard>
  </div>
</template>