# 按钮权限使用指南

> 2026-04-01 实现按钮级精细化权限控制

## 功能概述

按钮权限用于控制页面内操作按钮的显示/隐藏，实现精细化权限控制。

## 使用方式

### 方式一：指令方式（推荐）

```vue
<template>
  <!-- 单个权限 -->
  <el-button v-permission="'user:create'" type="primary">新增用户</el-button>
  
  <!-- 多个权限（满足任一即可） -->
  <el-button v-permission="['user:update', 'user:delete']">操作</el-button>
  
  <!-- 多个权限（需全部满足） -->
  <el-button v-permission.all="['user:view', 'user:export']">导出</el-button>
</template>
```

### 方式二：组合式函数

```typescript
import { useButtonPermission } from '@/hooks/common/permission';

const { hasPermission, hasAnyPermission, hasAllPermissions } = useButtonPermission();

// 单个权限检查
if (hasPermission('user:delete')) {
  await deleteUser(id);
}

// 任一权限检查
if (hasAnyPermission(['user:update', 'user:admin'])) {
  // ...
}

// 全部权限检查
if (hasAllPermissions(['user:view', 'user:export'])) {
  // ...
}
```

### 方式三：直接导入函数

```typescript
import { hasPermission } from '@/directives/permission';

if (hasPermission('user:create')) {
  // ...
}
```

## 权限码命名规范

```
格式：{routeName}:{operation}

常用操作类型：
- create  新增
- update  编辑
- delete  删除
- export  导出
- import  导入
- assign  分配权限
- approve 审批
- view    查看详情

示例：
- user:create      用户管理-新增
- user:update      用户管理-编辑
- user:delete      用户管理-删除
- user:export      用户管理-导出
- role:assign      角色管理-分配权限
```

## 权限配置

### 配置入口

角色管理 → 点击"配置权限" → 切换到"按钮权限" Tab

### 配置流程

1. 选择要配置的角色
2. 在树形结构中勾选需要授权的按钮
3. 点击"保存"按钮

### 权限继承

- 子角色自动继承父角色的按钮权限
- 被标记为"拒绝"的按钮权限优先级最高

## 注意事项

1. **超级管理员**：userId=1 的用户自动拥有所有按钮权限
2. **权限检查时机**：组件挂载时检查，无权限时直接移除 DOM 元素
3. **刷新权限**：用户登录后自动获取按钮权限，角色变更后需重新登录

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/store/modules/button-permission.ts` | 按钮权限状态管理 |
| `src/directives/permission.ts` | v-permission 指令实现 |
| `src/hooks/common/permission.ts` | useButtonPermission 组合式函数 |
| `src/views/manage/role/modules/button-auth-tab.vue` | 权限配置组件 |
| `src/service/api/system-manage.ts` | API 接口定义 |

## 示例：完整按钮权限控制

```vue
<script setup lang="ts">
import { useButtonPermission } from '@/hooks/common/permission';

const { hasPermission } = useButtonPermission();

// 根据权限显示不同的操作列
const columns = computed(() => [
  { prop: 'name', label: '名称' },
  { prop: 'status', label: '状态' },
  {
    prop: 'actions',
    label: '操作',
    width: 200,
    hide: !hasPermission('user:update') && !hasPermission('user:delete')
  }
]);
</script>

<template>
  <div>
    <div class="mb-16px">
      <el-button v-permission="'user:create'" type="primary">新增</el-button>
    </div>
    
    <el-table :data="tableData">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button v-permission="'user:update'" link @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm v-permission="'user:delete'" title="确认删除？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```