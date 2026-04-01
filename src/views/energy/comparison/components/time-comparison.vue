<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCompareTime } from '@/service/api/energy';
import ComparisonChart from './comparison-chart.vue';

defineOptions({ name: 'TimeComparison' });

interface Props {
  teamOptions: Array<{ value: number; label: string }>;
}

defineProps<Props>();

const loading = ref(false);
const result = ref<Api.Energy.Comparison.TimeComparisonResult | null>(null);

const query = reactive<Api.Energy.Comparison.TimeComparisonQuery>({
  teamId: 0,
  periodType: 'daily',
  periodEnd: new Date().toISOString().split('T')[0]
});

const selectedMetric = ref<'total_energy' | 'specific_consumption' | 'cost' | 'peak_valley_flat'>(
  'specific_consumption'
);

const items = computed(() => {
  if (!result.value) return [];
  return [result.value.currentPeriod, result.value.previousPeriod, result.value.samePeriodLastYear];
});

const itemLabels = computed(() => {
  return ['本期', '上期', '去年同期'];
});

async function handleCompare() {
  if (!query.teamId) {
    ElMessage.warning('请选择班组');
    return;
  }

  loading.value = true;

  try {
    const res = await fetchCompareTime(query);
    result.value = res.data || null;
  } catch {
    ElMessage.error('对比查询失败');
    result.value = null;
  } finally {
    loading.value = false;
  }
}

const momDiff = computed(() => {
  if (!result.value) return null;
  return result.value.differences.mom || result.value.differences.previous;
});

const yoyDiff = computed(() => {
  if (!result.value) return null;
  return result.value.differences.yoy || result.value.differences.last_year;
});
</script>

<template>
  <div class="time-comparison">
    <ElCard class="mb-4">
      <ElForm :inline="true" class="flex flex-wrap gap-4">
        <ElFormItem label="班组">
          <ElSelect v-model="query.teamId" placeholder="选择班组" class="w-48">
            <ElOption v-for="team in teamOptions" :key="team.value" :value="team.value" :label="team.label" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="周期类型">
          <ElRadioGroup v-model="query.periodType">
            <ElRadioButton value="daily">日</ElRadioButton>
            <ElRadioButton value="weekly">周</ElRadioButton>
            <ElRadioButton value="monthly">月</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="结束日期">
          <ElDatePicker v-model="query.periodEnd" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="handleCompare">开始对比</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <template v-if="result">
      <ElCard class="mb-4">
        <ElRadioGroup v-model="selectedMetric">
          <ElRadioButton value="total_energy">总能耗</ElRadioButton>
          <ElRadioButton value="specific_consumption">单耗</ElRadioButton>
          <ElRadioButton value="cost">成本</ElRadioButton>
          <ElRadioButton value="peak_valley_flat">峰谷平</ElRadioButton>
        </ElRadioGroup>
      </ElCard>

      <ElCard class="mb-4">
        <ComparisonChart :items="items" :item-labels="itemLabels" :metric="selectedMetric" :loading="loading" />
      </ElCard>

      <ElRow :gutter="20" class="mb-4">
        <ElCol :span="8">
          <ElCard>
            <template #header>
              <ElTag type="primary">本期</ElTag>
            </template>
            <ElStatistic title="总能耗" :value="result.currentPeriod.totalEnergy" suffix="kWh" />
            <ElStatistic class="mt-2" title="单耗" :value="result.currentPeriod.specificConsumption" :precision="4" />
          </ElCard>
        </ElCol>

        <ElCol :span="8">
          <ElCard>
            <template #header>
              <ElTag type="success">上期</ElTag>
              <span v-if="momDiff" class="ml-2 text-sm">
                环比:
                <span :class="momDiff.isPositive ? 'text-green-500' : 'text-red-500'">
                  {{ momDiff.percentChange > 0 ? '+' : '' }}{{ momDiff.percentChange.toFixed(1) }}%
                </span>
              </span>
            </template>
            <ElStatistic title="总能耗" :value="result.previousPeriod.totalEnergy" suffix="kWh" />
            <ElStatistic class="mt-2" title="单耗" :value="result.previousPeriod.specificConsumption" :precision="4" />
          </ElCard>
        </ElCol>

        <ElCol :span="8">
          <ElCard>
            <template #header>
              <ElTag type="warning">去年同期</ElTag>
              <span v-if="yoyDiff" class="ml-2 text-sm">
                同比:
                <span :class="yoyDiff.isPositive ? 'text-green-500' : 'text-red-500'">
                  {{ yoyDiff.percentChange > 0 ? '+' : '' }}{{ yoyDiff.percentChange.toFixed(1) }}%
                </span>
              </span>
            </template>
            <ElStatistic title="总能耗" :value="result.samePeriodLastYear.totalEnergy" suffix="kWh" />
            <ElStatistic
              class="mt-2"
              title="单耗"
              :value="result.samePeriodLastYear.specificConsumption"
              :precision="4"
            />
          </ElCard>
        </ElCol>
      </ElRow>

      <ElCard>
        <ElAlert type="info" :closable="false">
          {{ result.summary }}
        </ElAlert>
      </ElCard>
    </template>
  </div>
</template>
