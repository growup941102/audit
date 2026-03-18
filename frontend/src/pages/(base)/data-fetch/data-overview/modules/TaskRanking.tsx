import dayjs from 'dayjs';

import { useRouter } from '@/features/router';
import { useProjectStatusRanking } from '@/service/hooks';

interface RankingCategory {
  key: Api.DataOverview.RankingCategory;
  title: string;
}

interface RankItemData {
  completeTime?: string | null;
  name: string;
  rank: number;
}

const rankingCategoryToScheduleStatus: Record<Api.DataOverview.RankingCategory, string[]> = {
  abnormal: ['failed'],
  completed: ['success'],
  remaining: ['pending'],
  running: ['running']
};

function useRankingCategories(): RankingCategory[] {
  const { t } = useTranslation();

  return [
    { key: 'completed', title: t('page.dataOverview.completedTasks') },
    { key: 'running', title: t('page.dataOverview.runningTasks') },
    { key: 'remaining', title: t('page.dataOverview.remainingTasks') },
    { key: 'abnormal', title: t('page.dataOverview.abnormalTasks') }
  ];
}

function getRankBadgeStyle(rank: number) {
  if (rank === 1) return { background: '#f5222d', color: '#fff' };
  if (rank === 2) return { background: '#fa8c16', color: '#fff' };
  if (rank === 3) return { background: '#52c41a', color: '#fff' };
  return { background: '#f0f0f0', color: '#999' };
}

const RankItem = memo(({ item }: { item: RankItemData }) => {
  return (
    <div className="flex items-center gap-8px py-10px text-13px">
      <span
        className="h-20px w-20px inline-flex shrink-0 items-center justify-center rd-full text-12px"
        style={getRankBadgeStyle(item.rank)}
      >
        {item.rank}
      </span>
      <span className="flex-1 truncate text-#333">{item.name}</span>
      <span
        className="w-120px shrink-0 text-12px text-#999"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {item.completeTime || '-'}
      </span>
    </div>
  );
});

const TaskRanking = () => {
  const { t } = useTranslation();
  const { push } = useRouter();
  const rankingCategories = useRankingCategories();
  const [activeKey, setActiveKey] = useState<Api.DataOverview.RankingCategory>('completed');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'day'), dayjs()]);

  const rankingQuery = useProjectStatusRanking({
    category: activeKey,
    endTime: dateRange?.[1]?.format('YYYY-MM-DD') || undefined,
    limit: 20,
    startTime: dateRange?.[0]?.format('YYYY-MM-DD') || undefined
  });

  const rankingData = useMemo<RankItemData[]>(
    () =>
      (rankingQuery.data?.records || []).map(item => ({
        completeTime: item.completeTime,
        name: item.name,
        rank: item.rank
      })),
    [rankingQuery.data?.records]
  );

  const { leftList, rightList } = useMemo(
    () => ({
      leftList: rankingData.slice(0, 10),
      rightList: rankingData.slice(10, 20)
    }),
    [rankingData]
  );

  const [refreshing, { setFalse: stopRefreshing, setTrue: startRefreshing }] = useBoolean(false);

  const handleRefresh = useMemoizedFn(async () => {
    startRefreshing();
    try {
      await rankingQuery.refetch();
    } finally {
      stopRefreshing();
    }
  });

  const handleViewMoreData = useMemoizedFn(() => {
    push('/data-fetch/data-schedule', {
      query: { taskStatus: rankingCategoryToScheduleStatus[activeKey] }
    });
  });

  if (rankingQuery.error) {
    throw rankingQuery.error;
  }

  const loading = refreshing || rankingQuery.isFetching;

  return (
    <ACard
      className="min-h-420px card-wrapper"
      variant="borderless"
    >
      <div className="mb-16px flex items-center justify-between">
        <span className="text-16px font-bold">{t('page.dataOverview.taskRankingTitle')}</span>
        <div className="flex items-center gap-12px">
          <ADatePicker.RangePicker
            value={dateRange}
            onChange={dates => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
          <AButton
            loading={loading}
            onClick={handleRefresh}
          >
            {t('page.dataOverview.refresh')}
          </AButton>
        </div>
      </div>

      <ASegmented
        block
        options={rankingCategories.map(c => ({ label: c.title, value: c.key }))}
        value={activeKey}
        onChange={val => setActiveKey(val as Api.DataOverview.RankingCategory)}
      />

      <ASpin
        spinning={loading}
        wrapperClassName="[&_.ant-spin]:flex [&_.ant-spin]:items-center [&_.ant-spin]:justify-center"
      >
        <div className="mt-16px">
          <ARow gutter={[32, 0]}>
            <ACol
              md={12}
              span={24}
            >
              {leftList.map(item => (
                <RankItem
                  item={item}
                  key={`${activeKey}-${item.rank}`}
                />
              ))}
            </ACol>
            <ACol
              md={12}
              span={24}
            >
              {rightList.map(item => (
                <RankItem
                  item={item}
                  key={`${activeKey}-${item.rank}`}
                />
              ))}
            </ACol>
          </ARow>
          {!loading && rankingData.length === 0 ? (
            <div className="pt-24px">
              <AEmpty description="暂无可展示数据" />
            </div>
          ) : null}
        </div>
      </ASpin>
      <div className="mt-8px flex justify-center">
        <AButton
          type="link"
          onClick={handleViewMoreData}
        >
          {t('page.dataOverview.viewMoreData')}
        </AButton>
      </div>
    </ACard>
  );
};

export default TaskRanking;
