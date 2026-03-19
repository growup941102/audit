import { globalConfig } from '@/config';

import { request } from '../request';
import { getAuthorization } from '../request/shared';
import { DATA_QUERY_URLS } from '../urls';

function parseFileNameFromDisposition(disposition: string, fallback: string) {
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const basicName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  let parsedName = basicName;
  if (utf8Name) {
    try {
      parsedName = decodeURIComponent(utf8Name);
    } catch {
      parsedName = utf8Name;
    }
  }
  return parsedName || fallback;
}

function buildRequestURL(rawBase: string, url: string) {
  const baseURL = (rawBase || '').replace(/\/$/, '');
  return `${baseURL}${url}`;
}

async function fetchDataQueryBlobFile(url: string, fallbackFileName: string) {
  const requestURL = buildRequestURL(globalConfig.serviceBaseURL || '', url);
  const authorization = getAuthorization();
  const response = await fetch(requestURL, {
    headers: authorization ? { Authorization: authorization } : undefined,
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`下载失败（${response.status}）`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const fileName = parseFileNameFromDisposition(disposition, fallbackFileName);
  return { blob, fileName };
}

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

/** export data-query industry pivot as excel file */
export async function fetchDataQueryIndustryPivotExport(params: Api.DataQuery.IndustryPivotExportParams) {
  const query = new URLSearchParams();
  query.set('industry', params.industry);
  if (params.projectName) {
    query.set('projectName', params.projectName);
  }
  const queryString = query.toString();

  return fetchDataQueryBlobFile(
    `${DATA_QUERY_URLS.EXPORT_INDUSTRY_PIVOT}${queryString ? `?${queryString}` : ''}`,
    `data-query-${params.industry}.xlsx`
  );
}

/** get data-query drilldown detail */
export function fetchDataQueryDrilldown(params: Api.DataQuery.DrilldownParams) {
  return request<Api.DataQuery.DrilldownResult>({
    method: 'get',
    params,
    url: DATA_QUERY_URLS.GET_DRILLDOWN
  });
}
