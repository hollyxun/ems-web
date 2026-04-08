<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { use } from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { ElCard, ElRow, ElCol, ElEmpty } from 'element-plus';

use([GaugeChart, TooltipComponent, CanvasRenderer]);

defineOptions({ name: 'RealtimeMetricsCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const metrics = ref({
  voltage: 380,
  current: 125,
  power: 47.5,
  frequency: 50
});

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchRealtimeMetrics(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 200));
  metrics.value = {
    voltage: 380 + Math.random() * 5 - 2.5,
    current: 125 + Math.random() * 10 - 5,
    power: 47.5 + Math.random() * 3 - 1.5,
    frequency: 50 + Math.random() * 0.5 - 0.25
  };
  loading.value = false;
}

function createGaugeOption(name: string, value: number, min: number, max: number, unit: string) {
  return {
    series: [{
      name,
      type: 'gauge',
      center: ['50%', '70%'],
      radius: '90%',
      min,
      max,
      splitNumber: 10,
      axisLine: {
        lineStyle: { width: 6, color: [[0.6, '#10B981'], [0.8, '#F59E0B'], [1, '#EF4444']] }
      },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -6, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -6, length: 10, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { color: 'inherit', distance: 12, fontSize: 10 },
      detail: { valueAnimation: true, formatter: `{value} ${unit}`, color: 'inherit', fontSize: 14 },
      data: [{ value: Math.round(value * 10) / 10, name }]
    }]
  };
}

const voltageOption = computed(() => createGaugeOption('电压', metrics.value.voltage, 340, 420, 'V'));
const currentOption = computed(() => createGaugeOption('电流', metrics.value.current, 80, 200, 'A'));
const powerOption = computed(() => createGaugeOption('功率', metrics.value.power, 20, 80, 'kW'));
const frequencyOption = computed(() => createGaugeOption('频率', metrics.value.frequency, 45, 55, 'Hz'));

onMounted(loadData);

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard shadow="never" class="h-full" v-loading="loading">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">实时指标</span>
        <span class="text-xs text-green-500 animate-pulse">实时</span>
      </div>
    </template>
    <ElRow v-if="!loading" :gutter="16" class="h-full">
      <ElCol :span="12" class="h-140px">
        <VChart :option="voltageOption" autoresize />
      </ElCol>
      <ElCol :span="12" class="h-140px">
        <VChart :option="currentOption" autoresize />
      </ElCol>
      <ElCol :span="12" class="h-140px">
        <VChart :option="powerOption" autoresize />
      </ElCol>
      <ElCol :span="12" class="h-140px">
        <VChart :option="frequencyOption" autoresize />
      </ElCol>
    </ElRow>
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>