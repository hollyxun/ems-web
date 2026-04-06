<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchPriceList, fetchSavePriceList } from '@/service/api/peakvalley';
import type { PeakValley } from '@/service/api/peakvalley';

defineOptions({ name: 'PriceConfigDrawer' });

interface Props {
  visible: boolean;
  parentId: number | null;
}
interface Emits {
  (e: 'update:visible', visible: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({
  get() {
    return props.visible;
  },
  set(v) {
    emit('update:visible', v);
  }
});
const loading = ref(false);
const saving = ref(false);

// 用电类型选项
const electricityTypes = [
  { label: '尖', value: 'SHARP' },
  { label: '峰', value: 'PEAK' },
  { label: '平', value: 'FLAT' },
  { label: '谷', value: 'VALLEY' },
  { label: '深谷', value: 'DEEP_VALLEY' }
];

// 电价明细列表
const priceList = ref<PeakValley.PriceItem[]>([]);

// 加载电价明细
async function loadPriceList() {
  if (!props.parentId) return;
  loading.value = true;
  try {
    const { data, error } = await fetchPriceList({ page: 1, pageSize: 100, parentId: String(props.parentId) });
    if (!error && data?.list) {
      priceList.value = data.list.map(item => ({
        type: item.type,
        startTime: item.startTime,
        stopTime: item.stopTime,
        effectivityPrice: item.effectivityPrice
      }));
    }
    // 如果没有数据，初始化一个空行
    if (priceList.value.length === 0) {
      priceList.value = [{ type: 'SHARP', startTime: '00:00:00', stopTime: '06:00:00', effectivityPrice: 0 }];
    }
  } finally {
    loading.value = false;
  }
}

// 添加一行
function addRow() {
  priceList.value.push({ type: 'FLAT', startTime: '00:00:00', stopTime: '00:00:00', effectivityPrice: 0 });
}

// 删除一行
function deleteRow(index: number) {
  if (priceList.value.length > 1) {
    priceList.value.splice(index, 1);
  } else {
    ElMessage.warning('至少保留一条电价配置');
  }
}

// 批量保存
async function handleSave() {
  if (!props.parentId) {
    ElMessage.warning('父级ID不存在');
    return;
  }

  // 校验数据
  for (const item of priceList.value) {
    if (!item.type || !item.startTime || !item.stopTime) {
      ElMessage.warning('请完善电价配置信息');
      return;
    }
  }

  saving.value = true;
  try {
    const { error } = await fetchSavePriceList({
      parentId: String(props.parentId),
      list: priceList.value
    });
    if (!error) {
      ElMessage.success('保存成功');
      drawerVisible.value = false;
    }
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible && props.parentId) {
      loadPriceList();
    }
  }
);

onMounted(() => {
  if (props.visible && props.parentId) {
    loadPriceList();
  }
});
</script>

<template>
  <ElDrawer v-model="drawerVisible" title="电价明细配置" size="700px">
    <div v-loading="loading" class="p-4">
      <div class="mb-4 flex justify-between">
        <span class="text-gray-500">配置各时段的电价，时间段需覆盖24小时且不能重叠</span>
        <ElButton type="primary" size="small" @click="addRow">添加时段</ElButton>
      </div>

      <ElTable :data="priceList" border stripe>
        <ElTableColumn label="用电类型" width="120">
          <template #default="{ row, $index }">
            <ElSelect v-model="row.type" placeholder="选择类型" size="small">
              <ElOption v-for="t in electricityTypes" :key="t.value" :label="t.label" :value="t.value" />
            </ElSelect>
          </template>
        </ElTableColumn>
        <ElTableColumn label="开始时间" width="140">
          <template #default="{ row }">
            <ElTimePicker
              v-model="row.startTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="选择时间"
              size="small"
              class="w-full"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="结束时间" width="140">
          <template #default="{ row }">
            <ElTimePicker
              v-model="row.stopTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="选择时间"
              size="small"
              class="w-full"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="电价(元/kWh)" width="140">
          <template #default="{ row }">
            <ElInputNumber v-model="row.effectivityPrice" :precision="4" :min="0" size="small" class="w-full" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="80" align="center">
          <template #default="{ $index }">
            <ElButton type="danger" size="small" plain @click="deleteRow($index)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
    </template>
  </ElDrawer>
</template>
