<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Api } from '@/typings/api';

defineOptions({ name: 'RankingFilter' });

interface Props {
  factoryOptions: Array<{ value: number; label: string }>;
  workshopOptions: Array<{ value: number; label: string }>;
  energyMediumOptions: Array<{ value: string; label: string }>;
}

interface Emits {
  (e: 'update:timeDimension', value: Api.Energy.Ranking.TimeDimension): void;
  (e: 'update:metric', value: Api.Energy.Ranking.Metric): void;
  (e: 'update:factoryId', value: number | undefined): void;
  (e: 'update:workshopId', value: number | undefined): void;
  (e: 'update:energyMedium', value: string | undefined): void;
  (e: 'search'): void;
  (e: 'reset'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const timeDimension = ref<Api.Energy.Ranking.TimeDimension>('daily');
const metric = ref<Api.Energy.Ranking.Metric>('specific_consumption');
const factoryId = ref<number>();
const workshopId = ref<number>();
const energyMedium = ref<string>();

const timeDimensionOptions = [
  { value: 'daily', label: '日排名' },
  { value: 'weekly', label: '周排名' },
  { value: 'monthly', label: '月排名' }
];

const metricOptions = [
  { value: 'total_energy', label: '总能耗' },
  { value: 'specific_consumption', label: '单耗' },
  { value: 'cost', label: '成本' }
];

watch(timeDimension, v => emit('update:timeDimension', v));
watch(metric, v => emit('update:metric', v));
watch(factoryId, v => emit('update:factoryId', v));
watch(workshopId, v => emit('update:workshopId', v));
watch(energyMedium, v => emit('update:energyMedium', v));

function handleSearch() {
  emit('search');
}

function handleReset() {
  timeDimension.value = 'daily';
  metric.value = 'specific_consumption';
  factoryId.value = undefined;
  workshopId.value = undefined;
  energyMedium.value = undefined;
  emit('reset');
}
</script>

<template>
  <ElCard class="ranking-filter">
    <ElForm :inline="true" class="flex flex-wrap gap-4">
      <ElFormItem label="时间维度">
        <ElRadioGroup v-model="timeDimension">
          <ElRadioButton v-for="opt in timeDimensionOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="排名指标">
        <ElSelect v-model="metric" class="w-32">
          <ElOption v-for="opt in metricOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="工厂">
        <ElSelect v-model="factoryId" clearable placeholder="全部" class="w-40">
          <ElOption v-for="opt in factoryOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="车间">
        <ElSelect v-model="workshopId" clearable placeholder="全部" class="w-40">
          <ElOption v-for="opt in workshopOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="能源介质">
        <ElSelect v-model="energyMedium" clearable placeholder="全部" class="w-32">
          <ElOption v-for="opt in energyMediumOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>