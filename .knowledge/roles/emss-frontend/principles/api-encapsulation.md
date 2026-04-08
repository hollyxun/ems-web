---
description: "API 层封装规范：请求封装、类型定义、错误处理、拦截器配置"
triggers:
  - "API 封装"
  - "请求封装"
  - "Axios"
  - "接口类型"
  - "错误处理"
---

# API 层封装规范

## 核心原则

**所有后端 API 调用必须通过 `src/api/` 目录封装，使用 TypeScript 定义完整的请求/响应类型。**

---

## 目录结构

```
api/
├── system/            # 系统模块 API
│   ├── user.ts
│   ├── menu.ts
│   └── auth.ts
├── monitor/           # 监控模块 API
│   └── ...
└── ...
```

---

## API 文件规范

### 完整示例

```typescript
// api/system/user.ts
import request from '@/service/request'

// ========== 类型定义 ==========

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  nickName: string
  email: string
  phone?: string
  status: number
  roleIds?: number[]
  createTime?: string
}

/**
 * 用户搜索参数
 */
export interface UserSearchParams {
  page?: number
  pageSize?: number
  username?: string
  nickName?: string
  status?: number
}

/**
 * 创建用户请求
 */
export interface CreateUserRequest {
  username: string
  password: string
  nickName: string
  email?: string
  phone?: string
  roleIds?: number[]
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest extends Partial<Omit<UserInfo, 'id'>> {
  id: number
}

// ========== API 接口 ==========

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表分页数据
 * @example
 * const { list, total } = await getUserList({ page: 1, pageSize: 10 })
 */
export function getUserList(params?: UserSearchParams) {
  return request.post<PageResult<UserInfo>>('/user/getUserList', params)
}

/**
 * 根据 ID 获取用户信息
 * @param id 用户 ID
 * @returns 用户信息
 */
export function getUserById(id: number) {
  return request.get<UserInfo>('/user/getUserById', { params: { id } })
}

/**
 * 创建用户
 * @param data 用户数据
 * @returns 创建的用户信息
 */
export function createUser(data: CreateUserRequest) {
  return request.post<UserInfo>('/user/createUser', data)
}

/**
 * 更新用户
 * @param data 用户数据
 * @returns 更新后的用户信息
 */
export function updateUser(data: UpdateUserRequest) {
  return request.put<UserInfo>('/user/updateUser', data)
}

/**
 * 删除用户
 * @param id 用户 ID
 */
export function deleteUser(id: number) {
  return request.delete('/user/deleteUser', { params: { id } })
}

/**
 * 批量删除用户
 * @param ids 用户 ID 数组
 */
export function deleteUsersByIds(ids: number[]) {
  return request.delete('/user/deleteUsersByIds', { data: { ids } })
}
```

---

## 请求方法规范

| 操作 | HTTP 方法 | 函数命名 | 示例 |
|------|-----------|----------|------|
| 查询列表 | POST | `getXxxList` | `getUserList(params)` |
| 查询单个 | GET | `getXxxById` | `getUserById(id)` |
| 创建 | POST | `createXxx` | `createUser(data)` |
| 更新 | PUT | `updateXxx` | `updateUser(data)` |
| 删除 | DELETE | `deleteXxx` | `deleteUser(id)` |
| 批量删除 | DELETE | `deleteXxxByIds` | `deleteUsersByIds(ids)` |
| 导出 | POST | `exportXxx` | `exportUsers(params)` |
| 导入 | POST | `importXxx` | `importUsers(data)` |

---

## 类型定义规范

### 通用类型

```typescript
// typings/api/common.d.ts

/**
 * 分页结果
 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 通用响应
 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 分页参数
 */
export interface PageParams {
  page?: number
  pageSize?: number
}
```

### 搜索参数

```typescript
/**
 * 用户搜索参数
 */
export interface UserSearchParams extends PageParams {
  /** 用户名 */
  username?: string
  /** 昵称 */
  nickName?: string
  /** 状态：1-启用，2-禁用 */
  status?: number
}
```

---

## 请求实例封装

### Axios 配置

```typescript
// service/request/index.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 处理新 token
    const newToken = response.headers['new-token']
    if (newToken) {
      localStorage.setItem('token', newToken)
    }

    // 处理业务错误
    if (response.data.code !== 0) {
      ElMessage.error(response.data.message || '请求失败')
      return Promise.reject(new Error(response.data.message))
    }

    return response.data.data
  },
  (error) => {
    // 处理 HTTP 错误
    const { response } = error
    if (response?.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/login'
    } else {
      ElMessage.error(response?.data?.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
```

### 请求方法扩展

```typescript
// service/request/index.ts

export const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config)
  },

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  }
}
```

---

## 错误处理

### 统一错误处理

```typescript
// 在响应拦截器中统一处理
request.interceptors.response.use(
  (response) => {
    // 成功处理
    return response.data.data
  },
  (error) => {
    // 错误处理
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          // 清除登录状态并跳转
          useAuthStore().logout()
          break
        case 403:
          ElMessage.error('没有权限执行此操作')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    return Promise.reject(error)
  }
)
```

### 组件中使用

```typescript
// 组件中捕获特定错误
const handleSubmit = async () => {
  try {
    await createUser(formData)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    fetchData()
  } catch (error: any) {
    // 错误已在拦截器中提示，这里可做额外处理
    if (error.response?.status === 409) {
      // 用户名已存在，自动填充建议
      suggestUsername()
    }
  }
}
```

---

## 请求取消

### 使用 AbortController

