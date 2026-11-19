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
import { MetricKey } from '~shared/types/metrics';
import { axiosClient } from '~shared/helpers/axios-clients';
import { createClient } from '../generated/client';
import {
  getHealth,
  getProjectMeasures,
  getIssueCountHistory,
  getIssueDensityHistory,
  getIssueResolutionHistory,
  search,
} from '../generated/sdk.gen';
import type { SearchData } from '../generated/types.gen';
import { createClientConfig } from '../runtime';

const axiosInstance = createClientConfig().axios;
const previousAdapter = axiosInstance.defaults.adapter;
let requests: InternalAxiosRequestConfig[];

beforeEach(() => {
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
    expect(axiosInstance.defaults.baseURL).toBe(axiosClient.defaults.baseURL);
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
      '/api/v2/users-management/users?q=admin',
    ]);
    expect(
      new URL(axiosInstance.getUri(requests[1]), 'https://example.test').searchParams.get('q'),
    ).toBe('admin');
  });

  it('serializes array query parameters as comma-separated values by default', async () => {
    await createClient(createClientConfig()).get({
      query: { severities: ['HIGH', 'LOW'] },
      url: '/api/v2/example',
    });

    expect(axiosInstance.getUri(requests[0])).toBe(
      `${axiosClient.defaults.baseURL}/api/v2/example?severities=HIGH,LOW`,
    );
  });

  it('serializes filters and statistics on every generated issue history endpoint', async () => {
    const common = {
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO' as const,
      startDate: '2026-01-01',
      impacts: ['SECURITY:HIGH', 'RELIABILITY:LOW'],
      issueTypes: ['BUG' as const, 'VULNERABILITY' as const],
      severities: ['HIGH' as const, 'LOW' as const],
      typeSeverities: ['MAJOR' as const, 'MINOR' as const],
    };
    const filters = {
      ...common,
      ruleKeys: ['one', 'two'],
      statuses: ['OPEN' as const, 'CONFIRMED' as const],
    };
    await getIssueCountHistory({ query: filters });
    await getIssueDensityHistory({ query: filters });
    await getIssueResolutionHistory({ query: { ...common, statistic: 'MTTR' } });

    const urls = requests.map(
      (request) => new URL(axiosInstance.getUri(request), 'https://example.test'),
    );
    expect(urls.map((url) => url.pathname)).toEqual([
      expect.stringContaining('/api/v2/history/issue-count-history'),
      expect.stringContaining('/api/v2/history/issue-density-history'),
      expect.stringContaining('/api/v2/history/issue-resolution-history'),
    ]);
    for (const url of urls) {
      expect(url.searchParams.getAll('impacts')).toEqual(['SECURITY:HIGH,RELIABILITY:LOW']);
      expect(url.searchParams.getAll('issueTypes')).toEqual(['BUG,VULNERABILITY']);
      expect(url.searchParams.getAll('severities')).toEqual(['HIGH,LOW']);
      expect(url.searchParams.getAll('typeSeverities')).toEqual(['MAJOR,MINOR']);
    }
    for (const url of urls.slice(0, 2)) {
      expect(url.searchParams.getAll('ruleKeys')).toEqual(['one,two']);
      expect(url.searchParams.getAll('statuses')).toEqual(['OPEN,CONFIRMED']);
    }
    expect(urls[2].searchParams.get('statistic')).toBe('MTTR');
  });

  it('omits empty filter and sort arrays without dropping scalar query values', async () => {
    await getIssueCountHistory({
      query: {
        entityId: 'portfolio-id',
        entityType: 'PORTFOLIO',
        startDate: '2026-01-01',
        impacts: [],
        issueTypes: [],
        ruleKeys: [],
        severities: [],
        statuses: [],
        typeSeverities: [],
      },
    });
    await getProjectMeasures({
      query: {
        entityId: 'portfolio-id',
        entityType: 'PORTFOLIO',
        metricKey: MetricKey.coverage,
        nameContains: '',
        pageIndex: 0,
        requireValue: false,
        sort: [],
      },
    });

    const urls = requests.map(
      (request) => new URL(axiosInstance.getUri(request), 'https://example.test'),
    );
    for (const filter of [
      'impacts',
      'issueTypes',
      'ruleKeys',
      'severities',
      'statuses',
      'typeSeverities',
    ]) {
      expect(urls[0].searchParams.has(filter)).toBe(false);
    }
    expect(urls[0].searchParams.get('entityId')).toBe('portfolio-id');
    expect(urls[1].searchParams.has('sort')).toBe(false);
    expect(urls[1].searchParams.get('nameContains')).toBe('');
    expect(urls[1].searchParams.get('pageIndex')).toBe('0');
    expect(urls[1].searchParams.get('requireValue')).toBe('false');
  });

  it('honors explicit per-request array serialization', async () => {
    await createClient(createClientConfig()).get({
      query: { severities: ['HIGH', 'LOW'] },
      querySerializer: { array: { explode: true, style: 'form' } },
      url: '/api/v2/example',
    });

    const url = new URL(axiosInstance.getUri(requests[0]), 'https://example.test');
    expect(url.searchParams.getAll('severities')).toEqual(['HIGH', 'LOW']);
  });

  it('uses comma-separated sorting for generated dashboard calls without overrides', async () => {
    await getProjectMeasures({
      query: {
        entityId: 'portfolio-id',
        entityType: 'PORTFOLIO',
        metricKey: MetricKey.coverage,
        sort: ['-measure.currentValue', '+projectName'],
      },
    });

    const url = new URL(axiosInstance.getUri(requests[0]), 'https://example.test');
    expect(url.searchParams.getAll('sort')).toEqual(['-measure.currentValue,+projectName']);
    expect(url.searchParams.get('entityId')).toBe('portfolio-id');
  });
});
