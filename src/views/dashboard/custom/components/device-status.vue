<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElCard, ElProgress, ElStatistic, ElEmpty, ElDescriptions, ElDescriptionsItem } from 'element-plus';

defineOptions({ name: 'DeviceStatusCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const deviceStats = ref({
  total: 120,
  online: 108,
  offline: 8,
  warning: 4,
  fault: 0
});

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchDeviceStatus(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 300));
  deviceStats.value = {
    total: 120,
    online: 108,
    offline: 8,
    warning: 4,
    fault: 0
  };
  loading.value = false;
}

const onlineRate = ref(0);
const healthRate = ref(0);

onMounted(async () => {
  await loadData();
  onlineRate.value = Math.round((deviceStats.value.online / deviceStats.value.total) * 100);
  healthRate.value = Math.round(((deviceStats.value.online - deviceStats.value.warning) / deviceStats.value.total) * 100);
});

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard shadow="never" class="h-full" v-loading="loading">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">设备状态</span>
        <span class="text-xs text-gray-400">实时监控</span>
      </div>
    </template>
    <div v-if="!loading" class="flex flex-col gap-4">
      <!-- 在线率 -->
      <div class="flex items-center gap-4">
        <ElProgress
          type="dashboard"
          :percentage="onlineRate"
          :width="80"
          :stroke-width="8"
          :color="#10B981"
        >
          <template #default="{ percentage }">
            <span class="text-lg font-bold">{{ percentage }}%</span>
            <span class="text-xs text-gray-400">在线</span>
          </template>
        </ElProgress>
        <ElDescriptions :column="1" size="small" border>
          <ElDescriptionsItem label="总数">{{ deviceStats.total }}</ElDescriptionsItem>
          <ElDescriptionsItem label="在线" label-class-name="text-green-500">{{ deviceStats.online }}</ElDescriptionsItem>
          <ElDescriptionsItem label="离线" label-class-name="text-gray-400">{{ deviceStats.offline }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <!-- 健康率 -->
      <div class="flex items-center gap-4">
        <ElProgress
          type="dashboard"
          :percentage="healthRate"
          :width="80"
          :stroke-width="8"
          :color="healthRate >= 90 ? '#10B981' : healthRate >= 70 ? '#F59E0B' : '#EF4444'"
        >
          <template #default="{ percentage }">
            <span class="text-lg font-bold">{{ percentage }}%</span>
            <span class="text-xs text-gray-400">健康</span>
          </template>
        </ElProgress>
        <ElDescriptions :column="1" size="small" border>
          <ElDescriptionsItem label="告警" label-class-name="text-yellow-500">{{ deviceStats.warning }}</ElDescriptionsItem>
          <ElDescriptionsItem label="故障" label-class-name="text-red-500">{{ deviceStats.fault }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </div>
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>