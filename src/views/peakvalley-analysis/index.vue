<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { fetchSegmentAnalysisDay, fetchSegmentAnalysisHour } from '@/service/api/peakvalley';
import type { PeakValley } from '@/service/api/peakvalley';

defineOptions({ name: 'PeakValleyAnalysis' });

const timeTypes = [
  { label: '按小时', value: 'DAY' },
  { label: '按天', value: 'MONTH' },
  { label: '按月', value: 'YEAR' }
];

const queryParams = ref({
  modelCode: 'default',
  nodeId: 'default',
  timeType: 'DAY',
  queryTime: dayjs().format('YYYY-MM')
});

const loading = ref(false);
const analysisType = ref<'hour' | 'day'>('hour');
const hourData = ref<PeakValley.HourVO | null>(null);
const dayData = ref<PeakValley.DayVO | null>(null);

// 获取分析数据
async function getAnalysis() {
  loading.value = true;
  try {
    if (analysisType.value === 'hour') {
      const { data, error } = await fetchSegmentAnalysisHour({
        ...queryParams.value,
        queryTime: dayjs(queryParams.value.queryTime).startOf('day').format('YYYY-MM-DD')
      });
      if (!error && data) hourData.value = data;
    } else {
      const { data, error } = await fetchSegmentAnalysisDay({
        ...queryParams.value,
        queryTime: dayjs(queryParams.value.queryTime).startOf('month').format('YYYY-MM')
      });
      if (!error && data) dayData.value = data;
    }
  } finally {
    loading.value = false;
  }
}

// 时间类型变化时自动切换分析类型
function handleTimeTypeChange(val: string) {
  if (val === 'DAY') analysisType.value = 'hour';
  else analysisType.value = 'day';
  getAnalysis();
}

// 饼图数据
const pieChartData = computed(() => {
  if (!hourData.value?.pieChat) return [];
  const { peak, flat, tip, trough } = hourData.value.pieChat;
  return [
    { name: '尖', value: Number.parseFloat(tip) || 0 },
    { name: '峰', value: Number.parseFloat(peak) || 0 },
    { name: '平', value: Number.parseFloat(flat) || 0 },
    { name: '谷', value: Number.parseFloat(trough) || 0 }
  ];
});

// 折线图数据
const lineChartData = computed(() => {
  if (analysisType.value === 'hour' && hourData.value?.lineChat) {
    return hourData.value.lineChat;
  }
  if (analysisType.value === 'day' && dayData.value?.powerConsumptionList) {
    return dayData.value.powerConsumptionList;
  }
  return [];
});

// 汇总数据
const summaryData = computed(() => {
  if (dayData.value?.totalVO) {
    return dayData.value.totalVO;
  }
  return null;
});

