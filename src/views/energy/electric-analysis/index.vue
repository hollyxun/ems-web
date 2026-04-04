<script setup lang="ts">
import { ref } from 'vue';
import LoadAnalysis from './load-analysis.vue';
import PowerFactorAnalysis from './power-factor-analysis.vue';
import ThreePhaseAnalysis from './three-phase-analysis.vue';

const activeTab = ref('load');
</script>

<template>
  <div class="h-full">
    <ElTabs v-model="activeTab" type="border-card" class="h-full">
      <ElTabPane label="负荷分析" name="load">
        <LoadAnalysis v-if="activeTab === 'load'" />
      </ElTabPane>
      <ElTabPane label="功率因数" name="powerFactor">
        <PowerFactorAnalysis v-if="activeTab === 'powerFactor'" />
      </ElTabPane>
      <ElTabPane label="三相不平衡" name="threePhase">
        <ThreePhaseAnalysis v-if="activeTab === 'threePhase'" />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style scoped>
.h-full {
  height: 100%;
}
</style>