import { useCallback, useEffect, useRef, useState } from 'react';

import { TableHeaderOperation, useTable, useTableOperate } from '@/features/table';

import ScheduleCreateView from './modules/ScheduleCreateView';
import ScheduleDetailView from './modules/ScheduleDetailView';
import ScheduleLogModal from './modules/ScheduleLogModal';
import ScheduleSearch from './modules/ScheduleSearch';
import type { RecordWithIndex, ScheduleSearchParams } from './modules/mock';
import { PAGE_SIZE, fetchScheduleList } from './modules/mock';

const statusColorMap: Record<string, string> = {
  failed: 'error',
  paused: 'warning',
  pending: 'default',
  running: 'processing',
  stopped: 'default',
  success: 'success'
};

const statusI18nMap: Record<string, string> = {
  failed: 'page.dataSchedule.statusFailed',
  paused: 'page.dataSchedule.statusPaused',
  pending: 'page.dataSchedule.statusPending',
  running: 'page.dataSchedule.statusRunning',
  stopped: 'page.dataSchedule.statusStopped',
  success: 'page.dataSchedule.statusSuccess'
};

const DataSchedule = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = searchParams.get('mode') === 'add';
  const isDetailMode = searchParams.get('mode') === 'detail';
  const detailTaskId = searchParams.get('taskId') || '';

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useSize(tableWrapperRef);
  const scrollY = wrapperSize?.height ? wrapperSize.height - 55 : undefined;

  const isMobile = useMobile();
  const [logModalTask, setLogModalTask] = useState<{ projectName: string; taskId: string } | null>(null);

  const { columnChecks, data, run, searchProps, setColumnChecks, tableProps } = useTable({
    apiFn: fetchScheduleList,
    apiParams: {
      creator: null,
      current: 1,
      projectName: null,
      size: PAGE_SIZE,
      taskStatus: null
    },
    columns: () => [
      {
        align: 'center',
        dataIndex: 'taskId',
        key: 'taskId',
        title: t('page.dataSchedule.taskId'),
        width: 180
      },
      {
        dataIndex: 'projectName',
        key: 'projectName',
        render: (_, record) => (
          <ATooltip title={record.projectName}>
            <AButton
              className="max-w-full! p-0! text-left!"
              type="link"
              onClick={() => {
                goDetailSchedule(record.taskId);
              }}
            >
              <span className="line-clamp-2 whitespace-normal">{record.projectName}</span>
            </AButton>
          </ATooltip>
        ),
        title: t('page.dataSchedule.projectName'),
        width: 200
      },
      {
        align: 'center',
        dataIndex: 'taskStatus',
        key: 'taskStatus',
        render: (_, record) => {
          const label = t(statusI18nMap[record.taskStatus] || 'page.dataSchedule.statusPending');
          return <ATag color={statusColorMap[record.taskStatus] || 'default'}>{label}</ATag>;
        },
        title: t('page.dataSchedule.status'),
        width: 110
      },
      {
        align: 'center',
        dataIndex: 'progress',
        key: 'progress',
        render: (_, record) => (
          <div className="flex items-center">
            <AProgress
              percent={record.progress}
              showInfo={false}
              size={[60, 6]}
              status={record.taskStatus === 'failed' ? 'exception' : undefined}
              strokeColor={record.taskStatus === 'failed' ? '#f5222d' : undefined}
            />
            <span className="w-36px shrink-0 text-right text-12px">{record.progress}%</span>
          </div>
        ),
        title: t('page.dataSchedule.progress'),
        width: 120
      },
      {
        align: 'center',
        dataIndex: 'creator',
        key: 'creator',
        title: t('page.dataSchedule.creator'),
        width: 100
      },
      {
        align: 'center',
        dataIndex: 'createTime',
        key: 'createTime',
        title: t('page.dataSchedule.createTime'),
        width: 170
      },
      {
        align: 'center',
        dataIndex: 'completeTime',
        key: 'completeTime',
        render: (_, record) => record.completeTime || '-',
        title: t('page.dataSchedule.completeTime'),
        width: 170
      },
      {
        align: 'center',
        key: 'operate',
        render: (_, record) => (
          <div className="flex-center gap-8px">
            <AButton
              ghost
              size="small"
              type="primary"
              onClick={() => {
                goDetailSchedule(record.taskId);
              }}
            >
              {t('page.dataSchedule.viewResult')}
            </AButton>
            <ADropdown
              menu={{
                items: [
                  { key: 'log', label: t('page.dataSchedule.executionLog') },
                  {
                    danger: true,
                    key: 'delete',
                    label: t('common.delete')
                  }
                ],
                onClick: ({ key }) => {
                  if (key === 'log') {
                    setLogModalTask({
                      projectName: record.projectName,
                      taskId: record.taskId
                    });
                    return;
                  }

                  if (key === 'delete') {
                    window.$message?.info(t('page.dataSchedule.deleteTodo'));
                  }
                }
              }}
            >
              <AButton size="small">{t('page.dataSchedule.more')}</AButton>
            </ADropdown>
          </div>
        ),
        title: t('common.operate'),
        width: 200
      }
    ],
    pagination: false
  });

  // Infinite scroll state
  const [allRecords, setAllRecords] = useState<RecordWithIndex[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPageRef = useRef(1);
  const resetGenRef = useRef(0);
  const isResettingRef = useRef(false);

  // Reset scroll position helper
  const resetScrollPosition = useCallback(() => {
    const wrapper = tableWrapperRef.current;
    if (wrapper) {
      const tableBody = wrapper.querySelector('.ant-table-body');
      if (tableBody) {
        tableBody.scrollTop = 0;
      }
    }
  }, []);

  // When useTable data changes (initial load or search/reset), reset accumulated data
  useEffect(() => {
    if (data) {
      resetGenRef.current += 1;
      isResettingRef.current = false;
      setAllRecords(data as RecordWithIndex[]);
      currentPageRef.current = 1;
      hasMoreRef.current = data.length >= PAGE_SIZE;
      resetScrollPosition();
    }
  }, [data, resetScrollPosition]);

  // Stable loadMore with generation guard against stale results
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;

    const gen = resetGenRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    const nextPage = currentPageRef.current + 1;
    const formValues = searchProps.form.getFieldsValue();

    try {
      const res = await fetchScheduleList({
        ...formValues,
        current: nextPage,
        size: PAGE_SIZE
      } as ScheduleSearchParams);

      // Discard results if a reset/search happened while loading
      if (gen !== resetGenRef.current) return;

      if (res.records.length > 0) {
        setAllRecords(prev => {
          const startIndex = prev.length;
          return [
            ...prev,
            ...res.records.map((item, idx) => ({
              ...item,
              index: startIndex + idx + 1
            }))
          ];
        });
        currentPageRef.current = nextPage;
        hasMoreRef.current = res.records.length >= PAGE_SIZE;
      } else {
        hasMoreRef.current = false;
      }
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [searchProps.form]);

  // Scroll listener on .ant-table-body for infinite scroll
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return undefined;

    const tableBody = wrapper.querySelector('.ant-table-body');
    if (!tableBody) return undefined;

    const handleScroll = () => {
      const { clientHeight, scrollHeight, scrollTop } = tableBody;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadMore();
      }
    };

    tableBody.addEventListener('scroll', handleScroll);
    return () => tableBody.removeEventListener('scroll', handleScroll);
  }, [loadMore, scrollY]);

  // Custom reset: clear all form fields (including createTime etc.) then trigger search
  const handleReset = useCallback(() => {
    isResettingRef.current = true;
    searchProps.form.resetFields();
    searchProps.reset();
  }, [searchProps]);

  const { checkedRowKeys, onBatchDeleted, rowSelection } = useTableOperate(data, run, async () => {
    // placeholder
  });

  function goCreateSchedule() {
    nav('/data-fetch/data-schedule?mode=add');
  }

  function goDetailSchedule(taskId: string) {
    nav(`/data-fetch/data-schedule?mode=detail&taskId=${encodeURIComponent(taskId)}`);
  }

  function backToScheduleList() {
    nav('/data-fetch/data-schedule');
  }

  function handleCreateSchedule() {
    window.$message?.info('暂未接入后端接口，当前仅为界面展示');
  }

  const batchButtons = (
    <ASpace size={8}>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundReplay className="text-icon" />}
        size="small"
      >
        {t('page.dataSchedule.reExecute')}
      </AButton>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundPlayArrow className="text-icon" />}
        size="small"
      >
        {t('page.dataSchedule.continue')}
      </AButton>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundPause className="text-icon" />}
        size="small"
      >
        {t('page.dataSchedule.pause')}
      </AButton>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundStop className="text-icon" />}
        size="small"
      >
        {t('page.dataSchedule.stop')}
      </AButton>
    </ASpace>
  );

  if (isCreateMode) {
    return (
      <ScheduleCreateView
        onCancel={backToScheduleList}
        onCreate={handleCreateSchedule}
      />
    );
  }

  if (isDetailMode && detailTaskId) {
    return (
      <ScheduleDetailView
        taskId={detailTaskId}
        onBack={backToScheduleList}
      />
    );
  }

  return (
    <div className="h-full flex-col gap-16px overflow-hidden">
      <ACollapse
        bordered={false}
        className="shrink-0 card-wrapper"
        defaultActiveKey={isMobile ? undefined : '1'}
        items={[
          {
            children: (
              <ScheduleSearch
                {...searchProps}
                reset={handleReset}
              />
            ),
            key: '1',
            label: t('common.search')
          }
        ]}
      />

      <ACard
        className="min-h-0 flex-col-stretch flex-1 card-wrapper"
        styles={{ body: { display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0, overflow: 'hidden' } }}
        variant="borderless"
        title={
          <TableHeaderOperation
            hideColumnSetting
            add={goCreateSchedule}
            columns={columnChecks}
            disabledDelete={checkedRowKeys.length === 0}
            loading={tableProps.loading}
            prefix={batchButtons}
            refresh={run}
            setColumnChecks={setColumnChecks}
            onDelete={onBatchDeleted}
          />
        }
      >
        <div
          className="min-h-0 flex-1"
          ref={tableWrapperRef}
        >
          <ATable
            rowSelection={rowSelection}
            scroll={{ x: 1500, y: scrollY }}
            size="small"
            {...tableProps}
            dataSource={allRecords}
            loading={(!isResettingRef.current && tableProps.loading) || loadingMore}
            pagination={false}
          />
        </div>
      </ACard>

      <ScheduleLogModal
        open={Boolean(logModalTask)}
        projectName={logModalTask?.projectName}
        taskId={logModalTask?.taskId || ''}
        onCancel={() => setLogModalTask(null)}
      />
    </div>
  );
};

export default DataSchedule;
