<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetComprehensiveList as fetchComprehensiveList } from '@/service/api/comprehensive';
import { $t } from '@/locales';

defineOptions({ name: 'ComprehensiveStatistics' });

const loading = ref(false);
const data = ref<Api.Comprehensive.ComprehensiveListItem[]>([]);

async function getData() {
  loading.value = true;
  try {
    const params: Api.Comprehensive.ComprehensiveQuery = {
      timeType: 'MONTH'
    };
    const { data: result } = await fetchComprehensiveList(params);
    if (result) {
      data.value = result.dataList || [];
    }
  } catch (error) {
    console.error('获取数据失败:', error);
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
          <p>综合统计</p>
          <ElButton type="primary" @click="getData">刷新</ElButton>
        </div>
      </template>
      <ElTable v-loading="loading" height="100%" border :data="data" row-key="currentTime">
        <ElTableColumn type="index" :label="$t('common.index')" width="64" />
        <ElTableColumn prop="currentTime" label="时间" min-width="120" />
        <ElTableColumn prop="currentValue" label="总能耗(tce)" min-width="120" />
      </ElTable>
    </ElCard>
  </div>
</template>
