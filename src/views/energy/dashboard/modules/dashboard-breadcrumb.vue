<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

interface Props {
  items: Api.Dashboard.BreadcrumbItem[];
}

const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();

const levelIcons: Record<string, string> = {
  group: 'mdi:domain',
  factory: 'mdi:factory',
  workshop: 'mdi:warehouse',
  team: 'mdi:account-group'
};

function navigate(item: Api.Dashboard.BreadcrumbItem, index: number) {
  if (index === props.items.length - 1) return;

  const query: Record<string, string> = {
    level: item.level,
    orgId: item.id
  };

  router.push({
    path: route.path,
    query
  });
}
</script>

<template>
  <ElBreadcrumb separator="/" class="dashboard-breadcrumb">
    <ElBreadcrumbItem v-for="(item, index) in items" :key="item.id">
      <div
        class="flex cursor-pointer items-center gap-1 transition-colors hover:text-primary"
        :class="{ 'cursor-default text-gray-500': index === items.length - 1 }"
        @click="navigate(item, index)"
      >
        <Icon :icon="levelIcons[item.level]" class="text-sm" />
        <span>{{ item.name }}</span>
      </div>
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>

<style scoped>
.dashboard-breadcrumb {
  padding: 8px 0;
}
</style>