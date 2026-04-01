<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCompareShifts } from '@/service/api/energy';
import ComparisonChart from './comparison-chart.vue';

defineOptions({ name: 'ShiftComparison' });

interface Props {
  teamOptions: Array<{ value: number; label: string }>;
}

defineProps<Props>();

const loading = ref(false);
const result = ref<Api.Energy.Comparison.ComparisonResult | null>(null);

const query = reactive<Api.Energy.Comparison.ShiftComparisonQuery>({
  teamId: 0,
  date: new Date().toISOString().split('T')[0],
  shiftTypes: ['early', 'middle', 'late']
});

const selectedMetric = ref<'total_energy' | 'specific_consumption' | 'cost' | 'peak_valley_flat'>(
  'specific_consumption'
);

const shiftTypeOptions = [
  { value: 'early', label: '早班' },
  { value: 'middle', label: '中班' },
  { value: 'late', label: '晚班' }
];

const items = computed(() => {
  if (!result.value) return [];
  const itemList = [result.value.itemA, result.value.itemB];
  if (result.value.itemC) itemList.push(result.value.itemC);
  return itemList;
});

const itemLabels = computed(() => {
  if (!result.value) return [];
  const labels = [result.value.itemA.name, result.value.itemB.name];
  if (result.value.itemC) labels.push(result.value.itemC.name);
  return labels;
});

async function handleCompare() {
  if (!query.teamId) {
    ElMessage.warning('请选择班组');
    return;
  }

  loading.value = true;

  try {
    const res = await fetchCompareShifts(query);
    result.value = res.data || null;
  } catch {
    ElMessage.error('对比查询失败');
    result.value = null;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="shift-comparison">
    <ElCard class="mb-4">
      <ElForm :inline="true" class="flex flex-wrap gap-4">
        <ElFormItem label="班组">
          <ElSelect v-model="query.teamId" placeholder="选择班组" class="w-48">
            <ElOption v-for="team in teamOptions" :key="team.value" :value="team.value" :label="team.label" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="日期">
          <ElDatePicker v-model="query.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </ElFormItem>

        <ElFormItem label="班次">
          <ElCheckboxGroup v-model="query.shiftTypes">
            <ElCheckbox v-for="opt in shiftTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </ElCheckbox>
          </ElCheckboxGroup>
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
        <ElCol v-for="(item, index) in items" :key="index" :span="24 / items.length">
          <ElCard>
            <template #header>
              <span class="font-bold">{{ item.name }}</span>
            </template>
            <ElRow :gutter="16">
              <ElCol :span="12">
                <ElStatistic title="总能耗" :value="item.totalEnergy" suffix="kWh" />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic title="单耗" :value="item.specificConsumption" :precision="4" />
              </ElCol>
            </ElRow>
            <ElRow :gutter="16" class="mt-4">
              <ElCol :span="12">
                <ElStatistic title="成本" :value="item.cost" prefix="¥" :precision="2" />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic title="产量" :value="item.productionOutput" />
              </ElCol>
            </ElRow>
          </ElCard>
        </ElCol>
      </ElRow>

      <ElCard>
        <template #header>
          <span>差异对比</span>
        </template>

        <ElTable :data="result.differences" stripe>
          <ElTableColumn prop="metric" label="指标" width="150" />
          <ElTableColumn v-for="(item, index) in items" :key="index" :label="item.name" width="120">
            <template #default="{ row }">
              {{ row[`value${String.fromCharCode(65 + index)}` as keyof typeof row] }}
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="mt-4">
          <ElAlert type="info" :closable="false">
            {{ result.summary }}
          </ElAlert>
        </div>
      </ElCard>
    </template>
  </div>
</template>