onMounted(() => getAnalysis());
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <ElForm :model="queryParams" label-width="80px" class="flex flex-wrap gap-16px">
        <ElFormItem label="时间类型" class="w-200px">
          <ElSelect v-model="queryParams.timeType" @change="handleTimeTypeChange">
            <ElOption v-for="t in timeTypes" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="查询时间" class="w-240px">
          <ElDatePicker
            v-model="queryParams.queryTime"
            :type="queryParams.timeType === 'DAY' ? 'date' : 'month'"
            placeholder="选择时间"
            value-format="YYYY-MM-DD"
            @change="getAnalysis"
          />
        </ElFormItem>
        <ElFormItem class="ml-auto">
          <ElButton type="primary" :loading="loading" @click="getAnalysis">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 gap-16px lg:grid-cols-2">
      <!-- 折线图 -->
      <ElCard class="card-wrapper">
        <template #header>
          <p>{{ analysisType === 'hour' ? '小时用电趋势' : '日用电趋势' }}</p>
        </template>
        <div v-loading="loading" class="h-300px flex-center">
          <div class="text-gray-400">用电量趋势图</div>
        </div>
      </ElCard>

      <!-- 饼图 -->
      <ElCard class="card-wrapper">
        <template #header>
          <p>用电类型占比</p>
        </template>
        <div v-loading="loading" class="h-300px flex-center">
          <div class="grid grid-cols-4 gap-16px text-center">
            <div>
              <div class="text-24px text-red-500 font-bold">{{ pieChartData[0]?.value || 0 }}%</div>
              <div class="text-gray-500">尖</div>
            </div>
            <div>
              <div class="text-24px text-orange-500 font-bold">{{ pieChartData[1]?.value || 0 }}%</div>
              <div class="text-gray-500">峰</div>
            </div>
            <div>
              <div class="text-24px text-blue-500 font-bold">{{ pieChartData[2]?.value || 0 }}%</div>
              <div class="text-gray-500">平</div>
            </div>
            <div>
              <div class="text-24px text-green-500 font-bold">{{ pieChartData[3]?.value || 0 }}%</div>
              <div class="text-gray-500">谷</div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 汇总数据 -->
    <ElCard v-if="summaryData" class="card-wrapper">
      <template #header>
        <p>汇总统计</p>
      </template>
      <div class="grid grid-cols-2 gap-16px lg:grid-cols-4">
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">总电量</div>
          <div class="text-20px font-bold">{{ summaryData.totalPowerConsumption?.toFixed(2) || 0 }} kWh</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">总费用</div>
          <div class="text-20px font-bold">{{ summaryData.totalCost?.toFixed(2) || 0 }} 元</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">尖电量</div>
          <div class="text-20px text-red-500 font-bold">{{ summaryData.tipPowerConsumption?.toFixed(2) || 0 }} kWh</div>
          <div class="text-12px text-gray-400">占比 {{ summaryData.tipPowerProportion?.toFixed(1) || 0 }}%</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">峰电量</div>
          <div class="text-20px text-orange-500 font-bold">
            {{ summaryData.peakPowerConsumption?.toFixed(2) || 0 }} kWh
          </div>
          <div class="text-12px text-gray-400">占比 {{ summaryData.peakPowerProportion?.toFixed(1) || 0 }}%</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">平电量</div>
          <div class="text-20px text-blue-500 font-bold">
            {{ summaryData.flatPowerConsumption?.toFixed(2) || 0 }} kWh
          </div>
          <div class="text-12px text-gray-400">占比 {{ summaryData.flatPowerProportion?.toFixed(1) || 0 }}%</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">谷电量</div>
          <div class="text-20px text-green-500 font-bold">
            {{ summaryData.troughPowerConsumption?.toFixed(2) || 0 }} kWh
          </div>
          <div class="text-12px text-gray-400">占比 {{ summaryData.troughPowerProportion?.toFixed(1) || 0 }}%</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">尖费用</div>
          <div class="text-20px text-red-500 font-bold">{{ summaryData.tipPowerCost?.toFixed(2) || 0 }} 元</div>
          <div class="text-12px text-gray-400">占比 {{ summaryData.tipPowerCostProportion?.toFixed(1) || 0 }}%</div>
        </div>
        <div class="rounded bg-gray-50 p-4">
          <div class="text-14px text-gray-500">谷费用</div>
          <div class="text-20px text-green-500 font-bold">{{ summaryData.troughPowerCost?.toFixed(2) || 0 }} 元</div>
          <div class="text-12px text-gray-400">占比 {{ summaryData.troughPowerCostProportion?.toFixed(1) || 0 }}%</div>
        </div>
      </div>
    </ElCard>

    <!-- 数据表格 -->
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <p>{{ analysisType === 'hour' ? '小时明细数据' : '日明细数据' }}</p>
      </template>
      <ElTable
        v-loading="loading"
        height="300"
        border
        :data="analysisType === 'hour' ? hourData?.dataList : []"
        row-key="time"
      >
        <ElTableColumn prop="time" label="时间" width="160" />
        <ElTableColumn prop="sharpPower" label="尖电量(kWh)" width="120" />
        <ElTableColumn prop="sharpFee" label="尖费用(元)" width="120" />
        <ElTableColumn prop="peakPower" label="峰电量(kWh)" width="120" />
        <ElTableColumn prop="peakFee" label="峰费用(元)" width="120" />
        <ElTableColumn prop="flatPower" label="平电量(kWh)" width="120" />
        <ElTableColumn prop="flatFee" label="平费用(元)" width="120" />
        <ElTableColumn prop="valleyPower" label="谷电量(kWh)" width="120" />
        <ElTableColumn prop="valleyFee" label="谷费用(元)" width="120" />
        <ElTableColumn prop="totalPower" label="总电量(kWh)" width="120" />
        <ElTableColumn prop="totalFee" label="总费用(元)" width="120" />
      </ElTable>
    </ElCard>
  </div>
</template>
