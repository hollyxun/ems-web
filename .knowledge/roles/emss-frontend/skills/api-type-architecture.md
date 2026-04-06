---
description: "API 类型定义架构规范：typings 统一使用 Api 命名空间"
triggers:
  - "API 类型"
  - "typings/api"
  - "service/api"
  - "namespace"
  - "类型定义"
date: "2026-04-06"
---

# API 类型定义架构规范

## 核心原则

**API 类型定义统一放在 `typings/api/*.d.ts`，使用全局 `Api` 命名空间。**

## 目录职责划分

| 目录 | 职责 | 内容 |
|------|------|------|
| `typings/api/*.d.ts` | 类型定义 | `declare namespace Api { ... }` |
| `service/api/*.ts` | 请求函数 | `export function fetchXxx(...)` |

## 正确架构示例

### typings/api/alarm.d.ts

```typescript
/**
 * Alarm types
 * 告警类型定义
 */
declare namespace Api {
  namespace AlarmHistory {
    /**
     * 告警历史数据项
     */
    interface AlarmHistoryItem {
      /** 主键ID */
      id: string;
      /** 指标编码 */
      indexCode: string;
    }

    /**
     * 告警历史查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
    }

    /**
     * 列表响应
     */
    interface ListResponse {
      list: AlarmHistoryItem[];
      total: number;
    }
  }
}
```

### service/api/alarm.ts

```typescript
import { request } from '../request';

/**
 * 获取告警历史列表
 * @param params 查询参数
 */
export function fetchAlarmHistoryList(params: Api.AlarmHistory.SearchParams) {
  return request<Api.AlarmHistory.ListResponse>({
    url: '/alarm/history/list',
    method: 'get',
    params
  });
}

/**
 * 创建告警项
 * @param data 创建参数
 */
export function fetchCreateAlarmItem(data: Api.AlarmItem.CreateParams) {
  return request<Api.AlarmItem.Item>({
    url: '/alarm/item/create',
    method: 'post',
    data
  });
}
```

## 错误模式（禁止）

### 错误 1：service/api 中定义重复类型

```typescript
// ❌ 错误：service/api/alarm.ts 中定义本地 namespace
import { request } from '../request';

export namespace AlarmHistory {  // 禁止！
  export interface AlarmHistoryItem { /* ... */ }
}

export function fetchAlarmHistoryList(params: AlarmHistory.SearchParams) {
  // ...
}
```

**问题**：类型定义重复、不一致、难以维护。

### 错误 2：typings 和 service 类型不一致

```typescript
// typings/api/alarm.d.ts
interface Item {
  status: number;  // 数字类型
}

// service/api/alarm.ts
export interface Item {
  status: string;  // 字符串类型 - 不一致！
}
```

**问题**：运行时类型错误。

## JSDoc 注释规范

**所有类型定义和函数必须有 JSDoc 注释：**

```typescript
// ✅ 正确：完整的 JSDoc 注释
/**
 * 告警历史数据项
 */
interface AlarmHistoryItem {
  /** 主键ID */
  id: string;
  /** 指标编码 */
  indexCode: string;
}

/**
 * 获取告警历史列表
 * @param params 查询参数
 */
export function fetchAlarmHistoryList(params: Api.AlarmHistory.SearchParams) {
  // ...
}

// ❌ 错误：无注释
interface AlarmHistoryItem {
  id: string;
  indexCode: string;
}

export function fetchAlarmHistoryList(params: any) {
  // ...
}
```

## 特殊场景处理

### 1. 分页响应类型

使用 `Api.Common.PageResult<T>` 而非自定义：

```typescript
// ✅ 正确
export function fetchBenchmarkList(params: Api.Benchmark.SearchParams) {
  return request<Api.Common.PageResult<Api.Benchmark.Item>>({
    url: '/benchmark/list',
    method: 'get',
    params
  });
}

// ❌ 错误：使用未导入的 PageResult
export function fetchBenchmarkList(params: Api.Benchmark.SearchParams) {
  return request<PageResult<Api.Benchmark.Item>>({  // PageResult 未定义！
    // ...
  });
}
```

### 2. 无返回值请求（create/update/delete）

**禁止使用 `request<void>`**，直接省略泛型参数：

```typescript
// ✅ 正确：无返回值请求不指定泛型
export function fetchDeleteBenchmark(id: number) {
  return request({
    url: `/benchmark/${id}`,
    method: 'delete'
  });
}

export function fetchCreateBenchmark(data: Api.Benchmark.CreateParams) {
  return request({
    url: '/benchmark',
    method: 'post',
    data
  });
}

// ❌ 错误：ESLint @typescript-eslint/no-invalid-void-type
export function fetchDeleteBenchmark(id: number) {
  return request<void>({  // void 只能作为返回类型或泛型参数！
    url: `/benchmark/${id}`,
    method: 'delete'
  });
}
```

**原因**：ESLint 规则 `@typescript-eslint/no-invalid-void-type` 禁止将 `void` 作为泛型参数使用。

### 3. 文件导出（Blob 响应）

使用 axios 直接请求，不走封装的 request：

