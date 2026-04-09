---
description: "审计日志前端模块架构：API 封装、类型定义、页面组件"
triggers:
  - "审计日志"
  - "audit"
  - "操作记录"
  - "日志页面"
---

# 审计日志前端模块

## 概述

审计日志前端模块与后端 `plugin/audit/` 插件对接，提供统一的审计日志查询、详情查看和过期清理功能。

---

## 目录结构

```
web/src/
├── service/api/
│   └── audit.ts                    # 审计 API 封装
├── typings/api/
│   └── audit.d.ts                  # 审计类型定义
└── views/manage/
    └── audit-log/
        └── index.vue               # 审计日志页面
```

---

## API 封装

文件：`src/service/api/audit.ts`

### 可用函数

| 函数 | 用途 |
|------|------|
| `fetchGetAuditLogList(params)` | 获取审计日志列表（分页） |
| `fetchGetAuditLogById(id)` | 获取审计日志详情 |
| `fetchGetAuditStatistics(params)` | 获取审计统计 |
| `fetchCleanupAuditLogs(data)` | 清理过期日志 |
| `fetchGetAuditCategories()` | 获取审计分类列表 |
| `fetchGetAuditActions()` | 获取操作类型列表 |
| `fetchExportAuditLogs(params)` | 导出审计日志 |

---

## 类型定义

文件：`src/typings/api/audit.d.ts`

### 核心类型

```typescript
declare namespace Api.Audit {
  // 审计日志项
  interface AuditLogItem {
    id: number;
    userId: number;
    username: string;
    action: string;          // login, logout, create, update, delete...
    category: string;        // security, operation, compliance
    module: string;
    requestMethod: string;
    requestPath: string;
    responseStatus: number;
    latencyMs: number;
    ipAddress: string;
    status: string;          // success, failed
    createdAt: string;
    // ...
  }

  // 搜索参数
  interface AuditLogSearchParams {
    page: number;
    pageSize: number;
    userId?: number;
    username?: string;
    action?: string;
    category?: string;
    module?: string;
    startTime?: string;
    endTime?: string;
    ipAddress?: string;
    status?: string;
  }
}
```

---

## 使用示例

### 查询审计日志

```typescript
import { fetchGetAuditLogList } from '@/service/api/audit';

const { data } = await fetchGetAuditLogList({
  page: 1,
  pageSize: 30,
  category: 'security',
  startTime: '2026-04-01'
});
```

### 记录操作审计（后端侧）

前端无需主动记录操作审计，后端通过 `middleware.OperationRecord()` 自动记录 API 调用。

---

## 与旧 OperationRecord 模块的关系

| 旧模块 | 新模块 | 说明 |
|--------|--------|------|
| `views/manage/operation-record/` | `views/manage/audit-log/` | 页面迁移 |
| `fetchGetOperationRecordList` | `fetchGetAuditLogList` | API 迁移 |
| `Api.SystemManage.OperationRecord` | `Api.Audit.AuditLogItem` | 类型迁移 |

**注意**：`OperationRecord` 相关代码已完全删除，使用审计日志模块替代。

---

## 页面功能

### 审计日志列表

- 分类筛选：security / operation / compliance
- 操作类型筛选：login, logout, create, update, delete...
- 用户名/IP 搜索
- 时间范围筛选

### 详情查看

- 完整日志信息展示
- 请求/响应 Body 查看
- 错误信息展示

### 过期清理

- 可配置保留天数
- 支持预览模式（dry-run）
- 批量清理功能

---

**最后更新**: 2026-04-09