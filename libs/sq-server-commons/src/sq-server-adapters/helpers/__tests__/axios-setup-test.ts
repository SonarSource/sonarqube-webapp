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

import axios, { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { clearCachedCSRFToken, setCachedCSRFToken } from '../../../helpers/csrf-token';
import { getCSRFTokenValue } from '../../../helpers/request';
import { setupAxiosClient } from '../axios-setup';

afterEach(() => {
  clearCachedCSRFToken();
});

describe('setupAxiosClient', () => {
  it('axiosClient should be configured correctly', async () => {
    const client = axios.create();
    await setupAxiosClient(client);

    expect(client.defaults.baseURL).toEqual('');
    expect(client.defaults.headers.patch).toEqual({
      'Content-Type': 'application/merge-patch+json',
    });
  });

  it('should inject the cached CSRF token and disable axios own cookie read', async () => {
    setCachedCSRFToken('cached-token');
    const client = axios.create();
    const { onFulfilled } = await captureRequestInterceptor(client);

    const config = onFulfilled({
      url: '/api/v2/something',
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig);

    expect((config.headers as AxiosHeaders).get('X-XSRF-TOKEN')).toBe('cached-token');
    expect(config.withXSRFToken).toBe(false);
  });

  it('should not set a CSRF header when there is no token to send', async () => {
    const client = axios.create();
    const { onFulfilled } = await captureRequestInterceptor(client);

    const config = onFulfilled({
      url: '/api/v2/something',
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig);

    expect((config.headers as AxiosHeaders).has('X-XSRF-TOKEN')).toBe(false);
    expect(config.withXSRFToken).toBe(false);
  });

  it('should still recognize a same-origin request behind a relative deployment context path', async () => {
    setCachedCSRFToken('cached-token');
    const client = axios.create();
    const { onFulfilled } = await captureRequestInterceptor(client);

    const config = onFulfilled({
      url: '/api/v2/something',
      baseURL: '/sonarqube',
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig);

    expect((config.headers as AxiosHeaders).get('X-XSRF-TOKEN')).toBe('cached-token');
  });

  it.each([
    ['an absolute cross-origin URL', 'https://api.getbeamer.com/v0/unread/count'],
    ['a protocol-relative cross-origin URL', '//api.getbeamer.com/v0/unread/count'],
  ])(
    'should not set a CSRF header for %s, but still disable axios own cookie read',
    async (_, url) => {
      setCachedCSRFToken('cached-token');
      const client = axios.create();
      const { onFulfilled } = await captureRequestInterceptor(client);

      const config = onFulfilled({
        url,
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig);

      expect((config.headers as AxiosHeaders).has('X-XSRF-TOKEN')).toBe(false);
      expect(config.withXSRFToken).toBe(false);
    },
  );

  it('should cache the CSRF token found on a successful response header', async () => {
    const client = axios.create();
    const { onFulfilled } = await captureResponseInterceptor(client);

    onFulfilled({
      config: { url: '/api/v2/something' },
      headers: new AxiosHeaders({ 'X-XSRF-TOKEN': 'from-header' }),
    } as AxiosResponse);

    expect(getCSRFTokenValue()).toBe('from-header');
  });

  it('should cache the CSRF token found on an error response header, and rethrow', async () => {
    const client = axios.create();
    const { onRejected } = await captureResponseInterceptor(client);
    const error = {
      response: {
        config: { url: '/api/v2/something' },
        headers: new AxiosHeaders({ 'X-XSRF-TOKEN': 'from-error-header' }),
      },
    };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(getCSRFTokenValue()).toBe('from-error-header');
  });

  it('should not cache anything when the response has no CSRF header', async () => {
    setCachedCSRFToken('cached-token');
    const client = axios.create();
    const { onFulfilled } = await captureResponseInterceptor(client);

    onFulfilled({
      config: { url: '/api/v2/something' },
      headers: new AxiosHeaders(),
    } as AxiosResponse);

    expect(getCSRFTokenValue()).toBe('cached-token');
  });

  it('should not cache a CSRF-looking header coming from a cross-origin response', async () => {
    const client = axios.create();
    const { onFulfilled } = await captureResponseInterceptor(client);

    onFulfilled({
      config: { url: 'https://api.getbeamer.com/v0/unread/count' },
      headers: new AxiosHeaders({ 'X-XSRF-TOKEN': 'from-third-party' }),
    } as AxiosResponse);

    expect(getCSRFTokenValue()).toBe('');
  });
});

async function captureRequestInterceptor(client: ReturnType<typeof axios.create>) {
  const useSpy = jest.spyOn(client.interceptors.request, 'use');
  await setupAxiosClient(client);
  const [onFulfilled] = useSpy.mock.calls[0];
  return {
    onFulfilled: onFulfilled as (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
  };
}

async function captureResponseInterceptor(client: ReturnType<typeof axios.create>) {
  const useSpy = jest.spyOn(client.interceptors.response, 'use');
  await setupAxiosClient(client);
  const [onFulfilled, onRejected] = useSpy.mock.calls[0];
  return {
    onFulfilled: onFulfilled as (response: AxiosResponse) => AxiosResponse,
    onRejected: onRejected as (error: unknown) => Promise<never>,
  };
}
