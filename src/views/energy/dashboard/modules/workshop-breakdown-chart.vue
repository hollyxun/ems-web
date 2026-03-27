<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEcharts } from '@/hooks/common/echarts';
import type { ECOption } from '@/hooks/common/echarts';

interface Props {
  data: Api.Dashboard.WorkshopBreakdownItem[];
}

const props = defineProps<Props>();

const chartType = ref<'pie' | 'bar'>('pie');

const { domRef, updateOptions } = useEcharts<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `
        <div style="font-weight: bold;">${params.name}</div>
        <div>Consumption: ${params.data?.value?.toLocaleString()} ${params.data?.unit || 'kWh'}</div>
        <div>Percentage: ${(params.data?.percentage || 0).toFixed(1)}%</div>
      `;
    }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    formatter: (name: string) => {
      const item = props.data.find(d => d.workshopName === name);
      if (item) {
        return `${name} (${item.percentage.toFixed(1)}%)`;
      }
      return name;
    }
  },
  series: []
}));

watch(
  [() => props.data, chartType],
  ([newData, type]) => {
    if (!newData || newData.length === 0) return;

    if (type === 'pie') {
      updateOptions(opts => {
        return {
          ...opts,
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['40%', '50%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 14,
                  fontWeight: 'bold'
                }
              },
              data: newData.map(w => ({
                name: w.workshopName,
                value: w.consumption.value,
                unit: w.consumption.unit,
                percentage: w.percentage,
                workshopId: w.workshopId
              }))
            }
          ]
        };
      });
    } else {
      updateOptions(opts => {
        return {
          ...opts,
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: newData.map(w => w.workshopName),
            axisLabel: { rotate: 30, fontSize: 11 }
          },
          yAxis: { type: 'value', name: 'kWh' },
          series: [
            {
              type: 'bar',
              data: newData.map(w => ({
                value: w.consumption.value,
                unit: w.consumption.unit,
                percentage: w.percentage,
                workshopId: w.workshopId
              })),
              itemStyle: {
                color: '#3b82f6'
              }
            }
          ]
        };
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">Workshop Consumption Distribution</span>
        <ElRadioGroup v-model="chartType" size="small">
          <ElRadioButton value="pie">Pie</ElRadioButton>
          <ElRadioButton value="bar">Bar</ElRadioButton>
        </ElRadioGroup>
      </div>
    </template>
    <div ref="domRef" class="h-360px cursor-pointer" />
    <div class="mt-2 text-center text-xs text-gray-400">Click on chart to drill down to team details</div>
  </ElCard>
</template>