/**
 * React Query Keys
 *
 * Global unique keys for React Query cache management
 */

export const QUERY_KEYS = {
  // Auth
  AUTH: {
    USER_INFO: ['auth', 'userInfo'] as const
  },
  // Route
  ROUTE: {
    CONSTANT_ROUTES: ['route', 'constantRoutes'] as const,
    IS_ROUTE_EXIST: (routeName: string) => ['route', 'isRouteExist', routeName] as const,
    USER_ROUTES: ['route', 'userRoutes'] as const
  },
  // System Manage
  SYSTEM_MANAGE: {
    ALL_PAGES: ['systemManage', 'allPages'] as const,
    ALL_ROLES: ['systemManage', 'allRoles'] as const,
    MENU_LIST: ['systemManage', 'menuList'] as const,
    MENU_TREE: ['systemManage', 'menuTree'] as const,
    ROLE_LIST: (params?: Api.SystemManage.RoleSearchParams) => ['systemManage', 'roleList', params] as const,
    USER_LIST: (params?: Api.SystemManage.UserSearchParams) => ['systemManage', 'userList', params] as const,
    WATERMARK_SETTINGS: ['systemManage', 'watermarkSettings'] as const,
    WEBSITE_BRAND_SETTINGS: ['systemManage', 'websiteBrandSettings'] as const,
    WEBSITE_SETTINGS: ['systemManage', 'websiteSettings'] as const
  },
  // Data Schedule
  DATA_SCHEDULE: {
    EXTRACT_DRILLDOWN: (params: Api.DataSchedule.DrilldownParams | null) => ['dataSchedule', 'extractDrilldown', params] as const,
    EXTRACT_FIELDS: (params: Api.DataSchedule.FieldListParams | null) => ['dataSchedule', 'extractFields', params] as const,
    EXTRACT_SUMMARY: (taskId: string) => ['dataSchedule', 'extractSummary', taskId] as const,
    LOG_META: (taskId: string) => ['dataSchedule', 'logMeta', taskId] as const,
    LOG_LIST: (params: Api.DataSchedule.TaskLogListParams | null) => ['dataSchedule', 'logList', params] as const
  },
  // Data Overview
  DATA_OVERVIEW: {
    PROJECT_STATUS_DETAIL: (projectId: string) => ['dataOverview', 'projectStatusDetail', projectId] as const,
    PROJECT_STATUS_RANKING: (params: Api.DataOverview.ProjectStatusRankingParams) =>
      ['dataOverview', 'projectStatusRanking', params] as const,
    PROJECT_STATUS_SUMMARY: ['dataOverview', 'projectStatusSummary'] as const
  }
} as const;

export const MUTATION_KEYS = {
  AUTH: {
    LOGIN: ['auth', 'login'] as const,
    REFRESH_TOKEN: ['auth', 'refreshToken'] as const
  }
} as const;
