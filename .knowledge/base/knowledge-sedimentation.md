# 经验沉淀规范

> 当需要总结经验、沉淀知识时，**先判断这条知识的性质和受众，再决定放在哪里**。

---

## 知识分类与存放位置

| 类别 | 定义 | 存放位置 | 示例 |
|------|------|----------|------|
| **experience** | 具体事件的复盘和洞察：踩过的坑、发现的有效做法、关键决策的上下文 | `roles/<role>/experience/` | 「Element Plus 表格高度计算问题」 |
| **skill** | 可复用的操作流程：怎么做某类事、checklist、代码模式 | `roles/<role>/skills/` 或 `base/skills/` | 「页面开发完整流程」 |
| **principle** | 抽象的行为准则：应该/不应该做什么，与具体技术无关 | `roles/<role>/principles/` 或 `base/principles/` | 「必须使用 Composition API」 |
| **insight** | 从多次 experience 中归纳出的规律性认知：不是操作步骤，也不是行为准则，而是对「为什么会这样」的理解 | `roles/<role>/insights/` 或 `base/insights/` | 「响应式数据解构陷阱」 |

---

## 判断放 role 还是 base

- **只对本角色有意义** → `roles/<role>/`
  - 例如：EMSS Web 特有的组件封装模式，只有前端开发角色会用到

- **多个角色都可能遇到** → `base/`
  - 例如：「改了接口后要更新类型定义」「Git worktree 协作规范」

**问自己**：「如果另一个角色遇到类似情况，这条知识对他有用吗？」有用就放 base。

---

## 从 experience 提炼到 skill/principle/insight

experience 是原始素材，skill、principle 和 insight 是提炼后的可复用知识。

### 沉淀步骤

1. **先写 experience**：记录具体事件
   - 不只是犯错，也包括有效的做法
   - 关键决策的权衡过程
   - 首次跑通某个流程的完整记录

2. **再看能否提炼**：从 experience 中抽取可复用的模式
   - 补充到已有的 skill、principle 或 insight 文档中
   - 如果是全新主题则新建文档

### 提炼方向的区分

- **skill**：「下次遇到同类事该怎么操作？」→ 操作流程、checklist、代码模式
- **principle**：「下次遇到同类事该遵守什么准则？」→ 行为约束、设计原则
- **insight**：「为什么会这样？背后的规律是什么？」→ 规律性认知、架构模式

### 注意事项

**提炼不求大而全**。skill、principle、insight 都是 role private 的知识，扎根在角色的具体场景里就够了，不需要上升到普适真理。

不要只写 experience 不提炼——那只是日记。
不要只写 skill 不留 experience——丢失了具体上下文，后人无法理解「为什么有这条规则」。

---

## Experience 的唤醒（加载）策略

推荐采用 **分层加载（layered retrieval）**：

1. **先从索引入手**：读 `roles/<role>/AGENTS.md` 的知识索引
2. **优先加载提炼知识**：先 `Read` skill/principle/insight（更短、更可执行）
3. **再按条件升级到 experience**：当需要"证据/边界/反例/上下文"时，再加载 experience

**例外情况**：出现明确的 **症状型线索**（特定报错/异常现象）或正在执行 **高风险任务**（数据迁移、发布/回滚、权限/凭证相关操作等）时，可直接通过 triggers 命中某条 experience。

---

## Questions：记录已知的未知

四种知识类型都是**某种程度上已确认的**知识。但工作中经常产生"注意到了、有假说、但没条件验证"的疑问。

`questions.md` 就是放这些东西的地方。它不是第五种 knowledge type，而是知识的**前体**。

### 存放位置
- `roles/<role>/questions.md`

### 生命周期

```
session 中产生疑问 → 写入 questions.md
                         ↓ 未来某次 session 有机会验证
                     写 experience → 提炼 skill/principle/insight
                         ↓
                     回到 questions.md 勾 checkbox，注明去向
```

