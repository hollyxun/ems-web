<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElMessage, ElPopconfirm } from 'element-plus';
import {
  fetchCreatePriceTactics,
  fetchDeletePriceTactics,
  fetchPriceTacticsList,
  fetchUpdatePriceTactics
} from '@/service/api/costmanagement';
import type { CostManagement } from '@/service/api/costmanagement';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'CostPriceTacticsManage' });

const searchParams = ref({ page: 1, pageSize: 10, tacticsName: undefined as string | undefined });

const energyTypes = [
  { label: '电', value: 1 },
  { label: '水', value: 2 },
  { label: '气', value: 3 },
  { label: '热', value: 4 }
];

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: { currentPage: 1, pageSize: 10 },
  api: () => fetchPriceTacticsList(searchParams.value),
  transform: defaultTransform,
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'tacticsNumber', label: '策略编码', minWidth: 120 },
    { prop: 'tacticsName', label: '策略名称', minWidth: 150 },
    {
      prop: 'energyType',
      label: '能源类型',
      minWidth: 100,
      formatter: row => energyTypes.find(e => e.value === row.energyType)?.label || '-'
    },
    { prop: 'isLadder', label: '阶梯价格', minWidth: 100, formatter: row => (row.isLadder ? '是' : '否') },
    { prop: 'description', label: '描述', minWidth: 200 },
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

const formData = ref({
  tacticsNumber: '',
  tacticsName: '',
  energyType: 1,
  isLadder: false,
  description: '',
  items: [] as { rangeType: string; electricType: string; slotsMin: number; slotsMax: number; price: number }[]
});

const electricTypes = [
  { label: '尖时段', value: 'sharp' },
  { label: '峰时段', value: 'peak' },
  { label: '平时段', value: 'flat' },
  { label: '谷时段', value: 'valley' }
];

function addItem() {
  formData.value.items.push({
    rangeType: '',
    electricType: 'flat',
    slotsMin: 0,
    slotsMax: 0,
    price: 0
  });
}

function removeItem(index: number) {
  formData.value.items.splice(index, 1);
}

async function handleSubmit() {
  loading.value = true;
  try {
    const api = operateType.value === 'add' ? fetchCreatePriceTactics : fetchUpdatePriceTactics;
    const params = operateType.value === 'edit' ? { id: editingData.value!.id, ...formData.value } : formData.value;
    const { error } = await (api as any)(params);
    if (!error) {
      ElMessage.success('操作成功');
      drawerVisible.value = false;
      getDataByPage();
    }
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeletePriceTactics(id);
  if (!error) onDeleted();
}

function edit(id: number) {
  handleEdit(id);
  const row = data.value.find(item => item.id === id);
  if (row) {
    formData.value = {
      tacticsNumber: row.tacticsNumber,
      tacticsName: row.tacticsName,
      energyType: row.energyType,
      isLadder: row.isLadder,
      description: row.description || '',
      items: []
    };
  }
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="searchParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="策略名称" class="w-280px">
          <ElInput
            v-model="searchParams.tacticsName"
            placeholder="搜索策略名称"
            clearable
            @keyup.enter="getDataByPage"
          />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" @click="getDataByPage">查询</ElButton>
          <ElButton
            @click="
              () => {
                searchParams.tacticsName = undefined;
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
          <p>成本策略管理</p>
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
    </ElCard>

    <ElDrawer v-model="drawerVisible" :title="operateType === 'add' ? '新增成本策略' : '编辑成本策略'" size="700px">
      <ElForm :model="formData" label-width="100px">
        <ElFormItem label="策略编码" required>
          <ElInput v-model="formData.tacticsNumber" placeholder="请输入策略编码" />
        </ElFormItem>
        <ElFormItem label="策略名称" required>
          <ElInput v-model="formData.tacticsName" placeholder="请输入策略名称" />
        </ElFormItem>
        <ElFormItem label="能源类型" required>
          <ElSelect v-model="formData.energyType" placeholder="选择能源类型">
            <ElOption v-for="e in energyTypes" :key="e.value" :label="e.label" :value="e.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="阶梯价格">
          <ElSwitch v-model="formData.isLadder" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="formData.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </ElFormItem>

        <ElDivider>价格明细</ElDivider>
        <div class="mb-16px">
          <ElButton type="primary" size="small" @click="addItem">添加价格项</ElButton>
        </div>
        <div v-for="(item, index) in formData.items" :key="index" class="mb-8px flex items-center gap-8px">
          <ElSelect v-model="item.electricType" placeholder="电价类型" class="w-120px">
            <ElOption v-for="e in electricTypes" :key="e.value" :label="e.label" :value="e.value" />
          </ElSelect>
          <ElInputNumber v-model="item.slotsMin" placeholder="最小值" :min="0" class="w-120px" />
          <ElInputNumber v-model="item.slotsMax" placeholder="最大值" :min="0" class="w-120px" />
          <ElInputNumber v-model="item.price" placeholder="单价(元)" :precision="4" :min="0" class="w-140px" />
          <ElButton type="danger" size="small" @click="removeItem(index)">删除</ElButton>
        </div>
      </ElForm>
      <template #footer>
        <ElButton @click="drawerVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDrawer>
  </div>
</template>
