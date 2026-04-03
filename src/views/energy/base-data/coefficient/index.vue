<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import dayjs from 'dayjs';
import { fetchDeleteCoefficient, fetchGetAllMediums, fetchGetCoefficientList } from '@/service/api/energy';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import CoefficientSearch from './modules/coefficient-search.vue';
import CoefficientOperateDrawer from './modules/coefficient-operate-drawer.vue';

defineOptions({ name: 'EnergyCoefficient' });

const searchParams = ref(getInitSearchParams());
const allMediums = ref<Api.Energy.Medium[]>([]);

// Late binding for handleEdit (populated after useTableOperate)
const editHandler = ref<(row: any) => void>(() => {});

const coefficientTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '折标煤系数', type: 'primary' },
  2: { label: '碳排放系数', type: 'warning' }
};

function getInitSearchParams(): Api.Energy.CoefficientSearchParams {
  return {
    page: 1,
    pageSize: 10,
    mediumId: undefined,
    coefficientType: undefined,
    status: undefined
  };
}

async function loadMediums() {
  const { data } = await fetchGetAllMediums();
  if (data) {
    allMediums.value = data;
  }
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: 1,
    pageSize: 10
  },
  api: () => fetchGetCoefficientList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'mediumName', label: '所属介质', minWidth: 120 },
    {
      prop: 'coefficientType',
      label: '系数类型',
      width: 120,
      align: 'center',
      formatter: row => {
        const config = coefficientTypeMap[row.coefficientType] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    { prop: 'coefficientPurpose', label: '用途', minWidth: 120 },
    {
      prop: 'coefficientValue',
      label: '系数值',
      width: 120,
      align: 'right',
      formatter: row => row.coefficientValue.toFixed(6)
    },
    { prop: 'unit', label: '单位', width: 100 },
    {
      prop: 'effectiveDate',
      label: '生效日期',
      width: 120,
      formatter: row => dayjs(row.effectiveDate).format('YYYY-MM-DD')
    },
    {
      prop: 'expiryDate',
      label: '失效日期',
      width: 120,
      formatter: row => (row.expiryDate ? dayjs(row.expiryDate).format('YYYY-MM-DD') : '-')
    },
    {
      prop: 'status',
      label: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      formatter: row => {
        const tagMap: Record<number, UI.ThemeColor> = {
          1: 'success',
          2: 'danger'
        };
        const label = row.status === 1 ? '启用' : '停用';
        return <ElTag type={tagMap[row.status] || 'info'}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 200,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => editHandler.value(row)}>
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

// Bind editHandler after useTableOperate returns handleEdit
editHandler.value = handleEdit;

async function handleDelete(id: number) {
  const { error } = await fetchDeleteCoefficient(id);
  if (!error) {
    onDeleted();
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

onMounted(() => {
  loadMediums();
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CoefficientSearch
      v-model:model="searchParams"
      :mediums="allMediums"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>系数折算管理</p>
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
    </ElCard>

    <CoefficientOperateDrawer
      v-model="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      :mediums="allMediums"
      @submitted="getDataByPage"
    />
  </div>
</template>
