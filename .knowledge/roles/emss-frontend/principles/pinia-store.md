---
description: "Pinia Store 设计规范：Setup Store 模式、状态管理、模块组织"
triggers:
  - "Pinia"
  - "Store"
  - "状态管理"
  - "Setup Store"
  - "defineStore"
---

# Pinia Store 设计规范

## 核心原则

**全局状态必须使用 Pinia，优先使用 Setup Store 模式。**

---

## Setup Store vs Options Store

### ✅ Setup Store（推荐）

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])

  // ========== Getters ==========
  const isLogin = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name ?? '')
  const hasPermission = (code: string) => {
    return permissions.value.includes(code)
  }

  // ========== Actions ==========
  const setToken = (val: string) => {
    token.value = val
  }

  const login = async (loginForm: LoginForm) => {
    const res = await loginApi(loginForm)
    if (res.code === 0) {
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      return true
    }
    return false
  }

  const logout = async () => {
    await logoutApi()
    token.value = ''
    userInfo.value = null
    permissions.value = []
  }

  // ========== Return ==========
  return {
    token,
    userInfo,
    permissions,
    isLogin,
    userName,
    hasPermission,
    setToken,
    login,
    logout
  }
})
```

### ❌ Options Store（不推荐）

```typescript
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null as UserInfo | null
  }),
  getters: {
    isLogin: (state) => !!state.token
  },
  actions: {
    setToken(val: string) {
      this.token = val
    }
  }
})
```

---

## Store 模块组织

### 目录结构

```
store/
├── modules/
│   ├── auth/
│   │   └── index.ts      # 认证相关
│   ├── user/
│   │   └── index.ts      # 用户信息
│   ├── route/
│   │   └── index.ts      # 路由状态
│   └── tab/
│       └── index.ts      # 标签页状态
├── plugins/
│   └── persist.ts        # 持久化插件
└── index.ts              # Store 入口
```

### Store 文件结构

```typescript
// store/modules/user/index.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 类型定义（可提取到单独的 types.ts）
interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
}

// Store 定义
export const useUserStore = defineStore('user', () => {
  // ... state, getters, actions

  return { /* ... */ }
})

// 导出类型
export type { UserInfo }
```

---

## State 设计

### 基本原则

```typescript
// ✅ 使用 ref 定义状态
const token = ref('')
const userInfo = ref<UserInfo | null>(null)
const menuList = ref<MenuItem[]>([])

// ✅ 复杂状态使用 reactive
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// ❌ 避免嵌套 ref
const state = ref({
  token: '',
  userInfo: null
})
// 访问麻烦：state.value.token
```

### 状态初始化

```typescript
// ✅ 提供合理的初始值
const loading = ref(false)
const list = ref<User[]>([])
const currentUser = ref<UserInfo | null>(null)

// ✅ 使用工厂函数初始化复杂状态
const createDefaultForm = (): FormData => ({
  name: '',
  email: '',
  status: 1,
  items: []
})
const form = ref<FormData>(createDefaultForm())
const resetForm = () => {
  form.value = createDefaultForm()
}
```

---

## Getters 设计

### 计算属性

```typescript
// ✅ 派生状态使用 computed
const isLogin = computed(() => !!token.value)
const isAdmin = computed(() => userInfo.value?.role === 'admin')

// ✅ 带参数的 getter 使用函数
const hasPermission = (code: string) => {
  return computed(() => permissions.value.includes(code))
}

// 使用
const canEdit = hasPermission('user:edit')
console.log(canEdit.value)

// ✅ 或者直接在 return 中返回函数
const hasPermission = (code: string) => {
  return permissions.value.includes(code)
}

// 使用
console.log(userStore.hasPermission('user:edit'))
```

---

## Actions 设计

### 异步操作

```typescript
// ✅ Action 处理异步逻辑
const fetchUserList = async (params: UserSearchParams) => {
  loading.value = true
  try {
    const res = await getUserList(params)
    if (res.code === 0) {
      list.value = res.data.list
      pagination.total = res.data.total
      return res.data
    }
    return null
  } catch (error) {
    console.error('Fetch user list failed:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// ✅ 组合多个 Action
const initUserData = async () => {
  await Promise.all([
    fetchUserInfo(),
    fetchPermissions(),
    fetchMenuList()
  ])
}
```

### 状态修改

```typescript
// ✅ 直接修改 ref 值
const updateUserInfo = (data: Partial<UserInfo>) => {
  if (userInfo.value) {
    Object.assign(userInfo.value, data)
  }
}

// ✅ 批量修改
const setUserData = (data: { info: UserInfo; permissions: string[] }) => {
  userInfo.value = data.info
  permissions.value = data.permissions
}

// ✅ 重置状态
const $reset = () => {
  token.value = ''
  userInfo.value = null
  permissions.value = []
}
```

---

## Store 使用

### 在组件中使用

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'

// ✅ 获取 store 实例
const userStore = useUserStore()

// ✅ 解构响应式数据使用 storeToRefs
const { token, userInfo, isLogin } = storeToRefs(userStore)

// ✅ 方法可以直接解构
const { login, logout } = userStore

// 使用
console.log(token.value)
console.log(isLogin.value)
login({ username: '', password: '' })
</script>
```

### 在组合式函数中使用

```typescript
// hooks/business/useAuth.ts
import { useUserStore } from '@/store'

export function useAuth() {
  const userStore = useUserStore()

  const checkLogin = () => {
    if (!userStore.isLogin) {
      throw new Error('未登录')
    }
  }

  return {
    checkLogin
  }
}
```

---

## Store 间通信

### 避免循环依赖

```typescript
// ✅ Store A 调用 Store B 的 Action
// store/modules/route.ts
import { useUserStore } from './user'

export const useRouteStore = defineStore('route', () => {
  const initRoutes = async () => {
    const userStore = useUserStore()
    const permissions = userStore.permissions
    // ... 根据权限生成路由
  }

  return { initRoutes }
})
```

---

## 持久化存储

### 选择性持久化

```typescript
// store/plugins/persist.ts
import type { PiniaPluginContext } from 'pinia'

export function persistPlugin({ store }: PiniaPluginContext) {
  // 只持久化特定字段
  const persistKeys = ['token', 'userInfo']

  const stored = localStorage.getItem(store.$id)
  if (stored) {
    store.$patch(JSON.parse(stored))
  }

  store.$subscribe((_mutation, state) => {
    const toPersist = persistKeys.reduce((acc, key) => {
      acc[key] = state[key]
      return acc
    }, {} as Record<string, any>)
    localStorage.setItem(store.$id, JSON.stringify(toPersist))
  })
}
```

---

## 检查清单

设计 Store 时检查：

- [ ] 使用 Setup Store 模式
- [ ] State 使用 ref/reactive 定义
- [ ] Getters 使用 computed
- [ ] Actions 处理异步逻辑
- [ ] 组件中使用 storeToRefs 解构响应式数据
- [ ] 提供 $reset 方法重置状态
- [ ] 避免 Store 间循环依赖

---

**最后更新**: 2026-03-18
