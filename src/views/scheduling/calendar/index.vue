<script setup lang="tsx">
import { computed, onMounted, ref, watch } from 'vue';
import { ElButton, ElDialog, ElMessage, ElTag } from 'element-plus';
import dayjs from 'dayjs';
import {
  fetchGenerateSchedule,
  fetchGetAllShiftPatterns,
  fetchGetAllTeams,
  fetchGetScheduleCalendarView
} from '@/service/api/scheduling';
import { $t } from '@/locales';
import CalendarSearch from './modules/calendar-search.vue';

defineOptions({ name: 'ScheduleCalendar' });

const currentDate = new Date();
const year = ref(currentDate.getFullYear());
const month = ref(currentDate.getMonth() + 1);
const loading = ref(false);
const calendarData = ref<Api.Scheduling.ScheduleCalendarMonthView | null>(null);
const allTeams = ref<Api.Scheduling.Team[]>([]);
const allPatterns = ref<Api.Scheduling.ShiftPattern[]>([]);
const selectedTeamId = ref<number | undefined>(undefined);
const showGenerateDialog = ref(false);
const generateForm = ref({
  patternId: undefined as number | undefined,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  coverExisting: false
});

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const searchParams = computed<Api.Scheduling.ScheduleCalendarSearchParams>({
  get() {
    return {
      year: year.value,
      month: month.value,
      teamId: selectedTeamId.value
    };
  },
  set(val) {
    year.value = val.year || currentDate.getFullYear();
    month.value = val.month || currentDate.getMonth() + 1;
    selectedTeamId.value = val.teamId;
  }
});

const calendarDays = computed(() => {
  if (!calendarData.value) return [];

  const days = calendarData.value.days || [];
  const firstDayOfWeek = dayjs(`${year.value}-${month.value}-01`).day();

  // Fill empty slots for the start of the month
  const emptySlots = Array(firstDayOfWeek).fill(null);

  return [...emptySlots, ...days];
});

async function loadCalendarData() {
  loading.value = true;
  try {
    const { data } = await fetchGetScheduleCalendarView({
      year: year.value,
      month: month.value,
      teamId: selectedTeamId.value
    });
    if (data) {
      calendarData.value = data;
      year.value = data.year;
      month.value = data.month;
    }
  } finally {
    loading.value = false;
  }
}

async function loadTeams() {
  const { data } = await fetchGetAllTeams();
  if (data) {
    allTeams.value = data.filter(t => t.status === 1);
  }
}

async function loadPatterns() {
  const { data } = await fetchGetAllShiftPatterns();
  if (data) {
    allPatterns.value = data.filter(p => p.status === 1);
  }
}

function prevMonth() {
  const current = dayjs(`${year.value}-${month.value}-01`);
  const prev = current.subtract(1, 'month');
  year.value = prev.year();
  month.value = prev.month() + 1;
  loadCalendarData();
}

function nextMonth() {
  const current = dayjs(`${year.value}-${month.value}-01`);
  const next = current.add(1, 'month');
  year.value = next.year();
  month.value = next.month() + 1;
  loadCalendarData();
}

function resetSearchParams() {
  const now = new Date();
  year.value = now.getFullYear();
  month.value = now.getMonth() + 1;
  selectedTeamId.value = undefined;
  loadCalendarData();
}

function openGenerateDialog() {
  showGenerateDialog.value = true;
  generateForm.value = {
    patternId: undefined,
    startDate: dayjs(`${year.value}-${month.value}-01`).format('YYYY-MM-DD'),
    endDate: dayjs(`${year.value}-${month.value}-01`).endOf('month').format('YYYY-MM-DD'),
    coverExisting: false
  };
}

async function handleGenerateSchedule() {
  if (!generateForm.value.patternId) {
    ElMessage.warning('请选择排班模式');
    return;
  }

  const { error } = await fetchGenerateSchedule({
    patternId: generateForm.value.patternId,
    startDate: generateForm.value.startDate,
    endDate: generateForm.value.endDate,
    coverExisting: generateForm.value.coverExisting
  });

  if (!error) {
    ElMessage.success('排班生成成功');
    showGenerateDialog.value = false;
    loadCalendarData();
  }
}

function getTeamName(teamId: number) {
  return allTeams.value.find(t => t.id === teamId)?.name || '-';
}

function isToday(date: string) {
  return dayjs(date).isSame(dayjs(), 'day');
}

function isOtherMonth(date: string) {
  return dayjs(date).month() + 1 !== month.value;
}

onMounted(() => {
  loadTeams();
  loadPatterns();
  loadCalendarData();
});

