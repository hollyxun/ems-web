---
description: "2026-04-03 排班规则引擎前端开发中遇到的问题复盘"
triggers:
  - "规则引擎"
  - "版本时间线"
  - "ElCheckbox"
  - "类型定义"
---

# 规则引擎前端开发问题复盘

## 事件概述

**日期**: 2026-04-03
**任务**: 排班规则引擎前端可视化配置界面开发
**范围**: 规则配置、版本管理、模板管理页面及共享组件

---

## 遇到的问题

### 问题 1: ElCheckbox 导入遗漏

**场景**: `version-timeline.vue` 组件中使用 ElCheckbox 但未导入

**修复**:
```typescript
// 错误
import { ElButton, ElCard, ElTimeline, ElTimelineItem, ElTag, ElTooltip } from 'element-plus';

// 正确
import { ElButton, ElCard, ElCheckbox, ElTimeline, ElTimelineItem, ElTag, ElTooltip } from 'element-plus';
```

---

### 问题 2: 类型定义需要与后端对齐

**场景**: 前端 API 类型定义与后端不完全匹配

**修复**:
1. 更新 `typings/api/rule-engine.d.ts` 添加新类型
2. 确保 `ValidateConfigResponse` 的 errors/warnings 是对象数组而非字符串数组
3. 添加 `PreviewScheduleParams` 和 `PreviewScheduleResult` 类型

**示例**:
```typescript
// 与后端对齐的类型定义
interface ValidateConfigResponse {
  valid: boolean;
  errors: ValidationError[];    // 对象数组，非字符串数组
  warnings: ValidationWarning[];
  checkedAt?: string;
}

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
```

---

### 问题 3: 计算属性 isValid 判断逻辑

**场景**: `rule-preview.vue` 中 isValid 判断过于简单

**修复**:
```typescript
// 错误 - 仅检查 valid 字段
const isValid = computed(() => validationResult.value?.valid === true);

// 正确 - 检查 valid 且无 errors
const isValid = computed(() => 
  validationResult.value?.valid === true && 
  !validationResult.value?.errors?.length
);
```

---

### 问题 4: TSX 中错误使用 Vue 模板语法

**场景**: `rule-version/index.vue` 在 TSX 中使用了 `v-if` 指令

**错误**:
```tsx
// TSX 中不能使用 v-if 指令
<ElButton v-if={!row.isActive} ...>
```

**修复**: 使用逻辑与或三元表达式
```tsx
// 正确 - 使用逻辑与操作
{!row.isActive && (
  <ElButton type="primary" text size="small" onClick={() => handleActivate(row)}>
    激活
  </ElButton>
)}
```

---

### 问题 5: ElTextarea 组件不存在

**场景**: 多个文件中导入了 `ElTextarea`，但 Element Plus 没有这个组件

**修复**:
1. 移除 `ElTextarea` 导入
2. 使用 `<ElInput type="textarea">` 替代

```typescript
// 错误
import { ElTextarea } from 'element-plus';
<ElTextarea v-model="value" :rows="3" />

// 正确
import { ElInput } from 'element-plus';
<ElInput v-model="value" type="textarea" :rows="3" />
```

**影响文件**:
- `rule-config/modules/rule-config-operate-drawer.vue`
- `rule-template/modules/template-operate-drawer.vue`
- `rule-version/modules/create-version-drawer.vue`

---

### 问题 6: const enum 不被 ESLint 允许

**场景**: `typings/api/rule-engine.d.ts` 中使用了 `const enum`

**修复**: 使用对象常量替代
```typescript
// 错误
const enum RuleType {
  SchedulingPattern = 1,
  CalendarMapping = 2
}

// 正确
type RuleType = 1 | 2 | 3;
const RuleType = {
  SchedulingPattern: 1 as const,
  CalendarMapping: 2 as const,
  RotationAlgorithm: 3 as const
};
```

---

## 最佳实践总结

### API 类型定义

1. 与后端 request/response 结构保持一致
2. 使用 JSDoc 注释说明字段含义
3. 可选字段用 `?:` 标记

### 组件开发

1. 使用前检查所有 Element Plus 组件是否已导入
2. computed 属性要有明确的语义判断
3. 组件间共享的类型定义放在 `typings/api/` 目录

### 路由配置

1. elegant-router 自动生成路由，无需手动配置
2. 新页面放在对应目录即可自动识别
3. i18n 翻译需要手动更新

---

## 新增文件清单

| 文件 | 用途 |
|------|------|
| `views/scheduling/rule-config/index.vue` | 规则配置列表页 |
| `views/scheduling/rule-config/modules/rule-config-operate-drawer.vue` | 规则编辑抽屉 |
| `views/scheduling/rule-version/index.vue` | 版本管理页 |
| `views/scheduling/rule-version/modules/version-history-drawer.vue` | 版本查看抽屉 |
| `views/scheduling/rule-version/modules/create-version-drawer.vue` | 创建版本抽屉 |
| `views/scheduling/rule-template/index.vue` | 模板管理页 |
| `views/scheduling/rule-template/modules/template-operate-drawer.vue` | 模板编辑抽屉 |
| `views/scheduling/shared/rule-preview.vue` | 规则预览组件 |
| `views/scheduling/shared/version-timeline.vue` | 版本时间线组件 |
| `views/scheduling/shared/rule-binding-selector.vue` | 规则绑定选择器 |
| `service/api/scheduling/rule-engine.ts` | API 封装 |
| `typings/api/rule-engine.d.ts` | 类型定义 |

---

## 后端 API 对接

### 新增 API 路由

| 路由 | 方法 | 描述 |
|------|------|------|
| `/scheduling/shiftPattern/generatePatternDetailsByRule` | POST | 通过规则引擎生成排班明细 |
| `/scheduling/shiftPattern/generatePatternDetailsWithConfig` | POST | 使用配置生成排班明细 |
| `/scheduling/factoryCalendar/generateFactoryCalendarWithMapping` | POST | 使用自然月映射生成工厂日历 |
| `/scheduling/factoryCalendar/getNaturalMonthMapping` | GET | 获取自然月映射信息 |
| `/scheduling/factoryCalendar/updateMappingConfig` | PUT | 更新映射配置 |

### Request 类型定义

```typescript
// GeneratePatternDetailsByRuleRequest
interface GeneratePatternDetailsByRuleParams {
  ruleId: number;
  teamIds: number[];
  cycleDays: number;
}

// GeneratePatternDetailsWithConfigRequest
interface GeneratePatternDetailsWithConfigParams {
  patternType: number;
  teamIds: number[];
  configJson: string;
}
```

---

**最后更新**: 2026-04-03