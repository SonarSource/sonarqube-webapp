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
} from '../dashboard-measure-history';

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
