import { useEffect, useMemo, useState } from 'react';

import { fetchDataQueryIndustryPivotExport } from '@/service/api';
import { useDataQueryDrilldown, useDataQueryIndustries, useDataQueryIndustryPivot } from '@/service/hooks';

import DataQueryDrilldownModal from './modules/DataQueryDrilldownModal';
import DataQuerySearch from './modules/DataQuerySearch';
import DataQueryTable, { type DataQueryDrilldownClickPayload } from './modules/DataQueryTable';

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_INDUSTRY_OPTIONS: Api.DataQuery.IndustryOption[] = [];
const INDUSTRY_LABEL_MAP: Record<string, string> = {
  js: '建筑行业',
  sw: '水务行业'
};
const DEFAULT_DRILLDOWN_PAGE_SIZE = 10;

type DrilldownState = DataQueryDrilldownClickPayload & {
  current: number;
  industry: string;
  size: number;
};

const DataQuery = () => {
  const industriesQuery = useDataQueryIndustries();
  const industries = useMemo(
    () =>
      (industriesQuery.data || EMPTY_INDUSTRY_OPTIONS).map(option => {
        const key = (option.value || '').toLowerCase();
        const mappedLabel = INDUSTRY_LABEL_MAP[key];

        return mappedLabel
          ? {
              ...option,
              label: mappedLabel
            }
          : option;
      }),
    [industriesQuery.data]
  );
  const [formIndustry, setFormIndustry] = useState('');
  const [formProjectName, setFormProjectName] = useState('');
  const [queryParams, setQueryParams] = useState<Api.DataQuery.IndustryPivotParams | null>(null);
  const [drilldownState, setDrilldownState] = useState<DrilldownState | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

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
  const drilldownParams: Api.DataQuery.DrilldownParams | null = drilldownState
    ? {
        current: drilldownState.current,
        fieldKey: drilldownState.fieldKey,
        industry: drilldownState.industry,
        projectId: drilldownState.projectId,
        size: drilldownState.size
      }
    : null;
  const drilldownQuery = useDataQueryDrilldown(drilldownParams);

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

  function handleDrilldown(payload: DataQueryDrilldownClickPayload) {
    const activeIndustry = queryParams?.industry || formIndustry;
    if (!activeIndustry) {
      window.$message?.warning('请先选择项目行业');
      return;
    }

    setDrilldownState({
      ...payload,
      current: 1,
      industry: activeIndustry,
      size: DEFAULT_DRILLDOWN_PAGE_SIZE
    });
  }

  function handleDrilldownPageChange(current: number, size: number) {
    setDrilldownState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        current,
        size
      };
    });
  }

  function closeDrilldown() {
    setDrilldownState(null);
  }

  async function handleExport() {
    const industry = queryParams?.industry || formIndustry;
    if (!industry) {
      window.$message?.warning('请先选择项目行业');
      return;
    }

    try {
      setExportLoading(true);
      const result = await fetchDataQueryIndustryPivotExport({
        industry,
        projectName: queryParams?.projectName ?? formProjectName.trim()
      });
      const downloadUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.download = result.fileName;
      anchor.href = downloadUrl;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      window.$message?.success('导出成功');
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败，请稍后重试';
      window.$message?.error(message);
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <ASpace
      className="w-full"
      direction="vertical"
      size={[16, 16]}
    >
      <DataQuerySearch
        exportLoading={exportLoading}
        industries={industries}
        industryValue={formIndustry}
        loading={industriesQuery.isLoading}
        projectNameValue={formProjectName}
        onExport={handleExport}
        onIndustryChange={handleIndustryChange}
        onProjectNameChange={setFormProjectName}
        onReset={handleReset}
        onSearch={handleSearch}
      />
      <DataQueryTable
        data={pivotData}
        loading={pivotQuery.isFetching}
        onDrilldown={handleDrilldown}
        onPageChange={handlePageChange}
      />
      <DataQueryDrilldownModal
        data={drilldownQuery.data}
        loading={drilldownQuery.isFetching}
        open={Boolean(drilldownState)}
        onCancel={closeDrilldown}
        onPageChange={handleDrilldownPageChange}
      />
    </ASpace>
  );
};

export default DataQuery;
