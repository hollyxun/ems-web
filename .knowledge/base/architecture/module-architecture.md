---
description: "模块架构详细设计：组件通信、数据流向、模块边界"
triggers:
  - "模块架构"
  - "组件通信"
  - "数据流向"
  - "模块边界"
  - "组件组织"
---

# 模块架构详细设计

## 架构分层总览

```
┌─────────────────────────────────────────┐
│  Layer 1: 页面层 (Views)                 │  ← 业务页面，组织组件
│  文件: views/[module]/[page]/index.vue   │
├─────────────────────────────────────────┤
│  Layer 2: 组件层 (Components)            │  ← 可复用 UI 组件
│  文件: components/[type]/[name].vue      │
├─────────────────────────────────────────┤
│  Layer 3: 逻辑层 (Hooks/Store)           │  ← 业务逻辑、状态管理
│  文件: hooks/[name].ts, store/[name]     │
├─────────────────────────────────────────┤
│  Layer 4: 服务层 (API/Service)           │  ← 接口封装、请求处理
│  文件: api/[module].ts                   │
└─────────────────────────────────────────┘
```

---

## 各层详细职责

### Layer 1: 页面层 (Views)

**核心职责**: 业务页面实现，组织和协调组件、Hooks、Store

**应该做**:
- ✅ 组合组件实现业务功能
- ✅ 调用 Hooks 提取可复用逻辑
- ✅ 使用 Store 管理页面状态
- ✅ 调用 API 获取数据

**禁止做**:
- ❌ 直接写可复用的 UI 逻辑
- ❌ 跨页面直接调用其他页面的逻辑
- ❌ 直接操作 HTTP 请求（应通过 API 层）

**代码示例**:
```vue
<script setup lang="ts">
// 页面层组合各层能力
import { useTable } from './hooks/useTable'
import { useUserStore } from '@/store'
import UserForm from './components/UserForm.vue'

// 使用组合式函数
const { loading, list, fetchData } = useTable()

// 使用 Store
const userStore = useUserStore()
</script>
```

---

### Layer 2: 组件层 (Components)

**核心职责**: 提供可复用的 UI 组件

**组件分类**:
| 类型 | 位置 | 职责 | 示例 |
|------|------|------|------|
| common | `components/common/` | 纯展示、无业务逻辑 | DataTable, SvgIcon |
| custom | `components/custom/` | 业务相关、可复用 | UserCard, StatusTag |
| advanced | `components/advanced/` | 复杂组件、组合多个组件 | SearchForm, DataList |

**应该做**:
- ✅ Props/Emits 类型化定义
- ✅ 职责单一、功能明确
- ✅ 样式隔离（scoped）
- ✅ 支持插槽扩展

**禁止做**:
- ❌ 直接调用 API
- ❌ 直接访问 Store
- ❌ 包含复杂业务逻辑

---

### Layer 3: 逻辑层 (Hooks/Store)

**核心职责**: 封装可复用的业务逻辑和全局状态

#### Hooks

**使用场景**: 页面级别的可复用逻辑

```typescript
// hooks/business/useTable.ts
export function useTable<T, S>(fetchFn: (params: S) => Promise<PageResult<T>>) {
  const loading = ref(false)
  const list = ref<T[]>([])
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  const fetchData = async (params: S) => {
    loading.value = true
    try {
      const res = await fetchFn({ ...params, ...pagination })
      list.value = res.list
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  return { loading, list, pagination, fetchData }
}
```

#### Store

**使用场景**: 全局状态、跨页面共享数据

```typescript
// store/modules/auth/index.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)

  const login = async (form: LoginForm) => {
    const res = await loginApi(form)
    token.value = res.token
    userInfo.value = res.userInfo
  }

  return { token, userInfo, login }
})
```

---

### Layer 4: 服务层 (API)

**核心职责**: 封装后端接口调用

```typescript
// api/system/user.ts
export function getUserList(params: UserSearchParams) {
  return request.post<PageResult<UserInfo>>('/user/getUserList', params)
}
```

---

## 数据流向

### 单向数据流

```
页面组件 (View)
    ↓ (通过 Props)
子组件 (Component)
    ↓ (通过 Events)
页面组件 (View)
    ↓ (调用 Actions)
Store / Hooks
    ↓ (调用 API)
API Service
    ↓ (HTTP 请求)
后端服务
```

### 跨组件通信

```typescript
// 方案 1: Props + Events (父子组件)
// 父组件
<Child :data="list" @submit="handleSubmit" />

// 方案 2: Provide / Inject (跨层级)
// 祖先组件
provide('user', readonly(user))

// 后代组件
const user = inject('user')

// 方案 3: Store (任意组件)
const userStore = useUserStore()
```

---

## 依赖规则

### 允许的方向

```
View → Component → (无下层依赖)
  ↓
Hook / Store
  ↓
API Service → 后端
```

### 禁止的方向

| 禁止行为 | 后果 | 正确做法 |
|---------|------|---------|
| Component → Store | 组件耦合业务逻辑 | 通过 Events 通知父组件 |
| Component → API | 组件耦合数据获取 | 通过 Events 通知父组件 |
| API → Store | 循环依赖 | Store 调用 API |
| Hook → View | 循环依赖 | Hook 提供通用逻辑 |

---

## 模块组织示例

### 用户管理模块

```
views/system/user/
├── index.vue              # 页面入口
├── components/            # 页面专属组件
│   ├── UserFormDialog.vue
│   └── UserDetailDrawer.vue
├── hooks/                 # 页面专属 Hooks
│   └── useUserTable.ts
└── types.ts               # 页面类型定义
```

### API 模块

```
api/system/
├── user.ts                # 用户相关 API
├── role.ts                # 角色相关 API
└── menu.ts                # 菜单相关 API
```

---

## 检查清单

开发模块时检查：

- [ ] 组件职责单一，不包含业务逻辑
- [ ] Hooks 提取可复用逻辑
- [ ] Store 管理全局状态
- [ ] API 层统一封装接口
- [ ] 数据流向清晰，单向流动
- [ ] 没有跨层直接调用

---

**最后更新**: 2026-03-18
