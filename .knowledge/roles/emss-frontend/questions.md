# EMSS 前端开发 - 待验证问题

> 记录已知的未知（known unknowns）。这些问题不是 TODO，没有 deadline，但值得在未来验证。

---

## Open Questions

### Q1: Element Plus 表格虚拟滚动方案

**问题**: Element Plus 的 `el-table` 在数据量大时（>1000 条）性能下降明显。是否有推荐的虚拟滚动方案？是使用 `el-table-v2` 还是第三方库如 `vue-virtual-scroller`？

**来源**: 设计大数据量表格页面时的性能考虑

**验证思路**:
- 测试 `el-table-v2` 的功能完整性和兼容性
- 对比 `vue-virtual-scroller` 与 Element Plus 的集成成本
- 查看社区最佳实践

---

### Q2: Pinia Store 持久化存储

**问题**: 用户登录状态、主题设置等需要持久化存储到 localStorage。项目是否有统一的 Pinia 持久化方案？是使用 `pinia-plugin-persistedstate` 还是自行实现？

**来源**: 实现记住密码功能时的架构疑问

**验证思路**:
- 查看项目现有 Store 的持久化实现
- 评估 `pinia-plugin-persistedstate` 的引入成本
- 了解数据加密/脱敏需求

---

### Q3: 动态路由前端缓存

**问题**: 动态路由从后端获取后，如何在页面刷新后保持？是存储到 localStorage 还是每次重新获取？重新获取时的白屏问题如何处理？

**来源**: 实现动态权限路由时的用户体验考虑

**验证思路**:
- 查看 `router/guard/permission.ts` 的实现
- 测试页面刷新后的路由恢复流程
- 了解路由缓存与权限变更的平衡策略

---

### Q4: UnoCSS 与 Element Plus 样式冲突

**问题**: UnoCSS 的原子类可能与 Element Plus 的组件样式冲突。项目是否有统一的样式优先级策略？如何处理深度选择器 `:deep()` 的滥用问题？

**来源**: 自定义组件样式时的样式覆盖问题

**验证思路**:
- 收集现有样式冲突案例
- 了解 `unocss-preset-element-plus` 等解决方案
- 制定样式覆盖的最佳实践

---

### Q5: API 请求取消机制

**问题**: 组件卸载时如何取消未完成的 API 请求？是使用 Axios CancelToken 还是 AbortController？请求取消后的错误处理如何统一？

**来源**: 页面快速切换时的请求竞态问题

**验证思路**:
- 查看现有请求封装是否支持取消
- 测试 `useRequest` 等组合式函数的取消逻辑
- 了解请求取消与 Loading 状态的联动处理

---

## 已解答的问题

> 已验证的问题移动到这里，注明答案和验证日期。

### Q3: 动态路由前端缓存 ✅ (2026-03-30)

**答案**：使用 localStorage 缓存路由版本，同步失败时降级使用缓存。

**实现**：
- `use-route-sync.ts` 中实现了指数退避重试机制
- 路由版本通过 MD5 hash 比对检测变更
- 失败时使用本地缓存路由，避免白屏

---

## 如何贡献

- 遇到不确定的问题？→ 添加到 Open Questions
- 验证了某个问题？→ 移动到「已解答」，注明结论
- 发现问题已过时？→ 标注为废弃，说明原因
