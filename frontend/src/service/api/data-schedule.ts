import { globalConfig } from '@/config';

import { request } from '../request';
import { getAuthorization } from '../request/shared';
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

function buildRequestURL(rawBase: string, url: string) {
  const baseURL = (rawBase || '').replace(/\/$/, '');
  return `${baseURL}${url}`;
}

async function fetchDataScheduleBlobFile(url: string, fallbackFileName: string) {
  const requestURL = buildRequestURL(globalConfig.serviceBaseURL || '', url);
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
  if (params.projectId) {
    query.set('projectId', params.projectId);
  }
  if (params.startTime) {
    query.set('startTime', params.startTime);
  }
  return query;
}

function buildDataScheduleRetryCreatePayload(
  params: Api.DataSchedule.RetryCreateTaskParams
): Api.DataSchedule.RetryCreateTaskPayload {
  return {
    fileIds: [],
    force: true,
    mode: 'pipeline',
    onlyStep: false,
    payload: {},
    preempt: true,
    priority: 838,
    projectIds: params.projectIds,
    stepNo: 1,
    subStep: ''
  };
}

/** get data schedule creator options */
export function fetchDataScheduleCreatorOptions(keyword?: string) {
  return request<Api.DataSchedule.CreatorOption[]>({
    method: 'get',
    params: keyword ? { keyword } : undefined,
    url: DATA_SCHEDULE_URLS.GET_CREATORS
  });
}

/** get data schedule select-data tree */
export function fetchDataScheduleSelectData() {
  return request<Api.DataSchedule.SelectDataPayload>({
    method: 'get',
    url: DATA_SCHEDULE_URLS.GET_SELECT_DATA
  });
}

/** get data schedule task list */
export function fetchDataScheduleTasks(params?: Api.DataSchedule.TaskListParams) {
  return request<Api.DataSchedule.TaskList>({
    method: 'get',
    params,
    url: DATA_SCHEDULE_URLS.GET_TASK_LIST
  });
}

/** operate data schedule tasks */
export function operateDataScheduleTasks(params: Api.DataSchedule.TaskActionParams) {
  return request<Api.DataSchedule.TaskActionResult>({
    data: params,
    method: 'post',
    url: DATA_SCHEDULE_URLS.OPERATE_TASKS
  });
}

/** create schedule tasks by retry admin api */
export async function createDataScheduleTasksByRetry(params: Api.DataSchedule.RetryCreateTaskParams) {
  const normalizedProjectIds = (params.projectIds || []).map(item => item.trim()).filter(Boolean);
  if (!normalizedProjectIds.length) {
    throw new Error('projectIds 不能为空');
  }

  const retryAdminBaseURL = globalConfig.serviceOtherBaseURL.retryAdmin || '';
  if (!retryAdminBaseURL) {
    throw new Error('未配置 retryAdmin 代理地址，请检查 VITE_OTHER_SERVICE_BASE_URL');
  }

  const requestURL = buildRequestURL(retryAdminBaseURL, DATA_SCHEDULE_URLS.ADMIN_RETRY);
  const authorization = getAuthorization();
  const payload = buildDataScheduleRetryCreatePayload({ projectIds: normalizedProjectIds });
  const response = await fetch(requestURL, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {})
    },
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`新增任务失败（${response.status}）`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = (await response.json()) as Api.DataSchedule.RetryCreateTaskResult;
    return json;
  }

  return { raw: await response.text() };
}

/** get extract result summary */
export function fetchDataScheduleExtractSummary(taskId: string) {
  return request<Api.DataSchedule.TaskSummary>({
    method: 'get',
    url: DATA_SCHEDULE_URLS.GET_EXTRACT_SUMMARY(taskId)
  });
}

/** get data schedule task detail */
export function fetchDataScheduleTaskDetail(taskId: string) {
  return request<Api.DataSchedule.TaskDetail>({
    method: 'get',
    url: DATA_SCHEDULE_URLS.GET_TASK_DETAIL(taskId)
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

/** update extract result field value */
export function updateDataScheduleExtractField(params: Api.DataSchedule.FieldUpdateParams) {
  const { fieldKey, fieldValue, taskId } = params;
  return request<Api.DataSchedule.FieldRecord>({
    data: { fieldValue },
    method: 'patch',
    url: DATA_SCHEDULE_URLS.UPDATE_EXTRACT_FIELD(taskId, fieldKey)
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

/** create drilldown row */
export function createDataScheduleDrilldownRow(params: Api.DataSchedule.CreateDrilldownRowParams) {
  const { taskId, ...payload } = params;
  return request<{ fieldKey: string; record: Api.DataSchedule.DrilldownRecord }>({
    data: payload,
    method: 'post',
    url: DATA_SCHEDULE_URLS.CREATE_EXTRACT_DRILLDOWN_ROW(taskId)
  });
}

/** update drilldown row */
export function updateDataScheduleDrilldownRow(params: Api.DataSchedule.UpdateDrilldownRowParams) {
  const { rowId, taskId, ...payload } = params;
  return request<{ fieldKey: string; record: Api.DataSchedule.DrilldownRecord }>({
    data: payload,
    method: 'patch',
    url: DATA_SCHEDULE_URLS.UPDATE_EXTRACT_DRILLDOWN_ROW(taskId, rowId)
  });
}

/** delete drilldown row */
export function deleteDataScheduleDrilldownRow(params: Api.DataSchedule.DeleteDrilldownRowParams) {
  const { fieldKey, rowId, taskId } = params;
  return request<{ fieldKey: string; rowId: number }>({
    method: 'delete',
    params: { fieldKey },
    url: DATA_SCHEDULE_URLS.DELETE_EXTRACT_DRILLDOWN_ROW(taskId, rowId)
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
export function fetchDataScheduleLogsMeta(params: Api.DataSchedule.TaskLogMetaParams) {
  const { projectId, taskId } = params;
  return request<Api.DataSchedule.TaskLogMeta>({
    method: 'get',
    params: projectId ? { projectId } : undefined,
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
