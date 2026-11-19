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

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import {
  getIssueCountHistory,
  getIssueDensityHistory,
  getIssueResolutionHistory,
  getMeasuresHistory,
} from '~sq-server-openapi-community';
import { getDashboardScaResolutionHistory } from '../../api/dashboard-history';
import {
  getDashboardIssueCountHistoryQueryOptions,
  getDashboardIssueDensityHistoryQueryOptions,
  getDashboardIssueResolutionHistoryQueryOptions,
  getDashboardMeasuresHistoryQueryOptions,
  getDashboardScaResolutionHistoryQueryOptions,
} from '../dashboard-history';

jest.mock('~sq-server-openapi-community', () => ({
  getIssueCountHistory: jest.fn(),
  getIssueDensityHistory: jest.fn(),
  getIssueResolutionHistory: jest.fn(),
  getMeasuresHistory: jest.fn(),
}));
jest.mock('../../api/dashboard-history', () => ({
  getDashboardScaResolutionHistory: jest.fn(),
}));

const historyParams = {
  entityId: 'branch-id',
  entityType: 'PROJECT_BRANCH' as const,
  startDate: '2026-01-01T00:00:00.000Z',
};

describe('dashboard history queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nullable issue history rows and distribution entries', async () => {
    jest.mocked(getIssueCountHistory).mockResolvedValue({
      data: {
        issueCountHistory: [
          {
            date: null,
            distribution: [{ key: 'BUG', value: 3 }],
          },
          {
            date: '2026-01-02',
            distribution: [
              { key: 'BUG', value: 3 },
              { key: null, value: 1 },
              { key: 'CODE_SMELL', value: null },
            ],
          },
          {
            date: '2026-01-03',
          },
        ],
      },
    } as never);

    const { result } = renderHook(
      () => useQuery(getDashboardIssueCountHistoryQueryOptions(historyParams)),
      {
        wrapper: getContextWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      issueCountHistory: [
        { date: '2026-01-02', distribution: [{ key: 'BUG', value: 3 }] },
        { date: '2026-01-03', distribution: [] },
      ],
    });
  });

  it('normalizes issue-density history rows and distribution entries', async () => {
    const { result: client } = renderHook(() => useQueryClient(), { wrapper: getContextWrapper() });
    jest.mocked(getIssueDensityHistory).mockResolvedValue({
      data: {
        issueDensityHistory: [
          { date: null, distribution: [{ key: 'all', value: 3 }] },
          {
            date: '2026-01-02',
            distribution: [
              { key: 'all', value: 5 },
              { key: null, value: 1 },
            ],
          },
        ],
      },
    } as never);

    await expect(
      client.current
        .fetchQuery(getDashboardIssueDensityHistoryQueryOptions(historyParams))
        .then((data) => data.issueDensityHistory),
    ).resolves.toEqual([{ date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] }]);
  });

  it('normalizes issue-resolution history rows and distribution entries', async () => {
    const { result: client } = renderHook(() => useQueryClient(), { wrapper: getContextWrapper() });
    jest.mocked(getIssueResolutionHistory).mockResolvedValue({
      data: {
        issueResolutionHistory: [
          { date: null, distribution: [{ key: 'all', value: 3 }] },
          {
            date: '2026-01-02',
            distribution: [
              { key: 'all', value: 5 },
              { key: 'all', value: null },
            ],
          },
        ],
        statistic: 'MTTR',
      },
    } as never);

    await expect(
      client.current
        .fetchQuery(
          getDashboardIssueResolutionHistoryQueryOptions({ ...historyParams, statistic: 'MTTR' }),
        )
        .then((data) => data.issueResolutionHistory),
    ).resolves.toEqual([{ date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] }]);
  });

  it('normalizes sca-resolution history rows and distribution entries', async () => {
    const { result: client } = renderHook(() => useQueryClient(), { wrapper: getContextWrapper() });
    jest.mocked(getDashboardScaResolutionHistory).mockResolvedValue({
      scaResolutionHistory: [
        { date: null, distribution: [{ key: 'all', value: 3 }] },
        { date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] },
      ],
      statistic: 'SCA_MTTR',
    });

    await expect(
      client.current
        .fetchQuery(
          getDashboardScaResolutionHistoryQueryOptions({ ...historyParams, statistic: 'SCA_MTTR' }),
        )
        .then((data) => data.scaResolutionHistory),
    ).resolves.toEqual([{ date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] }]);
  });

  it('normalizes nullable measure fields and supplies an empty type', async () => {
    jest.mocked(getMeasuresHistory).mockResolvedValue({
      data: {
        measuresHistory: [
          {
            date: '2026-01-04',
            measures: [
              { metric: MetricKey.coverage, type: null, value: '80' },
              { metric: null, type: 'integer', value: '3' },
              { metric: MetricKey.bugs, type: 'integer', value: null },
            ],
          },
          {
            date: '2026-01-05',
          },
        ],
      },
    } as never);

    const { result } = renderHook(
      () =>
        useQuery(
          getDashboardMeasuresHistoryQueryOptions({
            ...historyParams,
            metricKeys: [MetricKey.coverage, MetricKey.bugs],
          }),
        ),
      {
        wrapper: getContextWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      measuresHistory: [
        {
          date: '2026-01-04',
          measures: [{ metric: MetricKey.coverage, type: '', value: '80' }],
        },
        {
          date: '2026-01-05',
          measures: [],
        },
      ],
    });
  });

  it('defaults omitted history arrays to empty responses', async () => {
    jest.mocked(getIssueCountHistory).mockResolvedValue({ data: {} } as never);
    jest.mocked(getMeasuresHistory).mockResolvedValue({ data: {} } as never);

    const issueQuery = renderHook(
      () => useQuery(getDashboardIssueCountHistoryQueryOptions(historyParams)),
      {
        wrapper: getContextWrapper(),
      },
    );
    const measuresQuery = renderHook(
      () =>
        useQuery(
          getDashboardMeasuresHistoryQueryOptions({
            ...historyParams,
            metricKeys: [MetricKey.coverage],
          }),
        ),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(issueQuery.result.current.isSuccess).toBe(true);
    });
    await waitFor(() => {
      expect(measuresQuery.result.current.isSuccess).toBe(true);
    });

    expect(issueQuery.result.current.data).toEqual({ issueCountHistory: [] });
    expect(measuresQuery.result.current.data).toEqual({ measuresHistory: [] });
  });
});
