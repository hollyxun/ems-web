---
description: "EMSS Web 项目代码风格规范：代码格式、注释规范、TypeScript 规范、组件规范"
triggers:
  - "代码风格"
  - "code style"
  - "格式"
  - "注释"
  - "TypeScript"
  - "组件规范"
---

# 代码风格规范

## 总体原则

1. **使用 ESLint + Prettier**：统一代码格式
2. **保持一致性**：与项目现有代码风格保持一致
3. **清晰可读**：代码是自解释的，注释解释"为什么"
4. **类型安全**：充分利用 TypeScript 类型系统

---

## Vue 组件规范

### 文件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// ✅ 正确 - 使用 script setup + TypeScript
import { ref, computed } from 'vue'

// 类型定义
interface Props {
  title: string
}

// Props 定义
const props = defineProps<Props>()

// Emits 定义
const emit = defineEmits<{
  submit: [data: FormData]
}>()

// 响应式状态
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}
</script>

<style scoped>
/* 样式内容 */
</style>
```

### 组件顺序

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 1. imports
// 2. types/interfaces
// 3. props
// 4. emits
// 5. reactive state
// 6. computed
// 7. watch
// 8. lifecycle hooks
// 9. methods
// 10. expose (if needed)
</script>

<style scoped>
/* 样式 */
</style>
```

### Props 定义

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

// ❌ 不推荐 - 使用对象语法
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
})
```

### Emits 定义

```typescript
// ✅ 推荐 - 使用类型化语法
const emit = defineEmits<{
  submit: [data: FormData]
  update: [value: string]
  refresh: []
}>()

// 使用
emit('submit', formData)
emit('update', newValue)
emit('refresh')

// ❌ 不推荐 - 使用数组语法
const emit = defineEmits(['submit', 'update'])
```

---

## TypeScript 规范

### 类型定义

```typescript
// ✅ 优先使用接口定义对象类型
interface UserInfo {
  id: number
  name: string
  email: string
}

// ✅ 使用类型别名定义联合类型
type UserRole = 'admin' | 'user' | 'guest'
type StatusCode = 200 | 404 | 500

// ✅ 使用泛型定义通用类型
interface PageResult<T> {
  list: T[]
  total: number
}
```

### 类型推断

```typescript
// ✅ 简单类型可以推断，不需要显式声明
const count = ref(0)              // 自动推断为 Ref<number>
const name = ref('')              // 自动推断为 Ref<string>
const user = reactive({           // 自动推断类型
  name: '',
  age: 0
})

// ✅ 复杂类型需要显式声明
const userList = ref<User[]>([])  // 需要显式声明
const form = reactive<FormData>({ // 需要显式声明
  name: '',
  items: []
})
```

### 非空断言使用

```typescript
// ✅ 当确定值存在时使用非空断言
const userName = userInfo.value!.name

// ✅ 使用可选链更安全
const userName = userInfo.value?.name

// ❌ 避免滥用非空断言
const id = maybeNull!.id  // 危险，如果 maybeNull 为 null 会报错
```

---

## 组合式函数规范

### Hooks 命名与结构

```typescript
// ✅ 使用 use 前缀
export function useTable<T, S>(fetchFn: (params: S) => Promise<PageResult<T>>) {
  // State
  const loading = ref(false)
  const dataList = ref<T[]>([])

  // Computed
  const isEmpty = computed(() => dataList.value.length === 0)

  // Methods
  const fetchData = async (params: S) => {
    loading.value = true
    try {
      const res = await fetchFn(params)
      dataList.value = res.list
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    // ...
  })

  // Return
  return {
    loading,
    dataList,
    isEmpty,
    fetchData
  }
}
```

---

## 注释规范

### 文件头注释

```typescript
/**
 * 用户管理相关 API
 * @module api/system/user
 * @description 提供用户增删改查等接口
 */
```

### 函数/方法注释

```typescript
/**
 * 获取用户列表
 * @param params - 查询参数
 * @param params.page - 页码
 * @param params.pageSize - 每页数量
 * @returns 用户列表分页数据
 * @example
 * const { list, total } = await getUserList({ page: 1, pageSize: 10 })
 */
export const getUserList = async (params: UserSearchParams) => {
  // ...
}
```

### 行内注释

```typescript
// ✅ 解释"为什么"而不是"做什么"
// 由于后端接口限制，需要转换日期格式
const formatDate = (date: string) => {
  return date.replace(/-/g, '/')
}

// ❌ 不要解释显而易见的代码
// 设置 count 为 0
const count = ref(0)  // 多余注释
```

### TODO 注释

```typescript
// TODO: 添加表单验证逻辑
// FIXME: 修复表格高度计算问题
// HACK: 临时处理，后续优化
```

---

## 样式规范

### UnoCSS 优先

```vue
<template>
  <!-- ✅ 优先使用 UnoCSS 原子类 -->
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
    <span class="text-lg font-medium text-gray-800">标题</span>
    <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
      提交
    </button>
  </div>
</template>
```

### Scoped 样式

```vue
<style scoped>
/* ✅ 组件样式使用 scoped */
.custom-component {
  /* 样式内容 */
}

/* ✅ 深度选择器 */
:deep(.el-input__inner) {
  /* 覆盖 Element Plus 样式 */
}
</style>
```

### CSS 变量

```css
/* ✅ 使用 CSS 变量维护主题色 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
}
```

---

## 错误处理

### 请求错误

```typescript
// ✅ 统一错误处理
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList(params)
    dataList.value = res.list
  } catch (error) {
    // 统一错误提示
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}
```

### 可选链与默认值

```typescript
// ✅ 使用可选链和空值合并
const userName = userInfo.value?.name ?? '匿名用户'
const avatar = userInfo.value?.avatar || defaultAvatar

// ❌ 避免嵌套判断
const userName = userInfo.value && userInfo.value.name ? userInfo.value.name : '匿名用户'
```

---

## 性能优化

### 计算属性缓存

```typescript
// ✅ 复杂计算使用 computed 缓存
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 1)
})

// ❌ 避免在模板中复杂计算
<div v-for="item in list.filter(i => i.status === 1)" :key="item.id">
```

### 虚拟列表

```typescript
// ✅ 大数据量使用虚拟列表
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  bigList,
  { itemHeight: 50 }
)
```

### 防抖节流

```typescript
// ✅ 使用 vue-use 的防抖节流
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn((keyword: string) => {
  search(keyword)
}, 300)

const throttledScroll = useThrottleFn(() => {
  handleScroll()
}, 100)
```

---

## 检查清单

编写代码时检查：

- [ ] 使用 ESLint + Prettier 格式化代码
- [ ] Vue 组件使用 `<script setup lang="ts">`
- [ ] Props 使用 TypeScript 接口定义
- [ ] Emits 使用类型化语法
- [ ] 复杂类型显式声明
- [ ] 注释解释"为什么"而不是"做什么"
- [ ] 样式优先使用 UnoCSS
- [ ] 请求错误统一处理
- [ ] 复杂计算使用 computed

---

**最后更新**: 2026-03-18
