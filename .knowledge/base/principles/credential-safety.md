---
description: "接触凭证、权限、token 时的安全原则：永不硬编码、最小权限、敏感信息处理规范"
triggers:
  - "凭证"
  - "token"
  - "密码"
  - "secret"
  - "安全"
  - "权限"
  - "credential"
---

# 凭证安全原则

## 核心原则

**任何涉及凭证、权限、token 的操作，安全是第一优先级。**

---

## 绝对禁止

### ❌ 禁止硬编码敏感信息

```typescript
// 绝对禁止
const API_KEY = 'sk-1234567890abcdef'  // 禁止！
const JWT_SECRET = 'my-secret-key'      // 禁止！
```

### ❌ 禁止将敏感信息提交到 Git

```bash
# .env 文件包含敏感信息
VITE_API_KEY=secret123  # 如果提交到 Git，就是泄露
```

### ❌ 禁止在日志中打印敏感信息

```typescript
// 危险
console.log('User login', { token: userToken })  // 禁止！
console.log('API request', { apiKey: API_KEY })  // 禁止！
```

### ❌ 禁止在前端暴露服务端密钥

```typescript
// 前端代码 - 用户可以看到！
const serverSecret = 'server-side-secret-key'  // 禁止！
```

---

## 必须遵守

### ✅ 使用环境变量

```bash
# .env.local (已加入 .gitignore)
VITE_API_BASE_URL=https://api.example.com
VITE_APP_KEY=${APP_KEY}  # 从 CI/CD 环境注入
```

### ✅ 配置文件加入 .gitignore

```gitignore
# .gitignore
.env.local
.env.*.local
*.pem
*.key
/dist
```

### ✅ 使用最小权限原则

- Token 只在需要的组件/请求中使用
- 敏感操作需要二次确认
- 定期清理本地存储的 token

### ✅ 敏感信息脱敏

```typescript
// 日志脱敏
function maskToken(token: string): string {
  if (token.length <= 8) {
    return '***'
  }
  return token.slice(0, 4) + '...' + token.slice(-4)
}

console.log('User login', { token: maskToken(token) })
```

### ✅ 安全的存储方式

```typescript
// Token 存储使用封装好的 localStorage 工具
import { localStg } from '@/utils/storage'

// ✅ 正确 - 使用封装工具，可以统一处理加密/过期
localStg.set('token', token)
const token = localStg.get('token')

// ❌ 错误 - 直接使用 localStorage
localStorage.setItem('token', token)  // 不推荐
```

---

## EMSS Web 具体实践

### Token 管理

```typescript
// src/utils/storage.ts
export const localStg = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string) {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  },
  remove(key: string) {
    localStorage.removeItem(key)
  }
}

// 使用 Pinia 管理 Token
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStg.get('token') || '')

  const setToken = (val: string) => {
    token.value = val
    localStg.set('token', val)
  }

  const clearToken = () => {
    token.value = ''
    localStg.remove('token')
  }

  return { token, setToken, clearToken }
})
```

### API 请求中的 Token

```typescript
// src/service/request/index.ts
import { useAuthStore } from '@/store'

request.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Token 续期处理
request.interceptors.response.use((response) => {
  const newToken = response.headers['new-token']
  if (newToken) {
    const authStore = useAuthStore()
    authStore.setToken(newToken)
  }
  return response
})
```

---

## 检查清单

处理凭证时检查：

- [ ] 没有硬编码的密钥/密码/token
- [ ] 环境变量文件已加入 .gitignore
- [ ] 敏感信息通过环境变量注入
- [ ] 日志中没有打印敏感信息
- [ ] Token 存储使用封装工具
- [ ] API 请求自动处理 Token 续期

---

## 泄露响应

如果意外将敏感信息提交到 Git：

1. **立即撤销该凭证**（让它失效）
2. **不要在 Git 历史中删除后重新提交**（历史仍可查看）
3. **生成新凭证替换**
4. **审查该凭证的访问日志**

---

## Escalate to experience if

- 不确定某个值是否属于敏感信息
- 需要将敏感信息传递给第三方服务
- 设计多环境凭证管理方案
