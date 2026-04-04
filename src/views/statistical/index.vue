<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchStatisticalList } from '@/service/api/statistical';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'StatisticalAnalysis' });

const searchParams = ref({ page: 1, pageSize: 10, indicatorName: undefined as string | undefined });

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchStatisticalList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'nodeName', label: '节点名称', minWidth: 150 },
    { prop: 'indicatorName', label: '指标名称', minWidth: 150 },
    { prop: 'indicatorValue', label: '指标值', width: 120 },
    { prop: 'unit', label: '单位', width: 80 },
    { prop: 'timeType', label: '时间类型', width: 100 },
    { prop: 'dataTime', label: '数据时间', minWidth: 120 }
  ]
});

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="指标名称" class="w-280px">
          <ElInput v-model="searchParams.indicatorName" placeholder="搜索指标名称" clearable @keyup.enter="getDataByPage" />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton @click="() => { searchParams.indicatorName = undefined; getDataByPage(); }">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>统计分析</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData" />
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="id">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
      <div class="mt-20px flex justify-end">
        <ElPagination v-if="mobilePagination.total" layout="total,prev,pager,next,sizes" v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']" @size-change="mobilePagination['size-change']" />
      </div>
    </ElCard>
  </div>
</template>