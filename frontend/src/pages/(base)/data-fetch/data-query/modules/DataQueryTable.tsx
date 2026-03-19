import { Empty, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type DataQueryTableProps = {
  data?: Api.DataQuery.IndustryPivotResult;
  loading?: boolean;
  onPageChange: (current: number, size: number) => void;
};

const DataQueryTable: FC<DataQueryTableProps> = memo(({ data, loading = false, onPageChange }) => {
  const columns: ColumnsType<Api.DataQuery.IndustryPivotRecord> = (data?.columns || []).map(column => ({
    dataIndex: column.key,
    ellipsis: { showTitle: false },
    fixed: column.key === 'projectName' ? undefined : column.fixed,
    key: column.key,
    render: value => {
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
        scroll={{ x: 'max-content' }}
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
