# TypeScript & ESLint 批量修复复盘

> 日期：2026-04-07
> 影响范围：`src/views/` 下多个模块
> 修复结果：TypeScript 错误从 350+ 降至 0，ESLint 错误从 73 降至 68（剩余均为项目已存在质量问题）

---

## 问题背景

前端项目存在大量 TypeScript 类型错误，主要集中在：
- FlatResponseData 类型处理不当
- useUIPaginatedTable 泛型参数缺失
- 空接口定义问题
- Element Plus 组件类型不匹配
- API 参数类型不正确

---

## 关键修复模式

### 1. FlatResponseData 类型解构

**问题**：API 返回值直接赋值导致类型不匹配

```typescript
// ❌ 错误：FlatResponseData 不能直接赋值
tableData.value = await fetchYearProcessEnergyList(params);

// ✅ 正确：解构获取 data
const { data: res } = await fetchYearProcessEnergyList(params);
tableData.value = res || [];
```

**影响文件**：
- `src/views/process-energy/statistics/year/index.vue`
- `src/views/process-energy/statistics/monthly/index.vue`
- `src/views/statistical/cost/index.vue`
- `src/views/statistical/yoy-mom/index.vue`
- `src/views/statistical/flow/index.vue`

---

### 2. useUIPaginatedTable 泛型参数

**问题**：泛型推断失败导致 `data` 类型为 `never[]`

```typescript
// ❌ 错误：缺少泛型参数，data 类型推断为 never[]
const { data } = useUIPaginatedTable({
  api: () => fetchList(searchParams.value),
  columns: () => [...]
});

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

**影响文件**：
- `src/views/productoutput/index.vue`
- `src/views/spikesandvalleys/index.vue`
- `src/views/saving/policy/index.vue`
- `src/views/saving/program/index.vue`
- `src/views/processenergy/index.vue`

---

### 3. 空接口改为类型别名

**问题**：ESLint `@typescript-eslint/no-empty-object-type` 错误

```typescript
// ❌ 错误：空接口
interface ListResponse extends Api.Common.PageResult<Item> {}

// ✅ 正确：使用类型别名
type ListResponse = Api.Common.PageResult<Item>;
```

**影响文件**：
- `src/typings/api/saving.d.ts`
- `src/typings/api/knowledge.d.ts`
- `src/typings/api/productoutput.d.ts`
- `src/typings/api/spikesandvalleys.d.ts`

---

### 4. ElTag type 属性限制

**问题**：`type` 属性值不在允许范围内

```typescript
// ❌ 错误：string 类型过于宽泛
const colorMap: Record<number, string> = { 1: 'primary' };

// ✅ 正确：使用联合类型限制
const colorMap: Record<number, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  1: 'primary',
  2: 'success'
};
```

**影响文件**：
- `src/views/scheduling/rule-config/index.vue`
- `src/views/scheduling/rule-template/index.vue`
- `src/views/scheduling/shift-pattern/index.vue`

---

### 5. ThemeColor 类型限制

**问题**：`'default'` 不是有效的 ThemeColor 值

```typescript
// ❌ 错误：'default' 不在 UI.ThemeColor 中
const colorMap = { 6: { label: '自定义', type: 'default' } };

// ✅ 正确：使用有效的 ThemeColor
const colorMap = { 6: { label: '自定义', type: 'primary' } };
```

**类型定义**：`src/typings/ui.d.ts`
```typescript
type ThemeColor = 'danger' | 'primary' | 'info' | 'success' | 'warning';
```

---

### 6. 类型定义补全

**问题**：使用不存在的属性

```typescript
// ScheduleCalendarSearchParams 缺少 year 和 month
interface ScheduleCalendarSearchParams {
  page?: number;
  pageSize?: number;
  year?: number;      // 新增
  month?: number;     // 新增
  startDate?: string;
  // ...
}

