import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import { fetchDataScheduleLogsExport } from '@/service/api';
import { useDataScheduleLogs, useDataScheduleLogsMeta } from '@/service/hooks';

interface Props {
  readonly open: boolean;
  readonly projectName?: string;
  readonly taskId: string;
  readonly onCancel: () => void;
}

const LOG_COUNT_OPTIONS = [50, 100, 200, 500, 1000];

const ScheduleLogModal = ({ onCancel, open, projectName, taskId }: Props) => {
  const { t } = useTranslation();
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [level, setLevel] = useState<Api.DataSchedule.LogLevel | undefined>();
  const [count, setCount] = useState(100);
  const [orderDirection, setOrderDirection] = useState<Api.DataSchedule.LogOrderDirection>('desc');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKeywordInput('');
    setKeyword('');
    setLevel(undefined);
    setCount(100);
    setOrderDirection('desc');
    setDateRange([null, null]);
  }, [open, taskId]);

  const listParams = useMemo<Api.DataSchedule.TaskLogListParams | null>(() => {
    if (!open || !taskId) return null;

    return {
      count,
      endTime: dateRange[1] ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : undefined,
      keyword: keyword || undefined,
      level,
      orderBy: 'time',
      orderDirection,
      startTime: dateRange[0] ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      taskId
    };
  }, [count, dateRange, keyword, level, open, orderDirection, taskId]);

  const metaQuery = useDataScheduleLogsMeta(open ? taskId : null);
  const logsQuery = useDataScheduleLogs(listParams);

  const logMeta = metaQuery.data;
  const logData = logsQuery.data;
  const records = logData?.records || [];

  const levelLabelMap: Record<Api.DataSchedule.LogLevel, string> = {
    error: t('page.dataSchedule.logLevelError'),
    info: t('page.dataSchedule.logLevelInfo'),
    warn: t('page.dataSchedule.logLevelWarn')
  };

  const levelColorMap: Record<Api.DataSchedule.LogLevel, string> = {
    error: 'error',
    info: 'processing',
    warn: 'warning'
  };

  const columns = useMemo<ColumnsType<Api.DataSchedule.TaskLogRecord>>(
    () => [
      {
        dataIndex: 'time',
        key: 'time',
        title: (
          <AButton
            className="px-0!"
            size="small"
            type="link"
            onClick={() => {
              setOrderDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
            }}
          >
            {t('page.dataSchedule.logTime')}
            {orderDirection === 'desc' ? ' ↓' : ' ↑'}
          </AButton>
        ),
        width: 180
      },
      {
        dataIndex: 'component',
        key: 'component',
        title: t('page.dataSchedule.logComponent'),
        width: 160
      },
      {
        align: 'center',
        dataIndex: 'level',
        key: 'level',
        render: (value: Api.DataSchedule.LogLevel) => (
          <ATag color={levelColorMap[value] || 'default'}>{(levelLabelMap[value] || value).toUpperCase()}</ATag>
        ),
        title: t('page.dataSchedule.logLevel'),
        width: 120
      },
      {
        dataIndex: 'message',
        key: 'message',
        render: value => (
          <ATooltip title={value}>
            <span className="line-clamp-1">{value}</span>
          </ATooltip>
        ),
        title: t('page.dataSchedule.logMessage')
      }
    ],
    [levelColorMap, levelLabelMap, orderDirection, t]
  );

  async function handleRefresh() {
    await Promise.all([metaQuery.refetch(), logsQuery.refetch()]);
  }

  async function handleExport() {
    if (!listParams) return;

    try {
      setExporting(true);
      const result = await fetchDataScheduleLogsExport(listParams);
      const downloadUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.download = result.fileName;
      anchor.href = downloadUrl;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      window.$message?.success(t('page.dataSchedule.logExportSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.error');
      window.$message?.error(message);
    } finally {
      setExporting(false);
    }
  }

  function handleSearch() {
    setKeyword(keywordInput.trim());
  }

  return (
    <AModal
      destroyOnClose
      open={open}
      title={t('page.dataSchedule.logTitle')}
      width="min(1200px, calc(100vw - 24px))"
      footer={
        <AButton onClick={onCancel}>
          {t('page.dataSchedule.detailClose')}
        </AButton>
      }
      onCancel={onCancel}
    >
      <div className="flex-col gap-12px">
        <div className="rounded-10px border border-[#e2e8f0] bg-[#f8fafc] p-12px">
          <div className="flex items-start justify-between gap-12px lt-md:flex-col">
            <div className="grid flex-1 grid-cols-3 gap-12px lt-md:grid-cols-1">
              <div>
                <div className="text-12px text-[#94a3b8]">{t('page.dataSchedule.logProjectName')}</div>
                <div className="mt-4px text-14px text-[#0f172a]">{logMeta?.projectName || projectName || '--'}</div>
              </div>
              <div>
                <div className="text-12px text-[#94a3b8]">{t('page.dataSchedule.logServiceName')}</div>
                <div className="mt-4px text-14px text-[#0f172a]">{logMeta?.serviceName || '--'}</div>
              </div>
              <div>
                <div className="text-12px text-[#94a3b8]">{t('page.dataSchedule.logNodeName')}</div>
                <div className="mt-4px text-14px text-[#0f172a]">{logMeta?.nodeName || '--'}</div>
              </div>
            </div>

            <div className="flex gap-8px">
              <AButton
                icon={<IconIcRoundRefresh />}
                loading={metaQuery.isFetching || logsQuery.isFetching}
                onClick={handleRefresh}
              >
                {t('common.refresh')}
              </AButton>
              <AButton
                loading={exporting}
                type="primary"
                onClick={handleExport}
              >
                {t('page.dataSchedule.logExport')}
              </AButton>
            </div>
          </div>
        </div>

        <div className="rounded-10px border border-[#e2e8f0] bg-[#f8fafc] p-12px">
          <div className="grid grid-cols-[1.4fr_0.9fr_1.5fr_0.9fr_auto] items-center gap-10px lt-lg:grid-cols-1">
            <AInput
              allowClear
              placeholder={t('page.dataSchedule.logKeywordPlaceholder')}
              prefix={<IconIcRoundSearch className="text-[#94a3b8]" />}
              value={keywordInput}
              onChange={event => setKeywordInput(event.target.value)}
              onPressEnter={handleSearch}
            />

            <ASelect
              allowClear
              options={[
                { label: levelLabelMap.info, value: 'info' },
                { label: levelLabelMap.warn, value: 'warn' },
                { label: levelLabelMap.error, value: 'error' }
              ]}
              placeholder={t('page.dataSchedule.logLevelPlaceholder')}
              value={level}
              onChange={value => setLevel(value)}
            />

            <ADatePicker.RangePicker
              showTime
              value={dateRange}
              onChange={value => setDateRange((value as [Dayjs | null, Dayjs | null]) || [null, null])}
            />

            <ASelect
              options={LOG_COUNT_OPTIONS.map(value => ({
                label: `${value} ${t('page.dataSchedule.logCountUnit')}`,
                value
              }))}
              value={count}
              onChange={value => setCount(value)}
            />

            <div className="flex items-center justify-end gap-8px">
              <span className="text-13px text-[#64748b]">{t('page.dataSchedule.logFollowLatest')}</span>
              <ASwitch
                checked={orderDirection === 'desc'}
                onChange={checked => setOrderDirection(checked ? 'desc' : 'asc')}
              />
              <AButton
                ghost
                type="primary"
                onClick={handleSearch}
              >
                {t('common.search')}
              </AButton>
            </div>
          </div>
        </div>

        <ATable
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={logsQuery.isFetching}
          locale={{ emptyText: t('page.dataSchedule.logNoData') }}
          pagination={false}
          scroll={{ y: 420 }}
          size="small"
          title={() => (
            <div className="text-13px text-[#64748b]">
              {t('page.dataSchedule.logCountLabel')}: {logData?.count || count} / {t('page.dataSchedule.logTotalLabel')}:
              {` ${logData?.total || 0}`}
            </div>
          )}
        />
      </div>
    </AModal>
  );
};

export default ScheduleLogModal;
