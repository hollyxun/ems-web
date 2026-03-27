<script setup lang="ts">
import { watch } from 'vue';
import { useEcharts } from '@/hooks/common/echarts';

interface Props {
  data: Api.Dashboard.FactoryComparisonItem[];
  loading?: boolean;
  unit?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  unit: 'kWh'
});

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const item = params[0];
      return `
        <div style="font-weight: bold;">${item.name}</div>
        <div>Consumption: ${item.value.toLocaleString()} ${props.unit}</div>
        <div>Rank: #${item.data?.rank || '-'}</div>
        <div>Trend: ${item.data?.trend > 0 ? '+' : ''}${(item.data?.trend || 0).toFixed(1)}%</div>
      `;
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [] as string[],
    axisLabel: {
      rotate: 30,
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    name: props.unit,
    axisLabel: {
      formatter: (value: number) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toString();
      }
    }
  },
  series: [
    {
      type: 'bar',
      data: [] as any[],
      itemStyle: {
        color: (params: any) => {
          const rank = params.data?.rank || 0;
          const total = props.data.length;
          if (rank <= 3) return '#10b981';
          if (rank > total - 3) return '#ef4444';
          return '#3b82f6';
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }
  ]
}));

watch(
  () => props.data,
  newData => {
    if (!newData || newData.length === 0) return;

    updateOptions(opts => {
      opts.xAxis!.data = newData.map(f => f.factoryName);
      opts.series![0].data = newData.map(f => ({
        value: f.consumption.value,
        rank: f.rank,
        trend: f.trend
      }));
      return opts;
    });
  },
  { immediate: true }
);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">Factory Consumption Comparison</span>
        <div class="flex gap-4 text-xs">
          <span class="flex items-center gap-1">
            <span class="h-3 w-3 rounded bg-green-500" />
            Top 3
          </span>
          <span class="flex items-center gap-1">
            <span class="h-3 w-3 rounded bg-red-500" />
            Bottom 3
          </span>
        </div>
      </div>
    </template>
    <div ref="domRef" class="h-360px" />
  </ElCard>
</template>