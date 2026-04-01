import { request } from '../request';

// ===================== ShiftType APIs =====================

/**
 * Create shift type
 * @param data Shift type data
 */
export function fetchCreateShiftType(data: Api.Shift.CreateShiftTypeParams) {
  return request<Api.Shift.ShiftType>({
    url: '/shiftType/create',
    method: 'post',
    data
  });
}

/**
 * Update shift type
 * @param data Shift type data
 */
export function fetchUpdateShiftType(data: Api.Shift.UpdateShiftTypeParams) {
  return request<Api.Shift.ShiftType>({
    url: '/shiftType/update',
    method: 'put',
    data
  });
}

/**
 * Delete shift type
 * @param id Shift type ID
 */
export function fetchDeleteShiftType(id: number) {
  return request<boolean>({
    url: '/shiftType/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * Get shift type by ID
 * @param id Shift type ID
 */
export function fetchGetShiftTypeById(id: number) {
  return request<Api.Shift.ShiftType>({
    url: '/shiftType/detail',
    method: 'get',
    params: { id }
  });
}

/**
 * Get shift type list
 * @param data Search params
 */
export function fetchGetShiftTypeList(data: Api.Shift.ShiftTypeSearchParams) {
  return request<Api.Common.PageResult<Api.Shift.ShiftType>>({
    url: '/shiftType/list',
    method: 'post',
    data
  });
}

/**
 * Get all shift types
 */
export function fetchGetAllShiftTypes() {
  return request<Api.Shift.ShiftType[]>({
    url: '/shiftType/all',
    method: 'get'
  });
}

/**
 * Change shift type status
 * @param id Shift type ID
 * @param status Status
 */
export function fetchChangeShiftTypeStatus(id: number, status: number) {
  return request<boolean>({
    url: '/shiftType/status',
    method: 'put',
    data: { id, status }
  });
}

// ===================== ShiftSchedule APIs =====================

/**
 * Create shift schedule
 * @param data Schedule data
 */
export function fetchCreateShiftSchedule(data: Api.Shift.CreateShiftScheduleParams) {
  return request<Api.Shift.ShiftSchedule>({
    url: '/shiftSchedule/create',
    method: 'post',
    data
  });
}

/**
 * Batch create shift schedule
 * @param data Batch schedule data
 */
export function fetchBatchCreateShiftSchedule(data: Api.Shift.BatchCreateShiftScheduleParams) {
  return request<boolean>({
    url: '/shiftSchedule/batchCreate',
    method: 'post',
    data
  });
}

/**
 * Update shift schedule
 * @param data Schedule data
 */
export function fetchUpdateShiftSchedule(data: Api.Shift.UpdateShiftScheduleParams) {
  return request<boolean>({
    url: '/shiftSchedule/update',
    method: 'put',
    data
  });
}

/**
 * Delete shift schedule
 * @param id Schedule ID
 */
export function fetchDeleteShiftSchedule(id: number) {
  return request<boolean>({
    url: '/shiftSchedule/delete',
    method: 'delete',
    params: { id }
  });
}

/**
 * Get shift schedule by ID
 * @param id Schedule ID
 */
export function fetchGetShiftScheduleById(id: number) {
  return request<Api.Shift.ShiftSchedule>({
    url: '/shiftSchedule/detail',
    method: 'get',
    params: { id }
  });
}

/**
 * Get shift schedule list
 * @param data Search params
 */
export function fetchGetShiftScheduleList(data: Api.Shift.ShiftScheduleSearchParams) {
  return request<Api.Common.PageResult<Api.Shift.ShiftSchedule>>({
    url: '/shiftSchedule/list',
    method: 'post',
    data
  });
}

/**
 * Get team shift calendar
 * @param teamId Team ID
 * @param year Year
 * @param month Month
 */
export function fetchGetTeamShiftCalendar(teamId: number, year: number, month: number) {
  return request<Api.Shift.ShiftSchedule[]>({
    url: '/shiftSchedule/calendar',
    method: 'get',
    params: { teamId, year, month }
  });
}
