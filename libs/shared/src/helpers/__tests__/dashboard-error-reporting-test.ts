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
import {
  getDashboardErrorReportingPayload,
  isTransientDashboardWidgetFetchError,
  normalizeUnknownError,
  serializeValueForErrorReporting,
  stringifyErrorContext,
} from '../dashboard-error-reporting';

function makeAxiosErrorWithStatus(status: number): AxiosError {
  const headers = new AxiosHeaders();
  const axiosConfig = { headers };
  return new AxiosError('error', undefined, axiosConfig, undefined, {
    config: axiosConfig,
    data: {},
    headers: {},
    status,
    statusText: String(status),
  });
}

describe('dashboard-error-reporting', () => {
  it('serializes primitive values', () => {
    expect(serializeValueForErrorReporting(undefined)).toBe('undefined');
    expect(serializeValueForErrorReporting(null)).toBe('null');
    expect(serializeValueForErrorReporting('message')).toBe('message');
    expect(serializeValueForErrorReporting(42)).toBe('42');
    expect(serializeValueForErrorReporting(true)).toBe('true');
  });

  it('serializes Response objects with status and url', () => {
    const response = new Response('body', { status: 404, statusText: 'Not Found' });
    const serialized = serializeValueForErrorReporting(response);
    expect(serialized).toContain('"type":"Response"');
    expect(serialized).toContain('"status":404');
  });

  it('serializes nested Response values', () => {
    const response = new Response(null, { status: 500, statusText: 'Server Error' });
    const serialized = serializeValueForErrorReporting({ response });
    expect(serialized).toContain('"type":"Response"');
    expect(serialized).toContain('"status":500');
  });

  it('serializes errors, arrays, and nested records', () => {
    const error = new Error('boom');
    expect(serializeValueForErrorReporting(error)).toContain('"message":"boom"');
    expect(serializeValueForErrorReporting(['a', 1])).toContain('"a"');
    expect(serializeValueForErrorReporting({ nested: { value: 1 } })).toContain('"value":1');
  });

  it('truncates deeply nested values', () => {
    const nested = {
      level1: { level2: { level3: { level4: { level5: { level6: { level7: {} } } } } } },
    };
    expect(serializeValueForErrorReporting(nested)).toContain('[MaxDepth]');
  });

  it('normalizes errors with empty messages', () => {
    const error = new Error('placeholder');
    error.message = '';
    const normalized = normalizeUnknownError(error);
    expect(normalized.message).not.toBe('');
    expect(normalized).not.toBe(error);
  });

  it('normalizes errors without messages', () => {
    const error = normalizeUnknownError(new Response(null, { status: 403 }));
    expect(error.message).toContain('Response');
    expect(error.message).toContain('403');
  });

  it('preserves errors that already have messages', () => {
    const error = new Error('already normalized');
    expect(normalizeUnknownError(error)).toBe(error);
  });

  it('does not throw on circular references', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(() => serializeValueForErrorReporting(circular)).not.toThrow();
  });

  it('stringifies error context values', () => {
    expect(stringifyErrorContext({ count: 2, label: 'widget' })).toEqual({
      count: '2',
      label: 'widget',
    });
  });

  it('builds dashboard error reporting payloads', () => {
    const payload = getDashboardErrorReportingPayload(
      new Error('widget failed'),
      {
        componentStack: 'at Widget',
      },
      {
        widgetKey: 'abc',
      },
    );

    expect(payload.message).toBe('widget failed');
    expect(payload.context.errorMessage).toBe('widget failed');
    expect(payload.context.widgetKey).toBe('abc');
    expect(payload.serialized).toContain('widget failed');
  });
});

describe('isTransientDashboardWidgetFetchError', () => {
  it('returns false for null and undefined', () => {
    expect(isTransientDashboardWidgetFetchError(null)).toBe(false);
    expect(isTransientDashboardWidgetFetchError(undefined)).toBe(false);
  });

  it('returns false for 403 Forbidden Response', () => {
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 403 }))).toBe(false);
  });

  it('returns false for 5xx server errors via Response', () => {
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 500 }))).toBe(false);
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 503 }))).toBe(false);
  });

  it('returns false for 403 Forbidden via AxiosError with response', () => {
    expect(isTransientDashboardWidgetFetchError(makeAxiosErrorWithStatus(403))).toBe(false);
  });

  it('returns false for 5xx server errors via AxiosError with response', () => {
    expect(isTransientDashboardWidgetFetchError(makeAxiosErrorWithStatus(500))).toBe(false);
    expect(isTransientDashboardWidgetFetchError(makeAxiosErrorWithStatus(503))).toBe(false);
  });

  it('returns true for Axios ECONNABORTED (timeout)', () => {
    expect(isTransientDashboardWidgetFetchError(new AxiosError('timeout', 'ECONNABORTED'))).toBe(
      true,
    );
  });

  it('returns true for Axios ERR_CANCELED', () => {
    expect(isTransientDashboardWidgetFetchError(new AxiosError('canceled', 'ERR_CANCELED'))).toBe(
      true,
    );
  });

  it('returns true for Axios ERR_NETWORK', () => {
    expect(
      isTransientDashboardWidgetFetchError(new AxiosError('network error', 'ERR_NETWORK')),
    ).toBe(true);
  });

  it('returns true for Axios error with no response (network failure)', () => {
    expect(isTransientDashboardWidgetFetchError(new AxiosError('Network Error'))).toBe(true);
  });

  it('returns true for TypeError with "failed to fetch" (case-insensitive)', () => {
    expect(isTransientDashboardWidgetFetchError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(new TypeError('failed to fetch'))).toBe(true);
  });

  it('returns true for Error with "timeout exceeded"', () => {
    expect(isTransientDashboardWidgetFetchError(new Error('timeout exceeded'))).toBe(true);
  });

  it('returns true for 4xx client errors (except 403)', () => {
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 400 }))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 401 }))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 404 }))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 409 }))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 422 }))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(new Response(null, { status: 429 }))).toBe(true);
  });

  it('returns true for 4xx AxiosError responses (except 403)', () => {
    expect(isTransientDashboardWidgetFetchError(makeAxiosErrorWithStatus(400))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(makeAxiosErrorWithStatus(401))).toBe(true);
    expect(isTransientDashboardWidgetFetchError(makeAxiosErrorWithStatus(404))).toBe(true);
  });

  it('returns false for non-error values without a known status', () => {
    expect(isTransientDashboardWidgetFetchError('some string error')).toBe(false);
    expect(isTransientDashboardWidgetFetchError(new Error('unexpected failure'))).toBe(false);
    expect(isTransientDashboardWidgetFetchError({ code: 'ECONNABORTED' })).toBe(false);
  });
});