```typescript
// service/request/index.ts
let controller: AbortController | null = null

export const cancelRequest = () => {
  controller?.abort()
  controller = null
}

request.interceptors.request.use((config) => {
  controller = new AbortController()
  config.signal = controller.signal
  return config
})
```

### 组件中使用

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { cancelRequest } from '@/service/request'

// 组件卸载时取消未完成的请求
onUnmounted(() => {
  cancelRequest()
})
</script>
```

---

---

## API 类型定义规范（CRITICAL）

### Namespace 风格统一

**所有 API 类型必须定义在 `src/typings/api/*.d.ts` 中，使用 `declare namespace Api` 风格。**

```typescript
// ✅ 正确：src/typings/api/approval.d.ts
declare namespace Api.Approval {
  // 实体类型
  interface Definition {
    id: number;
    name: string;
    // ...
  }

  // 请求参数类型
  interface CreateDefinitionParams {
    name: string;
    code: string;
    // ...
  }

  // 列表查询参数类型
  interface DefinitionListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }
}
```

```typescript
// ❌ 错误：直接导出接口（与项目风格不一致）
export interface ApprovalDefinition { ... }
export interface CreateDefinitionRequest { ... }
```

### 参数类型必须抽离（CRITICAL）

**禁止在 API 函数参数中内联定义类型，必须抽离到 typings 文件。**

```typescript
// ❌ 错误：内联定义参数类型
export function fetchActivateDefinition(data: { id: number; version?: number }) {
  return request({ url: '/approval/definition/activate', method: 'post', data });
}

export function fetchDefinitionList(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: string;
  keyword?: string;
}) {
  return request({ url: '/approval/definition/list', method: 'get', params });
}
```

```typescript
// ✅ 正确：参数类型抽离到 typings

// src/typings/api/approval.d.ts
declare namespace Api.Approval {
  interface ActivateDefinitionParams {
    id: number;
    version?: number;
  }

  interface DefinitionListParams {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
    keyword?: string;
  }
}

// src/service/api/approval.ts
export function fetchActivateDefinition(data: Api.Approval.ActivateDefinitionParams) {
  return request({ url: '/approval/definition/activate', method: 'post', data });
}

export function fetchDefinitionList(params?: Api.Approval.DefinitionListParams) {
  return request({ url: '/approval/definition/list', method: 'get', params });
}
```

### 参数类型命名规范

| 用途 | 命名后缀 | 示例 |
|------|---------|------|
| 创建请求 | `Params` | `CreateDefinitionParams` |
| 更新请求 | `Params` | `UpdateDefinitionParams` |
| 删除请求 | `Params` | `DeleteDefinitionParams` |
| GET 查询参数 | `Params` | `DefinitionListParams` |
| 单条查询参数 | `Params` | `GetDefinitionParams` |

### API 函数中使用全局类型

```typescript
// ✅ 正确：直接使用全局命名空间 Api，无需导入
export function fetchCreateDefinition(data: Api.Approval.CreateDefinitionParams) {
  return request<Api.Approval.Definition>({ ... });
}

// ❌ 错误：导入全局类型
import type { ApprovalDefinition } from '@/typings/api/approval';
export function fetchCreateDefinition(data: CreateDefinitionRequest) { ... }
```

---

## 检查清单

封装 API 时检查：

- [ ] **参数类型已抽离到 `src/typings/api/*.d.ts`**
- [ ] **使用 `declare namespace Api.Xxx` 风格定义类型**
- [ ] **API 函数直接使用 `Api.Xxx.TypeName`，无需导入**
- [ ] 使用 TypeScript 定义完整的请求/响应类型
- [ ] 添加完整的 JSDoc 注释
- [ ] 函数命名符合规范（get/create/update/delete）
- [ ] 统一的错误处理在拦截器中实现
- [ ] 组件中捕获特定错误做额外处理
- [ ] API 路径与后端 Router 路径一致
- [ ] 类型定义与后端 Model 字段一致

---

## 前后端一致性规范

### API 路径一致性

前端 API 路径必须与后端 Router 定义的路径完全一致：

```typescript
// ❌ 错误 - 前端使用 RESTful 风格，后端使用显式动作
// 前端
url: '/alarm/limit-type'          // POST
url: '/alarm/limit-type/:id'      // PUT

// 后端 Router
alarmRouter.POST("/limit-type/create", ...)   // 实际路径
alarmRouter.PUT("/limit-type/update", ...)    // 实际路径

// ✅ 正确 - 前端路径与后端一致
url: '/alarm/limit-type/create'   // POST
url: '/alarm/limit-type/update'   // PUT
```

### 类型定义一致性

前端类型定义必须与后端 Model 字段一致：

```typescript
// ❌ 错误 - 字段名和类型不一致
// 前端
interface AlarmItem {
  limitType: number
  limitVal: number
  status: number
}

// 后端 Model
type AlarmItem struct {
  LimitType  string `json:"limitType"`   // string, 不是 number
  LimitVal   string `json:"limitVal"`    // string
  StartStop  string `json:"startStop"`   // 字段名不同
}

// ✅ 正确 - 前端类型与后端一致
interface AlarmItem {
  limitType: string
  limitVal: string
  startStop: string
}
```

### 一致性检查方法

1. **API 路径检查**：对比前端 `src/service/api/*.ts` 与后端 `plugin/*/router/*.go`
2. **类型检查**：对比前端 `src/typings/api/*.d.ts` 与后端 `plugin/*/model/*.go`
3. **构建验证**：`pnpm build` 和 `go build` 都必须通过

---

**最后更新**: 2026-04-06
