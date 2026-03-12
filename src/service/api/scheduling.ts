import { request } from '../request';

/**
 * Team Management API
 */

/** get team list */
export function fetchGetTeamList(params?: Api.Scheduling.TeamSearchParams) {
  return request<Api.Scheduling.TeamList>({
    url: '/api/v1/scheduling/team/getTeamList',
    method: 'get',
    params
  });
}

/** get all teams */
export function fetchGetAllTeams() {
  return request<Api.Scheduling.Team[]>({
    url: '/api/v1/scheduling/team/getAllTeams',
    method: 'get'
  });
}

/** get team by id */
export function fetchGetTeamById(id: number) {
  return request<Api.Scheduling.Team>({
    url: '/api/v1/scheduling/team/getTeamById',
    method: 'get',
    params: { id }
  });
}

/** create team */
export function fetchCreateTeam(data: Partial<Api.Scheduling.Team>) {
  return request<boolean>({
    url: '/api/v1/scheduling/team/createTeam',
    method: 'post',
    data
  });
}

/** update team */
export function fetchUpdateTeam(data: Partial<Api.Scheduling.Team> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/team/updateTeam',
    method: 'put',
    data
  });
}

/** delete team */
export function fetchDeleteTeam(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/team/deleteTeam',
    method: 'delete',
    data: { id }
  });
}

/** change team status */
export function fetchChangeTeamStatus(data: { id: number; status: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/team/changeTeamStatus',
    method: 'put',
    data
  });
}

/**
 * Shift Management API
 */

/** get shift list */
export function fetchGetShiftList(params?: Api.Scheduling.ShiftSearchParams) {
  return request<Api.Scheduling.ShiftList>({
    url: '/api/v1/scheduling/shift/getShiftList',
    method: 'get',
    params
  });
}

/** get all shifts */
export function fetchGetAllShifts() {
  return request<Api.Scheduling.Shift[]>({
    url: '/api/v1/scheduling/shift/getAllShifts',
    method: 'get'
  });
}

/** get shift by id */
export function fetchGetShiftById(id: number) {
  return request<Api.Scheduling.Shift>({
    url: '/api/v1/scheduling/shift/getShiftById',
    method: 'get',
    params: { id }
  });
}

/** create shift */
export function fetchCreateShift(data: Partial<Api.Scheduling.Shift>) {
  return request<boolean>({
    url: '/api/v1/scheduling/shift/createShift',
    method: 'post',
    data
  });
}

/** update shift */
export function fetchUpdateShift(data: Partial<Api.Scheduling.Shift> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/shift/updateShift',
    method: 'put',
    data
  });
}

/** delete shift */
export function fetchDeleteShift(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/shift/deleteShift',
    method: 'delete',
    data: { id }
  });
}

/** change shift status */
export function fetchChangeShiftStatus(data: { id: number; status: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/shift/changeShiftStatus',
    method: 'put',
    data
  });
}

/**
 * Shift Pattern API
 */

/** get shift pattern list */
export function fetchGetShiftPatternList(params?: Api.Scheduling.ShiftPatternSearchParams) {
  return request<Api.Scheduling.ShiftPatternList>({
    url: '/api/v1/scheduling/shiftPattern/getShiftPatternList',
    method: 'get',
    params
  });
}

/** get all shift patterns */
export function fetchGetAllShiftPatterns() {
  return request<Api.Scheduling.ShiftPattern[]>({
    url: '/api/v1/scheduling/shiftPattern/getAllShiftPatterns',
    method: 'get'
  });
}

/** get shift pattern by id */
export function fetchGetShiftPatternById(id: number) {
  return request<Api.Scheduling.ShiftPatternResponse>({
    url: '/api/v1/scheduling/shiftPattern/getShiftPatternById',
    method: 'get',
    params: { id }
  });
}

/** create shift pattern */
export function fetchCreateShiftPattern(data: Partial<Api.Scheduling.ShiftPatternResponse>) {
  return request<boolean>({
    url: '/api/v1/scheduling/shiftPattern/createShiftPattern',
    method: 'post',
    data
  });
}

/** update shift pattern */
export function fetchUpdateShiftPattern(data: Partial<Api.Scheduling.ShiftPatternResponse> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/shiftPattern/updateShiftPattern',
    method: 'put',
    data
  });
}

/** delete shift pattern */
export function fetchDeleteShiftPattern(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/shiftPattern/deleteShiftPattern',
    method: 'delete',
    data: { id }
  });
}

/** generate pattern details */
export function fetchGeneratePatternDetails(data: Api.Scheduling.GeneratePatternDetailsParams) {
  return request<Api.Scheduling.ShiftPatternDetail[]>({
    url: '/api/v1/scheduling/shiftPattern/generatePatternDetails',
    method: 'post',
    data
  });
}

/**
 * Schedule Calendar API
 */

