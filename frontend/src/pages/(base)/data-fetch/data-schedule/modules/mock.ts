export interface ScheduleTaskRecord {
  completeTime: string;
  createBy: string;
  createTime: string;
  creator: string;
  id: number;
  progress: number;
  projectName: string;
  status: Api.Common.EnableStatus | null;
  taskId: string;
  taskStatus: string;
  updateBy: string;
  updateTime: string;
}

export type RecordWithIndex = ScheduleTaskRecord & { index: number };

export type ScheduleSearchParams = CommonType.RecordNullable<
  Pick<ScheduleTaskRecord, 'creator' | 'projectName'> & { taskStatus: string } & Api.Common.CommonSearchParams
>;

export const PAGE_SIZE = 10;

/** Real API is required. Mock data has been intentionally removed. */
export async function fetchScheduleList(
  _params: ScheduleSearchParams
): Promise<Api.Common.PaginatingQueryRecord<ScheduleTaskRecord>> {
  throw new Error('数据调度列表真实接口未接入，前端 mock 数据已移除');
}
