<script setup lang="ts">
import { ref } from 'vue';
import TeamComparison from './components/team-comparison.vue';
import ShiftComparison from './components/shift-comparison.vue';
import TimeComparison from './components/time-comparison.vue';

defineOptions({ name: 'EnergyComparison' });

const activeTab = ref('team');

const teamOptions = ref([
  { value: 1, label: '甲班', factoryId: 1 },
  { value: 2, label: '乙班', factoryId: 1 },
  { value: 3, label: '丙班', factoryId: 2 },
  { value: 4, label: '丁班', factoryId: 2 }
]);
</script>

<template>
  <div class="energy-comparison-page p-4">
    <ElCard>
      <ElTabs v-model="activeTab">
        <ElTabPane label="班组对比" name="team">
          <TeamComparison
            :team-options="teamOptions"
          />
        </ElTabPane>

        <ElTabPane label="班次对比" name="shift">
          <ShiftComparison
            :team-options="teamOptions"
          />
        </ElTabPane>

        <ElTabPane label="时间对比" name="time">
          <TimeComparison
            :team-options="teamOptions"
          />
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>