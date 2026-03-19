import { useEffect, useRef, useState } from 'react';

import { TableHeaderOperation, useTable, useTableOperate } from '@/features/table';
import { operateDataScheduleTasks } from '@/service/api';

import ScheduleCreateView from './modules/ScheduleCreateView';
import ScheduleDetailView from './modules/ScheduleDetailView';
import ScheduleLogModal from './modules/ScheduleLogModal';
import ScheduleSearch from './modules/ScheduleSearch';
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

const dataScheduleTaskStatusSet = new Set<Api.DataSchedule.TaskStatus>([
  'pending',
  'running',
  'success',
  'failed',
  'paused',
  'stopped'
]);

function isDataScheduleTaskStatus(value: string): value is Api.DataSchedule.TaskStatus {
  return dataScheduleTaskStatusSet.has(value as Api.DataSchedule.TaskStatus);
}

const DataSchedule = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreateMode = searchParams.get('mode') === 'add';
  const isDetailMode = searchParams.get('mode') === 'detail';
  const detailTaskId = searchParams.get('taskId') || '';
  const incomingTaskStatus = Array.from(
    new Set(
      searchParams
        .getAll('taskStatus')
        .map(item => item.trim())
        .filter(isDataScheduleTaskStatus)
    )
  );

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useSize(tableWrapperRef);
  const scrollY = wrapperSize?.height ? wrapperSize.height - 55 : undefined;

  const isMobile = useMobile();
  const [logModalTask, setLogModalTask] = useState<{ projectId: string; projectName: string; taskId: string } | null>(null);
  const hasAppliedIncomingTaskStatusRef = useRef(false);

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
                      projectId: record.projectId || '',
                      projectName: record.projectName,
                      taskId: record.taskId
                    });
                    return;
                  }

                  if (key === 'delete') {
                    handleTaskAction('delete', [record.taskId]).catch(error => {
                      window.$message?.error(error instanceof Error ? error.message : t('common.error'));
                    });
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
    pagination: {
      showQuickJumper: true
    },
    rowKey: 'taskId'
  });

  useEffect(() => {
    if (hasAppliedIncomingTaskStatusRef.current) return;
    if (isCreateMode || isDetailMode) return;
    if (incomingTaskStatus.length === 0) return;

    hasAppliedIncomingTaskStatusRef.current = true;
    searchProps.form.setFieldsValue({ taskStatus: incomingTaskStatus });
    run().catch(() => {
      // keep page render stable if preset filters fail validation unexpectedly
    });
  }, [incomingTaskStatus, isCreateMode, isDetailMode, run, searchProps.form]);

  // Custom reset: clear all form fields (including createTime etc.) then trigger search
  function handleReset() {
    searchProps.form.resetFields();
    searchProps.reset();
  }

  const { checkedRowKeys, onSelectChange, rowSelection } = useTableOperate(data, run, async () => {
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

  function getSelectedTaskIds() {
    return checkedRowKeys.map(item => String(item)).filter(Boolean);
  }

  async function handleTaskAction(action: Api.DataSchedule.TaskAction, taskIds?: string[]) {
    const normalizedTaskIds = action === 'refresh' ? [] : taskIds || [];
    const result = await operateDataScheduleTasks({
      action,
      taskIds: normalizedTaskIds
    });

    if (result.invalidTaskIds?.length) {
      window.$message?.warning(`部分任务无效或已不存在：${result.invalidTaskIds.length} 条`);
    }

    if (action === 'refresh') {
      window.$message?.success(t('common.refresh'));
    } else if (action === 'delete') {
      window.$message?.success(t('common.deleteSuccess'));
    } else {
      window.$message?.success(t('common.updateSuccess'));
    }

    await run(false);
    if (action !== 'refresh') {
      onSelectChange([]);
    }
  }

  async function handleBatchAction(action: Api.DataSchedule.TaskAction) {
    const taskIds = getSelectedTaskIds();
    if (!taskIds.length) return;
    await handleTaskAction(action, taskIds);
  }

  async function handleBatchDelete() {
    await handleBatchAction('delete');
  }

  async function handleRefresh() {
    await handleTaskAction('refresh');
  }

  function triggerRefresh() {
    handleRefresh().catch(error => {
      window.$message?.error(error instanceof Error ? error.message : t('common.error'));
    });
  }

  function triggerBatchDelete() {
    handleBatchDelete().catch(error => {
      window.$message?.error(error instanceof Error ? error.message : t('common.error'));
    });
  }

  const batchButtons = (
    <ASpace size={8}>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundReplay className="text-icon" />}
        size="small"
        onClick={() => {
          handleBatchAction('reExecute').catch(error => {
            window.$message?.error(error instanceof Error ? error.message : t('common.error'));
          });
        }}
      >
        {t('page.dataSchedule.reExecute')}
      </AButton>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundPlayArrow className="text-icon" />}
        size="small"
        onClick={() => {
          handleBatchAction('continue').catch(error => {
            window.$message?.error(error instanceof Error ? error.message : t('common.error'));
          });
        }}
      >
        {t('page.dataSchedule.continue')}
      </AButton>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundPause className="text-icon" />}
        size="small"
        onClick={() => {
          handleBatchAction('pause').catch(error => {
            window.$message?.error(error instanceof Error ? error.message : t('common.error'));
          });
        }}
      >
        {t('page.dataSchedule.pause')}
      </AButton>
      <AButton
        disabled={checkedRowKeys.length === 0}
        icon={<IconIcRoundStop className="text-icon" />}
        size="small"
        onClick={() => {
          handleBatchAction('stop').catch(error => {
            window.$message?.error(error instanceof Error ? error.message : t('common.error'));
          });
        }}
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
            setColumnChecks={setColumnChecks}
            onDelete={triggerBatchDelete}
            refresh={triggerRefresh}
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
            loading={tableProps.loading}
          />
        </div>
      </ACard>

      <ScheduleLogModal
        open={Boolean(logModalTask)}
        projectId={logModalTask?.projectId}
        projectName={logModalTask?.projectName}
        taskId={logModalTask?.taskId || ''}
        onCancel={() => setLogModalTask(null)}
      />
    </div>
  );
};

export default DataSchedule;
