# EMSS 前端知识库入口

> Vue 3 + TypeScript 前端开发知识沉淀

---

## 快速入口

**主要查阅文件**：`roles/emss-frontend/AGENTS.md`

| 文件 | 说明 |
|------|------|
| `roles/emss-frontend/AGENTS.md` | **角色知识** - 开发流程、陷阱速查 |
| `roles/emss-frontend/skills/` | 操作流程（9个） |
| `roles/emss-frontend/principles/` | 行为准则（4个） |
| `roles/emss-frontend/experience/` | 方法复盘（4个） |
| `CHANGELOG.md` | 变更日志 |

---

## 核心约定

| 约定 | 规范 |
|------|------|
| 架构 | 页面 → API → 组件（严格单向） |
| 组件 | Composition API + `<script setup>` |
| 状态 | Pinia Setup Store 模式 |
| 文件命名 | `kebab-case.vue` |
| API 封装 | `src/api/[module].ts` |

---

## 常见陷阱

| 陷阱 | 避免方法 |
|------|----------|
| reactive 直接解构 | 使用 `toRefs()` |
| props 直接修改 | emit 通知父组件 |
| async setup 直接 await | 使用 `onMounted` |
| 组件内直接调用 API | 封装到 `src/api/` |

---

## CLI 适配

| CLI | 配置位置 |
|-----|----------|
| Claude Code | `web/.claude/rules/project_rules.md` |
| Codex/Gemini 等 | 本文件 + `roles/emss-frontend/AGENTS.md` |

---

## 知识维护

- 学到新东西 → 写入 `roles/emss-frontend/` 对应目录
- 发现错误 → 更新或删除
- 新问题 → 写入 `questions.md`

---

**最后更新**: 2026-04-19