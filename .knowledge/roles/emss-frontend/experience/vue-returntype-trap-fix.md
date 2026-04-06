---
description: "Vue ReturnType 类型陷阱修复：使用 ReturnType<typeof computed/ref> 导致类型错误"
triggers:
  - "ReturnType"
  - "ComputedRef"
  - "Ref"
  - "TypeScript 类型错误"
  - "WritableComputedRefSymbol"
date: "2026-04-06"
file: "src/hooks/business/use-sse-connection.ts"
---

# Vue ReturnType 类型陷阱修复

## 问题现象

TypeScript 报错：
```
TS2741: Property '[WritableComputedRefSymbol]' is missing in type 'ComputedRef<T>' 
but required in type 'WritableComputedRef<T, T>'.
```

## 问题代码

```typescript
interface UseSSEConnectionReturn {
  // ❌ 错误写法：使用 ReturnType
  connectionStatus: ReturnType<typeof computed<SSEConnectionStatus>>;
  isConnected: ReturnType<typeof computed<boolean>>;
  reconnectAttempts: ReturnType<typeof ref<number>>;
  lastError: ReturnType<typeof ref<string | null>>;
}
```

## 根因分析

`ReturnType<typeof computed<T>>` 返回的是简化的类型推断结果，而非 Vue 实际导出的完整类型。

Vue 内部使用 Symbol 作为品牌标记（branding）来区分 `ComputedRef` 和 `WritableComputedRef`：
- `ComputedRef` 内部包含 `[ComputedRefSymbol]`
- `WritableComputedRef` 内部包含 `[WritableComputedRefSymbol]`

ReturnType 无法捕获这些内部 Symbol，导致类型检查失败。

## 解决方案

直接使用 Vue 导出的类型：

```typescript
import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

interface UseSSEConnectionReturn {
  // ✅ 正确写法：直接使用 Vue 导出的类型
  connectionStatus: ComputedRef<SSEConnectionStatus>;
  isConnected: ComputedRef<boolean>;
  reconnectAttempts: Ref<number>;
  lastError: Ref<string | null>;
}
```

## 适用范围

| Vue API | 正确类型 | 错误写法 |
|---------|---------|---------|
| `computed(() => value)` | `ComputedRef<T>` | `ReturnType<typeof computed<T>>` |
| `ref(value)` | `Ref<T>` | `ReturnType<typeof ref<T>>` |
| `shallowRef(value)` | `ShallowRef<T>` | `ReturnType<typeof shallowRef<T>>` |
| `reactive(obj)` | 定义接口类型 | `ReturnType<typeof reactive>` |

## 关键要点

1. **永远不要用 ReturnType 获取 Vue 响应式 API 的类型**
2. **使用 Vue 从 'vue' 导出的类型定义：ComputedRef, Ref, ShallowRef**
3. **computed 返回 ComputedRef（只读），ref 返回 Ref（可写）**

## 相关文件

- Vue 类型定义：`vue/dist/vue.d.ts`
- 本次修复：`src/hooks/business/use-sse-connection.ts`

---

**最后更新**: 2026-04-06