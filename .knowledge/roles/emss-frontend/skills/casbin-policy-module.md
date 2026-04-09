---
description: "Casbin 策略管理前端模块架构：API 封装、类型定义、页面组件"
triggers:
  - "Casbin"
  - "策略管理"
  - "policy"
  - "权限配置"
---

# Casbin 策略管理前端模块

## 概述

Casbin 策略管理前端模块与后端 `service/system/casbin_service.go` 对接，提供 Casbin 策略的可视化管理功能。

---

## 目录结构

```
web/src/
├── service/api/
│   └── casbin.ts                   # Casbin API 封装
├── typings/api/
│   └── casbin.d.ts                 # Casbin 类型定义
└── views/manage/
    └── policy/
        ├── index.vue               # 策略列表页
        └── modules/
            ├── policy-search.vue   # 搜索组件
            └── policy-operate-drawer.vue  # 编辑抽屉
```

---

## API 封装

文件：`src/service/api/casbin.ts`

### 可用函数

| 函数 | 用途 |
|------|------|
| `fetchGetPolicyList(params)` | 获取策略列表（分页） |
| `fetchCreatePolicy(data)` | 创建策略 |
| `fetchUpdatePolicy(data)` | 更新策略 |
| `fetchDeletePolicy(data)` | 删除策略 |
| `fetchBatchCreatePolicies(data)` | 批量创建 |
| `fetchBatchDeletePolicies(data)` | 批量删除 |
| `fetchTestEnforce(data)` | 测试权限 |
| `fetchClearCache(data)` | 清除缓存 |

---

## 类型定义

文件：`src/typings/api/casbin.d.ts`

### 核心类型

```typescript
declare namespace Api.Casbin {
  // 策略项
  interface PolicyItem {
    sub: string;      // 主体（角色ID）
    obj: string;      // 对象（资源）
    act: string;      // 动作
    effect: string;   // 效果：allow / deny
    ctx?: string;     // 上下文（JSON）
  }

  // 搜索参数
  interface PolicySearchParams {
    page: number;
    pageSize: number;
    sub?: string;
    obj?: string;
    act?: string;
  }

  // 创建请求
  interface CreatePolicyRequest {
    sub: string;
    obj: string;
    act: string;
    effect?: string;
    ctx?: string;
  }
}
```

---

## 策略格式说明

### 基础策略

```json
{
  "sub": "1",           // 角色 ID
  "obj": "/api/v1/user",  // 资源路径
  "act": "GET",         // HTTP 方法
  "effect": "allow"     // 允许/拒绝
}
```

### 带 JSON ctx 的扩展策略

```json
{
  "sub": "3",
  "obj": "/api/v1/energy/*",
  "act": "*",
  "effect": "allow",
  "ctx": "{\"factoryIds\":[1,2],\"shiftScope\":\"all\"}"
}
```

### ctx 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `factoryIds` | `number[]` | 允许访问的工厂 ID 列表 |
| `factoryAll` | `boolean` | 允许访问所有工厂 |
| `shiftScope` | `string` | 班次范围：`own` / `all` |
| `operations` | `string[]` | 操作权限列表 |

---

## 使用示例

### 查询策略

```typescript
import { fetchGetPolicyList } from '@/service/api/casbin';

const { data } = await fetchGetPolicyList({
  page: 1,
  pageSize: 30,
  sub: '1'  // 按角色 ID 筛选
});
```

### 创建策略

```typescript
import { fetchCreatePolicy } from '@/service/api/casbin';

await fetchCreatePolicy({
  sub: '3',
  obj: '/api/v1/energy/*',
  act: 'GET',
  effect: 'allow',
  ctx: '{"factoryIds":[1,2]}'
});
```

### 测试权限

```typescript
import { fetchTestEnforce } from '@/service/api/casbin';

const { data } = await fetchTestEnforce({
  sub: '3',
  obj: '/api/v1/energy/dashboard',
  act: 'GET'
});
// data.allowed = true/false
```

---

## 页面功能

### 策略列表

- 角色筛选
- 资源路径筛选
- 操作类型筛选
- 分页展示

### 策略编辑

- 主体选择（角色）
- 资源路径输入
- 操作类型选择
- JSON ctx 编辑器

### 批量操作

- 批量删除
- 批量创建

---

## 与旧 AdvancedPermission 模块的关系

| 旧模块 | 新模块 | 说明 |
|--------|--------|------|
| `views/manage/advanced-permission/` | `views/manage/policy/` | 页面迁移 |
| `AdvancedPermissionService` | `CasbinService` | 后端服务迁移 |
| 跨工厂/班次权限独立表 | Casbin ctx 字段 | 数据结构迁移 |

**注意**：`AdvancedPermission` 相关代码已完全删除，使用 Casbin 策略管理替代。

---

## 注意事项

1. **ctx 格式**：ctx 必须是有效的 JSON 字符串
2. **角色 ID**：sub 字段为角色 ID 字符串
3. **Admin 豁免**：角色 ID = 1 的用户自动拥有所有权限
4. **缓存**：策略变更后可能需要清除缓存

---

**最后更新**: 2026-04-09