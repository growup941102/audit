/** Data schedule module URLs */

export const DATA_SCHEDULE_URLS = {
  ADMIN_RETRY: '/admin/retry',
  CREATE_EXTRACT_DRILLDOWN_ROW: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/rows/`,
  DELETE_EXTRACT_DRILLDOWN_ROW: (taskId: string, rowId: number) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/rows/${rowId}/delete/`,
  EXPORT_EXTRACT_RESULT: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/export/`,
  EXPORT_LOGS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/export/`,
  GET_CREATORS: '/api/data-schedule/creators/',
  GET_EXTRACT_DRILLDOWN: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/`,
  GET_EXTRACT_FIELDS: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/fields/`,
  GET_EXTRACT_SUMMARY: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/summary/`,
  GET_LOGS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/`,
  GET_LOGS_META: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/meta/`,
  GET_SELECT_DATA: '/api/data-schedule/select-data/',
  GET_TASK_DETAIL: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/detail/`,
  GET_TASK_LIST: '/api/data-schedule/tasks/',
  OPERATE_TASKS: '/api/data-schedule/tasks/actions/',
  UPDATE_EXTRACT_DRILLDOWN_ROW: (taskId: string, rowId: number) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/rows/${rowId}/`,
  UPDATE_EXTRACT_FIELD: (taskId: string, fieldKey: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/fields/${encodeURIComponent(fieldKey)}/`
} as const;
