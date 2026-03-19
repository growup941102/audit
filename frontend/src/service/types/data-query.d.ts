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

    type IndustryPivotResult = Common.PaginatingQueryRecord<IndustryPivotRecord> & {
      columns: IndustryPivotColumn[];
    };
  }
}
