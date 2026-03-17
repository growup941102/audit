/** Data schedule module URLs */

export const DATA_SCHEDULE_URLS = {
  EXPORT_EXTRACT_RESULT: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/export/`,
  EXPORT_LOGS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/export/`,
  GET_EXTRACT_DRILLDOWN: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/`,
  CREATE_EXTRACT_DRILLDOWN_ROW: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/rows/`,
  UPDATE_EXTRACT_DRILLDOWN_ROW: (taskId: string, rowId: number) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/rows/${rowId}/`,
  DELETE_EXTRACT_DRILLDOWN_ROW: (taskId: string, rowId: number) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/rows/${rowId}/delete/`,
  GET_EXTRACT_FIELDS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/fields/`,
  UPDATE_EXTRACT_FIELD: (taskId: string, fieldKey: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/fields/${encodeURIComponent(fieldKey)}/`,
  GET_EXTRACT_SUMMARY: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/summary/`,
  GET_LOGS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/`,
  GET_LOGS_META: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/meta/`
} as const;
