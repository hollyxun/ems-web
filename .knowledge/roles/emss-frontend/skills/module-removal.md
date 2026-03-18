---
description: "功能模块删除的完整流程：如何安全彻底地删除前端功能模块，避免残留引用"
triggers:
  - "删除功能模块"
  - "删除组件"
  - "移除功能"
  - "删除页面"
  - "清理代码"
source:
  - "experience/2026-03-18-remove-devtools-ai-chat.md"
---

# 功能模块删除完整流程

## 概述

安全彻底地删除前端功能模块，确保不留下残留引用和死代码。

---

## 删除清单

### 1. 页面/组件文件

```bash
# 删除页面目录
rm -rf src/views/module-name/feature-name/

# 删除组件文件
rm -f src/components/module-name/feature-component.vue

# 删除 composables/hooks
rm -f src/views/module-name/hooks/use-feature.ts
```

### 2. API 层

**检查文件**: `src/views/module-name/api/index.ts` 或 `src/api/module.ts`

```typescript
// 删除该模块相关的所有 API 函数
// - 删除 import 的类型
// - 删除函数定义
// - 删除相关接口定义（如果该文件没有其他用途）
```

### 3. 类型定义

**检查文件**: `src/typings/api/module.d.ts`

```typescript
// 删除该模块相关的所有类型定义
// 如果文件因此为空，删除整个文件
```

### 4. 路由配置

**检查文件**:
- `src/router/elegant/routes.ts` - 路由配置
- `src/router/elegant/imports.ts` - 组件导入

```typescript
// routes.ts - 删除路由配置
{
  name: 'module_feature',  // ← 删除整个对象
  path: '/module/feature',
  // ...
}

// imports.ts - 删除导入
"module_feature": () => import("@/views/module/feature/index.vue"),  // ← 删除
```

### 5. 国际化翻译

**检查文件**:
- `src/locales/langs/zh-cn.ts`
- `src/locales/langs/en-us.ts`

```typescript
// 删除路由标题翻译
'module_feature': '功能名称',  // ← 删除

// 删除页面级翻译对象
moduleName: {
  feature: {
    // ... ← 删除整个对象
  }
}
```

### 6. Store/状态管理

**检查文件**: `src/store/modules/module.ts`

```typescript
// 删除相关的 state、getters、actions
// 如果文件因此为空，删除整个 store 模块
```

### 7. 样式文件

```bash
# 删除模块专属样式
rm -f src/styles/module/feature.scss
```

### 8. 自动生成的路由文件

**注意**: 以下文件由 `elegant-router` 自动生成，**不要手动修改**：
- `src/router/elegant/transform.ts`
- `src/typings/elegant-router.d.ts`

这些文件会在下次运行路由生成命令时自动更新。

---

## 验证清单

删除完成后，验证以下内容：

```bash
# 1. 搜索残留引用
grep -r "feature-name" src/ --include="*.ts" --include="*.vue" --include="*.js"

# 2. 检查路由配置
grep -r "module_feature" src/router/

# 3. 检查国际化
grep -r "module_feature" src/locales/

# 4. TypeScript 类型检查
npm run type-check

# 5. 构建验证
npm run build
```

---

## 提交规范

```bash
# 类型选择
feat(scope)!: 移除 XXX 功能模块   # 如果是破坏性变更
core(scope): 清理 XXX 代码        # 如果只是内部重构

# 提交信息应包含：
# - 删除了哪些文件
# - 更新了哪些配置
# - 破坏性变更说明（如果适用）
```

示例：
```
feat(devtools)!: 移除 AI 对话功能模块

删除 devtools 模块中的 AI 对话相关组件和功能：
- 删除 ai-chat 页面及所有子组件
- 删除 use-ai-storage composable
- 移除相关 API 和类型定义
- 更新路由配置
- 更新国际化翻译

BREAKING CHANGE: /devtools/ai-chat 路由不再可用
```

---

## 常见陷阱

### 1. 只删除页面，忘记 API

❌ **错误**: 只删除 `src/views/feature/`，忘记清理 `src/api/feature.ts`

✅ **正确**: 同步删除 API 层和类型定义

### 2. 路由残留

❌ **错误**: 删除了组件文件，但路由配置还在

✅ **正确**: 同时清理 `routes.ts` 和 `imports.ts`

### 3. 国际化残留

❌ **错误**: 删除了功能但翻译键还在

✅ **正确**: 同步清理 `zh-cn.ts` 和 `en-us.ts`

### 4. 类型定义残留

❌ **错误**: API 删除了但类型定义还在

✅ **正确**: 检查并清理 `src/typings/api/`

---

## 快速检查脚本

```bash
#!/bin/bash
MODULE_NAME="feature-name"

echo "=== 检查残留引用 ==="
grep -r "$MODULE_NAME" src/ \
  --include="*.ts" \
  --include="*.vue" \
  --include="*.js" \
  --include="*.json" \
  2>/dev/null | grep -v "node_modules"

echo "=== 检查路由 ==="
grep -r "$MODULE_NAME" src/router/ 2>/dev/null

echo "=== 检查国际化 ==="
grep -r "$MODULE_NAME" src/locales/ 2>/dev/null

echo "=== 完成 ==="
```

---

**最后更新**: 2026-03-18
