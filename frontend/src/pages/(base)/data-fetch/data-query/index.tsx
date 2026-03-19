import { useEffect, useMemo, useState } from 'react';

import { useDataQueryIndustries, useDataQueryIndustryPivot } from '@/service/hooks';

import DataQuerySearch from './modules/DataQuerySearch';
import DataQueryTable from './modules/DataQueryTable';

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_INDUSTRY_OPTIONS: Api.DataQuery.IndustryOption[] = [];

const DataQuery = () => {
  const industriesQuery = useDataQueryIndustries();
  const industries = useMemo(() => industriesQuery.data || EMPTY_INDUSTRY_OPTIONS, [industriesQuery.data]);
  const [formIndustry, setFormIndustry] = useState('');
  const [formProjectName, setFormProjectName] = useState('');
  const [queryParams, setQueryParams] = useState<Api.DataQuery.IndustryPivotParams | null>(null);

  useEffect(() => {
    if (formIndustry || !industries.length) {
      return;
    }

    const firstIndustry = industries[0]?.value || '';
    if (!firstIndustry) {
      return;
    }

    setFormIndustry(firstIndustry);
    setQueryParams({
      current: 1,
      industry: firstIndustry,
      projectName: '',
      size: DEFAULT_PAGE_SIZE
    });
  }, [formIndustry, industries]);

  const pivotQuery = useDataQueryIndustryPivot(queryParams);

  const pivotData: Api.DataQuery.IndustryPivotResult = pivotQuery.data || {
    columns: [{ fixed: 'left', key: 'projectName', title: '项目名称' }],
    current: queryParams?.current || 1,
    records: [],
    size: queryParams?.size || DEFAULT_PAGE_SIZE,
    total: 0
  };

  function refreshQuery(next: { current?: number; industry?: string; projectName?: string; size?: number }) {
    const nextIndustry = next.industry ?? formIndustry;
    if (!nextIndustry) {
      return;
    }

    setQueryParams({
      current: next.current ?? 1,
      industry: nextIndustry,
      projectName: next.projectName ?? formProjectName.trim(),
      size: next.size ?? queryParams?.size ?? DEFAULT_PAGE_SIZE
    });
  }

  function handleIndustryChange(value: string) {
    setFormIndustry(value);
    refreshQuery({
      current: 1,
      industry: value,
      projectName: formProjectName.trim()
    });
  }

  function handleSearch() {
    refreshQuery({
      current: 1,
      projectName: formProjectName.trim()
    });
  }

  function handleReset() {
    setFormProjectName('');
    refreshQuery({
      current: 1,
      projectName: ''
    });
  }

  function handlePageChange(current: number, size: number) {
    refreshQuery({
      current,
      projectName: queryParams?.projectName ?? formProjectName.trim(),
      size
    });
  }

  return (
    <ASpace
      className="w-full"
      direction="vertical"
      size={[16, 16]}
    >
      <DataQuerySearch
        industries={industries}
        industryValue={formIndustry}
        loading={industriesQuery.isLoading}
        projectNameValue={formProjectName}
        onIndustryChange={handleIndustryChange}
        onProjectNameChange={setFormProjectName}
        onReset={handleReset}
        onSearch={handleSearch}
      />
      <DataQueryTable
        data={pivotData}
        loading={pivotQuery.isFetching}
        onPageChange={handlePageChange}
      />
    </ASpace>
  );
};

export default DataQuery;
