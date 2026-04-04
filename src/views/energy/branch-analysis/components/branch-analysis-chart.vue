<script setup lang="ts">
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

defineOptions({ name: 'BranchAnalysisChart' });

interface Props {
  data: number[];
  labels: string[];
  unit: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const chartType = ref<'bar' | 'line'>('bar');

// 图表配置
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: chartType.value === 'bar' ? 'shadow' : 'line'
    },
    formatter: (params: any) => {
      const item = params[0];
      return `${item.name}<br/>能耗: ${item.value?.toFixed(2) || '-'} ${props.unit}`;
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.labels,
    axisLabel: {
      rotate: props.labels.length > 12 ? 45 : 0,
      interval: props.labels.length > 24 ? Math.floor(props.labels.length / 24) : 0
    }
  },
  yAxis: {
    type: 'value',
    name: `能耗 (${props.unit})`,
    axisLabel: {
      formatter: (value: number) => value.toFixed(0)
    }
  },
  dataZoom: props.data.length > 24 ? [
    {
      type: 'slider',
      start: 0,
      end: 50,
      bottom: 5
    }
  ] : [],
  series: [
    {
      name: '能耗',
      type: chartType.value,
      data: props.data,
      smooth: chartType.value === 'line',
      barMaxWidth: 40,
      itemStyle: {
        color: chartType.value === 'bar' ? {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#188df0' },
            { offset: 1, color: '#83bff6' }
          ]
        } : '#188df0'
      },
      areaStyle: chartType.value === 'line' ? {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 141, 240, 0.3)' },
            { offset: 1, color: 'rgba(24, 141, 240, 0.05)' }
          ]
        }
      } : undefined
    }
  ]
}));

// 切换图表类型
function toggleChartType() {
  chartType.value = chartType.value === 'bar' ? 'line' : 'bar';
}
</script>

<template>
  <div class="branch-analysis-chart">
    <!-- 图表类型切换 -->
    <div class="mb-4 flex justify-end">
      <ElRadioGroup v-model="chartType" size="small">
        <ElRadioButton value="bar">柱状图</ElRadioButton>
        <ElRadioButton value="line">折线图</ElRadioButton>
      </ElRadioGroup>
    </div>

    <!-- ECharts 图表 -->
    <VChart
      :option="chartOption"
      :style="{ height: '350px', width: '100%' }"
      autoresize
    />
  </div>
</template>

<style scoped>
.branch-analysis-chart {
  width: 100%;
}
</style>