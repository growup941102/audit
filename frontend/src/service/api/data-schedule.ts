import { globalConfig } from '@/config';

import { getAuthorization } from '../request/shared';
import { request } from '../request';
import { DATA_SCHEDULE_URLS } from '../urls';

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

  const rawBase = globalConfig.serviceBaseURL || '';
  const baseURL = rawBase.replace(/\/$/, '');
  const requestURL = `${baseURL}${DATA_SCHEDULE_URLS.EXPORT_EXTRACT_RESULT(taskId)}${
    query.toString() ? `?${query.toString()}` : ''
  }`;

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
  let fileName = `data-schedule-${taskId}-${scope || 'all'}.xlsx`;
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
  if (parsedName) {
    fileName = parsedName;
  }

  return { blob, fileName };
}
