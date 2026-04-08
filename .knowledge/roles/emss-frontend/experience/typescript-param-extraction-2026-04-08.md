# TypeScript 类型修复与参数抽离规范实战

> 日期：2026-04-08
> 相关文件：`principles/typescript-constraints.md`、`principles/api-encapsulation.md`

---

## 问题背景

运行 `pnpm vue-tsc --noEmit` 时发现两类问题：

1. **第三方库类型定义错误**：`@amap/amap-jsapi-types`、`@antv/g-lite` 等库的类型定义存在问题
2. **项目代码类型错误**：参数内联定义、类型未抽离、`catch` 参数缺失等

---

## 修复内容

### 1. tsconfig.json 添加 skipLibCheck

**问题**：第三方库类型定义错误导致构建失败。

**修复**：

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**效果**：跳过 `node_modules/**/*.d.ts` 检查，仅检查项目源码。

---

### 2. Vue 模板内联颜色值问题

**问题**：`vue-tsc` 解析模板中的 `#10B981` 时报 `TS1127 Invalid character`。

**修复**：将颜色值提取为变量。

```vue
<script setup lang="ts">
const greenColor = '#10B981';
const healthColor = computed(() =>
  healthRate.value >= 90 ? greenColor : yellowColor
);
</script>

<template>
  <ElProgress :color="greenColor">
    <template #default="slotProps">
      {{ slotProps.percentage }}%
    </template>
  </ElProgress>
</template>
```

---

### 3. API 参数类型抽离

**问题**：API 函数参数内联定义类型，不符合项目风格。

**修复**：

1. 在 `src/typings/api/*.d.ts` 中定义参数类型
2. 使用 `declare namespace Api.Xxx` 风格
3. API 函数中使用 `Api.Xxx.ParamsName`

**修复前**：

```typescript
// src/service/api/approval.ts
export function fetchActivateDefinition(data: { id: number; version?: number }) { ... }

// src/typings/api/approval.d.ts
export interface ApprovalDefinition { ... }  // export 风格
```

**修复后**：

```typescript
// src/typings/api/approval.d.ts
declare namespace Api.Approval {
  interface Definition { ... }
  interface ActivateDefinitionParams {
    id: number;
    version?: number;
  }
}

// src/service/api/approval.ts
export function fetchActivateDefinition(data: Api.Approval.ActivateDefinitionParams) { ... }
```

---

### 4. 其他类型修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `analysis/comprehensive/index.vue` | `catch` 缺少参数 | 添加 `error` 参数 |
| `analysis/consumption/index.vue` | `catch` 缺少参数 | 添加 `error` 参数 |
| `approval/workspace/index.vue` | `TabPaneName` 类型不兼容 | 参数改为 `string \| number` |
| `dashboard/custom/index.vue` | `Object.keys()` 返回 `string[]` 无法索引 | 创建类型化的 `categories` 数组 |
| `developer/function/*.vue` | 路由名称错误 | 改为 `developer_function_*` 格式 |

---

## 规范总结

### 必须执行

| 规范 | 说明 |
|------|------|
| `skipLibCheck: true` | 避免第三方库类型问题 |
| 参数类型抽离 | 所有 API 参数类型必须在 `typings/api/*.d.ts` 中定义 |
| Namespace 风格 | 使用 `declare namespace Api.Xxx` 定义类型 |
| 颜色值提取变量 | Vue 模板中避免内联 `#xxxxxx` 颜色值 |
| catch 参数 | `catch` 块必须有 `error` 参数 |

### 检查命令

```bash
# TypeScript 类型检查
pnpm vue-tsc --noEmit

# 构建验证
pnpm build
```

---

## 文件修改清单

| 文件路径 | 修改内容 |
|---------|---------|
| `tsconfig.json` | 添加 `skipLibCheck: true` |
| `src/typings/api/approval.d.ts` | 重构为 namespace 风格，添加参数类型 |
| `src/typings/api/dashboard.d.ts` | 添加看板相关参数类型 |
| `src/service/api/approval.ts` | 使用抽离的参数类型 |
| `src/service/api/dashboard.ts` | 使用抽离的参数类型 |
| `src/views/dashboard/custom/components/device-status.vue` | 颜色值提取变量 |
| `src/views/analysis/comprehensive/index.vue` | catch 参数修复 |
| `src/views/analysis/consumption/index.vue` | catch 参数修复 |
| `src/views/approval/workspace/index.vue` | TabPaneName 类型兼容 |
| `src/views/approval/flow-designer/index.vue` | 使用全局类型 |
| `src/views/approval/workspace/modules/approval-detail-drawer.vue` | 使用全局类型 |
| `src/views/developer/function/*.vue` | 路由名称修复 |

---

**最后更新**: 2026-04-08