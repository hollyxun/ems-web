import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import type { Ref, ShallowRef } from 'vue';
import * as ECharts from 'echarts';

export type EChartsOption = ECharts.EChartsOption;

export interface UseEChartsReturn {
  domRef: Ref<HTMLElement | null>;
  chartInstance: ShallowRef<ECharts.ECharts | null>;
  updateOptions: (options: EChartsOption) => void;
  resize: () => void;
  dispose: () => void;
}

export function useECharts(getOptions: () => EChartsOption): UseEChartsReturn {
  const domRef = ref<HTMLElement | null>(null);
  // 使用 shallowRef 避免 Vue 对 ECharts 实例进行深度响应式转换
  const chartInstance = shallowRef<ECharts.ECharts | null>(null);

  const initChart = () => {
    if (!domRef.value) return;

    const instance = ECharts.init(domRef.value);
    instance.setOption(getOptions());
    chartInstance.value = instance;
  };

  const updateOptions = (options: EChartsOption) => {
    if (!chartInstance.value) {
      initChart();
      return;
    }
    chartInstance.value.setOption(options);
  };

  const resize = () => {
    chartInstance.value?.resize();
  };

  const dispose = () => {
    chartInstance.value?.dispose();
    chartInstance.value = null;
  };

  const handleResize = () => {
    resize();
  };

  onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    dispose();
  });

  return {
    domRef,
    chartInstance,
    updateOptions,
    resize,
    dispose
  };
}

export default useECharts;
