import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { fetchDataScheduleTasks } from '@/service/api';

export type ScheduleTaskRecord = Api.DataSchedule.TaskListRecord;

export type RecordWithIndex = ScheduleTaskRecord & { index: number };

export type ScheduleSearchParams = CommonType.RecordNullable<
  Api.Common.CommonSearchParams & {
    createTime: [Dayjs, Dayjs] | null;
    creator: string | string[];
    matchRangeMax: number;
    matchRangeMin: number;
    projectName: string;
    taskStatus: Api.DataSchedule.TaskStatus | Api.DataSchedule.TaskStatus[];
  }
>;

export const PAGE_SIZE = 10;

function normalizeMultiValue(value: string | string[] | null | undefined): string[] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const values = value.map(item => String(item).trim()).filter(Boolean);
    return values.length ? values : undefined;
  }

  const normalized = String(value).trim();
  return normalized ? [normalized] : undefined;
}

function formatRangeValue(value: Dayjs | string | null | undefined, endOfDay: boolean): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (dayjs.isDayjs(value)) {
    return value.format(endOfDay ? 'YYYY-MM-DD 23:59:59' : 'YYYY-MM-DD 00:00:00');
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return undefined;
  }
  if (normalized.length === 10) {
    return `${normalized} ${endOfDay ? '23:59:59' : '00:00:00'}`;
  }
  return normalized;
}

export async function fetchScheduleList(
  params: ScheduleSearchParams
): Promise<Api.Common.PaginatingQueryRecord<ScheduleTaskRecord>> {
  const createTime = params?.createTime;
  const createStartRaw = Array.isArray(createTime) ? createTime[0] : undefined;
  const createEndRaw = Array.isArray(createTime) ? createTime[1] : undefined;
  const taskStatus = normalizeMultiValue(params?.taskStatus ?? undefined) as Api.DataSchedule.TaskStatus[] | undefined;
  const creator = normalizeMultiValue(params?.creator ?? undefined);

  return fetchDataScheduleTasks({
    createEndTime: formatRangeValue(createEndRaw, true),
    createStartTime: formatRangeValue(createStartRaw, false),
    creator,
    current: params?.current ?? 1,
    matchRangeMax: params?.matchRangeMax ?? undefined,
    matchRangeMin: params?.matchRangeMin ?? undefined,
    projectName: params?.projectName ?? undefined,
    size: params?.size ?? PAGE_SIZE,
    taskStatus
  });
}
