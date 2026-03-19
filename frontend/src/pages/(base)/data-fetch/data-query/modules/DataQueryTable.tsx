import { Button, Empty, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export type DataQueryDrilldownClickPayload = {
  fieldKey: string;
  fieldTitle: string;
  projectId: string;
  projectName: string;
};

type DataQueryTableProps = {
  data?: Api.DataQuery.IndustryPivotResult;
  loading?: boolean;
  onDrilldown: (payload: DataQueryDrilldownClickPayload) => void;
  onPageChange: (current: number, size: number) => void;
};

const DRILLDOWN_FIELD_KEY_ALIAS_MAP: Record<string, string> = {
  expert_info: 'expert_info',
  opening_attendee_info: 'opening_attendee_info',
  tender_agent_info: 'tender_agent_info',
  开标人员信息: 'opening_attendee_info',
  招标代理机构: 'tender_agent_info',
  评标专家信息: 'expert_info'
};

const DataQueryTable: FC<DataQueryTableProps> = memo(({ data, loading = false, onDrilldown, onPageChange }) => {
  const columns: ColumnsType<Api.DataQuery.IndustryPivotRecord> = (data?.columns || []).map(column => ({
    dataIndex: column.key,
    ellipsis: { showTitle: false },
    fixed: column.key === 'projectName' ? undefined : column.fixed,
    key: column.key,
    render: (value, record) => {
      const mappedFieldKey = DRILLDOWN_FIELD_KEY_ALIAS_MAP[column.key] || DRILLDOWN_FIELD_KEY_ALIAS_MAP[column.title] || '';
      if (mappedFieldKey) {
        const projectId = String(record?.projectId || '');
        const projectName = String(record?.projectName || '');
        return (
          <Button
            className="px-0!"
            disabled={!projectId}
            size="small"
            type="link"
            onClick={() =>
              onDrilldown({
                fieldKey: mappedFieldKey,
                fieldTitle: column.title,
                projectId,
                projectName
              })
            }
          >
            查看
          </Button>
        );
      }

      const normalized = typeof value === 'string' ? value.trim() : value;
      if (normalized === undefined || normalized === null || normalized === '') {
        return '--';
      }
      const displayValue = String(value);
      return (
        <Tooltip title={displayValue}>
          <span className="block w-full truncate">{displayValue}</span>
        </Tooltip>
      );
    },
    title: column.title,
    width: 220
  }));

  const records = (data?.records || []).map((item, index) => ({
    ...item,
    key: item.projectId || `${item.projectName}-${index}`
  }));

  return (
    <div className="rounded-8px bg-white p-16px">
      <Table<Api.DataQuery.IndustryPivotRecord>
        columns={columns}
        dataSource={records}
        loading={loading}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        rowKey="key"
        scroll={{ x: (data?.columns?.length || 1) * 220  }}
        pagination={{
          current: data?.current || 1,
          onChange: (current, size) => {
            onPageChange(current, size);
          },
          pageSize: data?.size || 10,
          showQuickJumper: true,
          showSizeChanger: true,
          size: 'default',
          total: data?.total || 0
        }}
      />
    </div>
  );
});

export default DataQueryTable;
