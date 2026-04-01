<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElButton, ElCard, ElTag } from 'element-plus';
import dayjs from 'dayjs';
import { useShiftScheduleStore } from '@/store/modules/shift-schedule';

defineOptions({ name: 'CalendarView' });

const props = defineProps<{
  teamId?: number;
}>();

const emit = defineEmits<{
  addSchedule: [date: string];
  editSchedule: [schedule: Api.Shift.ShiftSchedule];
}>();

const store = useShiftScheduleStore();

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

const currentYear = computed(() => store.currentMonth.getFullYear());
const currentMonth = computed(() => store.currentMonth.getMonth() + 1);

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  // Get first day of month
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Calculate the day of week for first day (0 = Sunday, adjust to Monday first)
  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Monday first

  // Calculate total days in month
  const totalDays = lastDay.getDate();

  // Build calendar grid
  const days: Array<{
    date: string;
    day: number;
    isCurrentMonth: boolean;
    schedules: Api.Shift.ShiftSchedule[];
  }> = [];

  // Add empty slots for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevDate = new Date(year, month - 1, -startDayOfWeek + i + 1);
    days.push({
      date: dayjs(prevDate).format('YYYY-MM-DD'),
      day: prevDate.getDate(),
      isCurrentMonth: false,
      schedules: []
    });
  }

  // Add days of current month
  for (let i = 1; i <= totalDays; i++) {
    const date = dayjs(new Date(year, month - 1, i)).format('YYYY-MM-DD');
    const schedules = store.schedulesByDate.get(date) || [];
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      schedules
    });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(year, month, i);
    days.push({
      date: dayjs(nextDate).format('YYYY-MM-DD'),
      day: i,
      isCurrentMonth: false,
      schedules: []
    });
  }

  return days;
});

const isToday = (dateStr: string) => {
  return dayjs(dateStr).isSame(dayjs(), 'day');
};

function getShiftColor(schedule: Api.Shift.ShiftSchedule): string {
  return schedule.color || '#1890ff';
}

function handleDayClick(date: string) {
  emit('addSchedule', date);
}

function handleScheduleClick(schedule: Api.Shift.ShiftSchedule) {
  emit('editSchedule', schedule);
}

async function loadData() {
  await store.loadShiftTypes();
  await store.loadMonthSchedules(currentYear.value, currentMonth.value, props.teamId);
}

watch(
  () => props.teamId,
  () => {
    loadData();
  }
);

watch(
  () => store.currentMonth,
  () => {
    loadData();
  }
);

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="calendar-view">
    <!-- Week header -->
    <div class="calendar-header">
      <div v-for="day in weekDays" :key="day" class="header-cell">
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <div
        v-for="(dayInfo, index) in calendarDays"
        :key="index"
        class="calendar-cell"
        :class="{
          'other-month': !dayInfo.isCurrentMonth,
          'is-today': isToday(dayInfo.date)
        }"
        @click="handleDayClick(dayInfo.date)"
      >
        <div class="day-number">{{ dayInfo.day }}</div>
        <div class="schedules-container">
          <ElTag
            v-for="schedule in dayInfo.schedules"
            :key="schedule.id"
            :color="getShiftColor(schedule)"
            effect="dark"
            size="small"
            class="schedule-tag"
            @click.stop="handleScheduleClick(schedule)"
          >
            {{ schedule.shiftTypeName || '' }}
            <span v-if="schedule.endNextDay" class="overnight-indicator">~次日</span>
          </ElTag>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calendar-view {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-cell {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--el-border-color-lighter);
}

.calendar-cell {
  min-height: 100px;
  padding: 8px;
  background-color: var(--el-bg-color);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

.other-month {
  background-color: var(--el-fill-color-lighter);

  .day-number {
    color: var(--el-text-color-placeholder);
  }
}

.is-today {
  .day-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: var(--el-color-primary);
    color: white;
    border-radius: 50%;
  }
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.schedules-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-tag {
  cursor: pointer;
  font-size: 12px;

  &:hover {
    opacity: 0.8;
  }
}

.overnight-indicator {
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.8;
}
</style>
