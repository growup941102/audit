import { useQuery } from '@tanstack/react-query';

import { fetchDataQueryIndustries, fetchDataQueryIndustryPivot } from '../api';
import { QUERY_KEYS } from '../keys';

/** get industry options hook */
export function useDataQueryIndustries() {
  return useQuery({
    queryFn: fetchDataQueryIndustries,
    queryKey: QUERY_KEYS.DATA_QUERY.INDUSTRIES
  });
}

/** get industry pivot list hook */
export function useDataQueryIndustryPivot(params: Api.DataQuery.IndustryPivotParams | null) {
  return useQuery({
    enabled: Boolean(params?.industry),
    queryFn: () => fetchDataQueryIndustryPivot(params as Api.DataQuery.IndustryPivotParams),
    queryKey: QUERY_KEYS.DATA_QUERY.INDUSTRY_PIVOT(params)
  });
}
