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

import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  PieChartIssueSlice,
  PieChartMetric,
  RichMetricKey,
  type ProjectDashboardWidgetPropMap,
} from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import type { DashboardInstance } from '../../logic/types';
import { getDashboardWidgetTelemetryAggregates } from '../getDashboardWidgetTelemetryAggregates';

describe('getDashboardWidgetTelemetryAggregates', () => {
  it('returns empty object when layout is null or undefined', () => {
    expect(getDashboardWidgetTelemetryAggregates(null)).toEqual({});
    expect(getDashboardWidgetTelemetryAggregates(undefined)).toEqual({});
  });

  it('aggregates visualization types and metric keys across sections', () => {
    const layout: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        {
          type: 'implicit',
          children: [
            {
              type: 'lineChart',
              key: 'w-line',
              position: { x: 0, y: 0 },
              dimensions: { width: 4, height: 2 },
              props: {
                groupBy: LineChartGroupBy.None,
                historyRange: HistoryRange.LastMonth,
                metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw },
                scope: CodeScope.Overall,
              },
            },
            {
              type: 'count',
              key: 'w-count',
              position: { x: 4, y: 0 },
              dimensions: { width: 2, height: 2 },
              props: {
                metric: { metricKey: RichMetricKey.Issues, type: DashboardMetricType.Rich },
                scope: CodeScope.Overall,
              },
            },
          ],
        },
        {
          type: 'explicit',
          key: 'sec',
          name: 'S',
          description: '',
          children: [
            {
              type: 'pieChart',
              key: 'w-pie',
              position: { x: 0, y: 0 },
              dimensions: { width: 3, height: 3 },
              props: {
                filter: '',
                metric: PieChartMetric.HotspotCount,
                scope: CodeScope.Overall,
                showLegend: true,
                slice: PieChartIssueSlice.IssueStatuses,
              },
            },
            {
              type: 'ratingBadge',
              key: 'w-rb',
              position: { x: 3, y: 0 },
              dimensions: { width: 2, height: 2 },
              props: {
                metricKey: MetricKey.vulnerabilities,
                scope: CodeScope.Overall,
              },
            },
          ],
        },
      ],
    };

    expect(getDashboardWidgetTelemetryAggregates(layout)).toEqual({
      widgetMetricsCount: {
        bugs: 1,
        hotspotCount: 1,
        issueCount: 1,
        vulnerabilities: 1,
      },
      widgetVisualizationsCount: {
        count: 1,
        lineChart: 1,
        pieChart: 1,
        ratingBadge: 1,
      },
    });
  });

  it('increments count with statistic for issue resolution metrics', () => {
    const layout: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        {
          type: 'implicit',
          children: [
            {
              type: 'count',
              key: 'w-ir',
              position: { x: 0, y: 0 },
              dimensions: { width: 2, height: 2 },
              props: {
                metric: {
                  statistic: IssueResolutionStatistic.MTTR,
                  type: DashboardMetricType.IssueResolution,
                },
                scope: CodeScope.Overall,
              },
            },
          ],
        },
      ],
    };

    expect(getDashboardWidgetTelemetryAggregates(layout)).toEqual({
      widgetMetricsCount: { [IssueResolutionStatistic.MTTR]: 1 },
      widgetVisualizationsCount: { count: 1 },
    });
  });

  it('increments counts when the same visualization or metric appears more than once', () => {
    const layout: DashboardInstance<ProjectDashboardWidgetPropMap> = {
      children: [
        {
          type: 'implicit',
          children: [
            {
              type: 'lineChart',
              key: 'a',
              position: { x: 0, y: 0 },
              dimensions: { width: 1, height: 1 },
              props: {
                groupBy: LineChartGroupBy.None,
                historyRange: HistoryRange.LastMonth,
                metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw },
                scope: CodeScope.Overall,
              },
            },
            {
              type: 'lineChart',
              key: 'b',
              position: { x: 1, y: 0 },
              dimensions: { width: 1, height: 1 },
              props: {
                groupBy: LineChartGroupBy.None,
                historyRange: HistoryRange.LastMonth,
                metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw },
                scope: CodeScope.Overall,
              },
            },
          ],
        },
      ],
    };

    expect(getDashboardWidgetTelemetryAggregates(layout)).toEqual({
      widgetMetricsCount: { bugs: 2 },
      widgetVisualizationsCount: { lineChart: 2 },
    });
  });
});
