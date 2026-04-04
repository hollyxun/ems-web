<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchConsumptionAnalysis } from '@/service/api/consumptionanalysis';
import { $t } from '@/locales';

defineOptions({ name: 'ConsumptionAnalysis' });

const loading = ref(false);
const data = ref<any[]>([]);

const queryParams = ref({
  nodeId: '',
  timeType: 'MONTH',
  dataTime: new Date().toISOString().slice(0, 7)
});

const timeTypes = [{ label: '日', value: 'DAY' }, { label: '月', value: 'MONTH' }, { label: '年', value: 'YEAR' }];

async function getData() {
  loading.value = true;
  try {
    const { data: res, error } = await fetchConsumptionAnalysis(queryParams.value);
    if (!error && res) {
      data.value = res.dataList || [];
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => getData());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="queryParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="节点ID" class="w-280px">
          <ElInput v-model="queryParams.nodeId" placeholder="请输入节点ID" />
        </ElFormItem>
        <ElFormItem label="时间类型" class="w-200px">
          <ElSelect v-model="queryParams.timeType">
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" :loading="loading" @click="getData">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <p>用能分析</p>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="currentTime">
        <ElTableColumn type="index" :label="$t('common.index')" width="64" />
        <ElTableColumn prop="currentTime" label="本期时间" minWidth="120" />
        <ElTableColumn prop="currentValue" label="本期值" width="120" />
        <ElTableColumn prop="compareTime" label="同期时间" minWidth="120" />
        <ElTableColumn prop="compareValue" label="同期值" width="120" />
        <ElTableColumn prop="ratio" label="同比(%)" width="100" />
      </ElTable>
    </ElCard>
  </div>
</template>