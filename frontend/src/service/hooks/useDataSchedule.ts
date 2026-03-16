import { useQuery } from '@tanstack/react-query';

import { fetchDataScheduleExtractDrilldown, fetchDataScheduleExtractFields, fetchDataScheduleExtractSummary } from '../api';
import { QUERY_KEYS } from '../keys';

/** get extract result summary hook */
export function useDataScheduleExtractSummary(taskId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(taskId),
    queryFn: () => fetchDataScheduleExtractSummary(taskId as string),
    queryKey: QUERY_KEYS.DATA_SCHEDULE.EXTRACT_SUMMARY(taskId || '')
  });
}

/** get extract result field list hook */
export function useDataScheduleExtractFields(params: Api.DataSchedule.FieldListParams | null) {
  return useQuery({
    enabled: Boolean(params?.taskId),
    queryFn: () => fetchDataScheduleExtractFields(params as Api.DataSchedule.FieldListParams),
    queryKey: QUERY_KEYS.DATA_SCHEDULE.EXTRACT_FIELDS(params)
  });
}

/** get extract result drilldown hook */
export function useDataScheduleExtractDrilldown(params: Api.DataSchedule.DrilldownParams | null) {
  return useQuery({
    enabled: Boolean(params?.taskId && params?.fieldKey),
    queryFn: () => fetchDataScheduleExtractDrilldown(params as Api.DataSchedule.DrilldownParams),
    queryKey: QUERY_KEYS.DATA_SCHEDULE.EXTRACT_DRILLDOWN(params),
    retry: false
  });
}
