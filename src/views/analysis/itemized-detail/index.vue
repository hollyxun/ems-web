<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { fetchItemizedEnergyList } from '@/service/api/itemized-energy-analysis';
import { $t } from '@/locales';

defineOptions({ name: 'ItemizedEnergyAnalysis' });

const searchParams = ref<Api.ItemizedEnergyAnalysis.Request>({
  nodeId: '',
  timeType: 'DAY',
  dataTime: dayjs().format('YYYY-MM-DD')
});

const loading = ref(false);
const data = ref<Api.ItemizedEnergyAnalysis.Item[]>([]);

const columns = [
  { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
  { prop: 'nodeName', label: '节点名称', minWidth: 150 },
  { prop: 'total', label: '总能耗', width: 120 }
];

async function getData() {
  loading.value = true;
  try {
    const { data: res } = await fetchItemizedEnergyList(searchParams.value);
    data.value = res?.dataList || [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>分项能耗分析</p>
          <ElButton :loading="loading" @click="getData">刷新</ElButton>
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data">
        <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
      </ElTable>
    </ElCard>
  </div>
</template>
