---
description: "Composition API 最佳实践：script setup 语法、响应式数据、生命周期使用规范"
triggers:
  - "Composition API"
  - "script setup"
  - "响应式数据"
  - "ref"
  - "reactive"
  - "生命周期"
---

# Composition API 最佳实践

## 核心原则

**所有 Vue 组件必须使用 `<script setup lang="ts">` 语法。**

---

## script setup 基础

### 基本结构

```vue
<script setup lang="ts">
// ✅ 自动暴露顶层绑定到模板
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>

<template>
  <div>{{ count }} - {{ double }}</div>
  <button @click="increment">+1</button>
</template>
```

### 组件引入

```vue
<script setup lang="ts">
// ✅ 组件自动注册，无需 components 选项
import UserForm from './components/UserForm.vue'
import DataTable from '@/components/common/DataTable.vue'
</script>

<template>
  <UserForm />
  <DataTable />
</template>
```

---

## 响应式数据

### ref vs reactive

```typescript
// ✅ ref - 推荐用于基本类型和需要替换的对象
const count = ref(0)
const user = ref<UserInfo | null>(null)

// 访问/修改需要 .value
count.value++
user.value = { id: 1, name: 'Tom' }

// ✅ reactive - 适用于复杂的表单对象
const form = reactive({
  name: '',
  email: '',
  items: [] as string[]
})

// 直接修改属性
form.name = 'Tom'
form.items.push('item1')

// ❌ 不能替换整个对象
form = { name: 'Jerry' }  // 错误！
```

### 响应式数据最佳实践

```typescript
// ✅ 简单状态使用 ref
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)

// ✅ 复杂对象使用 reactive + 类型断言
const form = reactive<FormData>({
  name: '',
  status: 1,
  items: []
})

// ✅ 数组使用 ref 便于替换
const list = ref<User[]>([])
list.value = await fetchUsers()  // 可以直接替换

// ✅ 需要解构的响应式数据使用 toRefs
import { toRefs } from 'vue'
const state = reactive({
  name: '',
  age: 0
})
const { name, age } = toRefs(state)  // 保持响应性
```

### 解构响应式数据（陷阱）

```typescript
// ❌ 错误 - 解构会失去响应性
const state = reactive({ count: 0 })
const { count } = state  // count 是普通数字，不是响应式的
count++  // 不会触发更新

// ✅ 正确 - 使用 toRefs
import { toRefs } from 'vue'
const state = reactive({ count: 0 })
const { count } = toRefs(state)  // count 是 Ref<number>
count.value++  // 会触发更新

// ✅ 正确 - 使用 storeToRefs (Pinia Store)
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { token, userInfo } = storeToRefs(userStore)  // 保持响应性
const { login, logout } = userStore  // 方法可以直接解构
```

---

## Props 与 Emits

### Props 类型定义

```typescript
// ✅ 推荐 - 使用接口定义
interface Props {
  title: string
  count?: number
  userInfo?: UserInfo
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  size: 'medium'
})

// 使用 props
cosnole.log(props.title)
```

### Emits 类型定义

```typescript
// ✅ 推荐 - 使用类型化语法
const emit = defineEmits<{
  // 无参数事件
  refresh: []

  // 单参数事件
  update: [value: string]

  // 多参数事件
  submit: [data: FormData, callback: () => void]

  // 可选参数事件
  change: [value?: number]
}>()

// 使用 emit
emit('refresh')
emit('update', newValue)
emit('submit', formData, () => console.log('done'))
```

---

## 计算属性

### 基本使用

```typescript
// ✅ 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// ✅ 可写计算属性
const count = ref(1)
const doubleCount = computed({
  get: () => count.value * 2,
  set: (val) => {
    count.value = val / 2
  }
})

doubleCount.value = 4  // count.value = 2
```

### 计算属性 vs 方法

```typescript
// ✅ 计算属性 - 有缓存，依赖不变不重新计算
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 1)
})

// ❌ 方法 - 每次渲染都执行
const getFilteredList = () => {
  return list.value.filter(item => item.status === 1)
}

// ✅ 方法 - 适合有参数的场景
const getItemById = (id: number) => {
  return list.value.find(item => item.id === id)
}
```

---

## Watch 监听

### 基本使用

```typescript
import { watch, watchEffect } from 'vue'

// ✅ 监听 ref
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// ✅ 监听 reactive 对象的属性
watch(() => form.name, (newVal) => {
  console.log(`name changed: ${newVal}`)
})

// ✅ 监听多个源
watch([count, page], ([newCount, newPage]) => {
  console.log('count or page changed')
})

// ✅ 立即执行 + 深度监听
watch(
  () => form,
  (newVal) => {
    console.log('form changed:', newVal)
  },
  { immediate: true, deep: true }
)
```

### watchEffect

```typescript
// ✅ 自动追踪依赖
watchEffect(() => {
  // 自动追踪 count 和 form.name
  console.log(`count: ${count.value}, name: ${form.name}`)
})

// ✅ 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(count.value)
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })
})
```

---

## 生命周期

### 生命周期钩子

```typescript
import {
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount,
  onErrorCaptured
} from 'vue'

// ✅ 挂载
onMounted(() => {
  fetchData()
})

// ✅ 卸载 - 清理工作
onUnmounted(() => {
  clearInterval(timer)
  eventBus.off('event', handler)
})

// ✅ 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err)
  return false  // 阻止错误向上传播
})
```

### setup 中的生命周期

| Options API | Composition API |
|-------------|-----------------|
| beforeCreate | 不需要，setup 本身执行 |
| created | 不需要，setup 本身执行 |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |
| errorCaptured | onErrorCaptured |

---

## 获取组件实例

### 模板引用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ElInput } from 'element-plus'

// ✅ 元素引用
const inputRef = ref<HTMLInputElement | null>(null)

// ✅ 组件引用
const elInputRef = ref<InstanceType<typeof ElInput> | null>(null)

onMounted(() => {
  inputRef.value?.focus()
  elInputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" />
  <el-input ref="elInputRef" />
</template>
```

---

## 依赖注入

### provide / inject

```typescript
// 父组件
import { provide, readonly } from 'vue'

const user = ref<UserInfo>({ id: 1, name: 'Tom' })

// ✅ 提供响应式数据
provide('user', readonly(user))  // 只读，防止子组件修改

// 子组件
import { inject } from 'vue'

// ✅ 注入
const user = inject('user') as Ref<UserInfo>

// ✅ 提供默认值
const user = inject('user', ref({ id: 0, name: '' }))
```

---

## 检查清单

开发组件时检查：

- [ ] 使用 `<script setup lang="ts">` 语法
- [ ] Props 使用 TypeScript 接口定义
- [ ] Emits 使用类型化语法
- [ ] 简单状态使用 ref，复杂对象使用 reactive
- [ ] 解构响应式数据使用 toRefs 或 storeToRefs
- [ ] 计算属性有缓存需求时使用 computed
- [ ] 清理副作用在 onUnmounted 中

---

**最后更新**: 2026-03-18
