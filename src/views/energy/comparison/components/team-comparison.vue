<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCompareTeams } from '@/service/api/energy';
import ComparisonChart from './comparison-chart.vue';

defineOptions({ name: 'TeamComparison' });

interface Props {
  teamOptions: Array<{ value: number; label: string; factoryId: number }>;
}

const props = defineProps<Props>();

const loading = ref(false);
const result = ref<Api.Energy.Comparison.ComparisonResult | null>(null);
const crossFactoryWarning = ref(false);

const query = reactive<Api.Energy.Comparison.TeamComparisonQuery>({
  teamAId: 0,
  teamBId: 0,
  timeDimension: 'daily',
  periodStart: new Date().toISOString().split('T')[0],
  periodEnd: new Date().toISOString().split('T')[0]
});

const selectedMetric = ref<'total_energy' | 'specific_consumption' | 'cost' | 'peak_valley_flat'>(
  'specific_consumption'
);

const isCrossFactory = computed(() => {
  const teamA = props.teamOptions.find(t => t.value === query.teamAId);
  const teamB = props.teamOptions.find(t => t.value === query.teamBId);
  return teamA && teamB && teamA.factoryId !== teamB.factoryId;
});

async function handleCompare() {
  if (!query.teamAId || !query.teamBId) {
    ElMessage.warning('请选择两个班组进行对比');
    return;
  }

  if (query.teamAId === query.teamBId) {
    ElMessage.warning('请选择不同的班组进行对比');
    return;
  }

  loading.value = true;
  crossFactoryWarning.value = false;

  try {
    const res = await fetchCompareTeams(query);
    result.value = res.data || null;
  } catch (error: any) {
    if (error.response?.status === 403) {
      crossFactoryWarning.value = true;
      ElMessage.error('您没有跨厂对比权限');
    } else {
      ElMessage.error('对比查询失败');
    }
    result.value = null;
  } finally {
    loading.value = false;
  }
}

function getDiffClass(diff: { isPositive: boolean }) {
  return diff.isPositive ? 'text-green-500' : 'text-red-500';
}

function formatValue(value: number, metric: string) {
  if (metric.includes('成本')) return `¥${value.toFixed(2)}`;
  if (metric.includes('单耗')) return value.toFixed(4);
  if (metric.includes('能耗')) return `${value.toFixed(2)} kWh`;
  return value.toFixed(2);
}
</script>

<template>
  <div class="team-comparison">
    <ElCard class="mb-4">
      <ElForm :inline="true" class="flex flex-wrap gap-4">
        <ElFormItem label="班组A">
          <ElSelect v-model="query.teamAId" placeholder="选择班组" class="w-48">
            <ElOption v-for="team in teamOptions" :key="team.value" :value="team.value" :label="team.label" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="班组B">
          <ElSelect v-model="query.teamBId" placeholder="选择班组" class="w-48">
            <ElOption v-for="team in teamOptions" :key="team.value" :value="team.value" :label="team.label" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="时间维度">
          <ElRadioGroup v-model="query.timeDimension">
            <ElRadioButton value="daily">日</ElRadioButton>
            <ElRadioButton value="weekly">周</ElRadioButton>
            <ElRadioButton value="monthly">月</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="日期">
          <ElDatePicker v-model="query.periodStart" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="handleCompare">开始对比</ElButton>
        </ElFormItem>
      </ElForm>

      <ElAlert v-if="isCrossFactory" type="warning" class="mt-2" :closable="false">跨厂对比需要特殊权限</ElAlert>
    </ElCard>

    <ElAlert v-if="crossFactoryWarning" type="error" class="mb-4" :closable="false">
      您没有跨厂对比权限，请联系管理员申请
    </ElAlert>

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
        <ComparisonChart
          :items="[result.itemA, result.itemB]"
          :item-labels="[result.itemA.name, result.itemB.name]"
          :metric="selectedMetric"
          :loading="loading"
        />
      </ElCard>

      <ElCard>
        <template #header>
          <span>差异对比</span>
        </template>

        <ElTable :data="result.differences" stripe>
          <ElTableColumn prop="metric" label="指标" width="150" />
          <ElTableColumn label="班组A" width="150">
            <template #default="{ row }">
              {{ formatValue(row.valueA, row.metric) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="班组B" width="150">
            <template #default="{ row }">
              {{ formatValue(row.valueB, row.metric) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="差值" width="120">
            <template #default="{ row }">
              <span :class="getDiffClass(row)">{{ row.difference > 0 ? '+' : '' }}{{ row.difference.toFixed(2) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="变化率" width="120">
            <template #default="{ row }">
              <span :class="getDiffClass(row)">
                {{ row.percentChange > 0 ? '+' : '' }}{{ row.percentChange.toFixed(1) }}%
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="趋势" width="100">
            <template #default="{ row }">
              <ElTag :type="row.isPositive ? 'success' : 'danger'">
                {{ row.isPositive ? '更优' : '较差' }}
              </ElTag>
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