/** get schedule calendar list */
export function fetchGetScheduleCalendarList(params?: Api.Scheduling.ScheduleCalendarSearchParams) {
  return request<Api.Scheduling.ScheduleCalendarList>({
    url: '/api/v1/scheduling/calendar/getScheduleCalendarList',
    method: 'get',
    params
  });
}

/** get schedule calendar by id */
export function fetchGetScheduleCalendarById(id: number) {
  return request<Api.Scheduling.ScheduleCalendar>({
    url: '/api/v1/scheduling/calendar/getScheduleCalendarById',
    method: 'get',
    params: { id }
  });
}

/** create schedule calendar */
export function fetchCreateScheduleCalendar(data: Partial<Api.Scheduling.ScheduleCalendar>) {
  return request<boolean>({
    url: '/api/v1/scheduling/calendar/createScheduleCalendar',
    method: 'post',
    data
  });
}

/** update schedule calendar */
export function fetchUpdateScheduleCalendar(data: Partial<Api.Scheduling.ScheduleCalendar> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/calendar/updateScheduleCalendar',
    method: 'put',
    data
  });
}

/** delete schedule calendar */
export function fetchDeleteScheduleCalendar(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/calendar/deleteScheduleCalendar',
    method: 'delete',
    data: { id }
  });
}

/** batch update schedule */
export function fetchBatchUpdateSchedule(data: Api.Scheduling.BatchUpdateScheduleParams) {
  return request<boolean>({
    url: '/api/v1/scheduling/calendar/batchUpdateSchedule',
    method: 'put',
    data
  });
}

/** generate schedule */
export function fetchGenerateSchedule(data: Api.Scheduling.GenerateScheduleParams) {
  return request<boolean>({
    url: '/api/v1/scheduling/calendar/generateSchedule',
    method: 'post',
    data
  });
}

/** get schedule calendar view */
export function fetchGetScheduleCalendarView(params: { year: number; month: number; teamId?: number }) {
  return request<Api.Scheduling.ScheduleCalendarMonthView>({
    url: '/api/v1/scheduling/calendar/getScheduleCalendarView',
    method: 'get',
    params
  });
}

/** get team schedule by date range */
export function fetchGetTeamScheduleByDateRange(params: { teamId: number; startDate: string; endDate: string }) {
  return request<Api.Scheduling.ScheduleCalendar[]>({
    url: '/api/v1/scheduling/calendar/getTeamScheduleByDateRange',
    method: 'get',
    params
  });
}

/** get schedule statistics */
export function fetchGetScheduleStatistics(params: { year: number; month: number }) {
  return request<Api.Scheduling.ScheduleStatistics>({
    url: '/api/v1/scheduling/calendar/getStatistics',
    method: 'get',
    params
  });
}

/**
 * Factory Calendar API
 */

/** get factory calendar list */
export function fetchGetFactoryCalendarList(params?: Api.Scheduling.FactoryCalendarSearchParams) {
  return request<Api.Scheduling.FactoryCalendarList>({
    url: '/api/v1/scheduling/factoryCalendar/getFactoryCalendarList',
    method: 'get',
    params
  });
}

/** get factory calendar by id */
export function fetchGetFactoryCalendarById(id: number) {
  return request<Api.Scheduling.FactoryCalendarView>({
    url: '/api/v1/scheduling/factoryCalendar/getFactoryCalendarById',
    method: 'get',
    params: { id }
  });
}

/** get factory calendar by date */
export function fetchGetFactoryCalendarByDate(date: string) {
  return request<Api.Scheduling.FactoryCalendar>({
    url: '/api/v1/scheduling/factoryCalendar/getFactoryCalendarByDate',
    method: 'get',
    params: { date }
  });
}

/** create factory calendar */
export function fetchCreateFactoryCalendar(data: Partial<Api.Scheduling.FactoryCalendar>) {
  return request<boolean>({
    url: '/api/v1/scheduling/factoryCalendar/createFactoryCalendar',
    method: 'post',
    data
  });
}

/** update factory calendar */
export function fetchUpdateFactoryCalendar(data: Partial<Api.Scheduling.FactoryCalendar> & { id: number }) {
  return request<boolean>({
    url: '/api/v1/scheduling/factoryCalendar/updateFactoryCalendar',
    method: 'put',
    data
  });
}

/** delete factory calendar */
export function fetchDeleteFactoryCalendar(id: number) {
  return request<boolean>({
    url: '/api/v1/scheduling/factoryCalendar/deleteFactoryCalendar',
    method: 'delete',
    data: { id }
  });
}

/** generate factory calendar */
export function fetchGenerateFactoryCalendar(data: Api.Scheduling.GenerateFactoryCalendarParams) {
  return request<boolean>({
    url: '/api/v1/scheduling/factoryCalendar/generateFactoryCalendar',
    method: 'post',
    data
  });
}

/** get factory calendar view */
export function fetchGetFactoryCalendarView(params: { year: number; month: number }) {
  return request<Api.Scheduling.FactoryCalendarView>({
    url: '/api/v1/scheduling/factoryCalendar/getFactoryCalendarView',
    method: 'get',
    params
  });
}
