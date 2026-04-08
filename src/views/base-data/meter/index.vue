<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { fetchDeleteMeter, fetchGetMeterList } from '@/service/api/energy-meter';
import { fetchGetAllMediums } from '@/service/api/energy';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import MeterSearch from './modules/meter-search.vue';
import MeterOperateDrawer from './modules/meter-operate-drawer.vue';

defineOptions({ name: 'BaseDataMeter' });

const searchParams = ref(getInitSearchParams());
const allMediums = ref<Api.Energy.Medium[]>([]);
const qrCodeVisible = ref(false);
const qrCodeData = ref<{ qrCode: string; meterName: string; meterCode: string }>({
  qrCode: '',
  meterName: '',
  meterCode: ''
});

const meterTypeMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '总表', type: 'primary' },
  2: { label: '分表', type: 'success' },
  3: { label: '设备表', type: 'info' }
};

const statusMap: Record<number, { label: string; type: UI.ThemeColor }> = {
  1: { label: '在线', type: 'success' },
  2: { label: '离线', type: 'danger' },
  3: { label: '故障', type: 'warning' }
};

function getInitSearchParams(): Api.Energy.MeterSearchParams {
  return {
    page: 1,
    pageSize: 10,
    code: undefined,
    name: undefined,
    type: undefined,
    organizationId: undefined,
    mediumId: undefined,
    status: undefined
  };
}

async function loadMediums() {
  const { data } = await fetchGetAllMediums();
  if (data) {
    allMediums.value = data;
  }
}

function getMediumName(mediumId: number): string {
  const medium = allMediums.value.find(m => m.id === mediumId);
  return medium?.mediumName || '-';
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetMeterList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage;
    searchParams.value.pageSize = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'code', label: '计量点编码', minWidth: 120 },
    { prop: 'name', label: '计量点名称', minWidth: 150 },
    {
      prop: 'type',
      label: '类型',
      width: 100,
      align: 'center',
      formatter: row => {
        const config = meterTypeMap[row.type] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    {
      prop: 'mediumId',
      label: '能源介质',
      minWidth: 100,
      formatter: row => getMediumName(row.mediumId)
    },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      width: 100,
      formatter: row => {
        const config = statusMap[row.status] || { label: '-', type: 'info' };
        return (
          <ElTag type={config.type} size="small">
            {config.label}
          </ElTag>
        );
      }
    },
    {
      prop: 'lastHeartbeat',
      label: '最后心跳',
      width: 160,
      formatter: row => row.lastHeartbeat || '-'
    },
    { prop: 'location', label: '安装位置', minWidth: 150 },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 200,
      formatter: row => (
        <div class="flex-center">
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <ElButton type="primary" plain size="small" onClick={() => handleEdit(row.id)}>
            {$t('common.edit')}
          </ElButton>
          <ElButton type="success" plain size="small" onClick={() => handleViewQRCode(row)}>
            二维码
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

function handleViewQRCode(row: Api.Energy.MeteringPoint) {
  qrCodeData.value = {
    qrCode: row.qrCode || '',
    meterName: row.name,
    meterCode: row.code
  };
  qrCodeVisible.value = true;
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMeter(id);
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
    <MeterSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>计量点管理</p>
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

    <MeterOperateDrawer
      v-model="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getDataByPage"
    />

    <!-- QR Code Dialog -->
    <ElDialog v-model="qrCodeVisible" title="计量点二维码" width="400px">
      <div class="flex flex-col items-center gap-4">
        <img
          v-if="qrCodeData.qrCode"
          :src="`data:image/png;base64,${qrCodeData.qrCode}`"
          alt="QR Code"
          class="h-48 w-48 border"
        />
        <div v-else class="h-48 w-48 flex items-center justify-center bg-gray-100 text-gray-400">暂无二维码</div>
        <div class="text-center">
          <p class="font-medium">{{ qrCodeData.meterName }}</p>
          <p class="text-sm text-gray-500">{{ qrCodeData.meterCode }}</p>
        </div>
      </div>
      <template #footer>
        <ElButton @click="qrCodeVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>
