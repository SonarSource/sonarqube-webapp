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

import type { ErrorEvent } from '@sentry/react';
import { HttpStatus } from '../../types/request';
import {
  addApiResponseErrorDetails,
  getApiErrorForReporting,
  getApiErrorReportingContext,
} from '../sentry-api-errors';

const API_ENDPOINT_TAG = 'api_endpoint';
const API_STATUS_CODE_TAG = 'api_status_code';
const API_VERSION_TAG = 'api_version';
const API_ERROR_KIND_TAG = 'api_error_kind';
const API_ERROR_SOURCE_TAG = 'api_error_source';
const SQC_ERROR_KIND_TAG = 'sqc_error_kind';
const SQC_ERROR_SOURCE_TAG = 'sqc_error_source';

const API_BACKEND_ERROR_KIND = 'api_backend';
const API_CLIENT_ERROR_KIND = 'api_client';
const API_ERROR_SOURCE = 'api';

it('should enrich raw response rejections before sending them to Sentry', () => {
  const response = new Response();

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search?componentKeys=project',
  });

  const event = {
    exception: { values: [{ type: 'Error', value: '[object Response]' }] },
  } as ErrorEvent;

  expect(addApiResponseErrorDetails(event, { originalException: response })).toEqual({
    exception: {
      values: [
        {
          type: 'ApiResponseError',
          value: 'API request failed',
        },
      ],
    },
    extra: {
      apiResponse: {
        endpoint: '/api/issues/search',
        status: HttpStatus.Ok,
        statusText: '',
        type: 'Response',
      },
    },
    fingerprint: ['api-error', '/api/issues/search', String(HttpStatus.Ok)],
    message: 'API request failed',
    tags: {
      [API_ENDPOINT_TAG]: '/api/issues/search',
      [API_STATUS_CODE_TAG]: String(HttpStatus.Ok),
      [API_VERSION_TAG]: 'v1',
      [API_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    },
  });
});

it('should only rewrite the last Sentry exception value for raw response rejections', () => {
  const response = new Response();

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search?componentKeys=project',
  });

  const event = {
    exception: {
      values: [
        { type: 'TypeError', value: 'Failed to fetch' },
        { type: 'Error', value: '[object Response]' },
      ],
    },
  } as ErrorEvent;

  expect(addApiResponseErrorDetails(event, { originalException: response })).toEqual(
    expect.objectContaining({
      exception: {
        values: [
          { type: 'TypeError', value: 'Failed to fetch' },
          { type: 'ApiResponseError', value: 'API request failed' },
        ],
      },
    }),
  );
});

it('should ignore non-Response exceptions when enriching raw response rejections', () => {
  const event = {
    extra: {
      preserved: true,
    },
  } as unknown as ErrorEvent;

  expect(addApiResponseErrorDetails(event, { originalException: new Error('boom') })).toBe(event);
});

it('should wrap raw Response API errors for Sentry reporting', () => {
  const response = new Response(undefined, { status: HttpStatus.InternalServerError });

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search?componentKeys=project',
  });

  const apiError = getApiErrorForReporting('Internal server error', response);

  expect(apiError).toEqual(
    expect.objectContaining({
      cause: response,
      message: 'Internal server error',
      name: 'ApiResponseError',
    }),
  );
});

it('should create an ApiResponseError when the event has no exception values', () => {
  const response = new Response(undefined, { status: HttpStatus.BadRequest });

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search',
  });

  const event = {} as ErrorEvent;

  expect(addApiResponseErrorDetails(event, { originalException: response })).toEqual({
    exception: {
      values: [
        {
          type: 'ApiResponseError',
          value: 'API request failed',
        },
      ],
    },
    extra: {
      apiResponse: {
        endpoint: '/api/issues/search',
        status: HttpStatus.BadRequest,
        statusText: '',
        type: 'Response',
      },
    },
    fingerprint: ['api-error', '/api/issues/search', String(HttpStatus.BadRequest)],
    message: 'API request failed',
    tags: {
      [API_ENDPOINT_TAG]: '/api/issues/search',
      [API_STATUS_CODE_TAG]: String(HttpStatus.BadRequest),
      [API_VERSION_TAG]: 'v1',
      [API_ERROR_KIND_TAG]: API_CLIENT_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    },
  });
});

