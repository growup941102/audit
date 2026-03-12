import dayjs from 'dayjs';

interface RankingCategory {
  key: string;
  title: string;
}

interface RankItemData {
  completeTime?: string;
  name: string;
  rank: number;
}

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

function useGetRankingData(activeKey: string): RankItemData[] {
  const dataMap = useMemo<Record<string, RankItemData[]>>(
    () => ({
      abnormal: [
        { completeTime: '2026-02-28 16:30', name: '中国石油天然气集团西南管道分公司输气站安全检测项目', rank: 1 },
        { completeTime: '2026-02-27 14:20', name: '国家电网华北电力调度中心设备异常排查项目', rank: 2 },
        { completeTime: '2026-02-26 11:45', name: '中国建筑第八工程局深圳前海综合管廊巡检项目', rank: 3 },
        { completeTime: '2026-02-25 09:30', name: '中国移动通讯集团广东分公司数据中心安全审计项目', rank: 4 },
        { completeTime: '2026-02-24 17:00', name: '中国铁路总公司京沪高铁沿线基站异常检测项目', rank: 5 },
        { completeTime: '2026-02-23 15:10', name: '中国南方电网贵州电力公司变电站故障排查项目', rank: 6 },
        { completeTime: '2026-02-22 10:40', name: '中国华能集团山东风电场设备异常监测项目', rank: 7 },
        { completeTime: '2026-02-21 13:55', name: '中国联通河北分公司核心网节点故障分析项目', rank: 8 },
        { completeTime: '2026-02-20 08:30', name: '中国中铁二局成渝中线铁路隧道安全检测项目', rank: 9 },
        { completeTime: '2026-02-19 16:20', name: '中国电信上海分公司光纤骨干网异常巡检项目', rank: 10 },
        { completeTime: '2026-02-18 11:00', name: '国家能源集团内蒙古煤矿安全监测系统审计项目', rank: 11 },
        { completeTime: '2026-02-17 14:45', name: '中国交通建设集团港珠澳大桥运维检测项目', rank: 12 },
        { completeTime: '2026-02-16 09:15', name: '中国石化胜利油田采油厂设备异常预警项目', rank: 13 },
        { completeTime: '2026-02-15 17:30', name: '中国广核集团大亚湾核电站安全巡检审计项目', rank: 14 },
        { completeTime: '2026-02-14 12:00', name: '中国铝业集团山西分公司冶炼车间安全检测项目', rank: 15 },
        { completeTime: '2026-02-13 10:20', name: '中国移动通讯集团四川分公司基站故障分析项目', rank: 16 },
        { completeTime: '2026-02-12 15:40', name: '中国建筑第三工程局武汉长江大桥维护检测项目', rank: 17 },
        { completeTime: '2026-02-11 08:50', name: '国家电投集团青海光伏电站设备异常监测项目', rank: 18 },
        { completeTime: '2026-02-10 13:10', name: '中国水利水电第七工程局三峡库区巡检项目', rank: 19 },
        { completeTime: '2026-02-09 16:00', name: '中国海洋石油集团南海钻井平台安全审计项目', rank: 20 }
      ],
      completed: [
        { completeTime: '2026-02-04 14:30', name: '中国移动通讯集团北京分公司菜市口枢纽站安全巡检项目', rank: 1 },
        { completeTime: '2026-02-04 11:20', name: '中国电信股份有限公司上海分公司浦东数据中心审计项目', rank: 2 },
        { completeTime: '2026-02-03 18:45', name: '国家电网有限公司华东分部变电站安全检测项目', rank: 3 },
        { completeTime: '2026-02-03 15:00', name: '中国石油化工集团有限公司茂名石化安全审计项目', rank: 4 },
        { completeTime: '2026-02-02 16:30', name: '中国联合网络通信集团广州分公司核心机房巡检项目', rank: 5 },
        { completeTime: '2026-02-02 12:10', name: '中国铁路北京局集团有限公司京张高铁沿线检测项目', rank: 6 },
        { completeTime: '2026-02-01 17:20', name: '中国建筑集团有限公司雄安新区综合管廊巡检项目', rank: 7 },
        { completeTime: '2026-02-01 14:00', name: '中国南方电网深圳供电局福田变电站安全审计项目', rank: 8 },
        { completeTime: '2026-01-31 16:50', name: '中国移动通讯集团浙江分公司杭州核心网检测项目', rank: 9 },
        { completeTime: '2026-01-31 11:30', name: '中国华能集团有限公司山东莱州风电场巡检项目', rank: 10 },
        { completeTime: '2026-01-30 15:20', name: '中国交通建设集团有限公司港珠澳大桥运维审计项目', rank: 11 },
        { completeTime: '2026-01-30 09:40', name: '中国石油天然气集团有限公司大庆油田安全检测项目', rank: 12 },
        { completeTime: '2026-01-29 17:10', name: '中国电信股份有限公司江苏分公司南京数据中心项目', rank: 13 },
        { completeTime: '2026-01-29 13:00', name: '国家能源投资集团有限公司神东煤炭安全审计项目', rank: 14 },
        { completeTime: '2026-01-28 16:30', name: '中国铁塔股份有限公司河南分公司基站巡检项目', rank: 15 },
        { completeTime: '2026-01-28 10:15', name: '中国广核集团有限公司阳江核电站安全检测项目', rank: 16 },
        { completeTime: '2026-01-27 14:50', name: '中国中铁股份有限公司成都地铁隧道巡检审计项目', rank: 17 },
        { completeTime: '2026-01-27 09:30', name: '中国联通河北分公司石家庄城域网安全审计项目', rank: 18 },
        { completeTime: '2026-01-26 17:00', name: '中国水利水电建设集团白鹤滩水电站巡检项目', rank: 19 },
        { completeTime: '2026-01-26 11:45', name: '中国海洋石油集团有限公司渤海湾钻井平台审计项目', rank: 20 }
      ],
      remaining: [
        { name: '中国移动通讯集团湖北分公司武汉光谷机房巡检项目', rank: 1 },
        { name: '国家电网有限公司西北分部青海变电站检测项目', rank: 2 },
        { name: '中国石油化工集团有限公司镇海炼化安全审计项目', rank: 3 },
        { name: '中国电信股份有限公司四川分公司成都核心网项目', rank: 4 },
        { name: '中国建筑第五工程局长沙地铁综合管廊巡检项目', rank: 5 },
        { name: '中国南方电网云南电力公司昆明变电站审计项目', rank: 6 },
        { name: '中国铁路上海局集团有限公司沪昆高铁沿线检测项目', rank: 7 },
        { name: '中国华电集团有限公司福建分公司风电场巡检项目', rank: 8 },
        { name: '中国联通山东分公司济南数据中心安全审计项目', rank: 9 },
        { name: '中国铁塔股份有限公司安徽分公司基站安全检测项目', rank: 10 },
        { name: '中国石油天然气集团有限公司西南油气田巡检项目', rank: 11 },
        { name: '中国交通建设集团有限公司南沙港区码头检测项目', rank: 12 },
        { name: '国家能源投资集团有限公司准能煤矿安全审计项目', rank: 13 },
        { name: '中国中铁二局重庆轨道交通隧道安全巡检项目', rank: 14 },
        { name: '中国广核集团有限公司台山核电站安全检测项目', rank: 15 },
        { name: '中国移动通讯集团陕西分公司西安枢纽站审计项目', rank: 16 },
        { name: '中国电信股份有限公司广西分公司南宁机房巡检项目', rank: 17 },
        { name: '中��水利水电第十四工程局乌东德水电站项目', rank: 18 },
        { name: '中国建筑第八工程局西安地铁综合管廊审计项目', rank: 19 },
        { name: '中国海洋石油集团有限公司南海荔湾气田检测项目', rank: 20 }
      ],
      running: []
    }),
    []
  );

  return dataMap[activeKey] || dataMap.completed;
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
  const rankingCategories = useRankingCategories();
  const [activeKey, setActiveKey] = useState('completed');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'day'), dayjs()]);

  const rankingData = useGetRankingData(activeKey);

  const { leftList, rightList } = useMemo(() => {
    const full: RankItemData[] = Array.from({ length: 20 }, (_, i) => {
      return rankingData[i] || { name: '-', rank: i + 1 };
    });
    return { leftList: full.slice(0, 10), rightList: full.slice(10, 20) };
  }, [rankingData]);

  const [loading, { setFalse: stopLoading, setTrue: startLoading }] = useBoolean(false);

  const handleRefresh = useMemoizedFn(() => {
    startLoading();
    setTimeout(stopLoading, 1000);
  });

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
        onChange={val => setActiveKey(val as string)}
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
        </div>
      </ASpin>
      <div className="mt-8px flex justify-center">
        <AButton type="link">{t('page.dataOverview.viewMoreData')}</AButton>
      </div>
    </ACard>
  );
};

export default TaskRanking;
