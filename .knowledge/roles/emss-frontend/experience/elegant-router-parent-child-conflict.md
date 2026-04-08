---
description: "elegant-router 父子路由冲突修复：父级路由目录同时有 index.vue 和子目录导致类型错误"
triggers:
  - "elegant-router"
  - "layout.base$view"
  - "GeneratedRoute"
  - "TS2322"
  - "component type incompatible"
date: "2026-04-06"
files:
  - "src/views/analysis/statistical/index.vue"
  - "src/router/elegant/routes.ts"
status: "archived"  # 2026-04-08: 示例路径已更新，statistical 移动到 analysis/statistical
---

# elegant-router 父子路由冲突修复

## 问题现象

TypeScript 报错：
```
TS2322: Type '{ name: "statistical"; path: "/statistical"; component: "layout.base"; ... }' 
is not assignable to type 'GeneratedRoute'.
Types of property 'component' are incompatible.
Type 'layout.base' is not assignable to type 'layout.base$view.statistical | layout.blank$view.statistical'.
```

## 问题原因

目录结构冲突：
```
views/analysis/statistical/
├── index.vue          ← 父级路由的视图（冲突）
├── cost/index.vue     ← 子路由
├── flow/index.vue     ← 子路由
└── yoy-mom/index.vue  ← 子路由
```

elegant-router 检测到 `statistical/index.vue` 存在，期望生成 `layout.base$view.analysis_statistical` 组件类型。但同时 `statistical` 有子目录，被识别为父级路由，生成 `layout.base` 组件。

**类型冲突**：
- 实际生成：`component: 'layout.base'`（父级路由）
- 类型期望：`component: 'layout.base$view.analysis_statistical'`（有视图的路由）

## 解决方案

**删除父级目录的 `index.vue`**，使路由成为纯父级路由：

```bash
rm src/views/analysis/statistical/index.vue
```

重新构建后，elegant-router 生成正确的类型。

## 路由结构规则

| 路由类型 | 目录结构 | component |
|---------|---------|-----------|
| 叶子路由 | `xxx/index.vue`（无子目录） | `layout.base$view.xxx` |
| 父级路由 | `xxx/`（有子目录，无 index.vue） | `layout.base` |
| **冲突** | `xxx/index.vue` + 子目录 | 类型错误 ❌ |

## 正确模式

**父级路由（无视图）**：
```
views/energy/
├── dashboard/index.vue
├── flow/index.vue
└── comparison/index.vue
```
生成：`{ name: 'energy', component: 'layout.base', children: [...] }`

**叶子路由（有视图）**：
```
views/home/
└── index.vue
```
生成：`{ name: 'home', component: 'layout.base$view.home' }`

## 如果需要父级默认视图

若父级路由需要默认内容，创建子路由：
```
views/energy/
├── home/index.vue        ← /energy 路由
├── dashboard/index.vue
└── flow/index.vue
```

## 相关文件

- elegant-router 类型定义：`src/typings/elegant-router.d.ts`
- 自动生成路由：`src/router/elegant/routes.ts`
- 自动生成导入：`src/router/elegant/imports.ts`

---

**最后更新**: 2026-04-06