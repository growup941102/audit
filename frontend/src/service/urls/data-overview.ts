/** Data overview module URLs */

export const DATA_OVERVIEW_URLS = {
  PROJECT_STATUS_DETAIL: (projectId: string) => `/api/admin/projects/${encodeURIComponent(projectId)}/status/`,
  PROJECT_STATUS_RANKING: '/api/admin/projects/status/ranking/',
  PROJECT_STATUS_SUMMARY: '/api/admin/projects/status/summary/'
} as const;
