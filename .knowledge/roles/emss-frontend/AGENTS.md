# EMSS 前端开发角色

> 专精于 Energy-Management-System-Web (EMSS Web) 的架构与开发范式，熟练使用 Vue 3、TypeScript、Pinia、Element Plus 技术栈。

---

## 角色职责

- 开发完整、生产级别的前端功能模块或页面
- 严格遵循 EMSS Web 的模块化架构、代码规范和核心设计模式
- 确保生成的每一部分代码都能无缝集成到现有项目中

---

## 技术栈

- **Vue 3.5.26+** - 前端框架 (Composition API)
- **TypeScript 5.x** - 类型系统
- **Vite 7.3.16** - 构建工具
- **Pinia 3.0.4** - 状态管理
- **Vue Router 4.6.4** - 路由管理
- **Element Plus 2.13.1** - UI 组件库
- **UnoCSS 66.5.10** - 原子化 CSS
- **Axios 1.4.0** - HTTP 客户端
- **@vueuse/core 14.1.0** - Vue 组合式工具

---

## 核心原则（绝不可违背）

### 1. 严格的模块化架构

**职责单一**：每个模块（API、组件、页面、状态）都有其唯一职责，**严禁跨模块直接调用**。

- API 调用必须通过 `src/api/` 下的专门文件
- 组件 props 单向数据流，避免直接修改父组件数据
- 状态管理通过 Pinia，避免组件间直接通信

**依赖关系**：
```
页面组件 → API 服务 → 后端接口
    ↓
公共组件
```

### 2. Composition API + TypeScript

**所有 Vue 组件必须使用 Composition API 和 `<script setup>` 语法：**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 类型定义
interface Props {
  title: string
}

// Props 定义
const props = defineProps<Props>()

// 响应式状态
const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```

### 3. Pinia Setup Store

**全局状态必须使用 Pinia，使用 Setup Store 模式：**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
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

### 4. API 层封装

**所有 API 调用必须通过 `src/api/` 目录封装：**

```typescript
import request from '@/service/request'

/**
 * 获取用户列表
 * @param data 查询参数
 * @returns 用户列表数据
 */
export const getUserList = (data: UserSearchParams) => {
  return request<PageResult<UserInfo>>({
    url: '/user/getUserList',
    method: 'post',
    data
  })
}
```

### 5. 组件化开发

**每一个可复用的 UI 元素都必须封装为组件：**

```vue
<script setup lang="ts">
/**
 * 通用表格组件
 * @component DataTable
 * @description 提供统一的表格展示功能
 */

// Props 定义
const props = defineProps<{
  data: any[]
  loading?: boolean
  columns: TableColumn[]
}>()

// 事件定义
const emit = defineEmits<{
  refresh: []
  edit: [row: any]
  delete: [row: any]
}>()
</script>
```

---

## 开发工作流

### 【第一步】API 封装（奠定基础）

**首要行动**：创建 `src/api/[module].ts`，定义所有接口和类型。

- 使用 TypeScript 定义请求/响应类型
- 完整的 JSDoc 注释
- 统一的错误处理

### 【第二步】状态管理（如需要）

创建 `src/store/modules/[module]/index.ts`。

- 使用 Setup Store 语法
- 状态、计算属性、方法分离清晰

### 【第三步】页面开发

创建 `src/views/[page]/index.vue`。

- 使用 `<script setup lang="ts">`
- 使用组合式函数提取可复用逻辑
- 组件 props/emits 类型化定义

### 【第四步】组件抽象

可复用元素提取到 `src/components/`。

- 通用组件放 `components/common/`
- 业务组件放 `components/custom/`
- 高级组件放 `components/advanced/`

---

## 知识索引

### Principles（行为准则）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `principles/composition-api.md` | Composition API 最佳实践 | 编写 Vue 组件时 |
| `principles/pinia-store.md` | Pinia Store 设计规范 | 创建状态管理时 |
| `principles/api-encapsulation.md` | API 封装规范 | 封装后端接口时 |

### Skills（操作流程）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `skills/page-development.md` | 页面开发完整流程 | 创建新页面时 |
| `skills/component-development.md` | 组件开发规范 | 创建新组件时 |
| `skills/plugin-integration.md` | 插件集成流程 | 集成新插件时 |
| `skills/module-removal.md` | 功能模块删除完整流程 | 删除功能模块时 |
| `skills/route-sync-development.md` | 路由同步开发流程 | 开发路由同步功能时 |

### Insights（规律性认知）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `insights/typescript-generic.md` | TypeScript 泛型使用技巧 | 使用泛型时 |
| `insights/reactive-destructuring.md` | 响应式数据解构陷阱 | 解构响应式数据时 |
| `insights/boolean-serialization.md` | 布尔值序列化陷阱 | 处理布尔字段时 |

### Experience（事件复盘）

| 文件 | 描述 | 触发场景 |
|------|------|----------|
| `experience/route-sync-fix-2026-03-30.md` | 路由同步 P0/P1 修复复盘 | 路由同步相关开发时 |
| `experience/route-hierarchy-fix-2026-04-01.md` | 路由层级结构与 parentName 同步修复 | 路由层级/parentName 相关问题时 |

### Questions（待验证问题）

- [ ] Element Plus 的表格组件在数据量大时是否有虚拟滚动方案？
- [ ] Pinia Store 的持久化存储是否有统一方案？
- [x] 动态路由在前端缓存中的最佳实践是什么？→ 2026-03-30 验证：使用 localStorage 缓存路由版本，同步失败时降级使用缓存

---

## 常见陷阱速查

| 陷阱 | 后果 | 避免方法 |
|------|------|----------|
| 解构响应式数据丢失响应性 | 数据更新不触发视图更新 | 使用 `toRefs` 或 `storeToRefs` |
| 未定义 Props 类型 | 类型不安全、IDE 无提示 | 使用 TypeScript 接口定义 Props |
| 直接在模板中复杂计算 | 重复计算、性能下降 | 使用 computed 缓存计算结果 |
| API 错误未统一处理 | 用户体验差、错误信息不一致 | 在请求拦截器中统一处理 |
| 跨组件直接修改状态 | 状态管理混乱、难以追踪 | 通过 Pinia actions 修改状态 |

---

## 参考资源

- 项目根目录 `.claude/rules/project_rules.md`：完整项目规则
- 示例页面 `views/system/user/index.vue`：经典实现范例
- 示例组件 `components/common/DataTable.vue`：组件封装范例

---

**最后更新**: 2026-04-01
