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

const mockData: ScheduleTaskRecord[] = [
  {
    completeTime: '2026-02-04 14:30:00',
    createBy: '张三',
    createTime: '2026-02-04 09:00:00',
    creator: '张三',
    id: 1,
    progress: 100,
    projectName: '道桥中心2025年度道路损害修复项目',
    status: '1',
    taskId: 'TASK-20260204-001',
    taskStatus: 'success',
    updateBy: '张三',
    updateTime: '2026-02-04 14:30:00'
  },
  {
    completeTime: '',
    createBy: '李四',
    createTime: '2026-02-04 10:15:00',
    creator: '李四',
    id: 2,
    progress: 67,
    projectName: '中国移动通讯集团北京分公司菜市口枢纽站安全巡检项目',
    status: '1',
    taskId: 'TASK-20260204-002',
    taskStatus: 'running',
    updateBy: '李四',
    updateTime: '2026-02-04 10:15:00'
  },
  {
    completeTime: '2026-02-03 18:45:00',
    createBy: '王五',
    createTime: '2026-02-03 08:30:00',
    creator: '王五',
    id: 3,
    progress: 100,
    projectName: '国家电网有限公司华东分部变电站安全检测项目',
    status: '1',
    taskId: 'TASK-20260203-001',
    taskStatus: 'success',
    updateBy: '王五',
    updateTime: '2026-02-03 18:45:00'
  },
  {
    completeTime: '',
    createBy: '赵六',
    createTime: '2026-02-03 11:00:00',
    creator: '赵六',
    id: 4,
    progress: 34,
    projectName: '中国石油化工集团有限公司茂名石化安全审计项目',
    status: '1',
    taskId: 'TASK-20260203-002',
    taskStatus: 'failed',
    updateBy: '赵六',
    updateTime: '2026-02-03 11:00:00'
  },
  {
    completeTime: '',
    createBy: '张三',
    createTime: '2026-02-02 09:30:00',
    creator: '张三',
    id: 5,
    progress: 0,
    projectName: '中国联合网络通信集团广州分公司核心机房巡检项目',
    status: '1',
    taskId: 'TASK-20260202-001',
    taskStatus: 'pending',
    updateBy: '张三',
    updateTime: '2026-02-02 09:30:00'
  },
  {
    completeTime: '',
    createBy: '李四',
    createTime: '2026-02-02 14:00:00',
    creator: '李四',
    id: 6,
    progress: 52,
    projectName: '中国铁路北京局集团有限公司京张高铁沿线检测项目',
    status: '1',
    taskId: 'TASK-20260202-002',
    taskStatus: 'paused',
    updateBy: '李四',
    updateTime: '2026-02-02 14:00:00'
  },
  {
    completeTime: '2026-02-01 17:20:00',
    createBy: '王五',
    createTime: '2026-02-01 08:00:00',
    creator: '王五',
    id: 7,
    progress: 100,
    projectName: '中国建筑集团有限公司雄安新区综合管廊巡检项目',
    status: '1',
    taskId: 'TASK-20260201-001',
    taskStatus: 'success',
    updateBy: '王五',
    updateTime: '2026-02-01 17:20:00'
  },
  {
    completeTime: '',
    createBy: '赵六',
    createTime: '2026-02-01 10:30:00',
    creator: '赵六',
    id: 8,
    progress: 0,
    projectName: '中国南方电网深圳供电局福田变电站安全审计项目',
    status: '1',
    taskId: 'TASK-20260201-002',
    taskStatus: 'stopped',
    updateBy: '赵六',
    updateTime: '2026-02-01 10:30:00'
  },
  {
    completeTime: '',
    createBy: '张三',
    createTime: '2026-01-31 09:00:00',
    creator: '张三',
    id: 9,
    progress: 88,
    projectName: '中国移动通讯集团浙江分公司杭州核心网检测项目',
    status: '1',
    taskId: 'TASK-20260131-001',
    taskStatus: 'running',
    updateBy: '张三',
    updateTime: '2026-01-31 09:00:00'
  },
  {
    completeTime: '2026-01-31 16:00:00',
    createBy: '李四',
    createTime: '2026-01-31 11:00:00',
    creator: '李四',
    id: 10,
    progress: 100,
    projectName: '中国华能集团有限公司山东莱州风电场巡检项目',
    status: '1',
    taskId: 'TASK-20260131-002',
    taskStatus: 'success',
    updateBy: '李四',
    updateTime: '2026-01-31 16:00:00'
  }
];

/** Mock API - generates paginated data by cycling mock records */
export function fetchScheduleList(
  params: ScheduleSearchParams
): Promise<Api.Common.PaginatingQueryRecord<ScheduleTaskRecord>> {
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = [...mockData];

      if (params.projectName) {
        filtered = filtered.filter(item => item.projectName.includes(params.projectName!));
      }
      if (params.taskStatus) {
        filtered = filtered.filter(item => item.taskStatus === params.taskStatus);
      }
      if (params.creator) {
        filtered = filtered.filter(item => item.creator === params.creator);
      }

      const current = params.current || 1;
      const size = params.size || PAGE_SIZE;
      const TOTAL = 1000;

      const records: ScheduleTaskRecord[] = [];
      const start = (current - 1) * size;
      for (let i = 0; i < size && start + i < TOTAL; i += 1) {
        const base = filtered[(start + i) % filtered.length];
        records.push({
          ...base,
          id: start + i + 1,
          taskId: `TASK-${String(20260200 + Math.floor((start + i) / 3) + 1).slice(0, 8)}-${String(((start + i) % 999) + 1).padStart(3, '0')}`
        });
      }

      resolve({ current, records, size, total: TOTAL });
    }, 500);
  });
}
