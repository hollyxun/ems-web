<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { fetchTrendData } from '@/service/api/dashboard';
import { useEcharts } from '@/hooks/common/echarts';

interface Props {
  orgId: string;
  scope?: 'group' | 'factory' | 'team';
  timeRange?: number;
  realtime?: boolean;
  refreshInterval?: number;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  scope: 'factory',
  timeRange: 24,
  realtime: true,
  refreshInterval: 30,
  title: 'Energy Trend'
});

const loading = ref(true);
const error = ref<Error | null>(null);
const trendData = ref<Api.Dashboard.TrendData | null>(null);
const showYesterday = ref(true);

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
    formatter: (params: any) => {
      const time = params[0].axisValue;
      let html = `<div style="font-weight: bold;">${time}</div>`;
      params.forEach((item: any) => {
        const color = item.seriesName === 'Current' ? '#3b82f6' : '#94a3b8';
        html += `
          <div style="color: ${color}; display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
            ${item.seriesName}: ${item.value.toLocaleString()} ${trendData.value?.unit || 'kWh'}
          </div>
        `;
      });
      return html;
    }
  },
  legend: {
    data: ['Current', 'Yesterday'],
    right: '5%',
    top: '3%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[],
    axisLabel: {
      formatter: (value: string) => {
        return value.split(' ')[1] || value;
      }
    }
  },
  yAxis: {
    type: 'value',
    name: 'kWh',
    axisLabel: {
      formatter: (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
      }
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100
    },
    {
      type: 'slider',
      start: 0,
      end: 100,
      height: 20,
      bottom: 5
    }
  ],
  series: [
    {
      name: 'Current',
      type: 'line',
      smooth: true,
      symbol: 'none',
      sampling: 'lttb',
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ]
        }
      },
      data: [] as number[]
    },
    {
      name: 'Yesterday',
      type: 'line',
      smooth: true,
      symbol: 'none',
      sampling: 'lttb',
      itemStyle: { color: '#94a3b8' },
      lineStyle: { type: 'dashed' },
      data: [] as number[]
    }
  ]
}));

async function loadTrendData() {
  loading.value = true;
  error.value = null;

  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - props.timeRange * 60 * 60 * 1000);

    const response = await fetchTrendData({
      orgId: props.orgId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });

    if (response.data) {
      trendData.value = response.data;
      updateChartData(response.data);
    }
  } catch (e) {
    error.value = e as Error;
  } finally {
    loading.value = false;
  }
}

function updateChartData(data: Api.Dashboard.TrendData) {
  updateOptions(opts => {
    opts.xAxis!.data = data.timestamps;
    opts.yAxis!.name = data.unit;
    opts.series![0].data = data.current;
    opts.series![1].data = showYesterday.value ? data.yesterday : [];
    return opts;
  });
}

watch(showYesterday, show => {
  if (trendData.value) {
    updateOptions(opts => {
      opts.series![1].data = show ? trendData.value!.yesterday : [];
      return opts;
    });
  }
});

let updateInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  loadTrendData();

  if (props.realtime) {
    updateInterval = setInterval(loadTrendData, props.refreshInterval * 1000);
  }
});

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

watch(
  () => [props.orgId, props.timeRange],
  () => {
    loadTrendData();
  }
);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">{{ title }}</span>
        <div class="flex items-center gap-4">
          <ElSwitch v-model="showYesterday" active-text="Compare Yesterday" size="small" />
          <ElButton :loading="loading" size="small" @click="loadTrendData">
            <Icon icon="mdi:refresh" />
          </ElButton>
        </div>
      </div>
    </template>

    <ElAlert v-if="error" type="error" :title="error.message" class="mb-4" />

    <div v-if="loading && !trendData" class="h-400px flex items-center justify-center">
      <ElIcon class="is-loading text-4xl text-primary">
        <Icon icon="mdi:loading" />
      </ElIcon>
    </div>

    <div v-else ref="domRef" class="h-400px" />
  </ElCard>
</template>
