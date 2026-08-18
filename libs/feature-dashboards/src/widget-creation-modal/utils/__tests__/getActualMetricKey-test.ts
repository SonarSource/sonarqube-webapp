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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { DashboardMetricType, IssueStatus, RichMetricKey } from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { getActualMetricKey } from '../getActualMetricKey';

describe('getActualMetricKey', () => {
  it('returns the metric key for raw metrics', () => {
    expect(
      getActualMetricKey({
        metricKey: MetricKey.coverage,
        type: DashboardMetricType.Raw,
      }),
    ).toBe(MetricKey.coverage);
  });

  it('maps rich hotspots metric to security_hotspots', () => {
    expect(
      getActualMetricKey({
        measureFilters: undefined,
        metricKey: RichMetricKey.Hotspots,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.security_hotspots);
  });

  it('maps issue status filters to backend metric keys', () => {
    expect(
      getActualMetricKey({
        measureFilters: { issueStatus: IssueStatus.Open },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.open_issues);
    expect(
      getActualMetricKey({
        measureFilters: { issueStatus: IssueStatus.Accepted },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.accepted_issues);
    expect(
      getActualMetricKey({
        measureFilters: { issueStatus: IssueStatus.FalsePositive },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.false_positive_issues);
  });

  it('maps software quality filters to backend metric keys', () => {
    expect(
      getActualMetricKey({
        measureFilters: { impactSoftwareQuality: SoftwareQuality.Security },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.security_issues);
    expect(
      getActualMetricKey({
        measureFilters: { impactSoftwareQuality: SoftwareQuality.Reliability },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.reliability_issues);
    expect(
      getActualMetricKey({
        measureFilters: { impactSoftwareQuality: SoftwareQuality.Maintainability },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.maintainability_issues);
  });

  it('defaults rich issue metric without filters to violations', () => {
    expect(
      getActualMetricKey({
        measureFilters: undefined,
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      }),
    ).toBe(MetricKey.violations);
  });

  it('returns undefined for issue resolution metrics', () => {
    expect(
      getActualMetricKey({
        statistic: IssueResolutionStatistic.MTTR,
        type: DashboardMetricType.IssueResolution,
      }),
    ).toBeUndefined();

    expect(
      getActualMetricKey({
        statistic: IssueResolutionStatistic.ResolvedIssues,
        type: DashboardMetricType.IssueResolution,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for issue density metrics backed by the dedicated API', () => {
    expect(
      getActualMetricKey({
        measureFilters: { impactSoftwareQuality: SoftwareQuality.Maintainability },
        type: DashboardMetricType.IssueDensity,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for SCA resolution metrics backed by the dedicated API', () => {
    expect(
      getActualMetricKey({
        type: DashboardMetricType.ScaResolution,
      }),
    ).toBeUndefined();
  });
});
