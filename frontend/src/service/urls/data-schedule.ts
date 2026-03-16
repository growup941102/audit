/** Data schedule module URLs */

export const DATA_SCHEDULE_URLS = {
  EXPORT_EXTRACT_RESULT: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/export/`,
  EXPORT_LOGS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/export/`,
  GET_EXTRACT_DRILLDOWN: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/drilldown/`,
  GET_EXTRACT_FIELDS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/fields/`,
  GET_EXTRACT_SUMMARY: (taskId: string) =>
    `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/extract-result/summary/`,
  GET_LOGS: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/`,
  GET_LOGS_META: (taskId: string) => `/api/data-schedule/tasks/${encodeURIComponent(taskId)}/logs/meta/`
} as const;
