<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElCalendar, ElCard, ElEmpty, ElTag } from 'element-plus';

defineOptions({ name: 'ScheduleCalendarCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const scheduleEvents = ref<Record<string, { type: string; content: string }[]>>({});

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchScheduleEvents(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 300));
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  scheduleEvents.value = {
    [dateStr]: [
      { type: 'shift', content: '班组A - 白班' },
      { type: 'shift', content: '班组B - 夜班' }
    ],
    [`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate() + 1).padStart(2, '0')}`]:
      [{ type: 'maintenance', content: '设备巡检' }]
  };
  loading.value = false;
}

function getEvents(date: Date) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return scheduleEvents.value[dateStr] || [];
}

onMounted(loadData);

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full overflow-auto">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">排班日历</span>
        <ElTag size="small">本月</ElTag>
      </div>
    </template>
    <ElCalendar v-if="!loading" #date-cell="{ data }">
      <div class="flex flex-col items-center">
        <span class="text-sm">{{ data.day.split('-')[2] }}</span>
        <div v-for="event in getEvents(new Date(data.day))" :key="event.content" class="mt-1">
          <ElTag
            :type="event.type === 'shift' ? 'primary' : event.type === 'maintenance' ? 'warning' : 'info'"
            size="small"
            effect="plain"
          >
            {{ event.content }}
          </ElTag>
        </div>
      </div>
    </ElCalendar>
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>

<style scoped>
:deep(.el-calendar-table) {
  font-size: 12px;
}
:deep(.el-calendar-day) {
  min-height: 60px;
}
</style>
