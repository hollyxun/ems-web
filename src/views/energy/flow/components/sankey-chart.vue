<script setup lang="ts">
import { watch } from 'vue';
import { useEcharts } from '@/hooks/common/echarts';
import type { ECOption } from '@/hooks/common/echarts';

defineOptions({ name: 'SankeyChart' });

interface SankeyNode {
  id: string;
  name: string;
  depth: number;
  value: number;
  nodeType: 'input' | 'workshop' | 'team' | 'loss';
  orgId: number;
  metadata?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface Props {
  nodes: SankeyNode[];
  links: SankeyLink[];
  loading?: boolean;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: '500px'
});

const emit = defineEmits<{
  nodeClick: [node: SankeyNode];
}>();

// Node color mapping by type
const nodeColors: Record<string, string> = {
  input: '#409EFF', // Blue
  workshop: '#67C23A', // Green
  team: '#E6A23C', // Orange
  loss: '#F56C6C' // Red
};

// Get node color based on type
function getNodeColor(nodeType: string): string {
  return nodeColors[nodeType] || '#909399';
}

// Format number with thousand separators
function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

// Build ECharts options
function buildOptions(): ECOption {
  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = props.nodes.find(n => n.id === params.data.name);
          if (node) {
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${node.name}</div>
              <div>类型: ${getNodeTypeName(node.nodeType)}</div>
              <div>能耗值: ${formatNumber(node.value)} kWh</div>
            </div>`;
          }
        } else if (params.dataType === 'edge') {
          const sourceNode = props.nodes.find(n => n.id === params.data.source);
          const targetNode = props.nodes.find(n => n.id === params.data.target);
          if (sourceNode && targetNode) {
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">能量流向</div>
              <div>从: ${sourceNode.name}</div>
              <div>到: ${targetNode.name}</div>
              <div>流量: ${formatNumber(params.data.value)} kWh</div>
            </div>`;
          }
        }
        return '';
      }
    },
    series: [
      {
        type: 'sankey',
        layoutIterations: 32,
        nodeWidth: 20,
        nodeGap: 12,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.5
        },
        label: {
          position: 'right',
          fontSize: 12
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            opacity: 0.8
          }
        },
        data: props.nodes.map(node => ({
          name: node.id,
          itemStyle: {
            color: getNodeColor(node.nodeType)
          }
        })),
        links: props.links.map(link => ({
          source: link.source,
          target: link.target,
          value: link.value
        }))
      }
    ]
  };
}

function getNodeTypeName(type: string): string {
  const names: Record<string, string> = {
    input: '输入源',
    workshop: '车间',
    team: '班组',
    loss: '损耗'
  };
  return names[type] || type;
}

const { domRef, updateOptions } = useEcharts(buildOptions);

// Watch for data changes
watch(
  () => [props.nodes, props.links],
  () => {
    updateOptions(buildOptions);
  },
  { deep: true }
);
</script>

<template>
  <div class="sankey-chart-wrapper">
    <div ref="domRef" class="sankey-chart" :style="{ height }"></div>
    <div v-if="loading" class="loading-overlay">
      <span>加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.sankey-chart-wrapper {
  position: relative;
  width: 100%;
}

.sankey-chart {
  width: 100%;
  min-height: 400px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.dark .loading-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>