```typescript
// ✅ 正确：使用 axios 直接请求
import axios from 'axios';
import { localStg } from '@/utils/storage';

export async function exportHistoricalData(params: Api.HistoricalData.Request) {
  const token = localStg.get('token');
  const response = await axios.get('/history/export', {
    params,
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

// ❌ 错误：request 不支持 responseType: 'blob'
export function exportHistoricalData(params: Api.HistoricalData.Request) {
  return request<Blob>({
    url: '/history/export',
    method: 'get',
    params,
    responseType: 'blob'  // 类型错误！
  });
}
```

### 4. 函数重名冲突

同一导出文件中函数名必须唯一：

```typescript
// ❌ 错误：comprehensive.ts 和 consumption-analysis.ts 都有 fetchGetEnergyRanking

// ✅ 解决：重命名
// comprehensive.ts
export function fetchGetEnergyRanking(params: Api.Comprehensive.ComprehensiveQuery) { }

// consumption-analysis.ts
export function fetchConsumptionEnergyRanking(params: Api.ConsumptionAnalysis.GetEnergyRankingParams) { }
```

### 5. 已有类型扩展

在现有类型文件中扩展，不创建新文件：

```typescript
// ✅ 正确：在 energy.d.ts 中添加 VirtualMeter 类型
declare namespace Api.Energy {
  // ... 现有类型

  /** 虚拟计量点 */
  interface VirtualMeter {
    id: number;
    code: string;
    name: string;
    // ...
  }
}

// ❌ 错误：创建单独的 virtual-meter.d.ts 定义 Energy 命名空间
```

## 重构检查清单

### 新增 API 模块时

- [ ] 在 `typings/api/` 创建对应的 `.d.ts` 文件
- [ ] 使用 `declare namespace Api.ModuleName { }` 定义类型
- [ ] 所有类型和字段添加 JSDoc 注释
- [ ] 在 `service/api/` 创建对应的 `.ts` 文件
- [ ] 直接引用 `Api.*` 类型，不定义本地 namespace
- [ ] 分页使用 `Api.Common.PageResult<T>`
- [ ] 无返回值请求不使用 `request<void>`
- [ ] 导出函数添加 JSDoc `@param` 注释
- [ ] **运行 TypeScript 检查**：`npx tsc --noEmit`
- [ ] **运行 ESLint 检查**：`pnpm lint`

### 重构现有模块时

1. **检查 typings/api 是否存在对应文件**
   - 存在 → 跳到步骤 3
   - 不存在 → 步骤 2

2. **创建 typings/api 文件**
   - 从 service/api 提取所有类型定义
   - 转换为 `declare namespace Api.ModuleName { }` 格式
   - 补充缺失的 `ListResponse` 等响应类型
   - 添加完整 JSDoc 注释

3. **简化 service/api 文件**
   - 删除所有 `export namespace` 和 `export interface`
   - 将类型引用改为 `Api.ModuleName.TypeName`
   - 分页响应使用 `Api.Common.PageResult<T>`
   - 无返回值请求不使用 `request<void>`
   - 文件导出改用 axios 直接请求
   - 添加 JSDoc 注释

4. **验证（CRITICAL）**
   - `npx tsc --noEmit` 无源码类型错误
   - `pnpm lint` 无 ESLint 错误
   - `pnpm build` 构建通过

## 命名空间层级规范

```
Api
├── Common (通用类型：PageResult, SelectOption 等)
├── ModuleName (模块名，如 Alarm, Saving)
│   ├── Item / EntityName (实体类型)
│   ├── SearchParams (查询参数)
│   ├── ListResponse (列表响应)
│   ├── CreateParams (创建参数)
│   ├── UpdateParams (更新参数)
│   └── SubModule (子模块，如 Saving.Program, Saving.Policy)
└── Energy (大型模块，包含多个子命名空间)
    ├── Medium
    ├── MeteringPoint
    ├── TouPeriod
    ├── VirtualMeter
    ├── Realtime
    ├── EnergyFlow
    ├── Ranking
    ├── Comparison
    └── Report
```

## 常见类型定义模板

```typescript
/**
 * ModuleName types
 * 模块描述
 */
declare namespace Api {
  namespace ModuleName {
    /**
     * 实体数据项
     */
    interface Item {
      /** 主键ID */
      id: number;
      /** 业务字段 */
      name: string;
      /** 创建时间 */
      createdAt: string;
      /** 更新时间 */
      updatedAt: string;
    }

    /**
     * 查询参数
     */
    interface SearchParams {
      /** 页码 */
      page: number;
      /** 每页数量 */
      pageSize: number;
      /** 可选筛选字段 */
      name?: string;
      status?: number;
    }

    /**
     * 创建参数
     */
    interface CreateParams {
      /** 必填字段 */
      name: string;
      /** 可选字段 */
      description?: string;
    }

    /**
     * 更新参数
     */
    interface UpdateParams {
      /** 主键ID */
      id: number;
      /** 可更新字段 */
      name?: string;
      description?: string;
    }
  }
}
```

## 相关文件

- 类型定义目录：`src/typings/api/`
- 请求函数目录：`src/service/api/`
- 请求封装：`src/service/request/index.ts`
- 通用类型：`src/typings/api/common.d.ts`

---

**最后更新**: 2026-04-06