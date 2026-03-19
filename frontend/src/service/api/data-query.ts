import { request } from '../request';
import { DATA_QUERY_URLS } from '../urls';

/** get data-query industry options */
export function fetchDataQueryIndustries() {
  return request<Api.DataQuery.IndustryOption[]>({
    method: 'get',
    url: DATA_QUERY_URLS.GET_INDUSTRIES
  });
}

/** get data-query industry pivot list */
export function fetchDataQueryIndustryPivot(params: Api.DataQuery.IndustryPivotParams) {
  return request<Api.DataQuery.IndustryPivotResult>({
    method: 'get',
    params,
    url: DATA_QUERY_URLS.GET_INDUSTRY_PIVOT
  });
}

/** get data-query drilldown detail */
export function fetchDataQueryDrilldown(params: Api.DataQuery.DrilldownParams) {
  return request<Api.DataQuery.DrilldownResult>({
    method: 'get',
    params,
    url: DATA_QUERY_URLS.GET_DRILLDOWN
  });
}
