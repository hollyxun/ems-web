---
description: "分层加载策略：常驻 vs 按需判断标准、experience 唤醒、context 压缩后重新加载、摘要写法"
triggers:
  - "知识加载"
  - "分层加载"
  - "常驻 context"
  - "按需加载"
  - "experience 唤醒"
  - "context 压缩"
  - "compaction"
---

# 知识加载策略

角色知识文档会持续增长，不能全部塞进 context。采用**索引→按需**的两层加载：

1. **始终加载**：`roles/<role>/AGENTS.md`。角色 `AGENTS.md` 包含职责和知识索引，每条知识附带 2-3 句摘要，足以判断是否需要读全文
2. **按需加载（分层）**：优先 `Read` skill/principle/insight（更短、更可执行）；当需要"证据/边界条件/反例/权衡上下文"时，再升级加载 experience

---

## 哪些知识应该"常驻 context"

把知识是否常驻 context 视为一个工程权衡：**高频 + 高风险 + 短小稳定** 的内容更适合常驻；**低频 + 语境化 + 易过时 + 体量大** 的内容更适合按需加载。

### 常驻（强烈建议每次任务都确保在 context）

- `AGENTS.md`：协作规则、工作流、安全底线、加载策略
- `roles/<role>/AGENTS.md`：角色职责 + 知识索引

> 经验法则：如果某条规则"做错一次就会造成不可逆损失/大范围误导"，就应该进入 `AGENTS.md`。

### 按需加载（默认）

- **skill / principle / insight**：通过 `AGENTS.md` 索引摘要 + front matter 的 `triggers` 命中后加载
- **experience**：默认不常驻；作为"证据/边界/反例/上下文"在需要时升级加载

### 触发式"优先加载"

当任务命中这些场景时，相关文档应尽早加载：

- **接触凭证 / 权限 / token**：`base/principles/credential-safety.md`
- **任何写操作**（多 agent 并行）：`base/principles/git-worktree.md`

---

## Context 压缩后重新加载

长 session 中 context 会被自动压缩（compaction），压缩后根 `AGENTS.md` 和角色 `AGENTS.md` 的内容可能被摘要掉。**agent 在感知到 context 被压缩后，必须重新 `Read` 以下文件**：

1. `AGENTS.md`（本文件）
2. `roles/<role>/AGENTS.md`（角色知识索引）

**判断依据**：如果你发现自己不确定当前角色的知识索引内容、或不记得协作规则的细节，说明 context 已被压缩，立即重新加载。

---

## 写摘要的要求

索引中每条知识的摘要必须包含**足够的关键词**，让 agent 能判断是否与当前任务相关。

不要只写「页面开发规范」，要写「页面开发流程、API 封装顺序、状态管理设计」——这样 agent 在做相关修改时能命中关键词。

---

## Escalate to experience if

- 需要理解"分层加载"在实际 session 中如何运作
- 需要判断某条知识是否应该从 role 提升到 base
