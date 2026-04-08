# TypeScript 类型约束最佳实践

> 本文档总结了前端开发中常见的类型错误及其解决方案，防止新增文件重复犯错。
> 相关实战复盘：`experience/typescript-eslint-fix-2026-04-07.md`

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

## 2. FlatResponseData 类型解构（CRITICAL）

### 问题

API 返回值直接赋值导致类型不匹配：

```typescript
// ❌ 错误：FlatResponseData 不能直接赋值
tableData.value = await fetchYearProcessEnergyList(params);
```

### 原因

`FlatResponseData<T>` 是包装类型，包含 `{ data, error }` 结构，必须解构获取实际数据。

### 解决方案

解构获取 data 属性：

```typescript
// ✅ 正确：解构获取 data
const { data: res } = await fetchYearProcessEnergyList(params);
tableData.value = res || [];
```

---

## 3. useUIPaginatedTable 泛型参数（CRITICAL）

### 问题

泛型推断失败导致 `data` 类型为 `never[]`：

```typescript
// ❌ 错误：缺少泛型参数，data 类型推断为 never[]
const { data } = useUIPaginatedTable({
  api: () => fetchList(searchParams.value),
  columns: () => [...]
});
```

### 解决方案

添加完整泛型参数：

```typescript
// ✅ 正确：添加完整泛型参数
const { data } = useUIPaginatedTable<
  FlatResponseData<App.Service.Response<any>, Api.Common.PageResult<Api.Item>>,
  Api.Item
>({
  api: () => fetchList(searchParams.value),
  transform: defaultTransform,
  columns: () => [...]
});
```

---

## 4. 空接口改为类型别名（ESLint）

### 问题

ESLint `@typescript-eslint/no-empty-object-type` 错误：

```typescript
// ❌ 错误：空接口
interface ListResponse extends Api.Common.PageResult<Item> {}
```

### 解决方案

使用类型别名：

```typescript
// ✅ 正确：使用类型别名
type ListResponse = Api.Common.PageResult<Item>;
```

---

## 5. Element Plus 组件导入

### 问题

使用 `ElMessage`、`ElMessageBox` 等全局组件时未导入：

```typescript
// ❌ 错误：TS2304 Cannot find name 'ElMessage'
ElMessage.success('操作成功');
```

### 解决方案

添加显式导入：

```typescript
// ✅ 正确：显式导入
import { ElMessage } from 'element-plus';

ElMessage.success('操作成功');
```

---

## 6. Element Plus 严格类型约束（CRITICAL）

### ElTag type 属性

```typescript
// ❌ 错误：string 类型过于宽泛
const colorMap: Record<number, string> = { 1: 'primary' };

// ✅ 正确：使用联合类型限制
const colorMap: Record<number, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  1: 'primary',
  2: 'success'
};
```

### ThemeColor 类型（无 'default'）

```typescript
// ❌ 错误：'default' 不在 UI.ThemeColor 中
const colorMap = { 6: { label: '自定义', type: 'default' } };

// ✅ 正确：使用有效的 ThemeColor
// UI.ThemeColor = 'danger' | 'primary' | 'info' | 'success' | 'warning'
const colorMap = { 6: { label: '自定义', type: 'primary' } };
```

### ElStatistic 值类型

```typescript
// ❌ 错误：字符串类型
const summary = {
  totalCost: totalCost.toFixed(2),  // string
};

// ✅ 正确：数字类型
const summary = {
  totalCost: Number(totalCost.toFixed(2)),  // number
};
```

---

## 7. DatePicker 值类型（value-format）

### 问题

`value-format` 指定字符串格式，但变量类型为 Date：

```typescript
// ❌ 错误：Date 类型与 value-format 不匹配
const queryDate = ref<Date>(new Date());

<ElDatePicker v-model="queryDate" value-format="YYYY-MM-DD" />
```

### 解决方案

使用字符串类型：

```typescript
// ✅ 正确：使用字符串类型
const queryDate = ref<string>(new Date().toISOString().split('T')[0]);
```

---

## 8. Vue Router 使用方式

### 问题

`window.$router` 类型问题：

```typescript
// ❌ 错误：window.$router 可能不存在
window.$router?.push({ path: '/xxx' });
```

### 解决方案

使用 useRouter composable：

```typescript
// ✅ 正确：使用 useRouter
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ path: '/xxx' });
```

---

## 9. v-for key 重复问题

### 问题

同时使用 `:key` 和 `v-bind` 导致 key 被覆盖：

```vue
<!-- ❌ 错误：key 在 col 中已存在 -->
<ElTableColumn v-for="col in columns" :key="col.key" v-bind="col">
```

### 解决方案