it('should build Sentry context for raw Response API errors', () => {
  const response = new Response(undefined, { status: HttpStatus.InternalServerError });

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search?componentKeys=project',
  });

  const parsedError = {
    msg: 'Internal server error',
    status: HttpStatus.InternalServerError,
  };

  expect(getApiErrorReportingContext(parsedError, response)).toEqual({
    extra: {
      apiEndpoint: '/api/issues/search',
      apiResponse: {
        endpoint: '/api/issues/search',
        status: HttpStatus.InternalServerError,
        statusText: '',
        type: 'Response',
      },
      error: parsedError,
      isAxios: false,
      response,
    },
    fingerprint: ['api-error', '/api/issues/search', String(HttpStatus.InternalServerError)],
    tags: {
      [API_ENDPOINT_TAG]: '/api/issues/search',
      [API_STATUS_CODE_TAG]: String(HttpStatus.InternalServerError),
      [API_VERSION_TAG]: 'v1',
      [API_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    },
  });
});

it('should allow product-specific tag names', () => {
  const response = new Response(undefined, { status: HttpStatus.InternalServerError });

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search?componentKeys=project',
  });

  const parsedError = {
    msg: 'Internal server error',
    status: HttpStatus.InternalServerError,
  };

  const context = getApiErrorReportingContext(parsedError, response, {
    errorKind: SQC_ERROR_KIND_TAG,
    errorSource: SQC_ERROR_SOURCE_TAG,
  });

  expect(context.tags).toEqual(
    expect.objectContaining({
      [SQC_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [SQC_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    }),
  );
});

it('should tag 4xx API errors separately from backend errors', () => {
  const response = new Response(undefined, { status: HttpStatus.BadRequest });

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/web-api/organizations/measures-history',
  });

  const parsedError = {
    msg: 'Date range must not exceed 6 months',
    status: HttpStatus.BadRequest,
  };

  const context = getApiErrorReportingContext(parsedError, response);

  expect(context.fingerprint).toEqual([
    'api-error',
    '/web-api/organizations/measures-history',
    String(HttpStatus.BadRequest),
  ]);

  expect(context.tags).toEqual(
    expect.objectContaining({
      [API_ENDPOINT_TAG]: '/web-api/organizations/measures-history',
      [API_STATUS_CODE_TAG]: String(HttpStatus.BadRequest),
      [API_VERSION_TAG]: 'v2',
      [API_ERROR_KIND_TAG]: API_CLIENT_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    }),
  );
});

it('should tag non-4xx API errors as backend errors', () => {
  const response = new Response(undefined, { status: HttpStatus.ServiceUnavailable });

  Object.defineProperty(response, 'url', {
    value: 'https://sonarcloud.io/api/issues/search?componentKeys=project',
  });

  const parsedError = {
    msg: 'default_error_message',
    status: HttpStatus.ServiceUnavailable,
  };

  const context = getApiErrorReportingContext(parsedError, response);

  expect(context.fingerprint).toEqual([
    'api-error',
    '/api/issues/search',
    String(HttpStatus.ServiceUnavailable),
  ]);

  expect(context.tags).toEqual(
    expect.objectContaining({
      [API_ENDPOINT_TAG]: '/api/issues/search',
      [API_STATUS_CODE_TAG]: String(HttpStatus.ServiceUnavailable),
      [API_VERSION_TAG]: 'v1',
      [API_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    }),
  );
});

it('should still build Sentry context when endpoint extraction fails', () => {
  const response = new Response(undefined, { status: HttpStatus.InternalServerError });

  Object.defineProperty(response, 'url', {
    value: 'https://[',
  });

  const parsedError = {
    msg: 'Internal server error',
    status: HttpStatus.InternalServerError,
  };

  expect(getApiErrorReportingContext(parsedError, response)).toEqual({
    extra: {
      apiEndpoint: undefined,
      apiResponse: {
        endpoint: undefined,
        status: HttpStatus.InternalServerError,
        statusText: '',
        type: 'Response',
      },
      error: parsedError,
      isAxios: false,
      response,
    },
    fingerprint: ['api-error', 'unknown_api_endpoint', String(HttpStatus.InternalServerError)],
    tags: {
      [API_STATUS_CODE_TAG]: String(HttpStatus.InternalServerError),
      [API_ERROR_KIND_TAG]: API_BACKEND_ERROR_KIND,
      [API_ERROR_SOURCE_TAG]: API_ERROR_SOURCE,
    },
  });
});
