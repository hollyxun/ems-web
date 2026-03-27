<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { Api } from '@/typings/api';

defineOptions({ name: 'RankingTrendChart' });

interface Props {
  data: Api.Energy.Ranking.RankingTrendPoint[];
  teamName: string;
  metricLabel: string;
  loading: boolean;
}

const props = defineProps<Props>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chartInstance || !props.data.length) return;

  const dates = props.data.map(d => d.date);
  const ranks = props.data.map(d => d.rank);
  const metrics = props.data.map(d => d.metricValue);

  const option: echarts.EChartsOption = {
    title: {
      text: `${props.teamName} - 近30天排名趋势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const date = params[0].axisValue;
        const rank = params[0].data;
        const metric = params[1]?.data || '-';
        return `${date}<br/>排名: ${rank}<br/>${props.metricLabel}: ${metric}`;
      }
    },
    legend: {
      data: ['排名', props.metricLabel],
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
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '排名',
        inverse: true,
        minInterval: 1
      },
      {
        type: 'value',
        name: props.metricLabel,
        position: 'right'
      }
    ],
    series: [
      {
        name: '排名',
        type: 'line',
        data: ranks,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: props.metricLabel,
        type: 'line',
        yAxisIndex: 1,
        data: metrics,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 4,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          type: 'dashed'
        }
      }
    ]
  };

  chartInstance.setOption(option);
}

function resizeChart() {
  chartInstance?.resize();
}

watch(() => props.data, updateChart, { deep: true });

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
  <div v-loading="loading" class="trend-chart-wrapper">
    <div ref="chartRef" class="h-80 w-full" />
  </div>
</template>