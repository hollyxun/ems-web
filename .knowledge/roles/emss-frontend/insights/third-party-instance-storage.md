---
description: "第三方库实例存储规范：使用 shallowRef 避免深度响应式转换"
triggers:
  - "ECharts"
  - "第三方库"
  - "实例存储"
  - "shallowRef"
  - "ref"
  - "WebSocket"
  - "Map"
---

# 第三方库实例存储规范

## 核心原则

**存储第三方库实例时，必须使用 `shallowRef`，禁止使用 `ref`。**

---

## 问题背景

Vue 的 `ref` 会对对象进行深度响应式转换（Deep Reactive）。对于第三方库实例：

1. Vue 递归遍历对象添加 Proxy 代理
2. 原始对象结构被修改，导致类型不匹配
3. 库内部频繁访问属性，代理开销累积

---

## 何时使用 shallowRef

| 场景 | 推荐 API | 原因 |
|------|----------|------|
| ECharts 实例 | `shallowRef` | 复杂对象，类型不兼容 |
| Map/Set 实例 | `shallowRef` | 内置对象，代理破坏原型 |
| WebSocket 实例 | `shallowRef` | 事件绑定，代理干扰 |
| IntersectionObserver | `shallowRef` | 浏览器 API |
| Three.js 场景 | `shallowRef` | 大型对象，性能问题 |
| 自定义类实例 | `shallowRef` | 可能包含不可代理属性 |
| DOM 元素引用 | `shallowRef` / `ref` | 元素不需要深度响应 |
| 简单类型值 | `ref` | 不需要浅层 |
| 需要深度响应的对象 | `ref` | 业务需要 |

---

## 正确示例

```typescript
import { ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import * as ECharts from 'echarts'

export function useECharts() {
  // DOM 元素可以用 ref
  const domRef: Ref<HTMLElement | null> = ref(null)
  
  // ✅ ECharts 实例必须用 shallowRef
  const chartInstance: ShallowRef<ECharts.ECharts | null> = shallowRef(null)

  const initChart = () => {
    if (!domRef.value) return
    
    // 创建实例
    const instance = ECharts.init(domRef.value)
    
    // 直接赋值，不触发深度转换
    chartInstance.value = instance
  }

  return { domRef, chartInstance, initChart }
}
```

---

## 错误示例

```typescript
// ❌ 错误 - 使用 ref 存储 ECharts 实例
const chartInstance = ref<ECharts.ECharts | null>(null)

// TypeScript 报错：
// Type 'Ref<DeepReactive<ECharts>>' is not assignable to 
// type 'Ref<ECharts | null>'
```

---

## 其他场景示例

### WebSocket

```typescript
import { shallowRef, onUnmounted } from 'vue'

const ws = shallowRef<WebSocket | null>(null)

const connect = (url: string) => {
  ws.value = new WebSocket(url)
  ws.value.onopen = () => console.log('connected')
}

onUnmounted(() => {
  ws.value?.close()
})
```

### IntersectionObserver

```typescript
import { ref, shallowRef, onUnmounted } from 'vue'

const targetRef = ref<HTMLElement | null>(null)
const observer = shallowRef<IntersectionObserver | null>(null)

const observe = () => {
  if (!targetRef.value) return
  
  observer.value = new IntersectionObserver((entries) => {
    // 处理回调
  })
  
  observer.value.observe(targetRef.value)
}

onUnmounted(() => {
  observer.value?.disconnect()
})
```

### Map/Set

```typescript
import { shallowRef } from 'vue'

// ✅ 使用 shallowRef 存储 Map
const dataMap = shallowRef(new Map<string, any>())

// 更新时重新赋值触发响应
const setItem = (key: string, value: any) => {
  const newMap = new Map(dataMap.value)
  newMap.set(key, value)
  dataMap.value = newMap
}
```

---

## 性能考量

即使类型兼容，对大型对象使用 `ref` 也有问题：

```
原始对象 → Vue 递归遍历 → 添加 Proxy 代理 → 内存占用增加
    ↓
每次属性访问 → 经过代理层 → 性能开销累积
    ↓
ECharts 内部频繁访问 → 代理开销显著
```

使用 `shallowRef`：
- 只追踪 `.value` 赋值
- 内部对象保持原始状态
- 零额外开销

---

## 检查清单

存储第三方库实例时检查：

- [ ] 是否使用了 `shallowRef` 而非 `ref`
- [ ] 类型定义是否使用 `ShallowRef<T>`
- [ ] 更新实例时是否直接赋值 `.value`
- [ ] 组件卸载时是否正确清理实例

---

## 参考资料

- [Vue 官方文档 - shallowRef](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Vue 官方文档 - 响应式系统深入](https://vuejs.org/guide/extras/rendering-mechanism.html)

---

**最后更新**: 2026-04-06