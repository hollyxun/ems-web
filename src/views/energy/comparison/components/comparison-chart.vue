<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import * as echarts from 'echarts';
import type { Api } from '@/typings/api';

defineOptions({ name: 'ComparisonChart' });

interface Props {
  items: Api.Energy.Comparison.ComparisonItem[];
  itemLabels: string[];
  metric: 'total_energy' | 'specific_consumption' | 'cost' | 'peak_valley_flat';
  loading?: boolean;
}

const props = defineProps<Props>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const metricConfig = computed(() => {
  const configs: Record<string, { key: string; label: string; unit: string }> = {
    total_energy: { key: 'totalEnergy', label: '总能耗', unit: 'kWh' },
    specific_consumption: { key: 'specificConsumption', label: '单耗', unit: '' },
    cost: { key: 'cost', label: '成本', unit: '¥' },
    peak_valley_flat: { key: 'peakRatio', label: '峰谷平占比', unit: '%' }
  };
  return configs[props.metric] || configs.total_energy;
});

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chartInstance || !props.items.length) return;

  const labels = props.itemLabels;

  let option: echarts.EChartsOption;

  if (props.metric === 'peak_valley_flat') {
    option = {
      title: {
        text: '峰谷平能耗对比',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['峰时', '谷时', '平时'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels
      },
      yAxis: {
        type: 'value',
        name: '能耗 (kWh)'
      },
      series: [
        {
          name: '峰时',
          type: 'bar',
          stack: 'total',
          data: props.items.map(i => i.peakEnergy),
          itemStyle: { color: '#F56C6C' }
        },
        {
          name: '谷时',
          type: 'bar',
          stack: 'total',
          data: props.items.map(i => i.valleyEnergy),
          itemStyle: { color: '#67C23A' }
        },
        {
          name: '平时',
          type: 'bar',
          stack: 'total',
          data: props.items.map(i => i.flatEnergy),
          itemStyle: { color: '#E6A23C' }
        }
      ]
    };
  } else {
    const values = props.items.map(item => {
      return item[metricConfig.value.key as keyof Api.Energy.Comparison.ComparisonItem] as number;
    });

    option = {
      title: {
        text: `${metricConfig.value.label}对比`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>${metricConfig.value.label}: ${metricConfig.value.unit}${item.value.toFixed(2)}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          interval: 0,
          rotate: labels.length > 3 ? 30 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: metricConfig.value.unit ? `${metricConfig.value.label} (${metricConfig.value.unit})` : metricConfig.value.label
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params: any) => {
              const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'];
              return colors[params.dataIndex % colors.length];
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => params.value.toFixed(2)
          }
        }
      ]
    };
  }

  chartInstance.setOption(option);
}

function resizeChart() {
  chartInstance?.resize();
}

watch([() => props.items, () => props.metric], updateChart, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});
</script>

<template>
  <div v-loading="loading" class="comparison-chart-wrapper">
    <div ref="chartRef" class="h-80 w-full" />
  </div>
</template>