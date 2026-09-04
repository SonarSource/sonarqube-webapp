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

import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { CodeScope } from '../../types/widget-common';
import { PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE } from '../../utils/portfolioMeasures';
import { dashboardMeasureHistoryMetricKey, dashboardMetricToMeasure } from '../dashboard-measure';
import { DashboardMetricType, RichMetricKey, type DashboardMetric } from '../widgets/shared';

const issueMetric: DashboardMetric = {
  measureFilters: {
    impactSeverities: [SoftwareImpactSeverity.High],
    impactSoftwareQuality: SoftwareQuality.Security,
  },
  metricKey: RichMetricKey.Issues,
  type: DashboardMetricType.Rich,
};

describe('dashboardMetricToMeasure', () => {
  it('maps an MQR issue metric to backend-shaped impacts', () => {
    expect(dashboardMetricToMeasure(issueMetric, CodeScope.Overall)).toEqual(
      expect.objectContaining({
        api: 'issue-count-history',
        impacts: ['SECURITY:HIGH'],
        statuses: ['OPEN'],
      }),
    );
  });

  it('expands severity-only filters across all software qualities', () => {
    const measure = dashboardMetricToMeasure(
      {
        measureFilters: { impactSeverities: [SoftwareImpactSeverity.High] },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      },
      CodeScope.Overall,
    );

    expect(measure).toEqual({
      api: 'issue-count-history',
      impacts: ['SECURITY:HIGH', 'RELIABILITY:HIGH', 'MAINTAINABILITY:HIGH'],
      metricKey: MetricKey.violations,
      sliceBy: undefined,
      statuses: ['OPEN'],
    });
  });

  it('maps raw measures directly to measures history', () => {
    expect(
      dashboardMetricToMeasure(
        { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
        CodeScope.Overall,
      ),
    ).toEqual({
      api: 'measures-history',
      metricKey: MetricKey.coverage,
      scope: CodeScope.Overall,
    });
  });

  it('keeps deprecated hotspot widgets on their supported measures-history path', () => {
    expect(
      dashboardMetricToMeasure(
        { metricKey: RichMetricKey.Hotspots, type: DashboardMetricType.Rich },
        CodeScope.Overall,
      ),
    ).toEqual({
      api: 'measures-history',
      metricKey: MetricKey.security_hotspots,
      scope: CodeScope.Overall,
    });
  });

  it('coerces non-raw new-code metrics to overall history', () => {
    expect(dashboardMetricToMeasure(issueMetric, CodeScope.New)).toEqual({
      api: 'issue-count-history',
      impacts: ['SECURITY:HIGH'],
      metricKey: MetricKey.software_quality_security_issues,
      statuses: ['OPEN'],
    });
  });

  it('preserves new-code scope for project raw metrics', () => {
    expect(
      dashboardMetricToMeasure(
        { metricKey: MetricKey.line_coverage, type: DashboardMetricType.Raw },
        CodeScope.New,
      ),
    ).toEqual({
      api: 'measures-history',
      metricKey: MetricKey.line_coverage,
      scope: CodeScope.New,
    });
  });

  it('coerces project raw metrics without a new-code measure to overall scope', () => {
    expect(
      dashboardMetricToMeasure(
        { metricKey: MetricKey.comment_lines, type: DashboardMetricType.Raw },
        CodeScope.New,
      ),
    ).toEqual({
      api: 'measures-history',
      metricKey: MetricKey.comment_lines,
      scope: CodeScope.Overall,
    });
  });

  it('coerces raw metrics unsupported by portfolio history to overall scope', () => {
    expect(
      dashboardMetricToMeasure(
        { metricKey: MetricKey.line_coverage, type: DashboardMetricType.Raw },
        CodeScope.New,
        { supportedNewCodeMetrics: PORTFOLIO_METRICS_SUPPORTING_NEW_CODE_SCOPE },
      ),
    ).toEqual({
      api: 'measures-history',
      metricKey: MetricKey.line_coverage,
      scope: CodeScope.Overall,
    });
  });
});

describe('dashboardMeasureHistoryMetricKey', () => {
  it('uses the API response key for new-code measures', () => {
    expect(
      dashboardMeasureHistoryMetricKey({
        api: 'measures-history',
        metricKey: MetricKey.coverage,
        scope: CodeScope.New,
      }),
    ).toBe(MetricKey.new_coverage);
  });

  it('uses project new-code response keys outside the portfolio allowlist', () => {
    expect(
      dashboardMeasureHistoryMetricKey({
        api: 'measures-history',
        metricKey: MetricKey.line_coverage,
        scope: CodeScope.New,
      }),
    ).toBe(MetricKey.new_line_coverage);
  });
});
