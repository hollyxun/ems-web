<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import { fetchDeleteUnit, fetchGetAllMediums, fetchGetUnitList, fetchSetStandardUnit } from '@/service/api/energy';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import UnitSearch from './modules/unit-search.vue';
import UnitOperateDrawer from './modules/unit-operate-drawer.vue';

defineOptions({ name: 'EnergyUnit' });

const searchParams = ref(getInitSearchParams());
const allMediums = ref<Api.Energy.Medium[]>([]);

function getInitSearchParams(): Api.Energy.UnitSearchParams {
  return {
    mediumId: undefined,
    mediumCode: undefined,
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
  api: () => fetchGetUnitList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'mediumName', label: '所属介质', minWidth: 120 },
    { prop: 'unitCode', label: '单位编码', minWidth: 100 },
    { prop: 'unitName', label: '单位名称', minWidth: 100 },
    {
      prop: 'isStandard',
      label: '标准单位',
      width: 100,
      align: 'center',
      formatter: row => {
        return row.isStandard ? (
          <ElTag type="success" size="small">
            是
          </ElTag>
        ) : (
          <ElTag type="info" size="small">
            否
          </ElTag>
        );
      }
    },
    {
      prop: 'conversionFactor',
      label: '换算系数',
      width: 120,
      align: 'right',
      formatter: row => row.conversionFactor.toFixed(6)
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
      width: 250,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => handleEdit(row.id)}>
            {$t('common.edit')}
          </ElButton>
          {!row.isStandard && (
            <ElButton type="warning" plain size="small" onClick={() => handleSetStandard(row.id)}>
              设为标准
            </ElButton>
          )}
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

async function handleDelete(id: number) {
  const { error } = await fetchDeleteUnit(id);
  if (!error) {
    onDeleted();
  }
}

async function handleSetStandard(id: number) {
  const { error } = await fetchSetStandardUnit(id);
  if (!error) {
    ElMessage.success('设置成功');
    getDataByPage();
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
    <UnitSearch v-model:model="searchParams" :mediums="allMediums" @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>介质单位管理</p>
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

    <UnitOperateDrawer
      v-model="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      :mediums="allMediums"
      @submitted="getDataByPage"
    />
  </div>
</template>
