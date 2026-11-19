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

import {
  type OrganizationsMeasuresHistoryDay,
  type OrganizationsIssueCountHistoryDay,
  type DashboardMeasureQueryOptions,
  CodeScope,
  IssueResolutionStatistic,
  ScaResolutionStatistic,
} from '~shared/types/dashboard-history';
import { useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import * as dashboardHistory from '~shared/helpers/dashboard-history';
import { IssueSeverity } from '~shared/types/issues';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import { useDashboardMeasureQuery } from '../dashboard-measure';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('../../../queries/mode');

const mockGetIssueCountHistoryData = jest.fn<
  Promise<OrganizationsIssueCountHistoryDay[]>,
  [unknown]
>();
const mockGetIssueDensityHistoryData = jest.fn<
  Promise<OrganizationsIssueCountHistoryDay[]>,
  [unknown]
>();
const mockGetIssueResolutionHistoryData = jest.fn<
  Promise<OrganizationsIssueCountHistoryDay[]>,
  [unknown]
>();
const mockGetMeasuresHistoryData = jest.fn<Promise<OrganizationsMeasuresHistoryDay[]>, [unknown]>();
const mockGetScaResolutionHistoryData = jest.fn<
  Promise<OrganizationsIssueCountHistoryDay[]>,
  [unknown]
>();

jest.mock('~sq-server-openapi-community', () => ({
  getIssueCountHistory: ({ query }: { query: unknown }) =>
    mockGetIssueCountHistoryData(query).then((issueCountHistory) => ({
      data: { issueCountHistory },
    })),
  getIssueDensityHistory: ({ query }: { query: unknown }) =>
    mockGetIssueDensityHistoryData(query).then((issueDensityHistory) => ({
      data: { issueDensityHistory },
    })),
  getIssueResolutionHistory: ({ query }: { query: unknown }) =>
    mockGetIssueResolutionHistoryData(query).then((issueResolutionHistory) => ({
      data: { issueResolutionHistory },
    })),
  getMeasuresHistory: ({ query }: { query: unknown }) =>
    mockGetMeasuresHistoryData(query).then((measuresHistory) => ({ data: { measuresHistory } })),
}));
jest.mock('../../../api/dashboard-history', () => ({
  getDashboardScaResolutionHistory: (query: unknown) =>
    mockGetScaResolutionHistoryData(query).then((scaResolutionHistory) => ({
      scaResolutionHistory,
    })),
}));

jest.mock('../../context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

describe('dashboardMeasureQueryOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useQuery)
      .mockImplementation((options) => options as unknown as ReturnType<typeof useQuery>);
    jest.mocked(useStandardExperienceModeQuery).mockReturnValue({
      data: false,
      error: null,
      isPending: false,
    } as ReturnType<typeof useStandardExperienceModeQuery>);
  });

  it('maps coexisting measure filters to the Server API', async () => {
    jest.mocked(mockGetIssueCountHistoryData).mockResolvedValue([]);

    const options = getDashboardMeasureQueryOptions({
      entityId: 'branch-id',
      entityType: 'PROJECT_BRANCH',
      measure: {
        api: 'issue-count-history',
        impacts: ['SECURITY:HIGH'],
        issueTypes: ['VULNERABILITY'],
        metricKey: MetricKey.security_issues,
        severities: [IssueSeverity.Critical],
      },
      months: 3,
    });

    await options.queryFn();

    expect(mockGetIssueCountHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({
        impacts: ['SECURITY:HIGH'],
        issueTypes: ['VULNERABILITY'],
        severities: [IssueSeverity.Critical],
      }),
    );
  });

  it('adapts MQR issue filters and distribution keys in Standard mode', async () => {
    jest.mocked(mockGetIssueCountHistoryData).mockResolvedValue([
      {
        date: '2026-01-01',
        distribution: [{ key: 'VULNERABILITY', value: 3 }],
      },
    ]);

    jest.mocked(useStandardExperienceModeQuery).mockReturnValue({
      data: true,
      error: null,
      isPending: false,
    } as ReturnType<typeof useStandardExperienceModeQuery>);
    const options = getDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'issue-count-history',
        impacts: ['SECURITY:HIGH'],
        metricKey: MetricKey.software_quality_security_issues,
        sliceBy: 'SOFTWARE_QUALITY',
      },
      months: 3,
    });
    const result = await options.queryFn();

    expect(mockGetIssueCountHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({
        issueTypes: ['VULNERABILITY'],
        sliceBy: 'TYPE',
        typeSeverities: [IssueSeverity.Critical],
      }),
    );
    expect(jest.mocked(mockGetIssueCountHistoryData).mock.calls[0]?.[0]).not.toHaveProperty(
      'impacts',
    );
    expect(result).toEqual({
      api: 'issue-count-history',
      history: [
        {
          date: '2026-01-01',
          distribution: [{ key: 'SECURITY', value: 3 }],
        },
      ],
    });
  });

  it('rewrites Standard-mode measure keys back to their canonical MQR key', async () => {
    jest.mocked(useStandardExperienceModeQuery).mockReturnValue({
      data: true,
      error: null,
      isPending: false,
    } as ReturnType<typeof useStandardExperienceModeQuery>);
    jest.mocked(mockGetMeasuresHistoryData).mockResolvedValue([
      {
        date: '2026-01-01',
        measures: [{ metric: MetricKey.reliability_rating, type: MetricType.Rating, value: 'A' }],
      },
    ]);

    const result = await getDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'measures-history',
        metricKey: MetricKey.software_quality_reliability_rating,
        scope: CodeScope.Overall,
      },
      months: 3,
    }).queryFn();

    expect(mockGetMeasuresHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ metricKeys: [MetricKey.reliability_rating] }),
    );
    expect(result).toEqual({
      api: 'measures-history',
      history: [
        {
          date: '2026-01-01',
          measures: [
            {
              metric: MetricKey.software_quality_reliability_rating,
              type: MetricType.Rating,
              value: 'A',
            },
          ],
        },
      ],
    });
  });

  it('keeps only the latest measures-history day for count widgets', async () => {
    jest.mocked(mockGetMeasuresHistoryData).mockResolvedValue([
      { date: '2026-02-01', measures: [] },
      { date: '2026-01-01', measures: [] },
    ]);

    const result = await getDashboardMeasureQueryOptions({
      entityId: 'branch-id',
      entityType: 'PROJECT_BRANCH',
      measure: {
        api: 'measures-history',
        metricKey: MetricKey.coverage,
        scope: CodeScope.Overall,
      },
    }).queryFn();

    expect(result).toEqual({
      api: 'measures-history',
      history: [{ date: '2026-02-01', measures: [] }],
    });
  });

  it('requests the new-code variant of project metrics outside the portfolio allowlist', async () => {
    jest.mocked(mockGetMeasuresHistoryData).mockResolvedValue([]);

    await getDashboardMeasureQueryOptions({
      entityId: 'branch-id',
      entityType: 'PROJECT_BRANCH',
      measure: {
        api: 'measures-history',
        metricKey: MetricKey.line_coverage,
        scope: CodeScope.New,
      },
      months: 1,
    }).queryFn();

    expect(mockGetMeasuresHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ metricKeys: [MetricKey.new_line_coverage] }),
    );
  });

  it('selects the density and issue-resolution APIs', async () => {
    jest.mocked(mockGetIssueDensityHistoryData).mockResolvedValue([]);
    jest.mocked(mockGetIssueResolutionHistoryData).mockResolvedValue([]);

    const density = await getDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: { api: 'issue-density-history' },
      months: 3,
    }).queryFn();
    const resolution = await getDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'issue-resolution-history',
        statistic: IssueResolutionStatistic.MTTR,
      },
      months: 3,
    }).queryFn();

    expect(density.api).toBe('issue-density-history');
    expect(resolution.api).toBe('issue-resolution-history');
    expect(mockGetIssueDensityHistoryData).toHaveBeenCalled();
    expect(mockGetIssueResolutionHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ statistic: 'MTTR' }),
    );
    expect(jest.mocked(mockGetIssueResolutionHistoryData).mock.calls[0]?.[0]).not.toHaveProperty(
      'endDate',
    );
  });

  it('selects the SCA resolution API', async () => {
    jest.mocked(mockGetScaResolutionHistoryData).mockResolvedValue([]);

    const result = await getDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'sca-resolution-history',
        statistic: ScaResolutionStatistic.ScaMTTR,
      },
      months: 6,
    }).queryFn();

    expect(result.api).toBe('sca-resolution-history');
    expect(mockGetScaResolutionHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ statistic: 'SCA_MTTR' }),
    );
  });

  it('reuses history selection across equal renders and refreshes changed ranges', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-30T12:00:00.000Z'));
    const actual =
      jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
    jest.mocked(useQuery).mockImplementation(actual.useQuery);
    const sort = jest.spyOn(dashboardHistory, 'sortDashboardHistory');
    mockGetMeasuresHistoryData.mockResolvedValue([
      {
        date: '2026-08-29',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '80' }],
      },
      {
        date: '2026-08-30',
        measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: '90' }],
      },
    ]);
    const input: Parameters<typeof useDashboardMeasureQuery>[0] = {
      entityId: 'branch-id',
      entityType: 'PROJECT_BRANCH',
      measure: { api: 'measures-history', metricKey: MetricKey.coverage, scope: CodeScope.Overall },
      months: 0,
    };
    try {
      const { result, rerender } = renderHook((params) => useDashboardMeasureQuery(params), {
        initialProps: input,
        wrapper: getContextWrapper(),
      });
      await waitFor(() => {
        expect(result.current.data?.history).toHaveLength(1);
      });
      const sorts = sort.mock.calls.length;

      rerender({ ...input, measure: { ...input.measure } });
      expect(sort).toHaveBeenCalledTimes(sorts);

      rerender({ ...input, months: 1 });
      await waitFor(() => {
        expect(result.current.data?.history).toHaveLength(2);
      });
      expect(sort.mock.calls.length).toBeGreaterThan(sorts);

      const requests = mockGetMeasuresHistoryData.mock.calls.length;
      jest.setSystemTime(new Date('2026-08-31T12:00:00.000Z'));
      rerender({ ...input, months: 1 });
      await waitFor(() => {
        expect(mockGetMeasuresHistoryData.mock.calls.length).toBeGreaterThan(requests);
      });

      const modeSorts = sort.mock.calls.length;
      jest.mocked(useStandardExperienceModeQuery).mockReturnValue({
        data: true,
        error: null,
        isPending: false,
      } as ReturnType<typeof useStandardExperienceModeQuery>);
      rerender({ ...input, months: 1 });
      expect(sort.mock.calls.length).toBeGreaterThan(modeSorts);
    } finally {
      sort.mockRestore();
      jest.useRealTimers();
    }
  });
});

function getDashboardMeasureQueryOptions(input: Parameters<typeof useDashboardMeasureQuery>[0]): {
  queryFn: () => Promise<{ api: string; history: unknown[] }>;
  queryKey: readonly unknown[];
} {
  const { result } = renderHook(() => useDashboardMeasureQuery(input));
  const options = result.current as unknown as DashboardMeasureQueryOptions;
  return {
    queryKey: options.queryKey,
    queryFn: async () => {
      if (typeof options.queryFn !== 'function') throw new Error('Expected query function');
      const data = await options.queryFn({
        queryKey: options.queryKey,
        signal: new AbortController().signal,
        meta: undefined,
      });
      if (!options.select) throw new Error('Expected dashboard selection');
      return options.select(data);
    },
  };
}
