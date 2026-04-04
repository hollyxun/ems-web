<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchDeleteSpikesAndValleys,
  fetchSpikesAndValleysList,
  schemeTypeOptions
} from '@/service/api/spikesandvalleys';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import SpikesAndValleysDrawer from './modules/spikesandvalleys-drawer.vue';

defineOptions({ name: 'SpikesAndValleysManage' });

const searchParams = ref({
  page: 1,
  pageSize: 10,
  schemeName: undefined as string | undefined,
  type: undefined as string | undefined
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchSpikesAndValleysList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'schemeName', label: '方案名称', minWidth: 150 },
    {
      prop: 'type',
      label: '方案类型',
      minWidth: 100,
      formatter: row => {
        const typeItem = schemeTypeOptions.find(t => t.value === row.type);
        return typeItem ? <ElTag>{typeItem.label}</ElTag> : row.type;
      }
    },
    { prop: 'executeTime', label: '执行时间', minWidth: 120 },
    { prop: 'remark', label: '备注', minWidth: 150 },
    { prop: 'createdAt', label: $t('common.createTime'), minWidth: 160 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 160,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row.id)}>
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

const { drawerVisible, operateType, handleAdd, handleEdit, editingData, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteSpikesAndValleys(id);
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
        <ElFormItem label="方案名称" class="w-280px">
          <ElInput
            v-model="searchParams.schemeName"
            placeholder="搜索方案名称"
            clearable
            @keyup.enter="getDataByPage"
          />
        </ElFormItem>
        <ElFormItem label="方案类型" class="w-280px">
          <ElSelect v-model="searchParams.type" placeholder="选择类型" clearable>
            <ElOption v-for="t in schemeTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton
            @click="
              () => {
                searchParams.schemeName = undefined;
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
          <p>尖峰平谷方案管理</p>
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
      <SpikesAndValleysDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>
  </div>
</template>
