---
description: "EMSS Web 项目命名约定：文件命名、变量命名、函数命名、组件命名规范"
triggers:
  - "命名"
  - "naming"
  - "命名规范"
  - "convention"
  - "文件名"
  - "变量名"
  - "函数名"
---

# 命名约定

## 总体原则

1. **见名知意**：名称应清晰表达用途
2. **保持一致**：相同概念使用相同命名方式
3. **遵循 Vue/TS 惯例**：遵循 Vue 3 和 TypeScript 官方代码规范
4. **避免缩写**：除通用缩写外，避免使用缩写

---

## 文件命名

### 基本规则

| 类型 | 格式 | 示例 |
|------|------|------|
| 普通文件 | kebab-case | `user-list.vue`, `use-auth.ts`, `api-config.ts` |
| Vue 组件 | PascalCase | `UserList.vue`, `DataTable.vue` |
| 测试文件 | `.test.ts` 或 `.spec.ts` | `user-list.test.ts` |
| 类型定义 | `.d.ts` | `user.d.ts`, `api.d.ts` |

### 具体规范

```
# ✅ 正确
user-list.vue
use-table.ts
api-config.ts
UserList.vue
DataTable.vue

# ❌ 错误
UserList.vue      # 非组件文件不要大驼峰
userList.ts       # 不要小驼峰
user_list.ts      # 不要用下划线
userlist.ts       # 没有分隔符
```

### 按类型命名

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 页面组件 | `views/[name]/index.vue` | `views/user/index.vue` |
| 公共组件 | `[组件名].vue` | `DataTable.vue`, `SvgIcon.vue` |
| API 文件 | `[模块].ts` | `user.ts`, `auth.ts` |
| Hooks | `use[功能].ts` | `useTable.ts`, `useAuth.ts` |
| Store | `[模块]/index.ts` | `auth/index.ts` |
| 类型定义 | `[模块].d.ts` | `user.d.ts` |
| 工具函数 | `[功能].ts` | `storage.ts`, `format.ts` |

---

## 变量命名

### 基本规则

| 场景 | 格式 | 示例 |
|------|------|------|
| 局部变量 | camelCase | `userName`, `pageSize`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`, `API_BASE_URL` |
| 布尔值 | is/has/can 前缀 | `isLogin`, `hasPermission`, `canEdit` |
| 数组/列表 | 复数形式 | `users`, `menuList`, `roleItems` |
| Ref 响应式 | 普通命名 | `count`, `userInfo` (不需要 countRef) |

### 具体示例

```typescript
// ✅ 局部变量 - camelCase
const userName = ref('')
const pageSize = ref(10)
const isLoading = ref(false)

// ✅ 常量 - UPPER_SNAKE_CASE
const DEFAULT_PAGE_SIZE = 10
const MAX_RETRY_COUNT = 3

// ✅ 布尔值 - is/has/can 前缀
const isLogin = computed(() => !!token.value)
const hasPermission = (code: string) => permissions.value.includes(code)
const canEdit = computed(() => userInfo.value?.role === 'admin')

// ✅ 数组/列表 - 复数形式
const users = ref<User[]>([])
const menuList = ref<MenuItem[]>([])

// ❌ 错误示例
const user_name = ref('')           // 不要用下划线
const UserName = ref('')            // 局部变量不要大写
const userlist = ref([])            // 用 userList
```

### 常用变量命名

| 概念 | 推荐命名 | 不推荐 |
|------|----------|--------|
| 错误 | `error`, `err` | `e`, `errMsg` |
| 加载状态 | `loading`, `isLoading` | `load`, `l` |
| 响应数据 | `data`, `res`, `response` | `d`, `result` |
| 分页 | `page`, `pageSize`, `total` | `p`, `ps`, `t` |
| 列表 | `list`, `items`, `records` | `arr`, `array`, `l` |
| ID | `id`, `userId` | `ID` (局部), `i` |
| 表单 | `form`, `formData` | `f`, `data` |

---

## 函数/方法命名

### 基本规则

| 场景 | 格式 | 示例 |
|------|------|------|
| 普通函数 | camelCase | `getUserList`, `handleSubmit` |
| Hooks | use前缀 + PascalCase | `useTable`, `useAuth` |
| 事件处理 | handle前缀 | `handleClick`, `handleSearch` |
| 获取数据 | get前缀 | `getUserList`, `getMenuTree` |
| 提交数据 | submit/create/update/delete | `submitForm`, `createUser` |
| 判断函数 | is/has/can前缀 | `isAdmin`, `hasRole` |

### 具体示例

```typescript
// ✅ 获取数据
const getUserList = async () => { }
const getMenuTree = async () => { }

