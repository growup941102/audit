/**
 * 命名空间 Api.DataQuery
 *
 * 后端 API 模块：数据查询
 */
declare namespace Api {
  namespace DataQuery {
    type IndustryOption = {
      label: string;
      value: string;
    };

    type IndustryPivotColumn = {
      fixed?: 'left' | 'right';
      key: string;
      title: string;
    };

    type IndustryPivotRecord = {
      projectId: string;
      projectName: string;
      [key: string]: string;
    };

    type IndustryPivotParams = {
      current?: number;
      industry: string;
      projectName?: string;
      size?: number;
    };

    type IndustryPivotExportParams = Pick<IndustryPivotParams, 'industry' | 'projectName'>;

    type IndustryPivotResult = Common.PaginatingQueryRecord<IndustryPivotRecord> & {
      columns: IndustryPivotColumn[];
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
      industry: string;
      projectId: string;
      size?: number;
    };

    type DrilldownResult = Common.PaginatingQueryRecord<DrilldownRecord> & {
      actions: DrilldownActions;
      columns: DrilldownColumn[];
      fieldKey: string;
      title: string;
    };
  }
}
