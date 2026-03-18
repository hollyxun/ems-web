---
description: "响应式数据解构陷阱：避免解构 ref 和 reactive 导致响应性丢失"
triggers:
  - "响应式"
  - "解构"
  - "ref"
  - "reactive"
  - "toRefs"
  - "storeToRefs"
---

# 响应式数据解构陷阱

## 问题背景

Vue 3 的响应式系统基于 Proxy。当我们解构 `ref` 或 `reactive` 对象时，会丢失响应性连接。

---

## 常见陷阱

### 陷阱 1: 解构 reactive 对象

```typescript
// ❌ 错误 - 解构会失去响应性
const state = reactive({
  count: 0,
  name: 'Tom'
})

const { count, name } = state  // count 和 name 是普通值，不是响应式的

count++  // 不会触发更新！
```

### 陷阱 2: 解构 ref 的 value

```typescript
// ❌ 错误 - 解构 value 也会失去响应性
const user = ref({
  name: 'Tom',
  age: 25
})

const { name, age } = user.value  // 普通值，非响应式

name = 'Jerry'  // 不会触发更新！
```

### 陷阱 3: 函数参数解构

```typescript
// ❌ 错误 - 函数参数解构
function useUser(store: ReturnType<typeof useUserStore>) {
  const { token, userInfo } = store  // 失去响应性！
  return { token, userInfo }
}
```

---

## 解决方案

### 方案 1: 使用 toRefs

```typescript
import { toRefs } from 'vue'

// ✅ 正确 - 使用 toRefs 保持响应性
const state = reactive({
  count: 0,
  name: 'Tom'
})

const { count, name } = toRefs(state)
// count 和 name 是 Ref 对象

count.value++  // 会触发更新！
```

### 方案 2: 使用 storeToRefs (Pinia)

```typescript
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'

// ✅ 正确 - Pinia Store 使用 storeToRefs
const userStore = useUserStore()

// 使用 storeToRefs 解构响应式数据
const { token, userInfo } = storeToRefs(userStore)

// 方法可以直接解构
const { login, logout } = userStore

// 使用
console.log(token.value)  // Ref 对象
login(credentials)        // 直接调用
```

### 方案 3: 保持对象引用

```typescript
// ✅ 正确 - 直接使用属性访问
const state = reactive({
  count: 0,
  name: 'Tom'
})

// 直接使用
console.log(state.count)
state.count++

// ✅ 正确 - ref 直接访问
const user = ref({ name: 'Tom', age: 25 })
console.log(user.value.name)
user.value.name = 'Jerry'
```

### 方案 4: 计算属性转换

```typescript
// ✅ 正确 - 使用计算属性提取
const user = ref({
  firstName: 'Tom',
  lastName: 'Jerry'
})

// 使用计算属性保持响应性
const fullName = computed(() => {
  return `${user.value.firstName} ${user.value.lastName}`
})
```

---

## 最佳实践

### Pinia Store 使用规范

```typescript
// ✅ 推荐模式
const userStore = useUserStore()

// 响应式数据使用 storeToRefs
const { token, userInfo, permissions } = storeToRefs(userStore)

// 方法直接解构
const { login, logout, updateUserInfo } = userStore

// 在模板中使用
// {{ userInfo.name }} - 自动解包
// {{ token }} - 自动解包
```

### 组合式函数返回规范

```typescript
// ✅ 返回 toRefs 后的对象
export function useCounter() {
  const state = reactive({
    count: 0,
    double: computed(() => state.count * 2)
  })

  const increment = () => state.count++

  return {
    ...toRefs(state),  // 解构后仍保持响应性
    increment
  }
}

// 使用
const { count, double, increment } = useCounter()
count.value++  // 响应式
```

---

## 检查清单

使用响应式数据时检查：

- [ ] 解构 `reactive` 对象时使用 `toRefs`
- [ ] 解构 Pinia Store 时使用 `storeToRefs`
- [ ] 检查解构后的值是否为 Ref 对象
- [ ] 避免在函数参数中解构响应式对象

---

**最后更新**: 2026-03-18