watch([year, month], () => {
  loadCalendarData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CalendarSearch
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="loadCalendarData"
      @generate="openGenerateDialog"
    >
      <template #teams>
        <ElOption v-for="team in allTeams" :key="team.id" :label="team.name" :value="team.id">
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded" :style="{ backgroundColor: team.color }" />
            <span>{{ team.name }}</span>
          </div>
        </ElOption>
      </template>
    </CalendarSearch>

    <ElCard v-loading="loading" class="flex-1 card-wrapper">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <ElButton @click="prevMonth">
              <template #icon>
                <icon-ic-round-chevron-left />
              </template>
            </ElButton>
            <span class="text-lg font-bold">{{ year }}年{{ month }}月</span>
            <ElButton @click="nextMonth">
              <template #icon>
                <icon-ic-round-chevron-right />
              </template>
            </ElButton>
          </div>
          <div v-if="calendarData?.factoryMonth" class="text-sm text-gray-500">
            工厂月：{{ calendarData.factoryMonth.factoryMonth }} ({{
              calendarData.factoryMonth.startDate
                ? dayjs(calendarData.factoryMonth.startDate).format('YYYY-MM-DD')
                : '-'
            }}
            ~
            {{
              calendarData.factoryMonth.endDate ? dayjs(calendarData.factoryMonth.endDate).format('YYYY-MM-DD') : '-'
            }})
          </div>
        </div>
      </template>

      <!-- 班组图例 -->
      <div class="mb-4 flex flex-wrap gap-4">
        <div v-for="team in allTeams" :key="team.id" class="flex items-center gap-2">
          <div class="h-4 w-4 rounded" :style="{ backgroundColor: team.color }" />
          <span class="text-sm">{{ team.name }}</span>
        </div>
      </div>

      <!-- 日历头部 -->
      <div class="grid grid-cols-7 mb-1 gap-1">
        <div
          v-for="day in weekDays"
          :key="day"
          class="bg-gray-100 py-2 text-center font-medium"
          :class="{ 'text-red-500': day === '日' || day === '六' }"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日历主体 -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="min-h-[100px] border p-1"
          :class="{
            'bg-gray-50': !day,
            'bg-blue-50': day && isToday(day.date),
            'opacity-50': day && isOtherMonth(day.date),
            'bg-red-50': day?.isHoliday,
            'bg-green-50': day?.isWorkDay && !day?.isHoliday
          }"
        >
          <template v-if="day">
            <div class="mb-1 flex items-center justify-between">
              <span
                class="text-sm font-medium"
                :class="{
                  'text-red-500': day.dayOfWeek === 0 || day.dayOfWeek === 6,
                  'text-blue-600': isToday(day.date)
                }"
              >
                {{ day.dayOfMonth }}
              </span>
              <ElTag v-if="day.isHoliday" type="danger" size="small">{{ day.holidayName || '休' }}</ElTag>
              <ElTag v-else-if="day.isWorkDay" type="success" size="small">班</ElTag>
            </div>

            <!-- 班组排班信息 -->
            <div class="space-y-1">
              <div
                v-for="team in day.teams || []"
                :key="team.teamId"
                class="truncate rounded px-1 py-0.5 text-xs"
                :style="{
                  backgroundColor: team.shiftColor + '20',
                  borderLeft: `3px solid ${team.shiftColor || '#999'}`
                }"
              >
                <span class="font-medium">{{ getTeamName(team.teamId) }}</span>
                <span v-if="team.shiftName" class="ml-1">{{ team.shiftName }}</span>
                <span v-if="team.startTime && team.endTime" class="ml-1 text-gray-500">
                  ({{ team.startTime }}-{{ team.endTime }})
                </span>
                <span v-else class="ml-1 text-gray-400">-</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </ElCard>

    <!-- 生成排班对话框 -->
    <ElDialog v-model="showGenerateDialog" title="生成排班" width="500px">
      <ElForm label-position="right" :label-width="100">
        <ElFormItem label="排班模式" required>
          <ElSelect v-model="generateForm.patternId" placeholder="请选择排班模式" style="width: 100%">
            <ElOption v-for="pattern in allPatterns" :key="pattern.id" :label="pattern.name" :value="pattern.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="开始日期" required>
          <ElDatePicker
            v-model="generateForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="结束日期" required>
          <ElDatePicker
            v-model="generateForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem>
          <ElCheckbox v-model="generateForm.coverExisting">覆盖已存在的排班</ElCheckbox>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElSpace>
          <ElButton @click="showGenerateDialog = false">{{ $t('common.cancel') }}</ElButton>
          <ElButton type="primary" @click="handleGenerateSchedule">{{ $t('common.confirm') }}</ElButton>
        </ElSpace>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow: auto;
}
</style>
