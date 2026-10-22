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

import { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { getBaseUrl } from '~adapters/helpers/system';
import { createClient } from '../generated/client';
import { getHealth, search } from '../generated/sdk.gen';
import type { SearchData } from '../generated/types.gen';
import { createClientConfig, openApiAxiosClientSetup } from '../runtime';

const axiosInstance = createClientConfig().axios;
const previousAdapter = axiosInstance.defaults.adapter;
let requests: InternalAxiosRequestConfig[];

beforeEach(async () => {
  await openApiAxiosClientSetup;
  requests = [];
  axiosInstance.defaults.adapter = ((config) => {
    requests.push(config);
    return Promise.resolve({
      config,
      data: { result: 'ok' },
      headers: {},
      status: 200,
      statusText: 'OK',
    });
  }) satisfies AxiosAdapter;
});

afterEach(() => {
  axiosInstance.defaults.adapter = previousAdapter;
});

describe('OpenAPI Axios client', () => {
  it('uses the server Axios configuration', () => {
    expect(axiosInstance.defaults.baseURL).toBe(getBaseUrl());
    expect(axiosInstance.defaults.headers.patch).toEqual({
      'Content-Type': 'application/merge-patch+json',
    });
  });

  it('sends generated calls to the full API v2 path and returns the full response', async () => {
    const query: SearchData['query'] = { q: 'admin' };

    expect((await getHealth()).data).toEqual({ result: 'ok' });
    expect((await search({ query })).data).toEqual({ result: 'ok' });
    expect(requests.map(({ url }) => url)).toEqual([
      '/api/v2/system/health',
      '/api/v2/users-management/users',
    ]);
    expect(requests[1].params).toEqual({ q: 'admin' });
  });

  it('serializes array query parameters as repeated keys', async () => {
    await createClient(createClientConfig()).get({
      query: { severities: ['HIGH', 'LOW'] },
      url: '/api/v2/example',
    });

    expect(axiosInstance.getUri(requests[0])).toBe(
      `${getBaseUrl()}/api/v2/example?severities=HIGH&severities=LOW`,
    );
  });
});