使用索引或移除重复 key：

```vue
<!-- ✅ 正确：使用索引 -->
<ElTableColumn v-for="(col, index) in columns" :key="index" v-bind="col">
```

---

## 10. useTableOperate 返回值解构

### 问题

使用 `useTableOperate` 时遗漏必要属性的解构：

```typescript
// ❌ 错误：模板中使用了 checkedRowKeys、handleAdd、editingData 但未解构
const { drawerVisible, operateType, handleEdit, onDeleted } = useTableOperate(data, 'id', getData);
```

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

## 11. I18n 国际化键类型

### 问题

使用非预定义的 i18n 键：

```typescript
// ❌ 错误：TS2345 Argument of type '"common.restore"' is not assignable to parameter of type 'I18nKey'
$t('common.restore')
```

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

## 12. null 与 undefined 类型兼容

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

## 13. RouteMeta 类型扩展

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

## 14. API 请求类型定义

### 问题

后端返回结构与前端类型定义不匹配。

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

## 15. 表格列类型定义

### 问题

v-for 循环中列属性类型推断不完整：

```typescript
// ❌ 错误：类型推断为联合类型，缺少某些属性
const tableColumns = computed(() => {
  const baseColumns = [
    { prop: 'name', label: '名称', width: 150, fixed: 'left' as const }
  ];
  // dayColumns 没有 fixed 属性，导致联合类型
});
```

### 解决方案

定义明确的接口类型：

```typescript
// ✅ 正确：定义明确的接口类型
interface TableColumn {
  prop: string;
  label: string;
  width: number;
  fixed?: 'left';
  align?: 'center';
  formatter?: (row: Api.Item) => string;
}

const tableColumns = computed<TableColumn[]>(() => {
  // ...
});
```

---

## 16. 类型定义补全

### 问题

使用不存在的属性：

```typescript
// ScheduleCalendarSearchParams 缺少 year 和 month
interface ScheduleCalendarSearchParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  // ...缺少 year, month
}
```

### 解决方案

在对应 `.d.ts` 文件中补全缺失字段：

```typescript
interface ScheduleCalendarSearchParams {
  page?: number;
  pageSize?: number;
  year?: number;      // 新增
  month?: number;     // 新增
  startDate?: string;
  // ...
}
```

---

## 17. 移除未使用的导入

### 问题

导入但未使用的类型：

```typescript
// ❌ 错误：导入未使用
import type { FormInstance } from 'element-plus';
import type { Api } from '@/typings/api';
```

### 解决方案

移除未使用的导入：

```typescript
// ✅ 正确：移除未使用的导入
// 使用全局命名空间 Api，无需导入
```

---

## 18. 常见类型错误速查表

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| TS2307 | 找不到模块 | 检查是否需要导入（全局命名空间无需导入） |
| TS2304 | 找不到名称 | 添加缺失的导入（如 `ElMessage`） |
| TS2322 | 类型不匹配 | 检查类型定义，使用类型断言或修改类型 |
| TS2339 | 属性不存在 | 扩展类型定义或解构缺失属性 |
| TS2345 | 参数类型不匹配 | 使用正确的类型或添加类型断言 |
| TS2741 | 缺少必需属性 | 添加缺失的属性到对象/解构 |

---

## 19. I18n 翻译键完整流程

### 问题

新增路由或功能时，i18n 类型检查报错：

```
TS2740: Type '{ ... }' is missing the following properties from type 'Record<I18nRouteKey, string>': "energy_dashboard", ...
TS2353: Object literal may only specify known properties, and 'restore' does not exist in type '{ ... }'
```

### 解决方案

三个文件必须同步更新：

1. `src/typings/app.d.ts` - 类型定义
2. `src/locales/langs/zh-cn.ts` - 中文翻译
3. `src/locales/langs/en-us.ts` - 英文翻译

---

## 20. 类型检查命令

```bash
# TypeScript 类型检查（只看 src/ 目录）
pnpm vue-tsc --noEmit 2>&1 | grep "^src/"

# ESLint 检查（只看错误）
pnpm eslint . 2>&1 | grep -E "^\s+[0-9]+:[0-9]+\s+error"
```

---

## 22. 遗留 ESLint 问题（非本次修复范围）

以下 ESLint 错误为项目已存在质量问题：
- `no-console` 警告（多处 console 语句）
- `@typescript-eslint/no-unused-vars`（未使用变量）
- `default-case`（缺少 default 分支）
- `no-warning-comments`（TODO 注释）
- `vue/no-mutating-props`（直接修改 props）

---

## 23. tsconfig.json skipLibCheck 配置（CRITICAL）

### 问题

