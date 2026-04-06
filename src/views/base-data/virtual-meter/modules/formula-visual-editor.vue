<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Graph } from '@antv/g6';

defineOptions({ name: 'FormulaVisualEditor' });

interface SourceConfig {
  meterId: number;
  meterName: string;
  meterCode: string;
  coefficient: number;
  order: number;
}

interface Props {
  sourceConfig: SourceConfig[];
  calculateType: Api.Energy.VirtualMeter.CalculateType;
  formula: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update:formula', value: string): void;
  (e: 'update:sourceConfig', value: SourceConfig[]): void;
}

const emit = defineEmits<Emits>();

const containerRef = ref<HTMLDivElement>();
let graph: Graph | null = null;

// 节点类型颜色
const nodeColors = {
  source: '#00d4ff',
  operator: '#FF9800',
  result: '#4CAF50'
};

// 运算符节点
const operatorNodes = computed(() => {
  const operators: { id: string; label: string; type: string }[] = [];

  switch (props.calculateType) {
    case 'sum':
      operators.push({ id: 'op-add', label: '+', type: 'add' });
      break;
    case 'difference':
      operators.push({ id: 'op-sub', label: '-', type: 'sub' });
      break;
    case 'average':
      operators.push({ id: 'op-add', label: '+', type: 'add' });
      operators.push({ id: 'op-div', label: '÷', type: 'div' });
      break;
    case 'ratio':
      operators.push({ id: 'op-div', label: '÷', type: 'div' });
      break;
    case 'custom':
      // 解析自定义公式中的运算符
      const opMatches = props.formula.match(/[+\-*/]/g) || [];
      const uniqueOps = [...new Set(opMatches)];
      uniqueOps.forEach((op, i) => {
        const label = op === '*' ? '×' : op === '/' ? '÷' : op;
        operators.push({ id: `op-${i}`, label, type: `op-${op}` });
      });
      break;
  }

  return operators;
});

// 初始化图
function initGraph() {
  if (!containerRef.value) return;

  // 清理旧图
  if (graph) {
    graph.destroy();
    graph = null;
  }

  // 构建节点和边数据
  const nodes: any[] = [];
  const edges: any[] = [];

  // 源计量点节点
  props.sourceConfig.forEach((source, index) => {
    nodes.push({
      id: `source-${index}`,
      data: {
        label: source.meterName || `M${index + 1}`,
        type: 'source',
        coefficient: source.coefficient
      }
    });
  });

  // 运算符节点
  operatorNodes.value.forEach((op, index) => {
    nodes.push({
      id: op.id,
      data: {
        label: op.label,
        type: 'operator'
      }
    });
  });

  // 结果节点
  nodes.push({
    id: 'result',
    data: {
      label: '结果',
      type: 'result'
    }
  });

  // 构建边
  if (props.sourceConfig.length > 0) {
    if (props.calculateType === 'sum' || props.calculateType === 'difference') {
      // 所有源节点 -> 运算符 -> 结果
      props.sourceConfig.forEach((_, index) => {
        edges.push({
          id: `e-source-${index}-op`,
          source: `source-${index}`,
          target: 'op-add'
        });
      });
      edges.push({
        id: 'e-op-result',
        source: 'op-add',
        target: 'result'
      });
    } else if (props.calculateType === 'ratio') {
      // M1 -> ÷ -> M2 -> 结果
      if (props.sourceConfig.length >= 2) {
        edges.push({
          id: 'e-source-0-op',
          source: 'source-0',
          target: 'op-div'
        });
        edges.push({
          id: 'e-source-1-op',
          source: 'source-1',
          target: 'op-div'
        });
        edges.push({
          id: 'e-op-result',
          source: 'op-div',
          target: 'result'
        });
      }
    } else if (props.calculateType === 'average') {
      // 所有源节点 -> + -> ÷ -> 结果
      props.sourceConfig.forEach((_, index) => {
        edges.push({
          id: `e-source-${index}-add`,
          source: `source-${index}`,
          target: 'op-add'
        });
      });
      edges.push({
        id: 'e-add-div',
        source: 'op-add',
        target: 'op-div'
      });
      edges.push({
        id: 'e-div-result',
        source: 'op-div',
        target: 'result'
      });
    } else {
      // 自定义公式 - 简化连线
      props.sourceConfig.forEach((_, index) => {
        edges.push({
          id: `e-source-${index}-result`,
          source: `source-${index}`,
          target: 'result'
        });
      });
    }
  }

  // 创建 G6 图
  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.clientWidth,
    height: 300,
    data: { nodes, edges },
    node: {
      type: 'rect',
      style: {
        size: (d: any) => {
          const type = d.data?.type;
          return type === 'result' ? [100, 50] : [80, 40];
        },
        radius: 8,
        fill: (d: any) => {
          const type = d.data?.type;
          return nodeColors[type as keyof typeof nodeColors] || '#666';
        },
        stroke: '#fff',
        lineWidth: 2,
        labelText: (d: any) => d.data?.label || '',
        labelFill: '#fff',
        labelFontSize: 14,
        labelFontWeight: 'bold'
      },
      state: {
        hover: {
          stroke: '#00d4ff',
          lineWidth: 3,
          shadowColor: 'rgba(0, 212, 255, 0.5)',
          shadowBlur: 10
        },
        selected: {
          stroke: '#FF9800',
          lineWidth: 3
        }
      }
    },
    edge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#00d4ff',
        lineWidth: 2,
        endArrow: true
      }
    },
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 40,
      ranksep: 80
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element']
  });

  graph.render();
}

// 监听数据变化重新渲染
watch(
  () => [props.sourceConfig, props.calculateType, props.formula],
  () => {
    initGraph();
  },
  { deep: true }
);

// 窗口大小变化
function handleResize() {
  if (graph && containerRef.value) {
    graph.resize(containerRef.value.clientWidth, 300);
  }
}

onMounted(() => {
  initGraph();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="formula-visual-editor">
    <div class="editor-header">
      <span class="title">公式可视化</span>
      <span class="formula-text">{{ formula || '暂无公式' }}</span>
    </div>
    <div ref="containerRef" class="graph-container" />
    <div v-if="sourceConfig.length === 0" class="empty-hint">请先添加源计量点以生成公式图</div>
  </div>
</template>

<style scoped lang="scss">
.formula-visual-editor {
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #00d4ff;
  }

  .formula-text {
    font-family: 'Consolas', monospace;
    font-size: 14px;
    color: #e0e6ed;
    background: rgba(0, 0, 0, 0.3);
    padding: 4px 12px;
    border-radius: 4px;
  }
}

.graph-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #718096;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}
</style>
