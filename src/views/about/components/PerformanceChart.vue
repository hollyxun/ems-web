<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { TrendCharts } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import type { HistoryDataPoint } from '../composables/useServerStatus';

interface Props {
  data: HistoryDataPoint[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
});

const chartRef = ref<HTMLDivElement>();
let chartInstance: ECharts | null = null;

const chartOption = computed<EChartsOption>(() => {
  const timestamps = props.data.map(item => {
    const date = new Date(item.timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  });

  const cpuData = props.data.map(item => item.cpuUsage);
  const memoryData = props.data.map(item => item.memoryUsage);

  return {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      formatter: (params: any) => {
        const time = params[0]?.axisValue;
        let result = `<div style="font-weight: 500; margin-bottom: 4px;">${time}</div>`;
        params.forEach((param: any) => {
          const color = param.color;
          const value = param.value?.toFixed(1) ?? 0;
          result += `<div style="display: flex; align-items: center; gap: 8px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span>
            <span>${param.seriesName}:</span>
            <span style="font-weight: 500;">${value}%</span>
          </div>`;
        });
        return result;
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timestamps,
      axisLine: {
        lineStyle: {
          color: '#9ca3af'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#6b7280',
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
          ])
        },
        data: cpuData
      },
      {
        name: '内存',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#a855f7'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(168, 85, 247, 0.2)' },
            { offset: 1, color: 'rgba(168, 85, 247, 0.02)' }
          ])
        },
        data: memoryData
      }
    ]
  };
});

const initChart = () => {
  if (!chartRef.value) return undefined;

  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(chartOption.value);

  const resizeHandler = () => {
    chartInstance?.resize();
  };
  window.addEventListener('resize', resizeHandler);

  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
};

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      chartInstance.setOption(chartOption.value);
    }
  },
  { deep: true }
);

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<template>
  <ElCard class="chart-card" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <ElIcon :size="20" class="text-primary">
            <TrendCharts />
          </ElIcon>
          <div>
            <span class="font-medium">性能趋势</span>
            <div class="text-xs text-gray-500">CPU 和内存使用率实时监控</div>
          </div>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1">
            <div class="h-1 w-3 rounded-full bg-blue-500"></div>
            <span class="text-gray-500">CPU</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="h-1 w-3 rounded-full bg-purple-500"></div>
            <span class="text-gray-500">内存</span>
          </div>
        </div>
      </div>
    </template>

    <div ref="chartRef" class="h-64 w-full"></div>
    <ElEmpty v-if="data.length === 0" description="暂无数据" class="py-12" />
  </ElCard>
</template>

<style scoped>
.text-primary {
  color: var(--el-color-primary);
}
</style>
