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

import { useQuery } from '@tanstack/react-query';
import { IssueSeverity } from '~shared/types/issues';
import { MetricKey } from '~shared/types/metrics';
import {
  getDashboardIssueCountHistoryData,
  getDashboardIssueDensityHistoryData,
  getDashboardIssueResolutionHistoryData,
  getDashboardMeasuresHistoryData,
  getDashboardScaResolutionHistoryData,
} from '../../../api/dashboard-history';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import { useDashboardMeasureQuery } from '../dashboard-measure';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../../queries/mode');

jest.mock('../../../api/dashboard-history', () => ({
  getDashboardIssueCountHistoryData: jest.fn(),
  getDashboardIssueDensityHistoryData: jest.fn(),
  getDashboardIssueResolutionHistoryData: jest.fn(),
  getDashboardMeasuresHistoryData: jest.fn(),
  getDashboardScaResolutionHistoryData: jest.fn(),
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
    jest.mocked(getDashboardIssueCountHistoryData).mockResolvedValue([]);

    const options = useDashboardMeasureQueryOptions({
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

    expect(getDashboardIssueCountHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({
        impacts: ['SECURITY:HIGH'],
        issueTypes: ['VULNERABILITY'],
        severities: [IssueSeverity.Critical],
      }),
    );
  });

  it('adapts MQR issue filters and distribution keys in Standard mode', async () => {
    jest.mocked(getDashboardIssueCountHistoryData).mockResolvedValue([
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
    const options = useDashboardMeasureQueryOptions({
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

    expect(getDashboardIssueCountHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({
        issueTypes: ['VULNERABILITY'],
        severities: [IssueSeverity.Critical],
        sliceBy: 'TYPE',
      }),
    );
    expect(jest.mocked(getDashboardIssueCountHistoryData).mock.calls[0]?.[0]).not.toHaveProperty(
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
    jest.mocked(getDashboardMeasuresHistoryData).mockResolvedValue([
      {
        date: '2026-01-01',
        measures: [{ metric: MetricKey.reliability_rating, type: 'RATING', value: 'A' }],
      },
    ]);

    const result = await useDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'measures-history',
        metricKey: MetricKey.software_quality_reliability_rating,
        scope: 'overall',
      },
      months: 3,
    }).queryFn();

    expect(getDashboardMeasuresHistoryData).toHaveBeenCalledWith(
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
              type: 'RATING',
              value: 'A',
            },
          ],
        },
      ],
    });
  });

  it('keeps only the latest measures-history day for count widgets', async () => {
    jest.mocked(getDashboardMeasuresHistoryData).mockResolvedValue([
      { date: '2026-02-01', measures: [] },
      { date: '2026-01-01', measures: [] },
    ]);

    const result = await useDashboardMeasureQueryOptions({
      entityId: 'branch-id',
      entityType: 'PROJECT_BRANCH',
      measure: {
        api: 'measures-history',
        metricKey: MetricKey.coverage,
        scope: 'overall' as never,
      },
    }).queryFn();

    expect(result).toEqual({
      api: 'measures-history',
      history: [{ date: '2026-02-01', measures: [] }],
    });
  });

  it('requests the new-code variant of project metrics outside the portfolio allowlist', async () => {
    jest.mocked(getDashboardMeasuresHistoryData).mockResolvedValue([]);

    await useDashboardMeasureQueryOptions({
      entityId: 'branch-id',
      entityType: 'PROJECT_BRANCH',
      measure: {
        api: 'measures-history',
        metricKey: MetricKey.line_coverage,
        scope: 'new',
      },
      months: 1,
    }).queryFn();

    expect(getDashboardMeasuresHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ metricKeys: [MetricKey.new_line_coverage] }),
    );
  });

  it('selects the density and issue-resolution APIs', async () => {
    jest.mocked(getDashboardIssueDensityHistoryData).mockResolvedValue([]);
    jest.mocked(getDashboardIssueResolutionHistoryData).mockResolvedValue([]);

    const density = await useDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: { api: 'issue-density-history' },
      months: 3,
    }).queryFn();
    const resolution = await useDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'issue-resolution-history',
        statistic: 'MTTR' as never,
      },
      months: 3,
    }).queryFn();

    expect(density.api).toBe('issue-density-history');
    expect(resolution.api).toBe('issue-resolution-history');
    expect(getDashboardIssueDensityHistoryData).toHaveBeenCalled();
    expect(getDashboardIssueResolutionHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ statistic: 'MTTR' }),
    );
    expect(
      jest.mocked(getDashboardIssueResolutionHistoryData).mock.calls[0]?.[0],
    ).not.toHaveProperty('endDate');
  });

  it('selects the SCA resolution API', async () => {
    jest.mocked(getDashboardScaResolutionHistoryData).mockResolvedValue([]);

    const result = await useDashboardMeasureQueryOptions({
      entityId: 'portfolio-id',
      entityType: 'PORTFOLIO',
      measure: {
        api: 'sca-resolution-history',
        statistic: 'SCA_MTTR' as never,
      },
      months: 6,
    }).queryFn();

    expect(result.api).toBe('sca-resolution-history');
    expect(getDashboardScaResolutionHistoryData).toHaveBeenCalledWith(
      expect.objectContaining({ statistic: 'SCA_MTTR' }),
    );
  });
});

function useDashboardMeasureQueryOptions(input: Parameters<typeof useDashboardMeasureQuery>[0]): {
  queryFn: () => Promise<{ api: string; history: unknown[] }>;
  queryKey: readonly unknown[];
} {
  return useDashboardMeasureQuery(input) as unknown as {
    queryFn: () => Promise<{ api: string; history: unknown[] }>;
    queryKey: readonly unknown[];
  };
}
