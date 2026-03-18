---
description: "组件开发规范：Props 设计、事件定义、插槽使用、样式封装"
triggers:
  - "组件开发"
  - "新建组件"
  - "组件封装"
  - "Props 设计"
---

# 组件开发规范

## 核心原则

**每一个可复用的 UI 元素都必须封装为组件，遵循单一职责原则，功能明确。**

---

## 组件目录结构

```
components/
├── common/            # 通用组件
│   ├── data-table/
│   │   ├── index.vue
│   │   └── types.ts
│   └── svg-icon/
│       └── index.vue
├── custom/            # 业务组件
│   └── ...
└── advanced/          # 高级组件
    └── search-form/
        ├── index.vue
        └── types.ts
```

---

## 组件文件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
/**
 * 组件功能描述
 * @component ComponentName
 * @description 详细描述组件的功能和使用场景
 * @example
 * <ComponentName :data="list" @submit="handleSubmit" />
 */

// ========== Imports ==========
import { computed } from 'vue'
import type { TableColumn } from './types'

// ========== Types ==========
interface Props {
  /** 表格数据 */
  data: any[]
  /** 列配置 */
  columns: TableColumn[]
  /** 加载状态 */
  loading?: boolean
}

// ========== Props & Emits ==========
const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  /** 刷新事件 */
  refresh: []
  /** 编辑事件 */
  edit: [row: any]
  /** 删除事件 */
  delete: [row: any]
}>()

// ========== Computed ==========
const hasData = computed(() => props.data.length > 0)

// ========== Methods ==========
const handleEdit = (row: any) => {
  emit('edit', row)
}
</script>

<style scoped>
/* 样式内容 */
</style>
```

---

## Props 设计

### 基本原则

```typescript
// ✅ Props 应该是只读的
const props = defineProps<{
  title: string
}>()

// ❌ 不要直接修改 props
props.title = 'new title'  // 错误！

// ✅ 使用 emit 通知父组件修改
emit('update:title', 'new title')
```

### 默认值

```typescript
// ✅ 使用 withDefaults 提供默认值
interface Props {
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
  maxCount: 10
})
```

### Props 验证

```typescript
// ✅ 复杂类型使用自定义验证
interface Props {
  status: number
}

const props = defineProps<{
  status: number
}>()

// 在组件内部验证
const validStatus = [1, 2, 3]
if (!validStatus.includes(props.status)) {
  console.warn(`Invalid status: ${props.status}`)
}
```

---

## 事件定义

### 类型化 Emits

```typescript
// ✅ 使用类型化语法定义事件
const emit = defineEmits<{
  /** 提交事件，携带表单数据 */
  submit: [data: FormData]
  /** 取消事件 */
  cancel: []
  /** 更新事件，用于 v-model */
  'update:modelValue': [value: string]
}>()

// 触发事件
emit('submit', formData)
emit('cancel')
emit('update:modelValue', newValue)
```

### v-model 支持

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:title': [value: string]
}>()

// 多个 v-model 支持
const updateValue = (val: string) => {
  emit('update:modelValue', val)
}

const updateTitle = (val: string) => {
  emit('update:title', val)
}
</script>

<template>
  <!-- 使用 -->
  <CustomInput v-model="value" v-model:title="title" />
</template>
```

---

## 插槽使用

### 默认插槽

```vue
<script setup lang="ts">
/**
 * 卡片组件
 */
</script>

<template>
  <div class="card">
    <div class="card-header">
      <slot name="header">
        <!-- 默认内容 -->
        默认标题
      </slot>
    </div>
    <div class="card-body">
      <slot>
        <!-- 默认插槽 -->
        默认内容
      </slot>
    </div>
    <div class="card-footer">
      <slot name="footer" :data="footerData">
        <!-- 作用域插槽 -->
        默认底部
      </slot>
    </div>
  </div>
</template>
```

### 使用插槽

```vue
<template>
  <Card>
    <!-- 默认插槽 -->
    <p>这是卡片内容</p>

    <!-- 具名插槽 -->
    <template #header>
      <h3>自定义标题</h3>
    </template>

    <!-- 作用域插槽 -->
    <template #footer="{ data }">
      <span>{{ data }}</span>
    </template>
  </Card>
</template>
```

