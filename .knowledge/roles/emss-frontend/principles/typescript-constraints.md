# TypeScript 类型约束最佳实践

> 本文档总结了前端开发中常见的类型错误及其解决方案，防止新增文件重复犯错。

---

## 1. 全局命名空间类型（无需导入）

### 问题

以下错误导入会导致 TS2307 错误：

```typescript
// ❌ 错误：全局命名空间不需要导入
import type { Api } from '@/typings/api';
```

### 原因

`src/typings/api/*.d.ts` 文件使用 `declare namespace Api` 声明全局命名空间，TypeScript 会自动识别，无需显式导入。

### 解决方案

直接使用全局命名空间：

```typescript
// ✅ 正确：直接使用全局类型
const data = ref<Api.Shift.ShiftType[]>([]);
```

---

## 2. useTableOperate 返回值解构

### 问题

使用 `useTableOperate` 时遗漏必要属性的解构：

```typescript
// ❌ 错误：模板中使用了 checkedRowKeys、handleAdd、editingData 但未解构
const { drawerVisible, operateType, handleEdit, onDeleted } = useTableOperate(data, 'id', getData);
```

### 原因

`useTableOperate` 返回的对象包含所有表格操作相关属性，必须解构出模板中使用的所有属性。

### 解决方案

完整解构所需属性：

```typescript
// ✅ 正确：解构所有需要的属性
const {
  drawerVisible,
  operateType,
  handleAdd,      // 新增操作
  handleEdit,     // 编辑操作
  editingData,    // 编辑数据
  checkedRowKeys, // 选中行
  onDeleted       // 删除回调
} = useTableOperate(data, 'id', getData);
```

### useTableOperate 完整返回值

```typescript
{
  drawerVisible,    // 抽屉可见性
  openDrawer,       // 打开抽屉
  closeDrawer,      // 关闭抽屉
  operateType,      // 操作类型 ('add' | 'edit')
  handleAdd,        // 新增处理函数
  editingData,      // 编辑数据
  handleEdit,       // 编辑处理函数
  checkedRowKeys,   // 选中行 keys
  onBatchDeleted,   // 批量删除回调
  onDeleted         // 删除回调
}
```

---

## 3. Element Plus 组件导入

### 问题

使用 `ElMessage`、`ElMessageBox` 等全局组件时未导入：

```typescript
// ❌ 错误：TS2304 Cannot find name 'ElMessage'
ElMessage.success('操作成功');
```

### 原因

虽然项目配置了 Element Plus 自动导入，但 TypeScript 类型检查时需要显式导入。

### 解决方案

添加显式导入：

```typescript
// ✅ 正确：显式导入
import { ElMessage } from 'element-plus';

ElMessage.success('操作成功');
```

---

## 4. I18n 国际化键类型

### 问题

使用非预定义的 i18n 键：

```typescript
// ❌ 错误：TS2345 Argument of type '"common.restore"' is not assignable to parameter of type 'I18nKey'
$t('common.restore')
```

### 原因

`$t` 函数的参数类型为 `I18nKey`，必须是 `@/locales/langs` 中已定义的键。

### 解决方案

1. **添加缺失的翻译键**：

```typescript
// zh-cn.ts
common: {
  restore: '恢复',
  // ...
}
```

2. **或使用字符串拼接（动态键）**：

```typescript
// 动态键需要类型断言
$t(`common.${action}` as I18n.I18nKey)
```

---

## 5. null 与 undefined 类型兼容

### 问题

`null` 不能赋值给 `string | undefined` 类型：

```typescript
// ❌ 错误：TS2322 Type 'null' is not assignable to type 'string | undefined'
const value: string | undefined = null;
```

### 解决方案

使用 `undefined` 替代 `null`，或修改类型定义：

```typescript
// ✅ 方案1：使用 undefined
const value: string | undefined = undefined;

// ✅ 方案2：类型包含 null
const value: string | undefined | null = null;
```

---

## 6. RouteMeta 类型扩展

### 问题

后端路由元信息类型缺少自定义字段：

```typescript
// ❌ 错误：TS2339 Property 'i18nKey' does not exist on type 'RouteMeta'
const key = route.meta.i18nKey;
```

### 解决方案

在 `src/typings/api/route.d.ts` 中扩展类型：

```typescript
interface RouteMeta {
  title: string;
  i18nKey?: App.I18n.I18nKey;  // 添加缺失字段
  icon?: string;
  // ...
}
```

---

## 7. API 请求类型定义

### 问题

后端返回结构与前端类型定义不匹配：

```typescript
// ❌ 错误：后端返回 { list, total } 但类型期望 { records, current, size, total }
```

### 解决方案

使用 `defaultTransform` 处理后端响应格式：

```typescript
import { defaultTransform } from '@/hooks/common/table';

const result = useUIPaginatedTable({
  api: fetchGetData,
  transform: response => defaultTransform(response), // 自动处理多种格式
});
```

---

## 8. 常见类型错误速查表

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| TS2307 | 找不到模块 | 检查是否需要导入（全局命名空间无需导入） |
| TS2304 | 找不到名称 | 添加缺失的导入（如 `ElMessage`） |
| TS2322 | 类型不匹配 | 检查类型定义，使用类型断言或修改类型 |
| TS2339 | 属性不存在 | 扩展类型定义或解构缺失属性 |
| TS2345 | 参数类型不匹配 | 使用正确的类型或添加类型断言 |
| TS2741 | 缺少必需属性 | 添加缺失的属性到对象/解构 |

---

## 9. 类型检查命令

```bash
# 运行类型检查
pnpm run typecheck

# 只检查特定文件
pnpm run typecheck -- --noEmit src/views/energy/dashboard/index.vue
```

---

**最后更新**: 2026-04-01