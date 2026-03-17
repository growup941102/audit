import { request } from '../request';
import { DATA_OVERVIEW_URLS } from '../urls';

/** get project status summary */
export function fetchProjectStatusSummary() {
  return request<Api.DataOverview.ProjectStatusSummary>({
    method: 'get',
    url: DATA_OVERVIEW_URLS.PROJECT_STATUS_SUMMARY
  });
}

/** get project status detail */
export function fetchProjectStatusDetail(projectId: string) {
  return request<Api.DataOverview.ProjectStatusDetail>({
    method: 'get',
    url: DATA_OVERVIEW_URLS.PROJECT_STATUS_DETAIL(projectId)
  });
}

/** get project status ranking */
export function fetchProjectStatusRanking(params: Api.DataOverview.ProjectStatusRankingParams) {
  return request<Api.DataOverview.ProjectStatusRankingResult>({
    method: 'get',
    params,
    url: DATA_OVERVIEW_URLS.PROJECT_STATUS_RANKING
  });
}
