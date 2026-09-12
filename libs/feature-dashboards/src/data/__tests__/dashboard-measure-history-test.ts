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

import { SoftwareImpactSeverity } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { ScaResolutionStatistic } from '../../types/organization-sca-resolution-history';
import { CodeScope } from '../../types/widget-common';
import {
  dashboardCountMetricType,
  dashboardMeasureHistoryValues,
  dashboardMeasureMetricKey,
  dashboardMeasureTrendPoints,
  dashboardMeasureTrendValues,
  dashboardMeasureTrendWindowValues,
  hasCompleteDashboardHistory,
  resolvedIssuesCountValues,
} from '../dashboard-measure-history';

describe('dashboard history maturity', () => {
  const current = { date: new Date('2026-03-31T00:00:00Z'), value: 20 };

  it('requires a genuine point at least 30 days before the current point', () => {
    const maturePoints = [{ date: new Date('2026-03-01T00:00:00Z'), value: 10 }, current];
    const immaturePoints = [{ date: new Date('2026-03-02T00:00:00Z'), value: 10 }, current];

    expect(hasCompleteDashboardHistory(maturePoints, 30)).toBe(true);
    expect(dashboardMeasureTrendValues(maturePoints, 30)).toEqual([10, 20]);
    expect(hasCompleteDashboardHistory(immaturePoints, 30)).toBe(false);
    expect(dashboardMeasureTrendValues(immaturePoints, 30)).toEqual([]);
    expect(dashboardMeasureTrendValues(immaturePoints, 30, true)).toEqual([10, 20]);
  });

  it('recognizes two adjacent 30-day calendar periods by their 59-day span', () => {
    const points = [{ date: new Date('2026-01-31T00:00:00Z'), value: 10 }, current];

    expect(hasCompleteDashboardHistory(points, 59)).toBe(true);
  });
});

describe('resolvedIssuesCountValues', () => {
  it('sums adjacent 30-day periods and builds a rolling-total sparkline', () => {
    const dailyPoints = [
      ...Array.from({ length: 30 }, (_, index) => ({
        date: new Date(Date.UTC(2026, 0, index + 1)),
        value: 2,
      })),
      ...Array.from({ length: 30 }, (_, index) => ({
        date: new Date(Date.UTC(2026, 0, index + 31)),
        value: 3,
      })),
    ];

    expect(resolvedIssuesCountValues(dailyPoints)).toEqual({
      currentTotal: 90,
      sparklineSeries: [60, ...Array.from({ length: 30 }, (_, index) => 61 + index)],
      trendValues: [60, 90],
    });
  });

  it('uses calendar periods when zero-resolution dates are omitted', () => {
    expect(
      resolvedIssuesCountValues([
        { date: new Date('2026-01-01T00:00:00Z'), value: 10 },
        { date: new Date('2026-01-31T00:00:00Z'), value: 20 },
        { date: new Date('2026-03-01T00:00:00Z'), value: 30 },
      ]),
    ).toEqual({
      currentTotal: 50,
      sparklineSeries: [20, 50],
      trendValues: [10, 50],
    });
  });

  it('does not produce a trend until two complete periods are available', () => {
    expect(
      resolvedIssuesCountValues([
        { date: new Date('2026-01-01T00:00:00Z'), value: 2 },
        { date: new Date('2026-01-02T00:00:00Z'), value: 0 },
        { date: new Date('2026-01-03T00:00:00Z'), value: 3 },
      ]),
    ).toEqual({
      currentTotal: 5,
      sparklineSeries: [],
      trendValues: [5],
    });
    expect(resolvedIssuesCountValues([])).toEqual({
      currentTotal: 0,
      sparklineSeries: [],
      trendValues: [],
    });
  });
});

it('limits a trend sparkline to the comparison window', () => {
  const points = Array.from({ length: 61 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 0, index + 1)),
    value: index,
  }));

  expect(dashboardMeasureTrendWindowValues(points)).toEqual(
    Array.from({ length: 31 }, (_, index) => index + 30),
  );
});

it('excludes synthetic leading zeroes from SCA trend maturity', () => {
  const points = [
    { date: new Date('2026-01-01T00:00:00Z'), value: 0 },
    { date: new Date('2026-02-01T00:00:00Z'), value: 0 },
    { date: new Date('2026-03-01T00:00:00Z'), value: 120 },
  ];

  expect(
    dashboardMeasureTrendPoints(points, {
      api: 'sca-resolution-history',
      statistic: ScaResolutionStatistic.ScaMTTR,
    }),
  ).toEqual([points[2]]);
  expect(
    dashboardMeasureTrendPoints(points, {
      api: 'issue-resolution-history',
      statistic: IssueResolutionStatistic.MTTR,
    }),
  ).toBe(points);
});

