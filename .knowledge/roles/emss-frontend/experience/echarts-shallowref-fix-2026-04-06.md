# ECharts 实例存储 shallowRef 修复

> 2026-04-06

---

## 问题现象

TypeScript 编译错误：

```
TS2322: Type 'Ref<{ id: string; group: string; getDom: () => HTMLElement; ... }>' 
is not assignable to type 'Ref<EChartsType | null, EChartsType | null>'.
```

**场景**: 在 `packages/hooks/src/use-echarts.ts` 中使用 `ref` 存储 ECharts 实例时触发类型错误。

---

## 根因分析

**Vue 的 `ref` 会对对象进行深度响应式转换**：

1. `ref()` 内部调用 `reactive()` 对对象进行深层代理
2. ECharts 实例是一个复杂的第三方库对象，包含大量内部属性和方法
3. Vue 的响应式代理会修改对象结构，导致类型不匹配

**类型错误本质**:
- `Ref<DeepReactive<ECharts>>` ≠ `Ref<ECharts>`
- Vue 的深层响应式类型包装与原始类型不兼容

---

## 解决方案

使用 `shallowRef` 替代 `ref`：

```typescript
// ❌ 错误写法
const chartInstance = ref<ECharts.ECharts | null>(null);

// ✅ 正确写法
import { shallowRef } from 'vue';
import type { ShallowRef } from 'vue';

const chartInstance = shallowRef<ECharts.ECharts | null>(null);
```

**`shallowRef` 的特点**:
- 只对 `.value` 赋值本身进行响应式追踪
- **不会**对内部对象进行深度响应式转换
- 保持原始对象结构不变

---

## 最佳实践

### 何时使用 shallowRef

| 场景 | 推荐 API |
|------|----------|
| 存储第三方库实例（ECharts、Map、Three.js 等） | `shallowRef` |
| 存储大型不可变数据结构 | `shallowRef` |
| 存储 DOM 元素引用 | `shallowRef` 或 `ref` 均可 |
| 存储简单类型（string、number、boolean） | `ref` |
| 存储需要深度响应的对象 | `ref` |

### 完整示例

```typescript
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import type { Ref, ShallowRef } from 'vue';
import * as ECharts from 'echarts';

export interface UseEChartsReturn {
  domRef: Ref<HTMLElement | null>;
  chartInstance: ShallowRef<ECharts.ECharts | null>;
  updateOptions: (options: ECharts.EChartsOption) => void;
  resize: () => void;
  dispose: () => void;
}

export function useECharts(getOptions: () => ECharts.EChartsOption): UseEChartsReturn {
  // DOM 元素可以用 ref，因为不需要深度响应
  const domRef = ref<HTMLElement | null>(null);
  
  // ECharts 实例必须用 shallowRef，避免深度响应式转换
  const chartInstance = shallowRef<ECharts.ECharts | null>(null);

  const initChart = () => {
    if (!domRef.value) return;
    const instance = ECharts.init(domRef.value);
    instance.setOption(getOptions());
    chartInstance.value = instance;
  };

  // ... 其他方法

  return { domRef, chartInstance, updateOptions, resize, dispose };
}
```

---

## 相关陷阱

### 类似问题的其他场景

1. **存储 WebSocket 实例**: 使用 `shallowRef`
2. **存储 IntersectionObserver**: 使用 `shallowRef`
3. **存储自定义类实例**: 使用 `shallowRef`
4. **存储 Immutable.js 数据**: 使用 `shallowRef`

### 性能考量

即使类型兼容，对大型对象使用 `ref` 也会有性能问题：
- Vue 需要递归遍历对象添加代理
- 每次访问属性都经过代理层
- ECharts 等库内部频繁访问属性，代理开销累积

---

## 参考资料

- [Vue 官方文档 - shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Vue 官方文档 - 响应式系统深入](https://vuejs.org/guide/extras/rendering-mechanism.html)

---

**知识点**: Vue 响应式系统、第三方库集成、TypeScript 类型兼容