### 什么时候写 question

- session 中注意到某个行为"不确定是不是总是这样"但没时间深究
- 提炼 skill/principle 时信心不足（只有一个数据点），先记为 question
- 读文档/代码时发现矛盾或模糊之处，但当前任务不需要解决它

---

## 自动沉淀：完成重要工作后主动反思

**不要等用户提醒才沉淀经验。** 完成以下类型的工作后，agent 应主动提出沉淀：

- PR review 修复（尤其是多轮迭代的）
- 跨组件 bug 修复
- 首次跑通某个流程（新页面、新组件）
- 踩了非显而易见的坑

### 反思五问

工作完成后，主动问自己：

1. **这次有没有踩坑或发现反直觉的行为？** → 写 experience
2. **能不能提炼出可复用的 checklist 或模式？** → 写/更新 skill
3. **有没有值得记住的抽象原则？** → 写/更新 principle
4. **有没有跨场景可泛化的规律性认知？** → 写/更新 insight
5. **有没有注意到但没条件验证的疑问？** → 写入 questions.md

---

## 实操 Checklist

沉淀不是"写点总结"，而是产出让后人**可回溯、可执行、可检索**的知识：

- [ ] **证据先行**：命令/日志/样本量/时间范围先写清楚，结论能复核
- [ ] **可回溯引用**：优先写本次产出的 PR / commit / 文档引用
- [ ] **写清决策依据**：关键决策落到「遵循了哪条 principle/insight」或「参考了哪条 experience/skill」
- [ ] **三件套拆分**：experience（发生了什么）→ skill（下次怎么做）→ insight（为什么会这样）
- [ ] **可检索**：摘要与 triggers 覆盖真实关键词
- [ ] **联动更新**：
  - skill/principle/insight 的 front matter 必须有 `description` + `triggers`
  - 更新角色 `AGENTS.md` 索引
  - 交叉引用链接完整

---

## Experience 写作建议

experience 不要求 YAML front matter。重点保证 **可复核**（证据）、**可回溯**（产出）、**可复用**（决策依据）。

### 推荐结构

```markdown
# <一句话标题>

日期: YYYY-MM-DD

## Triggers（可选）
- "能让 `rg` 命中的真实关键词（报错/组件名/命令/路径）"

## 背景
发生在什么模块/功能？影响范围是什么？

## 证据与现象
贴日志片段/代码片段/错误信息。

## 关键决策（含依据）
- 决策：做了什么选择？
  - 备选：还考虑过什么？为什么没选？
  - 依据：引用具体文档路径或可验证证据

## 结果
最终怎么收敛？修复点/验证方式是什么？
- 产出（若有）：PR/commit 链接
- 沉淀（若有）：新增/更新了哪些 skill/principle/insight
```

---

## Front Matter 规范

skill、principle、insight 文件必须包含 YAML front matter：

```yaml
---
description: "1-2 句话描述，用于 AGENTS 索引"
triggers:
  - "触发加载的场景关键词"
source:
  - "roles/<role>/experience/xxx.md"
---
```

- **description**（必填）：简明描述这条知识是什么
- **triggers**（必填）：列出应该加载这条知识的场景关键词
- **source**（可选）：指向提炼出这条知识的 experience 文件路径

建议在正文里补充：
- `## Escalate to experience if`：列出需要回溯 experience 的条件

---

## 反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| 所有经验都堆到一个 experience 文件 | 后续检索困难 | 按主题拆分，一个事件一个文件 |
| 只写 experience 不提炼 skill | 知识停留在「那次踩了个坑」 | experience 写完后审视能否提炼 |
| 角色专有知识放到 base | 污染共享知识库 | 问「其他角色会用到吗？」不会就放 role 下 |
| 通用经验只放在 role 下 | 其他角色重复踩坑 | 通用工程经验放 base |

---

**最后更新**: 2026-03-18
