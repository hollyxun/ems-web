<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchDailyProcessEnergyList as fetchProcessEnergyList } from '@/service/api/process-energy';
import { useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'ProcessEnergy' });

const searchParams = ref<Api.ProcessEnergy.DailyQuery>({
  indexCode: 'default',
  dataTime: '',
  timeType: 'day'
});

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable<
  Api.ProcessEnergy.DailyList[],
  Api.ProcessEnergy.DailyList
>({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: async () => {
    const { data: res } = await fetchProcessEnergyList(searchParams.value);
    return res || [];
  },
  transform: list => ({
    data: list,
    pageNum: 1,
    pageSize: 10,
    total: list.length
  }),
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'indexName', label: '指标名称', minWidth: 150 },
    { prop: 'unitId', label: '单位', minWidth: 80 },
    { prop: 'timeType', label: '时间类型', width: 100 }
  ]
});

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>工序能耗分析</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData" />
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
    </ElCard>
  </div>
</template>
