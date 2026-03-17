import { useQuery } from '@tanstack/react-query';

import { fetchProjectStatusDetail, fetchProjectStatusRanking, fetchProjectStatusSummary } from '../api';
import { QUERY_KEYS } from '../keys';

/** get project status summary hook */
export function useProjectStatusSummary() {
  return useQuery({
    queryFn: fetchProjectStatusSummary,
    queryKey: QUERY_KEYS.DATA_OVERVIEW.PROJECT_STATUS_SUMMARY
  });
}

/** get project status detail hook */
export function useProjectStatusDetail(projectId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(projectId),
    queryFn: () => fetchProjectStatusDetail(projectId as string),
    queryKey: QUERY_KEYS.DATA_OVERVIEW.PROJECT_STATUS_DETAIL(projectId || '')
  });
}

/** get project status ranking hook */
export function useProjectStatusRanking(params: Api.DataOverview.ProjectStatusRankingParams) {
  return useQuery({
    queryFn: () => fetchProjectStatusRanking(params),
    queryKey: QUERY_KEYS.DATA_OVERVIEW.PROJECT_STATUS_RANKING(params)
  });
}
