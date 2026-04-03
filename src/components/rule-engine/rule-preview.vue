<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElIcon,
  ElTable,
  ElTableColumn,
  ElTag
} from 'element-plus';
import dayjs from 'dayjs';
import { Refresh } from '@element-plus/icons-vue';
import { fetchPreviewSchedule } from '@/service/api/scheduling/rule-engine';

/**
 * 规则预览组件
 * 实时渲染规则生成的排班预览结果
 */

interface Props {
  ruleType: number;
  configValue: string;
  factoryId?: number;
  previewDays?: number;
}

const props = withDefaults(defineProps<Props>(), {
  factoryId: 1,
  previewDays: 30
});

const emit = defineEmits<{
  (e: 'loaded', data: Api.Scheduling.SchedulePreview): void;
  (e: 'error', message: string): void;
}>();

// 预览数据
const previewData = ref<Api.Scheduling.SchedulePreview | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// 日历视图数据
const calendarDays = computed(() => {
  if (!previewData.value?.generatedDates) return [];

  return previewData.value.generatedDates.map(day => ({
    ...day,
    date: dayjs(day.date).format('MM-DD'),
    dayOfWeek: dayjs(day.date).day(),
    dayOfMonth: dayjs(day.date).date()
  }));
});

// 班组排班视图
const teamShifts = computed(() => {
  if (!previewData.value?.generatedShifts) return [];

  // 按班组分组
  const teamMap = new Map<number, any[]>();
  for (const shift of previewData.value.generatedShifts) {
    if (!teamMap.has(shift.teamId)) {
      teamMap.set(shift.teamId, []);
    }
    teamMap.get(shift.teamId)!.push(shift);
  }

  return Array.from(teamMap.entries()).map(([teamId, shifts]) => ({
    teamId,
    teamName: shifts[0]?.teamName || `班组${teamId}`,
    shifts: shifts.slice(0, 7) // 只显示前7天
  }));
});

// 自然月映射视图
const naturalMonthViews = computed(() => {
  if (!previewData.value?.naturalMonthMapping) return [];
  return previewData.value.naturalMonthMapping.slice(0, 10);
});

// 加载预览
async function loadPreview() {
  if (!props.configValue) {
    error.value = '请先配置规则';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const { data, error: apiError } = await fetchPreviewSchedule({
      ruleType: props.ruleType,
      configValue: props.configValue,
      factoryId: props.factoryId,
      previewDays: props.previewDays
    });

    if (apiError) {
      error.value = apiError.message || '加载预览失败';
      emit('error', error.value);
    } else if (data) {
      previewData.value = data;
      emit('loaded', data);
    }
  } catch (e: any) {
    error.value = e.message || '未知错误';
    emit('error', error.value);
  } finally {
    loading.value = false;
  }
}

// 自动加载预览
watch(
  () => [props.configValue, props.ruleType],
  () => {
    if (props.configValue) {
      loadPreview();
    }
  },
  { immediate: true }
);

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 获取日期类型样式
function getDayClass(day: any) {
  if (!day.isWorkDay) return 'bg-gray-100 text-gray-400';
  return 'bg-green-50 text-green-600';
}
</script>

<template>
  <div v-loading="loading" class="rule-preview">
    <!-- 错误状态 -->
    <ElEmpty v-if="error" :description="error">
      <ElButton type="primary" @click="loadPreview">重试</ElButton>
    </ElEmpty>

    <!-- 预览内容 -->
    <div v-else-if="previewData" class="space-y-4">
      <!-- 概览信息 -->
      <ElCard shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">预览概览</span>
            <ElButton type="primary" text size="small" @click="loadPreview">
              <ElIcon><Refresh /></ElIcon>
              刷新
            </ElButton>
          </div>
        </template>

        <ElDescriptions :column="3" border size="small">
          <ElDescriptionsItem label="预览天数">{{ previewData.previewDays }} 天</ElDescriptionsItem>
          <ElDescriptionsItem label="生成班次">{{ previewData.generatedShifts?.length || 0 }} 条</ElDescriptionsItem>
          <ElDescriptionsItem label="工作日">
            {{ previewData.generatedDates?.filter(d => d.isWorkDay).length || 0 }} 天
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 日历视图 -->
      <ElCard v-if="calendarDays.length" shadow="never">
        <template #header>
          <span class="font-medium">日历视图</span>
        </template>

        <!-- 星期标题 -->
        <div class="grid grid-cols-7 mb-1 gap-1">
          <div v-for="day in weekDays" :key="day" class="bg-gray-50 py-2 text-center text-sm text-gray-600 font-medium">
            {{ day }}
          </div>
        </div>

        <!-- 日期格子 -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in calendarDays.slice(0, 28)"
            :key="day.date"
            class="h-14 flex flex-col items-center justify-center border rounded p-1"
            :class="getDayClass(day)"
          >
            <span class="text-sm font-medium">{{ day.dayOfMonth }}</span>
            <ElTag v-if="day.isWorkDay" size="small" type="success">班</ElTag>
            <ElTag v-else size="small" type="info">休</ElTag>
          </div>
        </div>
      </ElCard>

      <!-- 班组排班表 -->
      <ElCard v-if="teamShifts.length" shadow="never">
        <template #header>
          <span class="font-medium">班组排班预览（前7天）</span>
        </template>

        <ElTable :data="teamShifts" stripe size="small">
          <ElTableColumn prop="teamName" label="班组" width="120" fixed />
          <ElTableColumn v-for="(shift, idx) in 7" :key="idx" :label="`第${idx + 1}天`" width="100">
            <template #default="{ row }">
              <ElTag v-if="row.shifts[idx]" :color="row.shifts[idx].shiftColor" size="small">
                {{ row.shifts[idx].shiftName }}
              </ElTag>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>

      <!-- 自然月映射 -->
      <ElCard v-if="naturalMonthViews.length" shadow="never">
        <template #header>
          <span class="font-medium">自然月映射</span>
        </template>

        <ElTable :data="naturalMonthViews" stripe size="small" max-height="200">
          <ElTableColumn prop="cycleDate" label="周期日期" width="120" />
          <ElTableColumn prop="naturalMonth" label="自然月" width="100" />
          <ElTableColumn prop="boundaryType" label="边界类型" width="100">
            <template #default="{ row }">
              <ElTag :type="row.boundaryType === 'same_year' ? 'success' : 'warning'" size="small">
                {{ row.boundaryType === 'same_year' ? '同年' : '跨年' }}
              </ElTag>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>

    <!-- 空状态 -->
    <ElEmpty v-else description="配置规则后显示预览" />
  </div>
</template>

<style lang="scss" scoped>
.rule-preview {
  min-height: 300px;
}
</style>
