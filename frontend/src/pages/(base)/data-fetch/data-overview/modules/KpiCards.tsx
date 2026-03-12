interface KpiItemProps {
  color: string;
  key: string;
  percent: number;
  percentLabel: string;
  title: string;
  total: number;
  value: number;
}

function useGetKpiData(): KpiItemProps[] {
  const { t } = useTranslation();

  const kpiList: KpiItemProps[] = [
    {
      color: '#52c41a',
      key: 'completed',
      percent: 72,
      percentLabel: t('page.dataOverview.completionRate'),
      title: t('page.dataOverview.completedTasks'),
      total: 1280,
      value: 922
    },
    {
      color: '#faad14',
      key: 'running',
      percent: 0,
      percentLabel: t('page.dataOverview.runningRate'),
      title: t('page.dataOverview.runningTasks'),
      total: 0,
      value: 0
    },
    {
      color: '#4375e6',
      key: 'remaining',
      percent: 8,
      percentLabel: t('page.dataOverview.remainingRate'),
      title: t('page.dataOverview.remainingTasks'),
      total: 1280,
      value: 102
    },
    {
      color: '#f5222d',
      key: 'abnormal',
      percent: 5,
      percentLabel: t('page.dataOverview.abnormalRate'),
      title: t('page.dataOverview.abnormalTasks'),
      total: 1280,
      value: 64
    }
  ];

  return kpiList;
}

const KpiCardItem = (item: KpiItemProps) => {
  const { t } = useTranslation();

  return (
    <ACol
      className="flex"
      key={item.key}
      lg={6}
      md={12}
      span={24}
    >
      <ACard
        className="flex-1 card-wrapper"
        variant="borderless"
      >
        <div className="text-14px text-#666">{item.title}</div>
        <div className="py-12px">
          <NumberTicker
            className="text-32px font-bold"
            style={{ color: item.color }}
            value={item.value}
          />
        </div>
        <div className="flex justify-between pb-8px text-12px text-#999">
          <span>
            {item.percentLabel}：{item.percent}%
          </span>
          <span>
            {t('page.dataOverview.totalTasks')}：{item.total}
          </span>
        </div>
        <AProgress
          percent={item.percent}
          showInfo={false}
          size="small"
          strokeColor={item.color}
        />
      </ACard>
    </ACol>
  );
};

const KpiCards = () => {
  const kpiList = useGetKpiData();

  return (
    <ARow gutter={[16, 16]}>
      {kpiList.map(item => (
        <KpiCardItem
          {...item}
          key={item.key}
        />
      ))}
    </ARow>
  );
};

export default KpiCards;
