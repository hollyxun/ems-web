<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchBatchDeleteGatewaySetting,
  fetchDeleteGatewaySetting,
  fetchGatewaySettingList
} from '@/service/api/gatewaysetting';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import GatewaySettingDrawer from './modules/gateway-setting-drawer.vue';

defineOptions({ name: 'GatewaySettingManage' });

const searchParams = ref({
  page: 1,
  pageSize: 10,
  gatewayNum: undefined as string | undefined,
  gatewayName: undefined as string | undefined,
  runStatus: undefined as string | undefined
});

const runStatusOptions = ['在线', '离线', '未知'];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, selectedRowKeys } =
  useUIPaginatedTable({
    paginationProps: { currentPage: 1, pageSize: 10 },
    api: () => fetchGatewaySettingList(searchParams.value),
    transform: defaultTransform,
    columns: () => [
      { prop: 'selection', type: 'selection', width: 50 },
      { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
      { prop: 'gatewayNum', label: '网关编号', minWidth: 120 },
      { prop: 'gatewayName', label: '网关名称', minWidth: 120 },
      { prop: 'specsModel', label: '规格型号', minWidth: 100 },
      { prop: 'installLocation', label: '安装位置', minWidth: 150 },
      { prop: 'ipAdd', label: 'IP地址', minWidth: 120 },
      {
        prop: 'runStatus',
        label: '运行状态',
        minWidth: 80,
        formatter: row => {
          const statusMap: Record<string, string> = { 在线: 'success', 离线: 'danger', 未知: 'info' };
          return <ElTag type={statusMap[row.runStatus] || 'info'}>{row.runStatus || '未知'}</ElTag>;
        }
      },
      { prop: 'deviceNum', label: '计量器具数量', minWidth: 100 },
      { prop: 'ptNum', label: '监测点数量', minWidth: 100 },
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
  'id',
  getData
);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteGatewaySetting(id);
  if (!error) onDeleted();
}

async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) return;
  const { error } = await fetchBatchDeleteGatewaySetting(selectedRowKeys.value as number[]);
  if (!error) {
    selectedRowKeys.value = [];
    getData();
  }
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
        <ElFormItem label="网关编号" class="w-280px">
          <ElInput
            v-model="searchParams.gatewayNum"
            placeholder="搜索网关编号"
            clearable
            @keyup.enter="getDataByPage"
          />
        </ElFormItem>
        <ElFormItem label="网关名称" class="w-280px">
          <ElInput
            v-model="searchParams.gatewayName"
            placeholder="搜索网关名称"
            clearable
            @keyup.enter="getDataByPage"
          />
        </ElFormItem>
        <ElFormItem label="运行状态" class="w-280px">
          <ElSelect v-model="searchParams.runStatus" placeholder="选择状态" clearable>
            <ElOption v-for="s in runStatusOptions" :key="s" :label="s" :value="s" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton
            @click="
              () => {
                searchParams.gatewayNum = undefined;
                searchParams.gatewayName = undefined;
                searchParams.runStatus = undefined;
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
          <p>网关配置管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            :disabled-delete="selectedRowKeys.length === 0"
            @add="handleAdd"
            @refresh="getData"
            @delete="handleBatchDelete"
          />
        </div>
      </template>
      <ElTable
        v-loading="loading"
        height="100%"
        border
        :data="data"
        row-key="id"
        @selection-change="(rows: any[]) => selectedRowKeys = rows.map(r => r.id)"
      >
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
      <GatewaySettingDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>
  </div>
</template>
