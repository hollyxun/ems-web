<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { fetchPeakValleyDistribution } from '@/service/api/dashboard';
import { useEcharts } from '@/hooks/common/echarts';
import type { ECOption } from '@/hooks/common/echarts';

interface Props {
  orgId: string;
  period?: 'day' | 'month';
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  period: 'day',
  loading: false
});

const chartType = ref<'pie' | 'bar'>('pie');
const distributionData = ref<Api.Dashboard.PeakValleyDistribution | null>(null);
const loadingState = ref(false);

const { domRef, updateOptions } = useEcharts<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `
        <div style="font-weight: bold;">${params.name}</div>
        <div>Consumption: ${params.data?.value?.toLocaleString()} ${params.data?.unit}</div>
        <div>Percentage: ${params.percent?.toFixed(1)}%</div>
      `;
    }
  },
  legend: {
    data: ['Peak', 'Flat', 'Valley'],
    bottom: '5%'
  },
  series: []
}));

const segmentColors = {
  peak: '#ef4444',
  flat: '#f59e0b',
  valley: '#10b981'
};

const segmentLabels = {
  peak: 'Peak',
  flat: 'Flat',
  valley: 'Valley'
};

async function loadData() {
  loadingState.value = true;
  try {
    const response = await fetchPeakValleyDistribution(props.orgId, props.period);
    if (response.data) {
      distributionData.value = response.data;
      updateChartData(response.data);
    }
  } catch (e) {
    console.error('Failed to load distribution:', e);
  } finally {
    loadingState.value = false;
  }
}

function updateChartData(data: Api.Dashboard.PeakValleyDistribution) {
  const segments = [
    { key: 'peak', ...data.peak },
    { key: 'flat', ...data.flat },
    { key: 'valley', ...data.valley }
  ];

  if (chartType.value === 'pie') {
    updateOptions(opts => {
      return {
        ...opts,
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: ['35%', '60%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            data: segments.map(s => ({
              name: segmentLabels[s.key as keyof typeof segmentLabels],
              value: s.value,
              unit: s.unit,
              percentage: s.percentage,
              timeRanges: s.timeRanges,
              itemStyle: { color: segmentColors[s.key as keyof typeof segmentColors] }
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
          data: segments.map(s => segmentLabels[s.key as keyof typeof segmentLabels])
        },
        yAxis: { type: 'value', name: segments[0]?.unit || 'kWh' },
        series: [
          {
            type: 'bar',
            barWidth: '50%',
            data: segments.map(s => ({
              value: s.value,
              unit: s.unit,
              percentage: s.percentage,
              timeRanges: s.timeRanges,
              itemStyle: {
                color: segmentColors[s.key as keyof typeof segmentColors],
                borderRadius: [8, 8, 0, 0]
              }
            }))
          }
        ]
      };
    });
  }
}

watch(chartType, () => {
  if (distributionData.value) {
    updateChartData(distributionData.value);
  }
});

loadData();

watch(
  () => props.orgId,
  () => {
    loadData();
  }
);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">Peak/Valley/Flat Distribution</span>
        <ElRadioGroup v-model="chartType" size="small">
          <ElRadioButton value="pie">Pie</ElRadioButton>
          <ElRadioButton value="bar">Bar</ElRadioButton>
        </ElRadioGroup>
      </div>
    </template>

    <div v-if="loadingState" class="h-320px flex items-center justify-center">
      <ElIcon class="is-loading text-3xl text-primary">
        <Icon icon="mdi:loading" />
      </ElIcon>
    </div>

    <div v-else ref="domRef" class="h-320px" />

    <!-- Legend explanation -->
    <div class="mt-4 flex justify-center gap-6 text-xs">
      <div class="flex items-center gap-1">
        <span class="h-3 w-3 rounded bg-red-500" />
        <span>Peak (High price)</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="h-3 w-3 rounded bg-amber-500" />
        <span>Flat (Normal price)</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="h-3 w-3 rounded bg-green-500" />
        <span>Valley (Low price)</span>
      </div>
    </div>
  </ElCard>
</template>
