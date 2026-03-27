<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElButton, ElSelect, ElOption, ElSpace, ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { useShiftScheduleStore } from '@/store/modules/shift-schedule';
import CalendarView from './components/calendar-view.vue';
import ScheduleForm from './components/schedule-form.vue';
import type { Api } from '@/typings/api';

defineOptions({ name: 'ShiftSchedulePage' });

const store = useShiftScheduleStore();

const selectedTeamId = ref<number | undefined>(undefined);
const formVisible = ref(false);
const editingSchedule = ref<Api.Shift.Shift.ShiftSchedule | null>(null);
const selectedDate = ref('');

const currentYear = computed(() => store.currentMonth.getFullYear());
const currentMonth = computed(() => store.currentMonth.getMonth() + 1);
const monthDisplay = computed(() => {
  return `${currentYear.value}年${currentMonth.value}月`;
});

function prevMonth() {
  const newDate = dayjs(store.currentMonth).subtract(1, 'month').toDate();
  store.setCurrentMonth(newDate);
}

function nextMonth() {
  const newDate = dayjs(store.currentMonth).add(1, 'month').toDate();
  store.setCurrentMonth(newDate);
}

function goToToday() {
  store.setCurrentMonth(new Date());
}

function handleAddSchedule(date: string) {
  selectedDate.value = date;
  editingSchedule.value = null;
  formVisible.value = true;
}

function handleEditSchedule(schedule: Api.Shift.ShiftSchedule) {
  editingSchedule.value = schedule;
  selectedDate.value = '';
  formVisible.value = true;
}

function handleFormSuccess() {
  store.loadMonthSchedules(currentYear.value, currentMonth.value, selectedTeamId.value);
}

async function handleDeleteSchedule(schedule: Api.Shift.ShiftSchedule) {
  try {
    await store.deleteSchedule(schedule.id);
    ElMessage.success('删除成功');
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败');
  }
}

function handleTeamChange(teamId: number | undefined) {
  selectedTeamId.value = teamId;
  store.setSelectedTeam(teamId || null);
  store.loadMonthSchedules(currentYear.value, currentMonth.value, teamId);
}

// TODO: Load teams from organization API
const teams = ref([
  { id: 1, name: '甲班' },
  { id: 2, name: '乙班' },
  { id: 3, name: '丙班' }
]);

onMounted(() => {
  store.loadShiftTypes();
});
</script>

<template>
  <div class="shift-schedule-page">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">班组排班管理</h2>
      <div class="header-actions">
        <ElButton type="primary" @click="formVisible = true">
          添加排班
        </ElButton>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-bar">
      <div class="team-selector">
        <span class="label">班组筛选:</span>
        <ElSelect
          v-model="selectedTeamId"
          placeholder="全部班组"
          clearable
          style="width: 200px"
          @change="handleTeamChange"
        >
          <ElOption
            v-for="team in teams"
            :key="team.id"
            :value="team.id"
            :label="team.name"
          />
        </ElSelect>
      </div>

      <div class="month-navigation">
        <ElButton text @click="prevMonth">
          <icon-mdi-chevron-left />
        </ElButton>
        <span class="month-display">{{ monthDisplay }}</span>
        <ElButton text @click="nextMonth">
          <icon-mdi-chevron-right />
        </ElButton>
        <ElButton size="small" @click="goToToday">今天</ElButton>
      </div>
    </div>

    <!-- Calendar -->
    <div class="calendar-container">
      <CalendarView
        :team-id="selectedTeamId"
        @add-schedule="handleAddSchedule"
        @edit-schedule="handleEditSchedule"
      />
    </div>

    <!-- Form Dialog -->
    <ScheduleForm
      v-model:visible="formVisible"
      :schedule="editingSchedule"
      :date="selectedDate"
      :team-id="selectedTeamId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<style scoped lang="scss">
.shift-schedule-page {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-lighter);
}

.team-selector {
  display: flex;
  align-items: center;
  gap: 8px;

  .label {
    color: var(--el-text-color-regular);
  }
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-display {
  min-width: 100px;
  text-align: center;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.calendar-container {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-lighter);
  overflow: hidden;
}
</style>