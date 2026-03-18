<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, Clock } from '@element-plus/icons-vue';
import type { UptimeInfo } from '@/typings/api/devtools';
import StatusCard from './StatusCard.vue';

const UptimeIcon = 'mdi:timer-sand';

interface Props {
  uptime: UptimeInfo | null;
}

const props = withDefaults(defineProps<Props>(), {
  uptime: null
});

const formattedTime = computed(() => props.uptime?.formatted ?? '-');
const bootTime = computed(() => props.uptime?.bootTime ?? '-');
</script>

<template>
  <StatusCard title="运行时长" :icon="UptimeIcon">
    <div class="space-y-4">
      <!-- 主要运行时间显示 -->
      <div class="py-4 text-center">
        <div class="bg-primary-light mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full">
          <ElIcon :size="40" class="text-primary">
            <Clock />
          </ElIcon>
        </div>

        <div class="text-2xl font-medium">
          {{ formattedTime }}
        </div>

        <div class="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ElTag size="small" type="success">
            <div class="flex items-center gap-1">
              <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              运行中
            </div>
          </ElTag>
        </div>
      </div>

      <!-- 启动时间 -->
      <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-white shadow-sm">
          <ElIcon :size="20" class="text-primary">
            <Calendar />
          </ElIcon>
        </div>
        <div>
          <div class="text-xs text-gray-500">启动时间</div>
          <div class="font-medium">{{ bootTime }}</div>
        </div>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped>
.bg-primary-light {
  background-color: var(--el-color-primary-light-9);
}

.text-primary {
  color: var(--el-color-primary);
}

.space-y-4 > * + * {
  margin-top: 16px;
}
</style>
