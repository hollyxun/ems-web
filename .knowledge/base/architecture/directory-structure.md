---
description: "EMSS Web 项目详细目录结构说明：每个目录的职责、文件组织规范"
triggers:
  - "目录结构"
  - "directory"
  - "项目结构"
  - "文件夹"
  - "组织"
---

# 目录结构详细说明

## 整体结构

```
web/src/
├── api/                # API 接口封装
├── assets/             # 静态资源
│   ├── imgs/          # 图片资源
│   └── svg-icon/      # SVG 图标
├── components/         # 公共组件
├── constants/          # 常量定义
├── directives/         # 自定义指令
├── enum/               # 枚举定义
├── hooks/              # 组合式函数
├── layouts/            # 布局组件
├── locales/            # 国际化
├── plugins/            # 前端插件
├── router/             # 路由配置
├── service/            # 请求封装 (Axios)
├── store/              # 状态管理 (Pinia)
├── styles/             # 样式文件
├── theme/              # 主题配置
├── typings/            # TypeScript 类型定义
├── utils/              # 工具函数
└── views/              # 页面组件
```

---

## 各目录详细说明

### api/ - API 接口封装

**职责**: 封装所有后端 API 调用，提供类型安全的接口服务

**结构**:
```
api/
├── system/            # 系统模块 API
│   ├── user.ts
│   ├── menu.ts
│   └── auth.ts
├── monitor/           # 监控模块 API
└── ...
```

**规范**:
- 按业务模块组织 API 文件
- 使用 TypeScript 定义请求/响应类型
- 完整的 JSDoc 注释

**示例**:
```typescript
// api/system/user.ts
import request from '@/service/request'

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表分页数据
 */
export function getUserList(params: UserSearchParams) {
  return request.post<PageResult<UserInfo>>('/user/getUserList', params)
}
```

---

### components/ - 公共组件

**职责**: 提供可复用的 UI 组件

**结构**:
```
components/
├── advanced/          # 高级组件
│   ├── data-table/
│   ├── form-modal/
│   └── search-form/
├── common/            # 通用组件
│   ├── svg-icon/
│   ├── app-provider/
│   └── page-wrapper/
└── custom/            # 自定义组件
    └── ...
```

**组件规范**:
- 使用 `<script setup lang="ts">` 语法
- Props 使用 TypeScript 接口定义
- 样式优先使用 UnoCSS

---

### hooks/ - 组合式函数

**职责**: 封装可复用的业务逻辑

**结构**:
```
hooks/
├── business/          # 业务相关 hooks
│   ├── useUser.ts
│   ├── useAuth.ts
│   └── useTable.ts
└── common/            # 通用 hooks
    ├── useLoading.ts
    ├── useForm.ts
    └── useModal.ts
```

**示例**:
```typescript
// hooks/business/useTable.ts
export function useTable<T, S>(fetchFn: (params: S) => Promise<PageResult<T>>) {
  const loading = ref(false)
  const dataList = ref<T[]>([])
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })

  const fetchData = async (searchParams?: S) => {
    loading.value = true
    try {
      const res = await fetchFn({
        ...searchParams,
        page: pagination.page,
        pageSize: pagination.pageSize
      } as S)
      dataList.value = res.list
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  return { loading, dataList, pagination, fetchData }
}
```

---

### router/ - 路由配置

**职责**: 管理页面路由和权限控制

**结构**:
```
router/
├── elegant/           # 路由转换工具
├── guard/             # 路由守卫
│   ├── index.ts
│   ├── auth.ts
│   └── permission.ts
├── routes/            # 路由定义
│   ├── builtin.ts     # 内置路由
│   └── index.ts
├── index.ts           # 路由入口
└── types.d.ts         # 路由类型扩展
```

---

### service/ - 请求封装

**职责**: Axios 封装和请求配置

**结构**:
```
service/
├── api/               # API 实例配置
├── request/           # 请求封装
│   ├── index.ts       # 请求实例
│   ├── interceptors.ts # 拦截器
│   └── types.ts       # 类型定义
└── ...
```

---

### store/ - 状态管理

**职责**: Pinia 状态管理

**结构**:
```
store/
├── modules/           # 状态模块
│   ├── auth/index.ts
│   ├── user/index.ts
│   ├── route/index.ts
│   └── tab/index.ts
├── plugins/           # Pinia 插件
└── index.ts           # 状态入口
```

**Store 规范**:
```typescript
// store/modules/auth/index.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLogin = computed(() => !!token.value)

  // Actions
  const setToken = (val: string) => {
    token.value = val
  }

  return { token, userInfo, isLogin, setToken }
})
```

---

### typings/ - 类型定义

**职责**: TypeScript 类型定义

**结构**:
```
typings/
├── api/               # API 相关类型
│   ├── auth.d.ts
│   ├── user.d.ts
│   └── common.d.ts
├── components/        # 组件类型
├── router.d.ts        # 路由类型
├── store.d.ts         # 状态类型
└── env.d.ts           # 环境变量类型
```

---

### views/ - 页面组件

**职责**: 实现具体的业务页面

**结构**:
```
views/
├── home/              # 首页
├── login/             # 登录页
├── system/            # 系统管理
│   ├── user/
│   │   ├── index.vue
│   │   ├── components/
│   │   └── hooks/
│   ├── menu/
│   └── role/
└── ...
```

**页面规范**:
- 每个页面一个文件夹
- 页面级组件命名为 `index.vue`
- 子组件放在 `components/` 目录
- 专用 hooks 放在 `hooks/` 目录

---

## 文件组织最佳实践

### 1. 新页面开发流程

```
1. api/[module].ts        # 定义 API 接口
2. store/modules/[module] # 定义状态管理（如需要）
3. views/[page]/index.vue # 实现页面
4. views/[page]/components/ # 提取页面组件（如需要）
```

### 2. 文件命名规范

- 文件名：kebab-case（短横线命名）
- 组件名：PascalCase（大驼峰）
- 组合式函数：useXxx（camelCase，use 前缀）
- 类型定义：PascalCase

### 3. 目录深度控制

- 尽量保持 2-3 层深度
- 避免过深的嵌套
- 相关功能放在同一目录

---

## 参考示例

查看以下目录作为规范示例：
- `views/system/user/` - 标准页面结构
- `components/common/` - 标准组件组织
- `hooks/business/useTable.ts` - 标准组合式函数

---

**最后更新**: 2026-03-18
