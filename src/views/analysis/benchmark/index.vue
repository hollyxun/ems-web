<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm } from 'element-plus';
import { fetchBenchmarkList, fetchDeleteBenchmark } from '@/service/api/benchmark';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import BenchmarkDrawer from './modules/benchmark-drawer.vue';

defineOptions({ name: 'BenchmarkManage' });

const searchParams = ref({
  page: 1,
  pageSize: 10,
  code: undefined as string | undefined,
  type: undefined as string | undefined
});

const benchmarkTypes = ['国家标杆', '行业标杆', '企业标杆'];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchBenchmarkList(searchParams.value),
  transform: response => defaultTransform(response),
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'code', label: '标杆编码', minWidth: 120 },
    { prop: 'type', label: '标杆类型', minWidth: 100 },
    { prop: 'grade', label: '标杆等级', minWidth: 100 },
    { prop: 'value', label: '标杆值', minWidth: 120 },
    { prop: 'nationalNum', label: '国标编号', minWidth: 120 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 160,
      formatter: (row: Api.Benchmark.Item) => {
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
  'id',
  getData
);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteBenchmark(id);
  if (!error) onDeleted();
}

function edit(id: number) {
  handleEdit(id);
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="标杆编码" class="w-280px">
          <ElInput
            v-model="searchParams.code"
            placeholder="搜索标杆编码"
            clearable
            @keyup.enter="() => getDataByPage()"
          />
        </ElFormItem>
        <ElFormItem label="标杆类型" class="w-280px">
          <ElSelect v-model="searchParams.type" placeholder="选择类型" clearable>
            <ElOption v-for="t in benchmarkTypes" :key="t" :label="t" :value="t" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="() => getDataByPage()">查询</ElButton>
          <ElButton
            @click="
              () => {
                searchParams.code = undefined;
                searchParams.type = undefined;
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
          <p>标杆值管理</p>
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
      <BenchmarkDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="() => getDataByPage()"
      />
    </ElCard>
  </div>
</template>
