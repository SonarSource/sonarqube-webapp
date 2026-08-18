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

import type { ProjectDashboardWidgetPropMap } from '../../types/dashboard-widget';
import type { DashboardInstance, WidgetInstance } from '../logic/types';

function incrementRecord(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

function dropZeroCounts(record: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(record).filter(([, count]) => count > 0));
}

function collectFromWidget(
  widget: WidgetInstance<ProjectDashboardWidgetPropMap>,
  visualizationCounts: Record<string, number>,
  metricCounts: Record<string, number>,
) {
  incrementRecord(visualizationCounts, widget.type);

  switch (widget.type) {
    case 'count':
    case 'lineChart':
    case 'topList':
      if ('metricKey' in widget.props.metric) {
        incrementRecord(metricCounts, widget.props.metric.metricKey);
      } else if ('statistic' in widget.props.metric) {
        incrementRecord(metricCounts, widget.props.metric.statistic);
      }
      break;
    case 'donutChart':
    case 'pieChart':
      incrementRecord(metricCounts, widget.props.metric);
      break;
    case 'ratingBadge':
      incrementRecord(metricCounts, widget.props.metricKey);
      break;
  }
}

export type DashboardWidgetTelemetryAggregates = {
  widgetMetricsCount?: Record<string, number>;
  widgetVisualizationsCount?: Record<string, number>;
};

/**
 * Counts widget visualization types and metric keys on a dashboard layout for PageViewed telemetry.
 * Omits keys whose count is 0. Returns an empty object when layout is missing.
 */
export function getDashboardWidgetTelemetryAggregates(
  layout: DashboardInstance<ProjectDashboardWidgetPropMap> | null | undefined,
): DashboardWidgetTelemetryAggregates {
  if (!layout) {
    return {};
  }

  const visualizationCounts: Record<string, number> = {};
  const metricCounts: Record<string, number> = {};

  for (const section of layout.children) {
    for (const widget of section.children) {
      collectFromWidget(widget, visualizationCounts, metricCounts);
    }
  }

  const widgetVisualizationsCount = dropZeroCounts(visualizationCounts);
  const widgetMetricsCount = dropZeroCounts(metricCounts);

  const result: DashboardWidgetTelemetryAggregates = {};
  if (Object.keys(widgetVisualizationsCount).length > 0) {
    result.widgetVisualizationsCount = widgetVisualizationsCount;
  }
  if (Object.keys(widgetMetricsCount).length > 0) {
    result.widgetMetricsCount = widgetMetricsCount;
  }
  return result;
}
