/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { AxiosError, AxiosHeaders } from 'axios';
import { HttpStatus } from '../../types/request';
import {
  getApiEndpoint,
  getApiErrorForReporting,
  getApiErrorReportingContext,
} from '../sentry-api-errors';

const API_ENDPOINT_TAG = 'api_endpoint';
const API_STATUS_CODE_TAG = 'api_status_code';
const API_VERSION_TAG = 'api_version';
const API_ERROR_KIND_TAG = 'api_error_kind';
const API_ERROR_SOURCE_TAG = 'api_error_source';

const API_BACKEND_ERROR_KIND = 'api_backend';
const API_ERROR_SOURCE = 'api';

it('should wrap Axios API errors for Sentry reporting', () => {
  const axiosError = createAxiosError({
    baseURL: '/web-api',
    url: '/analysis/analysis-statuses',
  });

  expect(getApiErrorForReporting('Internal server error', axiosError)).toEqual(
    expect.objectContaining({
      cause: axiosError,
      message: 'Internal server error',
      name: 'ApiResponseError',
    }),
  );
});

it('should build Sentry context for Axios API errors', () => {
  const axiosError = createAxiosError({
    baseURL: '/web-api',
    url: '/analysis/analysis-statuses',
  });

  const parsedError = {
    msg: 'Internal server error',
    status: HttpStatus.InternalServerError,
  };

  expect(getApiErrorReportingContext(parsedError, axiosError)).toEqual({
    extra: {
      apiEndpoint: '/web-api/analysis/analysis-statuses',
      error: parsedError,
      isAxios: true,
      response: axiosError,
    },
    fingerprint: [
      'api-error',
      '/web-api/analysis/analysis-statuses',
      String(HttpStatus.InternalServerError),
    ],
    tags: {
      [API_ENDPOINT_TAG]: '/web-api/analysis/analysis-statuses',
      [API_STATUS_CODE_TAG]: String(HttpStatus.InternalServerError),
      [API_VERSION_TAG]: 'v2',
      [API_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    },
  });
});

it('should still build Axios Sentry context when request URL resolution is unavailable', () => {
  const axiosError = new AxiosError('Internal server error');

  const parsedError = {
    msg: 'Internal server error',
    status: HttpStatus.InternalServerError,
  };

  expect(getApiEndpoint(axiosError)).toBeUndefined();

  expect(getApiErrorReportingContext(parsedError, axiosError)).toEqual({
    extra: {
      apiEndpoint: undefined,
      error: parsedError,
      isAxios: true,
      response: axiosError,
    },
    fingerprint: ['api-error', 'unknown_api_endpoint', String(HttpStatus.InternalServerError)],
    tags: {
      [API_STATUS_CODE_TAG]: String(HttpStatus.InternalServerError),
      [API_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    },
  });
});

it('should ignore non-Axios and non-Response values when resolving API endpoints', () => {
  expect(getApiEndpoint(new Error('boom') as unknown as AxiosError)).toBeUndefined();
});

it('should prefer the resolved Axios request URL when available', () => {
  const axiosError = createAxiosError(
    {
      baseURL: '/web-api',
      url: '/fallback',
    },
    {
      responseURL: 'https://sonarcloud.io/web-api/analysis/status?project=x',
    },
  );

  expect(getApiEndpoint(axiosError)).toBe('/web-api/analysis/status');
});

function createAxiosError(
  config: { baseURL: string; url: string },
  request?: { responseURL: string },
) {
  const axiosConfig = {
    ...config,
    headers: new AxiosHeaders(),
  };

  return new AxiosError('Internal server error', undefined, axiosConfig, request, {
    config: axiosConfig,
    data: { message: 'Internal server error' },
    headers: {},
    status: HttpStatus.InternalServerError,
    statusText: 'Internal server error',
  });
}
