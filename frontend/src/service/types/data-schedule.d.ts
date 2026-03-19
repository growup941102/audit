/**
 * 命名空间 Api.DataSchedule
 *
 * 后端 API 模块：数据调度详情
 */
declare namespace Api {
  namespace DataSchedule {
    type Scope = 'all' | 'complete' | 'missing';
    type TaskStatus = 'failed' | 'paused' | 'pending' | 'running' | 'stopped' | 'success';
    type TaskAction = 'continue' | 'delete' | 'pause' | 'reExecute' | 'refresh' | 'stop';

    type ScopeCounts = {
      all: number;
      complete: number;
      missing: number;
    };

    type CreatorOption = {
      label: string;
      value: string;
    };

    type SelectDataCatalog = {
      description: string;
      id: string;
      name: string;
    };

    type SelectDataNode = {
      catalogId: string;
      children?: SelectDataNode[];
      fileExt?: string;
      fileSizeLabel?: string;
      id: string;
      itemCount?: number;
      name: string;
      parentId: string | null;
      type: 'file' | 'folder';
    };

    type SelectDataPayload = {
      catalogs: SelectDataCatalog[];
      projectTreeByCatalogId: Record<string, SelectDataNode[]>;
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

    type TaskDetail = TaskSummary & {
      industry: string;
      projectId: string;
    };

    type TaskListRecord = Common.CommonRecord<{
      completeTime: string;
      creator: string;
      progress: number;
      projectId?: string;
      projectName: string;
      taskId: string;
      taskStatus: TaskStatus;
    }>;

    type TaskListParams = {
      createEndTime?: string;
      createStartTime?: string;
      creator?: string | string[];
      current?: number;
      matchRangeMax?: number;
      matchRangeMin?: number;
      projectName?: string;
      size?: number;
      taskStatus?: TaskStatus | TaskStatus[];
    };

    type TaskList = Common.PaginatingQueryRecord<TaskListRecord>;

    type TaskActionParams = {
      action: TaskAction;
      taskIds?: string[];
    };

    type TaskActionResult = {
      action: TaskAction;
      deleted: number;
      fileReset: number;
      invalidTaskIds: string[];
      refreshedAt?: string;
      requested: number;
      statusStats?: Partial<Record<TaskStatus, number>>;
      total?: number;
      updated: number;
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

    type TaskLogMetaParams = {
      projectId?: string;
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
      projectId?: string;
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
