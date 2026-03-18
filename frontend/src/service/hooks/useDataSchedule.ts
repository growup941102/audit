import { useQuery } from '@tanstack/react-query';

import {
  fetchDataScheduleCreatorOptions,
  fetchDataScheduleExtractDrilldown,
  fetchDataScheduleExtractFields,
  fetchDataScheduleExtractSummary,
  fetchDataScheduleLogs,
  fetchDataScheduleLogsMeta,
  fetchDataScheduleSelectData,
  fetchDataScheduleTaskDetail
} from '../api';
import { QUERY_KEYS } from '../keys';

/** get creator options hook */
export function useDataScheduleCreatorOptions(keyword?: string) {
  return useQuery({
    queryFn: () => fetchDataScheduleCreatorOptions(keyword),
    queryKey: ['dataSchedule', 'creatorOptions', keyword || '']
  });
}

/** get select-data tree hook */
export function useDataScheduleSelectData() {
  return useQuery({
    queryFn: fetchDataScheduleSelectData,
    queryKey: QUERY_KEYS.DATA_SCHEDULE.SELECT_DATA
  });
}

/** get extract result summary hook */
export function useDataScheduleExtractSummary(taskId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(taskId),
    queryFn: () => fetchDataScheduleExtractSummary(taskId as string),
    queryKey: QUERY_KEYS.DATA_SCHEDULE.EXTRACT_SUMMARY(taskId || '')
  });
}

/** get task detail hook */
export function useDataScheduleTaskDetail(taskId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(taskId),
    queryFn: () => fetchDataScheduleTaskDetail(taskId as string),
    queryKey: ['dataSchedule', 'taskDetail', taskId || '']
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

/** get schedule logs meta hook */
export function useDataScheduleLogsMeta(taskId: string | null | undefined) {
  return useQuery({
    enabled: Boolean(taskId),
    queryFn: () => fetchDataScheduleLogsMeta(taskId as string),
    queryKey: QUERY_KEYS.DATA_SCHEDULE.LOG_META(taskId || '')
  });
}

/** get schedule logs list hook */
export function useDataScheduleLogs(params: Api.DataSchedule.TaskLogListParams | null) {
  return useQuery({
    enabled: Boolean(params?.taskId),
    queryFn: () => fetchDataScheduleLogs(params as Api.DataSchedule.TaskLogListParams),
    queryKey: QUERY_KEYS.DATA_SCHEDULE.LOG_LIST(params)
  });
}
