import { Graph, type IPointerEvent, type NodeData } from '@antv/g6';

// 节点类型
export type ApprovalNodeType = 'start' | 'end' | 'approval' | 'condition' | 'parallel';

// 节点数据
export interface ApprovalNodeData {
  id: string;
  name: string;
  type: ApprovalNodeType;
  config?: Record<string, any>;
  [key: string]: any;
}

// 边数据
export interface ApprovalEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  [key: string]: any;
}

// 流程图数据
export interface ApprovalFlowData {
  nodes: ApprovalNodeData[];
  edges: ApprovalEdgeData[];
}

// 节点样式配置
const nodeStyleMap: Record<ApprovalNodeType, { fill: string; stroke: string; icon: string }> = {
  start: { fill: '#10B981', stroke: '#059669', icon: '▶' },
  end: { fill: '#EF4444', stroke: '#DC2626', icon: '■' },
  approval: { fill: '#3B82F6', stroke: '#2563EB', icon: '✓' },
  condition: { fill: '#F59E0B', stroke: '#D97706', icon: '?' },
  parallel: { fill: '#8B5CF6', stroke: '#7C3AED', icon: '∥' }
};

interface ApprovalFlowConfig {
  container: string | HTMLElement;
  data: ApprovalFlowData;
  editable?: boolean;
  onNodeClick?: (node: ApprovalNodeData) => void;
  onEdgeClick?: (edge: ApprovalEdgeData) => void;
  onCanvasClick?: () => void;
}

export function useApprovalFlow(config: ApprovalFlowConfig) {
  const { container, data, editable = true, onNodeClick, onEdgeClick, onCanvasClick } = config;

  const graph = new Graph({
    container,
    autoFit: 'center',
    data,
    node: {
      type: 'rect',
      style: (nodeData: NodeData) => {
        const node = nodeData as ApprovalNodeData;
        const style = nodeStyleMap[node.type] || nodeStyleMap.approval;
        return {
          labelText: node.name,
          size: node.type === 'start' || node.type === 'end' ? [80, 40] : [140, 50],
          radius: node.type === 'condition' ? 0 : 8,
          fill: '#252830',
          stroke: style.stroke,
          lineWidth: 2,
          labelFill: '#E5E7EB',
          labelFontSize: 13,
          labelTextAlign: 'center',
          labelTextBaseline: 'middle',
          labelFontFamily: 'DM Sans, sans-serif',
          cursor: editable ? 'pointer' : 'default',
          badges: [{ text: style.icon, placement: 'top-left', offsetX: -25, offsetY: -5, fill: style.fill }],
          badgeFontSize: 12,
          badgeFill: '#E5E7EB',
          ports: [
            { id: 'left', placement: 'left' },
            { id: 'right', placement: 'right' },
            { id: 'top', placement: 'top' },
            { id: 'bottom', placement: 'bottom' }
          ]
        };
      },
      state: {
        selected: {
          lineWidth: 3,
          stroke: '#F59E0B',
          shadowColor: 'rgba(245, 158, 11, 0.4)',
          shadowBlur: 10
        },
        hover: {
          lineWidth: 2,
          stroke: '#F59E0B'
        }
      }
    },
    edge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#6B7280',
        lineWidth: 2,
        endArrow: true,
        endArrowSize: 8,
        endArrowFill: '#6B7280',
        labelFill: '#9CA3AF',
        labelFontSize: 11
      },
      state: {
        selected: {
          stroke: '#F59E0B',
          lineWidth: 3
        },
        hover: {
          stroke: '#F59E0B'
        }
      }
    },
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 40,
      ranksep: 80
    },
    behaviors: editable
      ? [
          'drag-canvas',
          'zoom-canvas',
          'drag-element',
          'click-select',
          {
            type: 'hover-activate',
            degree: 0
          }
        ]
      : ['drag-canvas', 'zoom-canvas'],
    plugins: [
      {
        type: 'tooltip',
        enable: (event: IPointerEvent) => event.targetType === 'node',
        getContent: (_event: IPointerEvent, items?: ApprovalNodeData[]) => {
          if (!items?.length) return '';
          const node = items[0];
          const typeNames: Record<ApprovalNodeType, string> = {
            start: '开始节点',
            end: '结束节点',
            approval: '审批节点',
            condition: '条件节点',
            parallel: '并行网关'
          };
          return `
            <div style="padding: 8px; background: #1E2028; color: #E5E7EB; border-radius: 6px; font-size: 12px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${node.name}</div>
              <div style="color: #9CA3AF;">类型: ${typeNames[node.type]}</div>
            </div>
          `;
        }
      }
    ]
  });

  // 绑定事件
  graph.on('node:click', (event: IPointerEvent) => {
    const nodeId = (event.target as any).id;
    const node = data.nodes.find(n => n.id === nodeId);
    if (node && onNodeClick) {
      onNodeClick(node);
    }
  });

  graph.on('edge:click', (event: IPointerEvent) => {
    const edgeId = (event.target as any).id;
    const edge = data.edges.find(e => e.id === edgeId);
    if (edge && onEdgeClick) {
      onEdgeClick(edge);
    }
  });

  graph.on('canvas:click', () => {
    if (onCanvasClick) {
      onCanvasClick();
    }
  });

  graph.render();

  return {
    graph,
    // 添加节点
    addNode: (node: ApprovalNodeData, x: number, y: number) => {
      graph.addNodeData([{ ...node, style: { x, y } }]);
    },
    // 添加边
    addEdge: (edge: ApprovalEdgeData) => {
      graph.addEdgeData([edge]);
    },
    // 删除节点
    removeNode: (nodeId: string) => {
      graph.removeNodeData([nodeId]);
    },
    // 删除边
    removeEdge: (edgeId: string) => {
      graph.removeEdgeData([edgeId]);
    },
    // 更新节点
    updateNode: (nodeId: string, updates: Partial<ApprovalNodeData>) => {
      graph.updateNodeData([{ id: nodeId, ...updates }]);
    },
    // 获取选中节点
    getSelectedNodes: () => {
      return graph.getElementDataByState('node', 'selected');
    },
    // 清除选中
    clearSelection: () => {
      const selectedNodes = graph.getElementDataByState('node', 'selected');
      selectedNodes.forEach((node: any) => {
        graph.setElementState(node.id, []);
      });
    },
    // 导出 JSON
    exportJSON: (): ApprovalFlowData => {
      const nodeData = graph.getNodeData();
      const edgeData = graph.getEdgeData();
      return {
        nodes: nodeData.map((n: any) => ({
          id: n.id,
          name: n.data?.name || n.style?.labelText || '',
          type: n.data?.type || 'approval',
          config: n.data?.config || {},
          position: { x: n.style?.x, y: n.style?.y }
        })),
        edges: edgeData.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.style?.labelText || '',
          condition: e.data?.condition || ''
        }))
      };
    }
  };
}
