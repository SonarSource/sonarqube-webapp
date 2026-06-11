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

import type { ErrorEvent, EventHint } from '@sentry/react';
// eslint-disable-next-line local-rules/no-direct-axios-import -- Needed for axios.getUri()
import axios, { isAxiosError, type AxiosError } from 'axios';
import { HttpStatus } from '../types/request';

export const API_ENDPOINT_TAG = 'api_endpoint';
export const API_STATUS_CODE_TAG = 'api_status_code';
export const API_VERSION_TAG = 'api_version';
const API_ERROR_KIND_TAG = 'api_error_kind';
const API_ERROR_SOURCE_TAG = 'api_error_source';

const API_BACKEND_ERROR_KIND = 'api_backend';
const API_CLIENT_ERROR_KIND = 'api_client';
const API_ERROR_FINGERPRINT = 'api-error';
const API_ERROR_SOURCE = 'api';
const API_RESPONSE_ERROR_TYPE = 'ApiResponseError';
const UNKNOWN_API_ENDPOINT = 'unknown_api_endpoint';
const DEFAULT_API_ERROR_MESSAGE = 'API request failed';

type ApiErrorKind = typeof API_BACKEND_ERROR_KIND | typeof API_CLIENT_ERROR_KIND;
type ApiVersion = 'v1' | 'v2';
type RequestWithResponseUrl = { responseURL: string };

export interface ApiErrorReportingTags {
  errorKind?: string;
  errorSource?: string;
}

export interface ApiErrorForReporting {
  status: number;
}

export function getApiErrorForReporting(message: string, response: AxiosError | Response): Error {
  const apiError = new Error(message, {
    cause: response,
  });

  apiError.name = API_RESPONSE_ERROR_TYPE;

  return apiError;
}

export function getApiErrorReportingContext<TError extends ApiErrorForReporting>(
  error: TError,
  response: AxiosError | Response,
  tags: ApiErrorReportingTags = {},
) {
  const apiEndpoint = getApiEndpoint(response);

  const apiResponse = isResponse(response)
    ? { apiResponse: getApiResponseExtra(response, apiEndpoint) }
    : {};

  return {
    extra: {
      apiEndpoint,
      ...apiResponse,
      error,
      isAxios: isAxiosError(response),
      response,
    },
    fingerprint: getApiErrorFingerprint(apiEndpoint, error.status),
    tags: getApiTags(apiEndpoint, error.status, tags),
  };
}

export function addApiResponseErrorDetails(
  event: ErrorEvent,
  hint: EventHint,
  tags: ApiErrorReportingTags = {},
): ErrorEvent {
  const { originalException } = hint;

  if (!isResponse(originalException)) {
    return event;
  }

  const apiEndpoint = getApiEndpoint(originalException);
  const message = DEFAULT_API_ERROR_MESSAGE;

  return {
    ...event,
    exception: getApiResponseException(event, message),
    extra: {
      ...event.extra,
      apiResponse: getApiResponseExtra(originalException, apiEndpoint),
    },
    fingerprint: getApiErrorFingerprint(apiEndpoint, originalException.status),
    message,
    tags: {
      ...event.tags,
      ...getApiTags(apiEndpoint, originalException.status, tags),
    },
  };
}

export function getApiEndpoint(response: AxiosError | Response) {
  try {
    let url: string | undefined;

    if (isResponse(response)) {
      const { url: responseUrl } = response;
      url = responseUrl;
    } else if (isAxiosError(response)) {
      const { config, response: axiosResponse } = response;
      const axiosRequest: unknown = response.request;
      const resolvedConfig = config ?? axiosResponse?.config;

      if (hasResponseUrl(axiosRequest)) {
        url = axiosRequest.responseURL;
      } else if (resolvedConfig) {
        url = axios.getUri(resolvedConfig);
      }
    }

    if (!url) {
      return undefined;
    }

    return new URL(url, globalThis.location.origin).pathname;
  } catch {
    return undefined;
  }
}

function getApiTags(
  apiEndpoint: string | undefined,
  status: number,
  { errorKind = API_ERROR_KIND_TAG, errorSource = API_ERROR_SOURCE_TAG }: ApiErrorReportingTags,
) {
  const apiVersion = getApiVersion(apiEndpoint);

  return {
    [API_STATUS_CODE_TAG]: String(status),
    [errorKind]: getApiErrorKind(status),
    [errorSource]: API_ERROR_SOURCE,
    ...(apiEndpoint ? { [API_ENDPOINT_TAG]: apiEndpoint } : {}),
    ...(apiVersion ? { [API_VERSION_TAG]: apiVersion } : {}),
  };
}

function getApiErrorKind(status: number): ApiErrorKind {
  if (status >= HttpStatus.BadRequest && status < HttpStatus.InternalServerError) {
    return API_CLIENT_ERROR_KIND;
  }

  return API_BACKEND_ERROR_KIND;
}

function getApiErrorFingerprint(apiEndpoint: string | undefined, status: number) {
  return [API_ERROR_FINGERPRINT, apiEndpoint ?? UNKNOWN_API_ENDPOINT, String(status)];
}

function getApiVersion(apiEndpoint: string | undefined): ApiVersion | undefined {
  if (!apiEndpoint) {
    return undefined;
  }

  if (apiEndpoint.startsWith('/api')) {
    return 'v1';
  }

  if (apiEndpoint.startsWith('/web-api')) {
    return 'v2';
  }

  return undefined;
}

function getApiResponseException(event: ErrorEvent, message: string): ErrorEvent['exception'] {
  const values = event.exception?.values;

  if (!values?.length) {
    return { values: [{ type: API_RESPONSE_ERROR_TYPE, value: message }] };
  }

  return {
    ...event.exception,
    values: values.map((value, index) =>
      index === values.length - 1
        ? { ...value, type: API_RESPONSE_ERROR_TYPE, value: message }
        : value,
    ),
  };
}

function getApiResponseExtra(response: Response, apiEndpoint: string | undefined) {
  return {
    endpoint: apiEndpoint,
    status: response.status,
    statusText: response.statusText,
    type: 'Response',
  };
}

function hasResponseUrl(request: unknown): request is RequestWithResponseUrl {
  return (
    typeof request === 'object' &&
    request !== null &&
    'responseURL' in request &&
    typeof request.responseURL === 'string'
  );
}

function isResponse(value: unknown): value is Response {
  return typeof Response !== 'undefined' && value instanceof Response;
}
