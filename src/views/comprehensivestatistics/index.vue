<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchComprehensiveList } from '@/service/api/comprehensivestatistics';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'ComprehensiveStatistics' });

const searchParams = ref({ page: 1, pageSize: 10 });

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchComprehensiveList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'timeLabel', label: '时间', minWidth: 120 },
    { prop: 'totalEnergy', label: '总能耗', width: 120 },
    { prop: 'electricEnergy', label: '电', width: 100 },
    { prop: 'waterEnergy', label: '水', width: 100 },
    { prop: 'gasEnergy', label: '气', width: 100 },
    { prop: 'heatEnergy', label: '热', width: 100 }
  ]
});

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>综合统计</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData" />
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="timeLabel">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination v-if="mobilePagination.total" layout="total,prev,pager,next,sizes" v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']" @size-change="mobilePagination['size-change']" />
      </div>
    </ElCard>
  </div>
</template>