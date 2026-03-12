import KpiCards from './modules/KpiCards';
import TaskRanking from './modules/TaskRanking';

const DataOverview = () => {
  return (
    <ASpace
      className="w-full"
      direction="vertical"
      size={[16, 16]}
    >
      <KpiCards />
      <TaskRanking />
    </ASpace>
  );
};

export default DataOverview;
