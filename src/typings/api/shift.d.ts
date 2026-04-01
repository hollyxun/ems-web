/**
 * Shift type and schedule types
 */
declare namespace Api {
  namespace Shift {
    /** Shift type */
    interface ShiftType {
      id: number;
      name: string;
      code: string;
      startTime: string; // HH:MM
      endTime: string; // HH:MM
      endNextDay: boolean;
      color: string;
      sort: number;
      status: number;
      description: string;
    }

    /** Shift schedule */
    interface ShiftSchedule {
      id: number;
      teamId: number;
      teamName?: string;
      teamCode?: string;
      shiftTypeId: number;
      shiftTypeName?: string;
      scheduleDate: string;
      status: number;
      remark: string;
      startTime?: string;
      endTime?: string;
      endNextDay?: boolean;
      color?: string;
    }

    /** Shift type search params */
    interface ShiftTypeSearchParams {
      page?: number;
      pageSize?: number;
      name?: string;
      code?: string;
      status?: number;
    }

    /** Shift schedule search params */
    interface ShiftScheduleSearchParams {
      page?: number;
      pageSize?: number;
      teamId?: number;
      startDate?: string;
      endDate?: string;
      status?: number;
    }

    /** Create shift type params */
    interface CreateShiftTypeParams {
      name: string;
      code: string;
      startTime: string;
      endTime: string;
      endNextDay?: boolean;
      color?: string;
      sort?: number;
      description?: string;
    }

    /** Update shift type params */
    interface UpdateShiftTypeParams {
      id: number;
      name?: string;
      startTime?: string;
      endTime?: string;
      endNextDay?: boolean;
      color?: string;
      sort?: number;
      status?: number;
      description?: string;
    }

    /** Create shift schedule params */
    interface CreateShiftScheduleParams {
      teamId: number;
      shiftTypeId: number;
      scheduleDate: string;
      status?: number;
      remark?: string;
    }

    /** Batch create shift schedule params */
    interface BatchCreateShiftScheduleParams {
      teamId: number;
      shiftTypeId: number;
      startDay: string;
      endDay: string;
      excludeWeekends?: boolean;
      daysOfWeek?: number[];
      status?: number;
      remark?: string;
    }

    /** Update shift schedule params */
    interface UpdateShiftScheduleParams {
      id: number;
      shiftTypeId?: number;
      status?: number;
      remark?: string;
    }
  }
}