第三方库类型定义问题导致构建失败：

```
node_modules/.pnpm/@amap+amap-jsapi-types@0.0.15/.../index.d.ts(1078,18): error TS2304: Cannot find name 'Resource'.
node_modules/.pnpm/@antv+g-lite@2.3.2/.../Camera.d.ts(21,5): error TS2416: Property 'canvas' ...
```

### 原因

第三方库（如 `@amap/amap-jsapi-types`、`@antv/g-lite`）的类型定义存在内部问题，项目无法控制。

### 解决方案

在 `tsconfig.json` 中启用 `skipLibCheck`：

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### 效果

- 跳过对所有 `node_modules/**/*.d.ts` 的类型检查
- 仅检查项目源码的类型正确性
- 不影响项目自身代码的类型检查严格性

---

## 24. Vue 模板内联颜色值问题（CRITICAL）

### 问题

`vue-tsc` 解析模板中的内联颜色值时报错：

```vue
<!-- ❌ 错误：TS1127 Invalid character at position 101 -->
<ElProgress :color="#10B981">
  <template #default="{ percentage }">
    {{ percentage }}%
  </template>
</ElProgress>
```

### 原因

模板中的 `#` 字符在 vue-tsc 生成的中间代码中被错误解析。

### 解决方案

将颜色值提取为变量：

```vue
<script setup lang="ts">
// ✅ 正确：颜色值提取为常量
const greenColor = '#10B981';
const yellowColor = '#F59E0B';
const redColor = '#EF4444';

const healthColor = computed(() =>
  healthRate.value >= 90 ? greenColor : healthRate.value >= 70 ? yellowColor : redColor
);
</script>

<template>
  <!-- ✅ 正确：使用变量绑定 -->
  <ElProgress :color="greenColor">
    <template #default="slotProps">
      {{ slotProps.percentage }}%
    </template>
  </ElProgress>
</template>
```

### 适用场景

- `ElProgress` 的 `:color` 属性
- `ElTag` 的 `:color` 属性
- 其他需要颜色值的组件属性

---

## 25. try-catch 参数缺失问题

### 问题

`catch` 块缺少参数但使用了 `_error` 变量：

```typescript
// ❌ 错误：_error 未定义
try {
  await fetchData();
} catch {
  console.error('获取数据失败:', _error);
}
```

### 解决方案

添加 `error` 参数：

```typescript
// ✅ 正确：添加 error 参数
try {
  await fetchData();
} catch (error) {
  console.error('获取数据失败:', error);
}
```

---

## 26. Element Plus TabPaneName 类型兼容

### 问题

`@tab-change` 回调参数类型不匹配：

```typescript
// ❌ 错误：TS2322 Type '(tab: string) => void' is not assignable to type '(name: TabPaneName) => any'
function handleTabChange(tab: string) {
  // ...
}
```

### 解决方案

参数类型改为 `string | number`：

```typescript
// ✅ 正确：兼容 TabPaneName 类型
function handleTabChange(tab: string | number) {
  const tabStr = String(tab);
  // 使用 tabStr 进行字符串比较
}
```

---

## 27. 代码修改后必检规范（CRITICAL）

### 强制要求

**每次编写或修改文件后，必须执行 TypeScript 和 ESLint 检查。**

### 检查时机

| 场景 | 必须检查 |
|------|---------|
| 新建文件 | TypeScript + ESLint |
| 修改现有文件 | TypeScript + ESLint |
| 重构代码 | TypeScript + ESLint |
| 提交代码前 | TypeScript + ESLint |

### 常见错误修复

| 检查工具 | 错误示例 | 修复方案 |
|---------|---------|---------|
| TypeScript | `TS2304: Cannot find name 'PageResult'` | 使用 `Api.Common.PageResult<T>` |
| TypeScript | `TS2741: missing properties` | 补充缺失的类型属性 |
| ESLint | `@typescript-eslint/no-invalid-void-type` | `request<void>` → `request({...})` |
| ESLint | `@typescript-eslint/no-empty-object-type` | `interface X extends Y {}` → `type X = Y` |

### 验证标准

```bash
# 通过标准：源码文件无错误输出
pnpm vue-tsc --noEmit 2>&1 | grep "^src/" | wc -l
# 期望输出：0
```

---

## 22. 遗留 ESLint 问题（非本次修复范围）

以下 ESLint 错误为项目已存在质量问题：
- `no-console` 警告（多处 console 语句）
- `@typescript-eslint/no-unused-vars`（未使用变量）
- `default-case`（缺少 default 分支）
- `no-warning-comments`（TODO 注释）
- `vue/no-mutating-props`（直接修改 props）

---

**最后更新**: 2026-04-08