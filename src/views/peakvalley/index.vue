<script setup lang="tsx">
import { onMounted, ref, computed } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchPriceDateList, fetchDeletePriceDate } from '@/service/api/peakvalley';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PriceDateDrawer from './modules/price-date-drawer.vue';

defineOptions({ name: 'PeakValleyManage' });

const searchParams = ref({ page: 1, pageSize: 10, remark: undefined as string | undefined });

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchPriceDateList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'beginDate', label: '开始日期', minWidth: 120 },
    { prop: 'endDate', label: '结束日期', minWidth: 120 },
    { prop: 'remark', label: '备注', minWidth: 150 },
    { prop: 'createdAt', label: '创建时间', minWidth: 160 },
    {
      prop: 'operate', label: $t('common.operate'), align: 'center', width: 200,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>编辑</ElButton>
          <ElButton type="success" plain size="small" onClick={() => configPrice(row.id)}>配置电价</ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.id)}>
            {{ reference: () => <ElButton type="danger" plain size="small">{$t('common.delete')}</ElButton> }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, onDeleted } = useTableOperate(data, 'id', getData);

const showPriceConfig = ref(false);
const currentParentId = ref<number | null>(null);

async function handleDelete(id: number) {
  const { error } = await fetchDeletePriceDate(id);
  if (!error) onDeleted();
}

function edit(id: number) { handleEdit(id); }

function configPrice(id: number) {
  currentParentId.value = id;
  showPriceConfig.value = true;
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="备注" class="w-280px">
          <ElInput v-model="searchParams.remark" placeholder="搜索备注" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.remark = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>电价时间段配置</p>
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
      <PriceDateDrawer v-model:visible="drawerVisible" :operate-type="operateType" :row-data="editingData" @submitted="getDataByPage" />
    </ElCard>

    <!-- 电价配置弹窗 -->
    <PriceConfigDrawer v-model:visible="showPriceConfig" :parent-id="currentParentId" />
  </div>
</template>