import { BACKEND_ERROR_CODE, createRequest } from '@sa/axios';

import { globalConfig } from '@/config';
import { localStg } from '@/utils/storage';

import { backEndFail, handleError } from './error';
import { getAuthorization } from './shared';
import type { RequestInstanceState } from './type';

function parseServiceSuccessCodes(rawValue: unknown) {
  const defaultCodes = ['0000'];

  if (Array.isArray(rawValue)) {
    const values = rawValue
      .map(item => String(item).trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
    return new Set(values.length ? values : defaultCodes);
  }

  if (rawValue == null) {
    return new Set(defaultCodes);
  }

  const rawText = String(rawValue).trim();
  if (!rawText) {
    return new Set(defaultCodes);
  }

  const tryJsonParse = () => {
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      return null;
    } catch {
      return null;
    }
  };

  const parsedFromJson = tryJsonParse();
  if (parsedFromJson && parsedFromJson.length) {
    return new Set(parsedFromJson);
  }

  const normalizedText = rawText.replace(/^\[|\]$/g, '');
  const normalized = normalizedText
    .replace(/[，；;|/\\\s]+/g, ',')
    .split(',')
    .map(code => code.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  return new Set(normalized.length ? normalized : defaultCodes);
}

const serviceSuccessCodes = parseServiceSuccessCodes(import.meta.env.VITE_SERVICE_SUCCESS_CODE);

export const request = createRequest<App.Service.Response, RequestInstanceState>(
  {
    baseURL: globalConfig.serviceBaseURL,
    headers: {
      apifoxToken: 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2'
    }
  },
  {
    isBackendSuccess(response) {
      // when the backend response code is "0000"(default), it means the request is success
      // to change this logic by yourself, you can modify the `VITE_SERVICE_SUCCESS_CODE` in `.env` file
      // use "," to separate multiple success codes, e.g. "0000,200"
      return serviceSuccessCodes.has(String(response.data.code));
    },
    async onBackendFail(response, instance) {
      await backEndFail(response, instance, request);
    },
    onError(error) {
      handleError(error, request);
    },
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });
      if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        config.headers?.delete?.('Content-Type');
      }

      return config;
    },
    transformBackendResponse(response) {
      return response.data.data;
    }
  }
);

export const demoRequest = createRequest<App.Service.DemoResponse>(
  {
    baseURL: globalConfig.serviceOtherBaseURL.demo
  },
  {
    isBackendSuccess(response) {
      // when the backend response code is "200", it means the request is success
      // you can change this logic by yourself
      return response.data.status === '200';
    },
    async onBackendFail(_response) {
      // when the backend response code is not "200", it means the request is fail
      // for example: the token is expired, refresh token and retry request
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;

      // show backend error message
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    },
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = localStg.get('token');
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    transformBackendResponse(response) {
      return response.data.result;
    }
  }
);
