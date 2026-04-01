---
description: "2026-04-01 路由层级结构与 parentName 同步修复经验"
triggers:
  - "路由层级"
  - "parentName"
  - "菜单结构"
  - "扁平化路由"
date: 2026-04-01
source:
  - "联调测试"
related:
  - "roles/emss-frontend/skills/route-sync-development.md"
---

# 路由层级结构与 parentName 同步修复

## 问题描述

前端菜单显示为扁平列表，无层级结构。用户反馈：
1. 菜单无层级结构（所有路由平铺显示）
2. 菜单显示英文 `route.xxx` 格式，无中文翻译

## 根因分析

### 1. parentName 未正确传递

**前端问题**：`collectRoutesByType` 函数递归处理子路由时，未传递 `parentName` 参数。

```typescript
// 错误：递归时未传递 parentName
function collect(items: GeneratedRoute[]) {
  items.forEach(item => {
    // ... 
    if (children && children.length > 0) {
      collect(children as unknown as GeneratedRoute[]); // 缺少 parentName
    }
  });
}

// 正确：递归时传递当前路由名称作为父级
function collect(items: GeneratedRoute[], parentName: string = '') {
  items.forEach(item => {
    const routeItem: Api.Route.FrontendRouteItem = {
      name: item.name,
      path: item.path,
      component: item.component,
      parentName: parentName || undefined, // 关键：传递父级名称
      meta: item.meta as Record<string, unknown> | undefined
    };
    // ...
    if (children && children.length > 0) {
      collect(children as unknown as GeneratedRoute[], item.name as string);
    }
  });
}
```

### 2. 类型定义缺失

`FrontendRouteItem` 接口缺少 `parentName` 字段定义：

```typescript
// 添加 parentName 字段
interface FrontendRouteItem {
  name: string;
  path: string;
  component?: string;
  parentName?: string; // 新增
  meta?: Record<string, unknown>;
  children?: FrontendRouteItem[];
}
```

### 3. i18nKey 未自动生成

后端返回的路由没有 `i18nKey` 字段，只有 `title` 字段包含路由名称。

```typescript
// 在 transformBackendRoutesToElegantRoutes 中添加自动生成逻辑
const generateI18nKey = (title: string, name: string): string | undefined => {
  // 如果 title 是中文，说明已经是翻译后的文本
  if (title && /[\u4e00-\u9fa5]/.test(title)) {
    return undefined;
  }
  // 否则使用 route.{name} 格式
  return `route.${name}`;
};

const i18nKey = route.meta?.i18nKey || generateI18nKey(route.meta?.title || '', route.name);
```

## 解决方案

### 前端修改

1. **类型定义** (`web/src/typings/api/route.d.ts`)
   - 添加 `parentName?: string` 字段

2. **路由收集** (`web/src/store/modules/route/index.ts`)
   - 修改 `collectRoutesByType` 函数，递归时传递 `parentName`
   - 添加 `transformBackendRoutesToElegantRoutes` 中的 i18nKey 自动生成逻辑

3. **国际化** (`web/src/locales/langs/zh-cn.ts`)
   - 补充缺失的路由翻译：
     - `shift-schedule: '班组排班管理'`
     - `energy_base-data_meter: '计量点管理'`
     - `energy_dashboard: '能耗看板'`
     - 等 12 个路由翻译

### 后端修改

1. **请求结构** (`server/model/request/sys_route_menu.go`)
   - 添加 `ConstantRoutes []RouteSyncItem` 字段

2. **同步逻辑** (`server/service/system/route_menu_service.go`)
   - 直接使用前端发送的扁平路由数据（前端已传递 parentName）
   - 支持废弃路由恢复：当路由重新出现时，将状态从废弃恢复为启用
   - 查询现有路由时包含废弃状态，避免唯一约束冲突

3. **树构建** (`buildElegantRouteTreeByParentName`)
   - 使用 parentName 映射正确构建层级关系
   - 一次查询获取所有 parentName，避免循环查询

## 关键代码模式

### 扁平化路由正确处理

```go
// 前端已发送扁平化路由（带 parentName），直接使用
allFlatRoutes := append(req.Routes, req.ConstantRoutes...)

// 不再调用 flattenSyncRoutes，避免覆盖前端传递的 parentName
```

### 废弃路由恢复

```go
// 检查是否需要更新或恢复
if s.needsUpdate(existing, route) || existing.Status == int(system.RouteMenuStatusObsolete) {
    s.mergeRoute(existing, route, operatorId)
    // 如果是废弃路由，恢复为启用状态
    if existing.Status == int(system.RouteMenuStatusObsolete) {
        existing.Status = int(system.RouteMenuStatusEnabled)
        existing.ObsoleteAt = nil
    }
}
```

### 树形结构构建

```go
// 1. 从数据库获取所有路由的 ParentName 信息
// 2. 构建 name -> ElegantRoute 映射
// 3. 构建 name -> ParentName 映射
// 4. 遍历路由，根据 parentName 分类为根路由或子路由
// 5. 递归设置子路由
```

## 测试验证

```bash
# 1. 检查后端返回的路由是否包含 children
curl -s "http://localhost:8888/api/v1/route-menu/user-routes" -H "Authorization: Bearer $TOKEN" | grep -o '"children":\[' | wc -l

# 2. 检查数据库 parentName 是否正确保存
curl -s "http://localhost:8888/api/v1/route-menu/list?page=1&pageSize=10" | grep -o '"parentName":"[^"]*"'

# 3. 浏览器验证菜单结构
agent-browser --cdp 9222 snapshot -i -d 3 | grep -E "menuitem|expanded"
```

## 注意事项

1. **前端路由扁平化时机**：前端应在发送前完成扁平化，并设置好 parentName
2. **废弃路由恢复**：同步时需要检查废弃状态的路由，避免唯一约束冲突
3. **版本号缓存**：修改路由结构后需清除 `ems_route_version` 缓存强制重新同步
4. **i18nKey 格式**：统一使用 `route.{name}` 格式，locale 文件中定义对应翻译

## 相关文件

| 文件 | 修改内容 |
|------|----------|
| `web/src/typings/api/route.d.ts` | 添加 parentName 字段 |
| `web/src/store/modules/route/index.ts` | collectRoutesByType 传递 parentName |
| `web/src/locales/langs/zh-cn.ts` | 补充路由翻译 |
| `server/model/request/sys_route_menu.go` | 添加 ConstantRoutes 字段 |
| `server/service/system/route_menu_service.go` | 修复同步和树构建逻辑 |