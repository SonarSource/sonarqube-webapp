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
import type { WidgetInstance } from '../../../dashboard-layout/logic/types';
import {
  DashboardMetricType,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  type ProjectDashboardWidgetPropMap,
} from '../../../types/dashboard-widget';
import { PieChartPastry } from '../../../types/visualization';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import { configToWidgetProps, widgetToConfig } from '../editWidgetConfig';

describe('editWidgetConfig', () => {
  it('widgetToConfig adds widgetType from instance type', () => {
    const widget: WidgetInstance<ProjectDashboardWidgetPropMap> = {
      dimensions: { height: 1, width: 1 },
      key: 'w1',
      position: { x: 0, y: 0 },
      props: {
        metric: { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
        scope: CodeScope.Overall,
      },
      type: 'count',
    };

    expect(widgetToConfig(widget)).toEqual({
      widgetType: VisualizationType.Count,
      metric: widget.props.metric,
      scope: CodeScope.Overall,
    });
  });

  it('configToWidgetProps strips widgetType and passes props for pie chart', () => {
    expect(
      configToWidgetProps({
        filter: '',
        metric: PieChartMetric.IssueCount,
        scope: CodeScope.Overall,
        showLegend: true,
        slice: PieChartIssueSlice.ImpactSeverities,
        widgetType: VisualizationType.PieChart,
      }),
    ).toEqual({
      filter: '',
      metric: PieChartMetric.IssueCount,
      scope: CodeScope.Overall,
      showLegend: true,
      slice: PieChartIssueSlice.ImpactSeverities,
    });
  });

  it('configToWidgetProps sets donut pastry on donut chart config', () => {
    expect(
      configToWidgetProps({
        filter: '',
        metric: PieChartMetric.LineCount,
        pastry: PieChartPastry.Donut,
        scope: CodeScope.Overall,
        showLegend: false,
        slice: PieChartLineSlice.Coverage,
        widgetType: VisualizationType.DonutChart,
      }),
    ).toEqual({
      filter: '',
      metric: PieChartMetric.LineCount,
      pastry: PieChartPastry.Donut,
      scope: CodeScope.Overall,
      showLegend: false,
      slice: PieChartLineSlice.Coverage,
    });
  });
});
