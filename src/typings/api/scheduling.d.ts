declare namespace Api.Scheduling {
  /** Team */
  interface Team {
    id: number;
    name: string;
    code: string;
    description?: string;
    leaderId?: number;
    leaderName?: string;
    sort: number;
    status: number;
    color?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface TeamSearchParams {
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    status?: number;
  }

  interface TeamList {
    list: Team[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** Shift */
  interface Shift {
    id: number;
    name: string;
    code: string;
    description?: string;
    shiftType: number;
    startTime?: string;
    endTime?: string;
    durationHours?: number;
    isNextDay: boolean;
    color?: string;
    sort: number;
    status: number;
    createdAt?: string;
    updatedAt?: string;
  }

  interface ShiftSearchParams {
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    shiftType?: number;
    status?: number;
  }

  interface ShiftList {
    list: Shift[];
    total: number;
    page: number;
    pageSize: number;
  }

  /** Shift Pattern */
  interface ShiftPattern {
    id: number;
    name: string;
    code: string;
    description?: string;
    patternType: number;
    cycleDays: number;
    workDaysPerCycle: number;
    restDaysPerCycle: number;
    teamsCount: number;
    status: number;
    createdAt?: string;
    updatedAt?: string;
  }

  interface ShiftPatternDetail {
    id?: number;
    patternId?: number;
    teamId: number;
    teamName?: string;
    dayIndex: number;
    shiftId: number;
    shiftName?: string;
    shiftColor?: string;
    isWorkDay: boolean;
    sort: number;
  }

  interface ShiftPatternResponse extends ShiftPattern {
    details: ShiftPatternDetail[];
  }

  interface ShiftPatternSearchParams {
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    patternType?: number;
    status?: number;
  }

  interface ShiftPatternList {
    list: ShiftPattern[];
    total: number;
    page: number;
    pageSize: number;
  }

  interface GeneratePatternDetailsParams {
    patternType: number;
    cycleDays: number;
    workDaysPerCycle: number;
    restDaysPerCycle: number;
    teamIds: number[];
  }

  interface GeneratePatternDetailsByRuleParams {
    ruleId: number;
    teamIds: number[];
    cycleDays: number;
  }

  interface GeneratePatternDetailsWithConfigParams {
    patternType: number;
    teamIds: number[];
    configJson: string;
  }

  /** Schedule Calendar */
  interface ScheduleCalendar {
    id: number;
    scheduleDate: string;
    teamId: number;
    teamName?: string;
    teamColor?: string;
    shiftId: number;
    shiftName?: string;
    shiftColor?: string;
    patternId?: number;
    factoryMonthId?: number;
    status: number;
    remark?: string;
    startTime?: string;
    endTime?: string;
    isWorkDay?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }

  interface ScheduleCalendarSearchParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    teamId?: number;
    shiftId?: number;
    patternId?: number;
    factoryMonthId?: number;
  }

  interface ScheduleCalendarList {
    list: ScheduleCalendar[];
    total: number;
    page: number;
    pageSize: number;
  }

  interface TeamScheduleView {
    teamId: number;
    teamName: string;
    teamColor: string;
    shiftId: number;
    shiftName: string;
    shiftColor: string;
    status: number;
    remark: string;
    startTime: string;
    endTime: string;
  }

  interface ScheduleCalendarDayView {
    date: string;
    dayOfMonth: number;
    dayOfWeek: number;
    isWorkDay: boolean;
    isRestDay: boolean;
    isHoliday: boolean;
    holidayName: string;
    teams: TeamScheduleView[];
  }

  interface FactoryMonthView {
    id: number;
    factoryMonth: string;
    startDate: string;
    endDate: string;
  }

  interface ScheduleCalendarMonthView {
    year: number;
    month: number;
    factoryMonth?: FactoryMonthView;
    days: ScheduleCalendarDayView[];
  }

  interface GenerateScheduleParams {
    patternId: number;
    startDate: string;
    endDate: string;
    factoryMonthId?: number;
    coverExisting?: boolean;
  }

  interface BatchUpdateScheduleParams {
    ids: number[];
    shiftId?: number;
    status?: number;
    remark?: string;
  }

  interface ScheduleStatistics {
    teamStats: { teamId: number; workDays: number }[];
    shiftStats: { shiftId: number; usedCount: number }[];
    totalDays: number;
  }

  /** Factory Calendar */
  interface FactoryCalendar {
    id: number;
    calendarCode: string;
    calendarName: string;
    year: number;
    month: number;
    factoryMonth: string;
    startDate: string;
    endDate: string;
    workDays: number;
    restDays: number;
    description?: string;
    status: number;
    createdAt?: string;
    updatedAt?: string;
  }

  interface FactoryCalendarDetail {
    id?: number;
    calendarId?: number;
    date: string;
    dayOfWeek: number;
    isWorkDay: boolean;
    isHoliday: boolean;
    holidayName?: string;
    remark?: string;
  }

  interface FactoryCalendarView extends FactoryCalendar {
    days: FactoryCalendarDayView[];
  }

  interface FactoryCalendarDayView {
    date: string;
    dayOfMonth: number;
    dayOfWeek: number;
    isWorkDay: boolean;
    isHoliday: boolean;
    holidayName?: string;
  }

  interface FactoryCalendarSearchParams {
    page?: number;
    pageSize?: number;
    year?: number;
    month?: number;
    factoryMonth?: string;
    calendarCode?: string;
  }

  interface FactoryCalendarList {
    list: FactoryCalendar[];
    total: number;
    page: number;
    pageSize: number;
  }

  interface GenerateFactoryCalendarParams {
    year: number;
    month: number;
    calendarCode: string;
    calendarName: string;
    startDate: string;
    endDate: string;
    weekendDays?: number[];
    holidays?: HolidayParams[];
  }

  interface HolidayParams {
    date: string;
    holidayName: string;
    isWorkDay: boolean;
  }

  interface GenerateFactoryCalendarWithMappingParams {
    year: number;
    month: number;
    calendarCode: string;
    calendarName: string;
    mappingRuleId?: number;
    mappingConfig?: string;
    holidays?: HolidayParams[];
  }

  interface NaturalMonthMappingInfo {
    calendarId: number;
    factoryMonth: string;
    startDate: string;
    endDate: string;
    mappingType: string;
    naturalMonths: string[];
    boundaryType: string;
  }

  interface UpdateMappingConfigParams {
    calendarId: number;
    mappingRuleId?: number;
    mappingConfig?: string;
  }
}
