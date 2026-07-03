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

import { isAxiosError } from 'axios';
import type { ErrorInfo } from 'react';
import { HttpStatus } from '../types/request';
import { isRecord, isStringDefined } from './types';

const TRANSIENT_AXIOS_CODES = new Set(['ECONNABORTED', 'ERR_CANCELED', 'ERR_NETWORK']);

function getHttpStatusFromCaughtError(error: unknown): number | undefined {
  if (typeof Response !== 'undefined' && error instanceof Response) {
    return error.status;
  }

  if (isAxiosError(error) && error.response?.status !== undefined) {
    return error.response.status;
  }

  return undefined;
}

/** Transient widget data-fetch failures (network, timeout, most 4xx) should not reach Sentry. */
export function isTransientDashboardWidgetFetchError(error: unknown): boolean {
  if (error == null) {
    return false;
  }

  const status = getHttpStatusFromCaughtError(error);

  if (status === HttpStatus.Forbidden) {
    return false;
  }

  if (status !== undefined && status >= HttpStatus.InternalServerError) {
    return false;
  }

  if (
    isAxiosError(error) &&
    ((error.code !== undefined && TRANSIENT_AXIOS_CODES.has(error.code)) || !error.response)
  ) {
    return true;
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
    return true;
  }

  if (error instanceof Error && error.message === 'timeout exceeded') {
    return true;
  }

  if (status !== undefined && status >= HttpStatus.BadRequest) {
    return true;
  }

  return false;
}

const MAX_SERIALIZE_DEPTH = 6;

function toSerializableForErrorReporting(value: unknown, depth = 0): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return value;
  }
  if (value instanceof Error) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      cause: toSerializableForErrorReporting(value.cause, depth + 1),
    };
  }
  if (typeof Response !== 'undefined' && value instanceof Response) {
    return {
      status: value.status,
      statusText: value.statusText,
      type: 'Response',
      url: value.url,
    };
  }
  if (depth >= MAX_SERIALIZE_DEPTH) {
    return '[MaxDepth]';
  }
  if (Array.isArray(value)) {
    return value.map((entry) => toSerializableForErrorReporting(entry, depth + 1));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        toSerializableForErrorReporting(entry, depth + 1),
      ]),
    );
  }
  return value;
}

/** Serializes any thrown value for console/Sentry (avoids `[object Response]` / `undefined`). */
export function serializeValueForErrorReporting(value: unknown, depth = 0): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value);
  }
  try {
    return JSON.stringify(toSerializableForErrorReporting(value, depth));
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function normalizeUnknownError(caught: unknown): Error {
  if (caught instanceof Error) {
    if (isStringDefined(caught.message)) {
      return caught;
    }
    const normalized = new Error(serializeValueForErrorReporting(caught), { cause: caught });
    if (caught.stack) {
      normalized.stack = caught.stack;
    }
    return normalized;
  }
  return new Error(serializeValueForErrorReporting(caught));
}

export function stringifyErrorContext(context: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, serializeValueForErrorReporting(value)]),
  );
}

export function getDashboardErrorReportingPayload(
  caught: unknown,
  errorInfo?: ErrorInfo,
  extra: Record<string, unknown> = {},
) {
  const error = normalizeUnknownError(caught);
  const context = stringifyErrorContext({
    ...extra,
    caught,
    componentStack: errorInfo?.componentStack,
    errorMessage: error.message,
    errorName: error.name,
    errorStack: error.stack,
  });

  return {
    context,
    message: error.message,
    serialized: serializeValueForErrorReporting({ caught, errorInfo, extra }),
  };
}