// ✅ 提交数据
const submitForm = async () => { }
const createUser = async () => { }
const updateUser = async () => { }
const deleteUser = async () => { }

// ✅ 事件处理
const handleSearch = () => { }
const handleReset = () => { }
const handlePageChange = (page: number) => { }

// ✅ 判断函数
const isAdmin = computed(() => role.value === 'admin')
const hasPermission = (code: string) => permissions.value.includes(code)

// ❌ 错误示例
const GetUserList = async () => { }     // 不要大写开头
const userList = async () => { }        // 名词不能做函数名
const doSubmit = async () => { }        // 不要用 do 前缀
```

---

## 组件命名

### Vue 组件

```vue
<!-- ✅ 正确 - PascalCase -->
<UserList />
<DataTable />
<SvgIcon />

<!-- ❌ 错误 -->
<user-list />       <!-- 不要 kebab-case -->
<userlist />        <!-- 没有分隔符 -->
<user_list />       <!-- 不要用下划线 -->
```

### 组件 Props

```typescript
// ✅ 使用接口定义 Props
interface Props {
  // 基础类型
  title: string
  visible: boolean
  count?: number

  // 对象类型
  userInfo?: UserInfo

  // 数组类型
  columns: TableColumn[]

  // 函数类型
  onSubmit?: (data: FormData) => void

  // 联合类型
  size?: 'small' | 'medium' | 'large'
}

const props = defineProps<Props>()
```

### 组件事件

```typescript
// ✅ 使用类型化 Emits
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
```

---

## TypeScript 类型/接口命名

### 基本规则

| 场景 | 格式 | 示例 |
|------|------|------|
| 接口 | PascalCase | `UserInfo`, `PageResult` |
| 类型别名 | PascalCase | `UserRole`, `MenuType` |
| 枚举 | PascalCase | `StatusEnum`, `GenderEnum` |
| 泛型 | T, K, V 或具体名 | `T`, `K extends string`, `DataType` |

### 具体示例

```typescript
// ✅ 接口定义
interface UserInfo {
  id: number
  name: string
  email: string
}

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ✅ 类型别名
type UserRole = 'admin' | 'user' | 'guest'
type ApiResponse<T> = {
  code: number
  data: T
  message: string
}

// ✅ 枚举
enum StatusEnum {
  ENABLED = 1,
  DISABLED = 2
}

// ✅ 泛型
function useTable<T, S>(fetchFn: (params: S) => Promise<PageResult<T>>) {
  // ...
}
```

---

## 路由命名

### 路由路径

```typescript
// ✅ 正确
const routes = [
  { path: '/user', name: 'User', component: User },
  { path: '/user/:id', name: 'UserDetail', component: UserDetail },
  { path: '/system/menu', name: 'SystemMenu', component: Menu }
]

// ❌ 错误
{ path: '/User' }           // 不要大写
{ path: '/user_list' }      // 不要用下划线
{ path: '/user-list' }      // 不要用连字符
```

### 路由名称

```typescript
// ✅ 正确 - PascalCase
name: 'User'
name: 'UserDetail'
name: 'SystemMenu'

// ❌ 错误
name: 'user'                // 不要小写
name: 'user-detail'         // 不要 kebab-case
```

---

## API 路径命名

```typescript
// ✅ 正确 - 与后端保持一致
'/user/getUserList'
'/user/createUser'
'/user/updateUser'
'/user/deleteUser'
'/menu/getMenuTree'

// ❌ 错误
'/user/list'                // 不清晰
'/user/create'              // 动词不完整
'/user/user-list'           // 重复
```

---

## 检查清单

编写代码时检查：

- [ ] 文件使用 kebab-case（Vue 组件除外）
- [ ] Vue 组件使用 PascalCase
- [ ] 变量使用 camelCase
- [ ] 常量使用 UPPER_SNAKE_CASE
- [ ] Hooks 使用 use 前缀
- [ ] 布尔值使用 is/has/can 前缀
- [ ] 类型/接口使用 PascalCase
- [ ] 事件处理函数使用 handle 前缀

---

**最后更新**: 2026-03-18