// RuleConfigSearchParams 缺少 isActive
interface RuleConfigSearchParams {
  // ...
  isActive?: boolean;  // 新增
}
```

**影响文件**：
- `src/typings/api/scheduling.d.ts`
- `src/typings/api/rule-engine.d.ts`

---

### 7. Vue Router 使用方式

**问题**：`window.$router` 类型问题

```typescript
// ❌ 错误：window.$router 可能不存在
window.$router?.push({ path: '/xxx' });

// ✅ 正确：使用 useRouter composable
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ path: '/xxx' });
```

**影响文件**：
- `src/views/scheduling/rule-config/index.vue`
- `src/views/scheduling/rule-version/index.vue`

---

### 8. DatePicker 值类型

**问题**：`value-format` 指定字符串格式，但变量类型为 Date

```typescript
// ❌ 错误：Date 类型与 value-format 不匹配
const queryDate = ref<Date>(new Date());

// ✅ 正确：使用字符串类型
const queryDate = ref<string>(new Date().toISOString().split('T')[0]);
```

**影响文件**：
- `src/views/statistical/cost/index.vue`
- `src/views/statistical/yoy-mom/index.vue`
- `src/views/statistical/flow/index.vue`

---

### 9. ElStatistic 值类型

**问题**：`:value` 期望数字，但提供了字符串

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

**影响文件**：
- `src/views/statistical/cost/index.vue`
- `src/views/statistical/yoy-mom/index.vue`

---

### 10. 表格列类型定义

**问题**：v-for 循环中列属性类型推断不完整

```typescript
// ❌ 错误：类型推断为联合类型，缺少某些属性
const tableColumns = computed(() => {
  const baseColumns = [
    { prop: 'name', label: '名称', width: 150, fixed: 'left' as const }
  ];
  // dayColumns 没有 fixed 属性，导致联合类型
});

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

**影响文件**：
- `src/views/process-energy/statistics/monthly/index.vue`

---

### 11. v-for key 重复问题

**问题**：同时使用 `:key` 和 `v-bind` 导致 key 被覆盖

```vue
<!-- ❌ 错误：key 在 col 中已存在 -->
<ElTableColumn v-for="col in columns" :key="col.key" v-bind="col">

<!-- ✅ 正确：使用索引或移除重复 key -->
<ElTableColumn v-for="(col, index) in columns" :key="index" v-bind="col">
```

**影响文件**：
- `src/views/scheduling/rule-config/index.vue`
- `src/views/scheduling/rule-template/index.vue`
- `src/views/scheduling/rule-version/index.vue`

---

### 12. 移除未使用的导入

**问题**：导入但未使用的类型

```typescript
// ❌ 错误：导入未使用
import type { FormInstance } from 'element-plus';
import type { Api } from '@/typings/api';

// ✅ 正确：移除未使用的导入
// 使用全局命名空间 Api，无需导入
```

**影响文件**：
- `src/views/analysis/consumption/index.vue`
- `src/views/statistical/flow/index.vue`
- `src/views/statistical/yoy-mom/index.vue`

---

## 检查命令

```bash
# TypeScript 类型检查（只看 src/ 目录）
pnpm vue-tsc --noEmit 2>&1 | grep "^src/"

# ESLint 检查（只看错误）
pnpm eslint . 2>&1 | grep -E "^\s+[0-9]+:[0-9]+\s+error"
```

---

## 遗留问题

以下 ESLint 错误为项目已存在质量问题，非本次修复范围：
- `no-console` 警告（多处 console 语句）
- `@typescript-eslint/no-unused-vars`（未使用变量）
- `default-case`（缺少 default 分支）
- `no-warning-comments`（TODO 注释）
- `vue/no-mutating-props`（直接修改 props）

---

## 经验总结

1. **FlatResponseData 必须解构**：API 返回值需用 `const { data } = await fetchXxx()` 解构
2. **泛型参数要完整**：useUIPaginatedTable 需要两个泛型参数确保类型推断正确
3. **全局类型无需导入**：`Api` 命名空间是全局的，不需要 `import type`
4. **Element Plus 类型严格**：ElTag type、ElStatistic value 等有明确的类型限制
5. **先查类型定义**：遇到类型错误先查看对应的 `.d.ts` 文件

---

**相关文档**：`principles/typescript-constraints.md`