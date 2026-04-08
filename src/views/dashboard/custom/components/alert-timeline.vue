<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElCard, ElEmpty, ElTag, ElTimeline, ElTimelineItem } from 'element-plus';

defineOptions({ name: 'AlertTimelineCard' });

const props = defineProps<{
  config?: Record<string, any>;
  refreshInterval?: number;
}>();

const loading = ref(true);
const alerts = ref<{ time: string; level: string; source: string; message: string }[]>([]);

async function loadData() {
  loading.value = true;
  // 实际应调用 API: fetchAlerts(props.config?.dataSource)
  await new Promise(r => setTimeout(r, 300));
  alerts.value = [
    { time: '10:25', level: 'warning', source: '计量点MP001', message: '电压波动超过阈值' },
    { time: '09:15', level: 'info', source: '班组A', message: '班次切换完成' },
    { time: '08:30', level: 'warning', source: '设备DEV003', message: '温度异常升高' },
    { time: '07:00', level: 'success', source: '系统', message: '日报表生成完成' },
    { time: '06:00', level: 'info', source: '系统', message: '数据采集任务启动' }
  ];
  loading.value = false;
}

const levelMap: Record<string, { type: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  success: { type: 'success', label: '正常' },
  info: { type: 'info', label: '信息' },
  warning: { type: 'warning', label: '告警' },
  danger: { type: 'danger', label: '故障' }
};

function getLevelInfo(level: string) {
  return levelMap[level] || { type: 'info' as const, label: '信息' };
}

onMounted(loadData);

defineExpose({ refresh: loadData });
</script>

<template>
  <ElCard v-loading="loading" shadow="never" class="h-full overflow-auto">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">告警时间线</span>
        <ElTag size="small" type="warning">今日</ElTag>
      </div>
    </template>
    <ElTimeline v-if="!loading && alerts.length">
      <ElTimelineItem
        v-for="alert in alerts"
        :key="alert.time + alert.message"
        :timestamp="alert.time"
        :type="getLevelInfo(alert.level).type"
        placement="top"
      >
        <div class="flex items-start gap-2">
          <ElTag :type="getLevelInfo(alert.level).type" size="small">
            {{ getLevelInfo(alert.level).label }}
          </ElTag>
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ alert.source }}</span>
            <span class="text-xs text-gray-400">{{ alert.message }}</span>
          </div>
        </div>
      </ElTimelineItem>
    </ElTimeline>
    <ElEmpty v-else-if="!loading" description="暂无告警" :image-size="60" />
    <ElEmpty v-else description="加载中..." :image-size="60" />
  </ElCard>
</template>
