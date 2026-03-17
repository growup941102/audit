/**
 * 命名空间 Api.DataSchedule
 *
 * 后端 API 模块：数据调度详情
 */
declare namespace Api {
  namespace DataSchedule {
    type Scope = 'all' | 'complete' | 'missing';

    type ScopeCounts = {
      all: number;
      complete: number;
      missing: number;
    };

    type TaskSummary = {
      bidNo: string;
      counts: ScopeCounts;
      createTime: string;
      creator: string;
      progress: number;
      projectName: string;
      status: string;
      taskId: string;
    };

    type FieldRecord = {
      canDrilldown: boolean;
      canEdit: boolean;
      drilldownLabel: string;
      fieldKey: string;
      fieldName: string;
      fieldValueDisplay: string;
      status: Scope;
    };

    type FieldListParams = {
      current?: number;
      scope?: Scope;
      size?: number;
      taskId: string;
    };

    type FieldList = Common.PaginatingQueryRecord<FieldRecord> & {
      counts: ScopeCounts;
      scope: Scope;
    };

    type FieldUpdateParams = {
      fieldKey: string;
      fieldValue: string;
      taskId: string;
    };

    type DrilldownColumn = {
      editable?: boolean;
      key: string;
      title: string;
      width?: number;
    };

    type DrilldownActions = {
      canCreate: boolean;
      canDelete: boolean;
      canEdit: boolean;
    };

    type DrilldownRecord = Record<string, string | number | boolean | null>;

    type DrilldownParams = {
      current?: number;
      fieldKey: string;
      scope?: Scope;
      size?: number;
      taskId: string;
    };

    type DrilldownResult = Common.PaginatingQueryRecord<DrilldownRecord> & {
      actions: DrilldownActions;
      columns: DrilldownColumn[];
      fieldKey: string;
      scope: Scope;
      title: string;
    };

    type DrilldownRowPayload = Record<string, string | number | boolean | null>;

    type CreateDrilldownRowParams = {
      fieldKey: string;
      rowData: DrilldownRowPayload;
      taskId: string;
    };

    type UpdateDrilldownRowParams = {
      fieldKey: string;
      rowData: DrilldownRowPayload;
      rowId: number;
      taskId: string;
    };

    type DeleteDrilldownRowParams = {
      fieldKey: string;
      rowId: number;
      taskId: string;
    };

    type ExportParams = {
      scope?: Scope;
      taskId: string;
    };

    type LogLevel = 'error' | 'info' | 'warn';
    type LogOrderBy = 'time';
    type LogOrderDirection = 'asc' | 'desc';

    type TaskLogMeta = {
      nodeName: string;
      projectName: string;
      serviceName: string;
      taskId: string;
    };

    type TaskLogRecord = {
      component: string;
      id: number;
      level: LogLevel;
      message: string;
      time: string;
    };

    type TaskLogListParams = {
      count?: number;
      endTime?: string;
      keyword?: string;
      level?: LogLevel;
      orderBy?: LogOrderBy;
      orderDirection?: LogOrderDirection;
      startTime?: string;
      taskId: string;
    };

    type TaskLogList = {
      count: number;
      records: TaskLogRecord[];
      total: number;
    };

    type TaskLogExportParams = TaskLogListParams;
  }
}
