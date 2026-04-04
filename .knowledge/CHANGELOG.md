# 变更日志

> 记录前端知识库内容的更新历史

---

## 2026-04-04

### 新增

- **[src/service/api/electric-analysis.ts]** - 电力分析 API 封装
  - ElectricLoad 命名空间: 负荷分析类型定义
  - PowerFactor 命名空间: 功率因数类型定义
  - ThreePhase 命名空间: 三相不平衡类型定义
  - HistoricalData 命名空间: 历史数据类型定义
  - fetchElectricLoadAnalysis: 负荷分析查询
  - fetchElectricityMeterList: 电表列表查询
  - fetchPowerFactorAnalysis: 功率因数查询
  - fetchThreePhaseAnalysis: 三相不平衡查询
  - fetchHistoricalData: 历史数据查询
  - exportHistoricalData: 历史数据导出

- **[src/views/energy/electric-analysis/]** - 电力分析页面
  - load-analysis.vue: 负荷分析页面（ECharts 折线图 + 汇总卡片）
  - power-factor-analysis.vue: 功率因数分析页面
  - three-phase-analysis.vue: 三相不平衡分析页面
  - index.vue: 入口页面（Tab 切换）

- **[src/router/routes/modules/electric-analysis.ts]** - 电力分析路由配置
  - /electric-analysis/load: 负荷分析
  - /electric-analysis/power-factor: 功率因数
  - /electric-analysis/three-phase: 三相不平衡

---

## 变更类型说明

| 类型 | 说明 |
|------|------|
| 新增 | 新创建的知识文件 |
| 更新 | 已有知识文件的修改 |
| 删除 | 废弃的知识文件 |
| 重构 | 知识结构重组 |

---

**最后更新**: 2026-04-04