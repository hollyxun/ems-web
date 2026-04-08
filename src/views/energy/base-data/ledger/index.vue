<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElTag } from 'element-plus';
import dayjs from 'dayjs';
import { fetchGetAllMediums, fetchGetLedgerList } from '@/service/api/energy';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'EnergyLedger' });

const searchParams = ref(getInitSearchParams());
const allMediums = ref<Api.Energy.Medium[]>([]);

const mediumTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '一次能源', type: 'primary' },
  2: { label: '二次能源', type: 'success' },
  3: { label: '耗能工质', type: 'warning' }
};

function getInitSearchParams(): Api.Energy.LedgerSearchParams {
  return {
    page: 1,
    pageSize: 10,
    mediumCode: undefined,
    mediumName: undefined,
    mediumType: undefined,
    status: undefined,
    queryDate: dayjs().format('YYYY-MM-DD')
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
  api: () => fetchGetLedgerList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'mediumCode', label: '介质编码', minWidth: 100 },
    { prop: 'mediumName', label: '介质名称', minWidth: 120 },
    {
      prop: 'mediumType',
      label: '介质类型',
      width: 100,
      align: 'center',
      formatter: row => {
        const config = mediumTypeMap[row.mediumType] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
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
        return (
          <ElTag type={tagMap[row.status] || 'info'} size="small">
            {label}
          </ElTag>
        );
      }
    },
    {
      prop: 'standardUnitCode',
      label: '标准单位',
      width: 120,
      align: 'center',
      formatter: row => {
        return row.standardUnitCode ? `${row.standardUnitCode}(${row.standardUnitName})` : '-';
      }
    },
    {
      prop: 'coalCoefficient',
      label: '折标煤系数',
      width: 140,
      align: 'right',
      formatter: row => {
        return row.coalCoefficient ? row.coalCoefficient.toFixed(6) : '-';
      }
    },
    {
      prop: 'carbonCoefficient',
      label: '碳排放系数',
      width: 140,
      align: 'right',
      formatter: row => {
        return row.carbonCoefficient ? row.carbonCoefficient.toFixed(6) : '-';
      }
    },
    { prop: 'coefficientPurpose', label: '系数用途', minWidth: 120 }
  ]
});

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
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" inline>
        <ElFormItem label="介质编码">
          <ElInput v-model="searchParams.mediumCode" placeholder="请输入介质编码" clearable style="width: 160px" />
        </ElFormItem>
        <ElFormItem label="介质名称">
          <ElInput v-model="searchParams.mediumName" placeholder="请输入介质名称" clearable style="width: 160px" />
        </ElFormItem>
        <ElFormItem label="介质类型">
          <ElSelect v-model="searchParams.mediumType" placeholder="请选择类型" clearable style="width: 160px">
            <ElOption label="一次能源" :value="1" />
            <ElOption label="二次能源" :value="2" />
            <ElOption label="耗能工质" :value="3" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchParams.status" placeholder="请选择状态" clearable style="width: 160px">
            <ElOption label="启用" :value="1" />
            <ElOption label="停用" :value="2" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="查询日期">
          <ElDatePicker
            v-model="searchParams.queryDate"
            type="date"
            placeholder="选择查询日期"
            style="width: 160px"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="() => getDataByPage()">
            <template #icon>
              <icon-ic-round-search />
            </template>
            {{ $t('common.search') }}
          </ElButton>
          <ElButton @click="resetSearchParams">
            <template #icon>
              <icon-ic-round-refresh />
            </template>
            {{ $t('common.reset') }}
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>介质台账</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData" />
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="id">
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
  </div>
</template>
