import { globalConfig } from '@/config';

import { getAuthorization } from '../request/shared';
import { request } from '../request';
import { DATA_SCHEDULE_URLS } from '../urls';

function parseFileNameFromDisposition(disposition: string, fallback: string) {
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const basicName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  let parsedName = basicName;
  if (utf8Name) {
    try {
      parsedName = decodeURIComponent(utf8Name);
    } catch {
      parsedName = utf8Name;
    }
  }
  return parsedName || fallback;
}

async function fetchDataScheduleBlobFile(url: string, fallbackFileName: string) {
  const rawBase = globalConfig.serviceBaseURL || '';
  const baseURL = rawBase.replace(/\/$/, '');
  const requestURL = `${baseURL}${url}`;
  const authorization = getAuthorization();

  const response = await fetch(requestURL, {
    headers: authorization ? { Authorization: authorization } : undefined,
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`下载失败（${response.status}）`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const fileName = parseFileNameFromDisposition(disposition, fallbackFileName);

  return { blob, fileName };
}

function buildDataScheduleLogQuery(params: Omit<Api.DataSchedule.TaskLogListParams, 'taskId'>) {
  const query = new URLSearchParams();
  if (params.count) {
    query.set('count', String(params.count));
  }
  if (params.endTime) {
    query.set('endTime', params.endTime);
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }
  if (params.level) {
    query.set('level', params.level);
  }
  if (params.orderBy) {
    query.set('orderBy', params.orderBy);
  }
  if (params.orderDirection) {
    query.set('orderDirection', params.orderDirection);
  }
  if (params.startTime) {
    query.set('startTime', params.startTime);
  }
  return query;
}

/** get extract result summary */
export function fetchDataScheduleExtractSummary(taskId: string) {
  return request<Api.DataSchedule.TaskSummary>({
    method: 'get',
    url: DATA_SCHEDULE_URLS.GET_EXTRACT_SUMMARY(taskId)
  });
}

/** get extract result fields */
export function fetchDataScheduleExtractFields(params: Api.DataSchedule.FieldListParams) {
  const { taskId, ...query } = params;

  return request<Api.DataSchedule.FieldList>({
    method: 'get',
    params: query,
    url: DATA_SCHEDULE_URLS.GET_EXTRACT_FIELDS(taskId)
  });
}

/** get field drilldown detail */
export function fetchDataScheduleExtractDrilldown(params: Api.DataSchedule.DrilldownParams) {
  const { taskId, ...query } = params;

  return request<Api.DataSchedule.DrilldownResult>({
    method: 'get',
    params: query,
    url: DATA_SCHEDULE_URLS.GET_EXTRACT_DRILLDOWN(taskId)
  });
}

/** export extract result as excel file */
export async function fetchDataScheduleExtractExport(params: Api.DataSchedule.ExportParams) {
  const { scope, taskId } = params;

  const query = new URLSearchParams();
  if (scope) {
    query.set('scope', scope);
  }

  return fetchDataScheduleBlobFile(
    `${DATA_SCHEDULE_URLS.EXPORT_EXTRACT_RESULT(taskId)}${query.toString() ? `?${query.toString()}` : ''}`,
    `data-schedule-${taskId}-${scope || 'all'}.xlsx`
  );
}

/** get schedule logs meta info */
export function fetchDataScheduleLogsMeta(taskId: string) {
  return request<Api.DataSchedule.TaskLogMeta>({
    method: 'get',
    url: DATA_SCHEDULE_URLS.GET_LOGS_META(taskId)
  });
}

/** get schedule logs list */
export function fetchDataScheduleLogs(params: Api.DataSchedule.TaskLogListParams) {
  const { taskId, ...query } = params;
  return request<Api.DataSchedule.TaskLogList>({
    method: 'get',
    params: query,
    url: DATA_SCHEDULE_URLS.GET_LOGS(taskId)
  });
}

/** export schedule logs */
export async function fetchDataScheduleLogsExport(params: Api.DataSchedule.TaskLogExportParams) {
  const { taskId, ...queryParams } = params;
  const query = buildDataScheduleLogQuery(queryParams);

  return fetchDataScheduleBlobFile(
    `${DATA_SCHEDULE_URLS.EXPORT_LOGS(taskId)}${query.toString() ? `?${query.toString()}` : ''}`,
    `data-schedule-log-${taskId}.xlsx`
  );
}
