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

import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import {
  getDashboardIssueCountHistory,
  getDashboardIssueDensityHistory,
  getDashboardIssueResolutionHistory,
  getDashboardMeasuresHistory,
  getDashboardScaResolutionHistory,
} from '../../api/dashboard-history';
import {
  useDashboardIssueCountHistoryQuery,
  useDashboardIssueDensityHistoryQuery,
  useDashboardIssueResolutionHistoryQuery,
  useDashboardMeasuresHistoryQuery,
  useDashboardScaResolutionHistoryQuery,
} from '../dashboard-history';

jest.mock('../../api/dashboard-history', () => ({
  ...jest.requireActual<typeof import('../../api/dashboard-history')>(
    '../../api/dashboard-history',
  ),
  getDashboardIssueCountHistory: jest.fn(),
  getDashboardIssueDensityHistory: jest.fn(),
  getDashboardIssueResolutionHistory: jest.fn(),
  getDashboardMeasuresHistory: jest.fn(),
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
    jest.mocked(getDashboardIssueCountHistory).mockResolvedValue({
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
    });

    const { result } = renderHook(() => useDashboardIssueCountHistoryQuery(historyParams), {
      wrapper: getContextWrapper(),
    });

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
    jest.mocked(getDashboardIssueDensityHistory).mockResolvedValue({
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
    });

    const { result } = renderHook(() => useDashboardIssueDensityHistoryQuery(historyParams), {
      wrapper: getContextWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      issueDensityHistory: [{ date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] }],
    });
  });

  it('normalizes issue-resolution history rows and distribution entries', async () => {
    jest.mocked(getDashboardIssueResolutionHistory).mockResolvedValue({
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
    });

    const { result } = renderHook(
      () => useDashboardIssueResolutionHistoryQuery({ ...historyParams, statistic: 'MTTR' }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      issueResolutionHistory: [{ date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] }],
    });
  });

  it('normalizes sca-resolution history rows and distribution entries', async () => {
    jest.mocked(getDashboardScaResolutionHistory).mockResolvedValue({
      scaResolutionHistory: [
        { date: null, distribution: [{ key: 'all', value: 3 }] },
        { date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] },
      ],
      statistic: 'SCA_MTTR',
    });

    const { result } = renderHook(
      () => useDashboardScaResolutionHistoryQuery({ ...historyParams, statistic: 'SCA_MTTR' }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      scaResolutionHistory: [{ date: '2026-01-02', distribution: [{ key: 'all', value: 5 }] }],
    });
  });

  it('normalizes nullable measure fields and supplies an empty type', async () => {
    jest.mocked(getDashboardMeasuresHistory).mockResolvedValue({
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
    });

    const { result } = renderHook(
      () =>
        useDashboardMeasuresHistoryQuery({
          ...historyParams,
          metricKeys: [MetricKey.coverage, MetricKey.bugs],
        }),
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
    jest.mocked(getDashboardIssueCountHistory).mockResolvedValue({});
    jest.mocked(getDashboardMeasuresHistory).mockResolvedValue({});

    const issueQuery = renderHook(() => useDashboardIssueCountHistoryQuery(historyParams), {
      wrapper: getContextWrapper(),
    });
    const measuresQuery = renderHook(
      () =>
        useDashboardMeasuresHistoryQuery({
          ...historyParams,
          metricKeys: [MetricKey.coverage],
        }),
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
