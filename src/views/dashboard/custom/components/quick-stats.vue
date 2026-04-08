<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElCard, ElStatistic, ElRow, ElCol, ElProgress, ElEmpty } from 'element-plus';

defineOptions({ name: 'QuickStatsCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const stats = ref({
  todayEnergy: 1850,
  yesterdayEnergy: 2100,
  monthEnergy: 52000,
  yearEnergy: 680000,
  savingRate: 12.5
});

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchQuickStats(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 200));
  stats.value = {
    todayEnergy: 1850 + Math.random() * 200,
    yesterdayEnergy: 2100,
    monthEnergy: 52000 + Math.random() * 5000,
    yearEnergy: 680000,
    savingRate: 12.5 + Math.random() * 5
  };
  loading.value = false;
}

const dayComparison = ref(0);
const monthTarget = ref(60000);
const monthProgress = ref(0);

onMounted(async () => {
  await loadData();
  dayComparison.value = Math.round((stats.value.todayEnergy - stats.value.yesterdayEnergy) / stats.value.yesterdayEnergy * 100);
  monthProgress.value = Math.round(stats.value.monthEnergy / monthTarget.value * 100);
});

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard shadow="never" class="h-full" v-loading="loading">
    <template #header>
      <span class="font-medium">快速统计</span>
    </template>
    <ElRow v-if="!loading" :gutter="16" class="h-full flex flex-col gap-4">
      <ElCol :span="24">
        <div class="flex items-center justify-between">
          <ElStatistic title="今日能耗" :value="Math.round(stats.todayEnergy)" suffix="kWh" />
          <div class="flex items-center gap-2">
            <icon-mdi:arrow-down v-if="dayComparison < 0" class="text-green-500" />
            <icon-mdi:arrow-up v-else class="text-red-500" />
            <span :class="dayComparison < 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-medium">
              {{ Math.abs(dayComparison) }}%
            </span>
          </div>
        </div>
      </ElCol>
      <ElCol :span="24">
        <ElStatistic title="本月能耗" :value="Math.round(stats.monthEnergy)" suffix="kWh" />
        <ElProgress
          :percentage="monthProgress"
          :stroke-width="10"
          :color="monthProgress < 80 ? '#10B981' : monthProgress < 100 ? '#F59E0B' : '#EF4444'"
          class="mt-2"
        >
          <template #default="{ percentage }">
            <span class="text-xs">{{ percentage }}% / {{ monthTarget }}</span>
          </template>
        </ElProgress>
      </ElCol>
      <ElCol :span="24">
        <ElStatistic title="节能率" :value="stats.savingRate" suffix="%" :value-style="{ color: '#10B981' }" />
      </ElCol>
    </ElRow>
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>