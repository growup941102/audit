import { Empty, Modal, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type DataQueryDrilldownModalProps = {
  data?: Api.DataQuery.DrilldownResult;
  loading?: boolean;
  open: boolean;
  onCancel: () => void;
  onPageChange: (current: number, size: number) => void;
};

const DataQueryDrilldownModal: FC<DataQueryDrilldownModalProps> = memo(
  ({ data, loading = false, open, onCancel, onPageChange }) => {
    const columns: ColumnsType<Api.DataQuery.DrilldownRecord> = (data?.columns || []).map(column => ({
      dataIndex: column.key,
      ellipsis: { showTitle: false },
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
      width: column.width || 220
    }));

    return (
      <Modal
        destroyOnClose
        footer={null}
        open={open}
        title={data?.title || '字段详情'}
        width="min(1280px, calc(100vw - 32px))"
        onCancel={onCancel}
      >
        <Table<Api.DataQuery.DrilldownRecord>
          columns={columns}
          dataSource={data?.records || []}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无数据" /> }}
          rowKey={(record, index) => String(record.id || index || 0)}
          scroll={{ x: 'max-content', y: 420 }}
          size="small"
          pagination={{
            current: data?.current || 1,
            onChange: (current, size) => {
              onPageChange(current, size || data?.size || 10);
            },
            pageSize: data?.size || 10,
            showSizeChanger: false,
            total: data?.total || 0
          }}
        />
      </Modal>
    );
  }
);

export default DataQueryDrilldownModal;
