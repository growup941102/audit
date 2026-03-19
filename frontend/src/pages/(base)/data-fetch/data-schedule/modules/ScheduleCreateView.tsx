import { useEffect, useMemo, useState } from 'react';

import { useDataScheduleSelectData } from '@/service/hooks';

import ScheduleChooseDataModal from './ScheduleChooseDataModal';
import { type SelectableProjectItem, filterSelectableProjects } from './chooseDataMock';

interface Props {
  readonly onCancel: () => void;
  readonly onCreate: (projectIds: string[]) => Promise<void>;
  readonly open: boolean;
}

const ScheduleCreateView = ({ onCancel, onCreate, open }: Props) => {
  const selectDataQuery = useDataScheduleSelectData();
  const allProjects = useMemo<SelectableProjectItem[]>(
    () => selectDataQuery.data?.projects || [],
    [selectDataQuery.data?.projects]
  );

  const [creating, setCreating] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const filteredProjects = useMemo(
    () => filterSelectableProjects(allProjects, searchKeyword),
    [allProjects, searchKeyword]
  );

  useEffect(() => {
    if (!open) {
      setSearchKeyword('');
      setSelectedProjectId('');
    }
  }, [open]);

  useEffect(() => {
    if (selectedProjectId && !allProjects.some(item => item.projectId === selectedProjectId)) {
      setSelectedProjectId('');
    }
  }, [allProjects, selectedProjectId]);

  useEffect(() => {
    if (open && selectDataQuery.isError) {
      window.$message?.error('加载可选项目失败，请稍后重试');
    }
  }, [open, selectDataQuery.isError]);

  async function handleConfirm() {
    if (!selectedProjectId) {
      window.$message?.warning('请先选择一个项目');
      return;
    }

    setCreating(true);
    try {
      await onCreate([selectedProjectId]);
      setSearchKeyword('');
      setSelectedProjectId('');
    } catch (error) {
      window.$message?.error(error instanceof Error ? error.message : '创建失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  }

  function handleCancel() {
    if (creating) return;
    onCancel();
  }

  return (
    <ScheduleChooseDataModal
      confirmLoading={creating}
      loading={selectDataQuery.isLoading}
      open={open}
      projects={filteredProjects}
      searchKeyword={searchKeyword}
      selectedProjectId={selectedProjectId}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      onSearchKeywordChange={setSearchKeyword}
      onSelectedProjectChange={setSelectedProjectId}
    />
  );
};

export default ScheduleCreateView;