it('extracts valid values for the requested measures-history metric', () => {
  const measure = {
    api: 'measures-history' as const,
    metricKey: MetricKey.coverage,
    scope: CodeScope.Overall,
  };

  expect(
    dashboardMeasureHistoryValues(
      {
        api: 'measures-history',
        history: [
          {
            date: '2026-01-01',
            measures: [
              { metric: MetricKey.bugs, type: MetricType.Integer, value: '12' },
              { metric: MetricKey.coverage, type: MetricType.Percent, value: '80.5' },
            ],
          },
          {
            date: '2026-02-01',
            measures: [{ metric: MetricKey.coverage, type: MetricType.Percent, value: 'invalid' }],
          },
        ],
      },
      measure,
    ),
  ).toEqual([80.5]);
});

it('sorts history and parses rating and data measures', () => {
  const measure = {
    api: 'measures-history' as const,
    metricKey: MetricKey.security_rating,
    scope: CodeScope.Overall,
  };
  expect(
    dashboardMeasureHistoryValues(
      {
        api: 'measures-history',
        history: [
          {
            date: '2026-02-01',
            measures: [{ metric: MetricKey.security_rating, type: MetricType.Rating, value: 'B' }],
          },
          {
            date: '2026-01-01',
            measures: [{ metric: MetricKey.security_rating, type: MetricType.Rating, value: 'A' }],
          },
        ],
      },
      measure,
      MetricType.Rating,
    ),
  ).toEqual([1, 2]);

  expect(
    dashboardMeasureHistoryValues(
      {
        api: 'measures-history',
        history: [
          {
            date: '2026-01-01',
            measures: [
              {
                metric: MetricKey.security_issues,
                type: MetricType.Data,
                value: '{"HIGH":3,"LOW":2,"total":5}',
              },
            ],
          },
        ],
      },
      { ...measure, metricKey: MetricKey.security_issues },
      MetricType.Data,
      { impactSeverities: [SoftwareImpactSeverity.High] },
    ),
  ).toEqual([3]);
});

it('rejects mismatched history and sums issue distributions', () => {
  const issueHistory = {
    api: 'issue-count-history' as const,
    history: [
      {
        date: '2026-01-01',
        distribution: [
          { key: 'HIGH', value: 2 },
          { key: 'LOW', value: 3 },
        ],
      },
    ],
  };

  expect(
    dashboardMeasureHistoryValues(issueHistory, {
      api: 'issue-count-history',
      metricKey: MetricKey.violations,
    }),
  ).toEqual([5]);
  expect(
    dashboardMeasureHistoryValues(
      { api: 'measures-history', history: [] },
      { api: 'issue-density-history' },
    ),
  ).toEqual([]);
  expect(dashboardMeasureHistoryValues(undefined, { api: 'issue-density-history' })).toEqual([]);
});

it('derives metric keys for metric and distribution measures', () => {
  expect(
    dashboardMeasureMetricKey({
      api: 'measures-history',
      metricKey: MetricKey.coverage,
      scope: CodeScope.Overall,
    }),
  ).toBe(MetricKey.coverage);
  expect(dashboardMeasureMetricKey({ api: 'issue-density-history' })).toBe(MetricKey.violations);
});

it('normalizes count display types for density, MTTR, data, and missing metadata', () => {
  expect(dashboardCountMetricType({ api: 'issue-density-history' }, undefined)).toBe(
    MetricType.Float,
  );
  expect(
    dashboardCountMetricType(
      { api: 'issue-resolution-history', statistic: IssueResolutionStatistic.MTTR },
      undefined,
    ),
  ).toBe('MTTR_CALENDAR');
  expect(
    dashboardCountMetricType(
      { api: 'sca-resolution-history', statistic: ScaResolutionStatistic.ScaMTTR },
      undefined,
    ),
  ).toBe('MTTR_CALENDAR');
  expect(
    dashboardCountMetricType(
      {
        api: 'issue-resolution-history',
        statistic: IssueResolutionStatistic.ResolvedIssues,
      },
      MetricType.Data,
    ),
  ).toBe(MetricType.Integer);
  expect(
    dashboardCountMetricType(
      {
        api: 'issue-resolution-history',
        statistic: IssueResolutionStatistic.ResolvedIssues,
      },
      undefined,
    ),
  ).toBe(MetricType.Integer);
});

it('omits missing density values while preserving decimals and zeroes', () => {
  expect(
    dashboardMeasureHistoryValues(
      {
        api: 'issue-density-history',
        history: [
          { date: '2026-06-17', distribution: [{ key: 'all', value: 2.5944423284132183 }] },
          { date: '2026-06-16', distribution: [{ key: 'all', value: 0 }] },
          { date: '2026-03-22', distribution: [{ key: 'all' }] },
        ],
      },
      { api: 'issue-density-history' },
    ),
  ).toEqual([0, 2.5944423284132183]);
});

it('preserves empty resolved-issues days as zeroes but omits empty MTTR days', () => {
  const history = {
    api: 'issue-resolution-history' as const,
    history: [{ date: '2026-06-17', distribution: [] }],
  };

  expect(
    dashboardMeasureHistoryValues(history, {
      api: 'issue-resolution-history',
      statistic: IssueResolutionStatistic.ResolvedIssues,
    }),
  ).toEqual([0]);
  expect(
    dashboardMeasureHistoryValues(history, {
      api: 'issue-resolution-history',
      statistic: IssueResolutionStatistic.MTTR,
    }),
  ).toEqual([]);
});
