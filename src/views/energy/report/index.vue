<script setup lang="ts">
import { ref } from 'vue';
import DailyReport from './components/daily-report.vue';
import MonthlyReport from './components/monthly-report.vue';
import RankingReport from './components/ranking-report.vue';
import ComparisonReport from './components/comparison-report.vue';

defineOptions({ name: 'ReportPage' });

const activeTab = ref('daily');
</script>

<template>
  <div class="report-page p-4">
    <ElTabs v-model="activeTab" type="border-card">
      <ElTabPane label="班组能耗日报" name="daily">
        <DailyReport />
      </ElTabPane>
      <ElTabPane label="班组能耗月报" name="monthly">
        <MonthlyReport />
      </ElTabPane>
      <ElTabPane label="能效排名报表" name="ranking">
        <RankingReport />
      </ElTabPane>
      <ElTabPane label="对比分析报表" name="comparison">
        <ComparisonReport />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style scoped>
.report-page :deep(.el-tabs__content) {
  padding: 0;
}
</style>
