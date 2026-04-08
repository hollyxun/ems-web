<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElAvatar, ElBadge, ElCard, ElEmpty, ElTag } from 'element-plus';

defineOptions({ name: 'TopUsersCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const topUsers = ref<
  { rank: number; name: string; avatar: string; department: string; energy: number; trend: number }[]
>([]);

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchTopEnergyUsers(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 300));
  topUsers.value = [
    { rank: 1, name: '张伟', avatar: '', department: '生产车间', energy: 2500, trend: -5 },
    { rank: 2, name: '李娜', avatar: '', department: '包装车间', energy: 2100, trend: 8 },
    { rank: 3, name: '王强', avatar: '', department: '质检部门', energy: 1800, trend: -12 },
    { rank: 4, name: '赵敏', avatar: '', department: '仓储部门', energy: 1500, trend: 3 },
    { rank: 5, name: '刘洋', avatar: '', department: '维修车间', energy: 1200, trend: -8 }
  ];
  loading.value = false;
}

onMounted(loadData);

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">能耗 Top5</span>
        <ElTag size="small" type="danger">本周</ElTag>
      </div>
    </template>
    <div v-if="!loading && topUsers.length" class="flex flex-col gap-3">
      <div v-for="user in topUsers" :key="user.rank" class="flex items-center justify-between rounded-lg p-2">
        <div class="flex items-center gap-3">
          <ElBadge :value="user.rank" :type="user.rank <= 2 ? 'danger' : user.rank <= 4 ? 'warning' : 'info'">
            <ElAvatar size="small" class="bg-blue-500">
              {{ user.name.charAt(0) }}
            </ElAvatar>
          </ElBadge>
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ user.name }}</span>
            <span class="text-xs text-gray-400">{{ user.department }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">{{ user.energy }} kWh</span>
          <div class="flex items-center">
            <icon-mdi:arrow-down v-if="user.trend < 0" class="text-xs text-green-500" />
            <icon-mdi:arrow-up v-else class="text-xs text-red-500" />
            <span :class="user.trend < 0 ? 'text-green-500' : 'text-red-500'" class="text-xs">
              {{ Math.abs(user.trend) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    <ElEmpty v-else-if="!loading" description="暂无数据" :image-size="60" />
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>