---

## 样式封装

### Scoped 样式

```vue
<style scoped>
/* ✅ 使用 scoped 限制样式作用域 */
.card {
  @apply p-4 bg-white rounded-lg shadow;
}

.card-header {
  @apply text-lg font-medium mb-2;
}
</style>
```

### CSS Modules（可选）

```vue
<style module>
.card {
  padding: 16px;
}
</style>
```

### 深度选择器

```vue
<style scoped>
/* ✅ 覆盖子组件样式 */
:deep(.el-input__inner) {
  @apply rounded-full;
}

/* ✅ 插槽内容样式 */
:slotted(.custom-class) {
  @apply text-blue-500;
}

/* ✅ 全局样式 */
:global(.global-class) {
  @apply text-red-500;
}
</style>
```

---

## 组件通信

### Props 向下传递

```vue
<!-- 父组件 -->
<template>
  <Child :user="user" :config="config" />
</template>

<!-- 子组件 -->
<script setup lang="ts">
interface Props {
  user: UserInfo
  config: Config
}
defineProps<Props>()
</script>
```

### 事件向上传递

```vue
<!-- 子组件 -->
<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: FormData]
}>()

const handleSubmit = () => {
  emit('submit', formData)
}
</script>

<!-- 父组件 -->
<template>
  <Child @submit="handleSubmit" />
</template>
```

### Provide/Inject（跨层级）

```vue
<!-- 祖先组件 -->
<script setup lang="ts">
import { provide, readonly } from 'vue'

const user = ref<UserInfo>({ id: 1, name: 'Tom' })
provide('user', readonly(user))  // 只读，防止后代修改
</script>

<!-- 后代组件 -->
<script setup lang="ts">
import { inject } from 'vue'

const user = inject('user') as Ref<UserInfo>
console.log(user.value.name)
</script>
```

---

## 组件示例

### DataTable 组件

```vue
<script setup lang="ts">
/**
 * 数据表格组件
 * @component DataTable
 * @description 封装 Element Plus 表格，提供统一的数据展示和操作功能
 * @example
 * <DataTable
 *   :data="list"
 *   :columns="columns"
 *   :loading="loading"
 *   @edit="handleEdit"
 *   @delete="handleDelete"
 * />
 */

import type { TableColumn } from './types'

interface Props {
  /** 表格数据 */
  data: any[]
  /** 列配置 */
  columns: TableColumn[]
  /** 加载状态 */
  loading?: boolean
  /** 是否显示操作列 */
  showAction?: boolean
  /** 操作列宽度 */
  actionWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showAction: true,
  actionWidth: 150
})

const emit = defineEmits<{
  refresh: []
  edit: [row: any]
  delete: [row: any]
}>()

const handleEdit = (row: any) => emit('edit', row)
const handleDelete = (row: any) => emit('delete', row)
</script>

<template>
  <el-table
    v-loading="loading"
    :data="data"
    stripe
    border
    highlight-current-row
  >
    <el-table-column
      v-for="col in columns"
      :key="col.prop"
      v-bind="col"
    >
      <template v-if="col.slot" #default="{ row }">
        <slot :name="col.prop" :row="row" />
      </template>
    </el-table-column>

    <el-table-column
      v-if="showAction"
      label="操作"
      :width="actionWidth"
      fixed="right"
    >
      <template #default="{ row }">
        <slot name="action" :row="row">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </slot>
      </template>
    </el-table-column>
  </el-table>
</template>
```

---

## 检查清单

开发组件时检查：

- [ ] 组件使用 `script setup lang="ts"`
- [ ] Props 使用 TypeScript 接口定义
- [ ] Emits 使用类型化语法
- [ ] 提供完整的 JSDoc 注释
- [ ] Props 有默认值（可选时）
- [ ] 样式使用 scoped
- [ ] 支持必要的插槽
- [ ] 事件命名规范（refresh/edit/delete）

---

**最后更新**: 2026-03-18
