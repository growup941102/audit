import { useProjectStatusSummary } from '@/service/hooks';

interface KpiItemProps {
  color: string;
  key: string;
  percent: number;
  percentLabel: string;
  title: string;
  total: number;
  value: number;
}

function useGetKpiData(summary?: Api.DataOverview.ProjectStatusSummary): KpiItemProps[] {
  const { t } = useTranslation();
  const totalProjects = summary?.totalProjects || 0;

  function calcPercent(value: number) {
    if (!totalProjects) return 0;
    return Math.round((value / totalProjects) * 100);
  }

  const kpiList: KpiItemProps[] = [
    {
      color: '#52c41a',
      key: 'completed',
      percent: calcPercent(summary?.successProjects || 0),
      percentLabel: t('page.dataOverview.completionRate'),
      title: t('page.dataOverview.completedTasks'),
      total: totalProjects,
      value: summary?.successProjects || 0
    },
    {
      color: '#faad14',
      key: 'running',
      percent: calcPercent(summary?.runningProjects || 0),
      percentLabel: t('page.dataOverview.runningRate'),
      title: t('page.dataOverview.runningTasks'),
      total: totalProjects,
      value: summary?.runningProjects || 0
    },
    {
      color: '#4375e6',
      key: 'remaining',
      percent: calcPercent(summary?.pendingProjects || 0),
      percentLabel: t('page.dataOverview.remainingRate'),
      title: t('page.dataOverview.remainingTasks'),
      total: totalProjects,
      value: summary?.pendingProjects || 0
    },
    {
      color: '#f5222d',
      key: 'abnormal',
      percent: calcPercent(summary?.failedProjects || 0),
      percentLabel: t('page.dataOverview.abnormalRate'),
      title: t('page.dataOverview.abnormalTasks'),
      total: totalProjects,
      value: summary?.failedProjects || 0
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
  const summaryQuery = useProjectStatusSummary();
  const kpiList = useGetKpiData(summaryQuery.data);

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
