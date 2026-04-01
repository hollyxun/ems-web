<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import GroupDashboard from './group-dashboard.vue';
import FactoryDashboard from './factory-dashboard.vue';
import TeamDashboard from './team-dashboard.vue';

defineOptions({ name: 'EnergyDashboard' });

const route = useRoute();

const dashboardLevel = computed(() => (route.query.level as string) || 'group');
const orgId = computed(() => (route.query.orgId as string) || 'default');
</script>

<template>
  <div class="dashboard-container h-full">
    <GroupDashboard v-if="dashboardLevel === 'group'" :org-id="orgId" />
    <FactoryDashboard v-else-if="dashboardLevel === 'factory'" :factory-id="orgId" />
    <TeamDashboard v-else-if="dashboardLevel === 'team'" :team-id="orgId" />
    <GroupDashboard v-else :org-id="orgId" />
  </div>
</template>

<style scoped>
.dashboard-container {
  background-color: var(--el-bg-color-page);
}
</style>
