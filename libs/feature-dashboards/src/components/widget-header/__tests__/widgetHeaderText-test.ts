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

import type { IntlShape } from 'react-intl';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType, IssueStatus, RichMetricKey } from '../../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import {
  getDashboardMetricTitle,
  getMetricWidgetHeaderText,
  getRatingWidgetHeaderText,
} from '../widgetHeaderText';

const formatMessage = ((descriptor: { id: string }, values?: { title?: string }): string => {
  if (descriptor.id === 'dashboard.widget.title.over_time') {
    return `${values?.title} over time`;
  }
  return descriptor.id === 'severity.HIGH' ? 'High' : descriptor.id;
}) as IntlShape['formatMessage'];

const getLocalizedMetricName = jest.fn(({ key }: { key: string }) => key);

describe('getDashboardMetricTitle', () => {
  it('formats severity-filtered rich metric parts in an over-time title', () => {
    const title = getDashboardMetricTitle({
      formatMessage,
      getLocalizedMetricName,
      hasHistoryRange: true,
      metric: {
        type: DashboardMetricType.Rich,
        metricKey: RichMetricKey.Issues,
        measureFilters: { impactSeverities: [SoftwareImpactSeverity.High] },
      },
    });

    expect(title).toBe(`High+ ${MetricKey.issues} over time`);
    expect(getLocalizedMetricName).toHaveBeenCalled();
  });

  it('formats issue resolution and issue density titles', () => {
    expect(
      getDashboardMetricTitle({
        formatMessage,
        getLocalizedMetricName,
        hasHistoryRange: false,
        metric: {
          statistic: IssueResolutionStatistic.MTTR,
          type: DashboardMetricType.IssueResolution,
        },
      }),
    ).toBe('dashboard.add_widget_modal.define_widget.metric.mttr');

    expect(
      getDashboardMetricTitle({
        formatMessage,
        getLocalizedMetricName,
        hasHistoryRange: false,
        metric: { type: DashboardMetricType.IssueDensity },
      }),
    ).toBe('dashboard.add_widget_modal.define_widget.metric.issue_density');
  });

  it('maps hotspot and raw metrics to their localized names', () => {
    expect(
      getDashboardMetricTitle({
        formatMessage,
        getLocalizedMetricName,
        hasHistoryRange: false,
        metric: {
          metricKey: RichMetricKey.Hotspots,
          type: DashboardMetricType.Rich,
        },
      }),
    ).toBe(MetricKey.security_hotspots);

    expect(
      getDashboardMetricTitle({
        formatMessage,
        getLocalizedMetricName,
        hasHistoryRange: true,
        metric: {
          metricKey: MetricKey.coverage,
          type: DashboardMetricType.Raw,
        },
      }),
    ).toBe(`${MetricKey.coverage} over time`);
  });

  it('uses the dedicated releasability rating over-time title', () => {
    expect(
      getDashboardMetricTitle({
        formatMessage,
        getLocalizedMetricName,
        hasHistoryRange: true,
        metric: {
          metricKey: MetricKey.releasability_rating,
          type: DashboardMetricType.Raw,
        },
      }),
    ).toBe('portfolio_dashboard.widget.releasability_rating_over_time');
  });

  it('omits a severity prefix when all severities are selected', () => {
    expect(
      getDashboardMetricTitle({
        formatMessage,
        getLocalizedMetricName,
        hasHistoryRange: false,
        metric: {
          measureFilters: {
            impactSeverities: Object.values(SoftwareImpactSeverity),
          },
          metricKey: RichMetricKey.Issues,
          type: DashboardMetricType.Rich,
        },
      }),
    ).toBe(MetricKey.issues);
  });
});

describe('getMetricWidgetHeaderText', () => {
  it('builds time range, scope, grouped filters, and title text', () => {
    const header = getMetricWidgetHeaderText({
      formatMessage,
      getLocalizedMetricName,
      groupBy: LineChartGroupBy.Severity,
      hasHistoryRange: false,
      metric: {
        measureFilters: {
          impactSeverities: [SoftwareImpactSeverity.High],
          impactSoftwareQuality: SoftwareQuality.Security,
          issueStatus: IssueStatus.Open,
        },
        metricKey: RichMetricKey.Issues,
        type: DashboardMetricType.Rich,
      },
      scope: CodeScope.Overall,
    });

    expect(header).toEqual({
      filterSegments: [
        'dashboard_widget.codescope.overall',
        'dashboard.line_chart.group_by.label: dashboard.line_chart.group_by.severity',
        'dashboard.add_widget_modal.apply_filters_section.select.status.label: issue.status.OPEN',
        'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label: software_quality.SECURITY',
        'dashboard.add_widget_modal.apply_filters_section.select.severity.label: High',
      ],
      title: `High+ issue.status.OPEN software_quality.SECURITY ${MetricKey.issues}`,
    });
  });

  it('adds a fixed time range for issue-resolution metrics', () => {
    const header = getMetricWidgetHeaderText({
      formatMessage,
      getLocalizedMetricName,
      hasHistoryRange: true,
      metric: {
        statistic: IssueResolutionStatistic.MTTR,
        type: DashboardMetricType.IssueResolution,
      },
      scope: CodeScope.New,
    });

    expect(header.filterSegments).toEqual([
      'dashboard_widget.time_range.rolling_30_day_average',
      'dashboard_widget.codescope.new',
    ]);
    expect(header.title).toBe('dashboard.add_widget_modal.define_widget.metric.mttr over time');
  });

  it('does not add a fixed time range for resolved issues over time', () => {
    const header = getMetricWidgetHeaderText({
      filterLineScopeOnly: true,
      formatMessage,
      getLocalizedMetricName,
      hasHistoryRange: true,
      metric: {
        statistic: IssueResolutionStatistic.ResolvedIssues,
        type: DashboardMetricType.IssueResolution,
      },
      scope: CodeScope.Overall,
    });

    expect(header.filterSegments).toEqual(['dashboard_widget.codescope.overall']);
  });
});

describe('getRatingWidgetHeaderText', () => {
  it('omits the scope for quality gate status', () => {
    expect(
      getRatingWidgetHeaderText({
        formatMessage,
        getLocalizedMetricName,
        metricKey: MetricKey.alert_status,
        scope: CodeScope.Overall,
      }),
    ).toEqual({
      filterSegments: [],
      title: MetricKey.alert_status,
    });
  });

  it('includes the scope for other ratings', () => {
    expect(
      getRatingWidgetHeaderText({
        formatMessage,
        getLocalizedMetricName,
        metricKey: MetricKey.reliability_rating,
        scope: CodeScope.New,
      }),
    ).toEqual({
      filterSegments: ['dashboard_widget.codescope.new'],
      title: MetricKey.reliability_rating,
    });
  });
});
