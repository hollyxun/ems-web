import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchBatchCreateShiftSchedule,
  fetchCreateShiftSchedule,
  fetchDeleteShiftSchedule,
  fetchGetShiftScheduleList,
  fetchGetShiftTypeList,
  fetchUpdateShiftSchedule
} from '@/service/api/shift';
import { SetupStoreId } from '@/enum';

export const useShiftScheduleStore = defineStore(SetupStoreId.ShiftSchedule, () => {
  // State
  const shiftTypes = ref<Api.Shift.ShiftType[]>([]);
  const schedules = ref<Api.Shift.ShiftSchedule[]>([]);
  const currentMonth = ref(new Date());
  const selectedTeamId = ref<number | null>(null);
  const loading = ref(false);

  // Getters
  const activeShiftTypes = computed(() =>
    shiftTypes.value.filter(st => st.status === 1).sort((a, b) => a.sort - b.sort)
  );

  const schedulesByDate = computed(() => {
    const map = new Map<string, Api.Shift.ShiftSchedule[]>();
    schedules.value.forEach(s => {
      const date = s.scheduleDate.split('T')[0];
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(s);
    });
    return map;
  });

  const getShiftTypeById = computed(() => {
    return (id: number) => shiftTypes.value.find(st => st.id === id);
  });

  // Actions
  async function loadShiftTypes() {
    try {
      const res = await fetchGetShiftTypeList({ pageSize: 100 });
      if (res.data) {
        shiftTypes.value = res.data.list || [];
      }
    } catch (error) {
      console.error('Failed to load shift types:', error);
    }
  }

  async function loadMonthSchedules(year: number, month: number, teamId?: number) {
    loading.value = true;
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      const res = await fetchGetShiftScheduleList({
        startDate,
        endDate: endDateStr,
        teamId: teamId || undefined,
        pageSize: 1000
      });

      if (res.data) {
        schedules.value = res.data.list || [];
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createSchedule(data: Api.Shift.CreateShiftScheduleParams) {
    const res = await fetchCreateShiftSchedule(data);
    if (res.data) {
      await loadMonthSchedules(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + 1,
        selectedTeamId.value || undefined
      );
    }
    return res;
  }

  async function updateSchedule(data: Api.Shift.UpdateShiftScheduleParams) {
    const res = await fetchUpdateShiftSchedule(data);
    if (res.data) {
      await loadMonthSchedules(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + 1,
        selectedTeamId.value || undefined
      );
    }
    return res;
  }

  async function deleteSchedule(id: number) {
    const res = await fetchDeleteShiftSchedule(id);
    if (res.data) {
      schedules.value = schedules.value.filter(s => s.id !== id);
    }
    return res;
  }

  async function batchCreateSchedule(data: Api.Shift.BatchCreateShiftScheduleParams) {
    const res = await fetchBatchCreateShiftSchedule(data);
    if (res.data) {
      await loadMonthSchedules(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + 1,
        selectedTeamId.value || undefined
      );
    }
    return res;
  }

  function setCurrentMonth(date: Date) {
    currentMonth.value = date;
  }

  function setSelectedTeam(teamId: number | null) {
    selectedTeamId.value = teamId;
  }

  return {
    // State
    shiftTypes,
    schedules,
    currentMonth,
    selectedTeamId,
    loading,
    // Getters
    activeShiftTypes,
    schedulesByDate,
    getShiftTypeById,
    // Actions
    loadShiftTypes,
    loadMonthSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    batchCreateSchedule,
    setCurrentMonth,
    setSelectedTeam
  };
});
