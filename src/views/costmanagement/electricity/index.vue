<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchDeleteElectricityCost, fetchElectricityCostList } from '@/service/api/costmanagement';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ElectricityDrawer from './modules/electricity-drawer.vue';

defineOptions({ name: 'ElectricityCost' });

const searchParams = ref({
  page: 1,
  pageSize: 10,
  organizationId: undefined as number | undefined,
  timeType: undefined as string | undefined
});

const timeTypes = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchElectricityCostList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'dataTime', label: '数据时间', minWidth: 120 },
    { prop: 'timeType', label: '时间类型', width: 80 },
    { prop: 'totalElectricity', label: '总电量(kWh)', minWidth: 120 },
    { prop: 'totalFee', label: '总电费(元)', minWidth: 120 },
    { prop: 'sharpElectricity', label: '尖电量', width: 100 },
    { prop: 'peakElectricity', label: '峰电量', width: 100 },
    { prop: 'flatElectricity', label: '平电量', width: 100 },
    { prop: 'valleyElectricity', label: '谷电量', width: 100 },
    { prop: 'powerFactor', label: '功率因数', width: 100 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 160,
      formatter: row => {
        const handleConfirm = () => handleDelete(row.id);
        return (
          <div class="flex-center">
            <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>
              {$t('common.edit')}
            </ElButton>
            <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={handleConfirm}>
              <ElButton type="danger" plain size="small">
                {$t('common.delete')}
              </ElButton>
            </ElPopconfirm>
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, onDeleted } = useTableOperate(
  data,
  'id' as const,
  getData
);

async function handleDelete(id: string) {
  const { error } = await fetchDeleteElectricityCost(id);
  if (!error) onDeleted();
}

function edit(id: string) {
  handleEdit(id);
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="时间类型" class="w-280px">
          <ElSelect v-model="searchParams.timeType" placeholder="选择时间类型" clearable>
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="() => getDataByPage()">查询</ElButton>
          <ElButton
            @click="
              () => {
                searchParams.timeType = undefined;
                getDataByPage();
              }
            "
          >
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>电费录入管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="handleAdd" @refresh="getData" />
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="id">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
      <ElectricityDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>
  </div>
</template>
