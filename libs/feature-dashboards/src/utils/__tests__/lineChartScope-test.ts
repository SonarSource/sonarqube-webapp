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
import { HistoryRange, LineChartGroupBy } from '../../data/widgets/line-chart';
import { DashboardMetricType, RichMetricKey } from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import type { LineChartConfig } from '../../widget-creation-modal/state/widgetConfigTypes';
import { clampLineChartScope } from '../lineChartScope';

describe('lineChartScope', () => {
  const rawLineChartConfig = {
    complete: true,
    groupBy: LineChartGroupBy.None,
    historyRange: HistoryRange.All,
    metric: { metricKey: MetricKey.coverage, type: DashboardMetricType.Raw },
    scope: CodeScope.New,
    showLegend: false,
  } satisfies LineChartConfig;

  const richLineChartConfig = {
    ...rawLineChartConfig,
    metric: {
      measureFilters: {},
      metricKey: RichMetricKey.Issues,
      type: DashboardMetricType.Rich,
    },
  } satisfies LineChartConfig;

  it('clamps issue-count line charts to overall code scope', () => {
    expect(clampLineChartScope(richLineChartConfig)).toEqual({
      ...richLineChartConfig,
      scope: CodeScope.Overall,
    });
  });

  it('clamps hotspot line charts to overall code scope', () => {
    const richHotspotConfig = {
      ...rawLineChartConfig,
      metric: {
        measureFilters: {},
        metricKey: RichMetricKey.Hotspots,
        type: DashboardMetricType.Rich,
      },
    } satisfies LineChartConfig;

    expect(clampLineChartScope(richHotspotConfig)).toEqual({
      ...richHotspotConfig,
      scope: CodeScope.Overall,
    });
  });

  it('keeps scope for raw line charts', () => {
    expect(clampLineChartScope(rawLineChartConfig)).toBe(rawLineChartConfig);
  });

  it('does not clamp other rich metrics that are not issue-count-history', () => {
    const richLinesConfig = {
      ...rawLineChartConfig,
      metric: {
        measureFilters: {},
        metricKey: RichMetricKey.Lines,
        type: DashboardMetricType.Rich,
      },
    } satisfies LineChartConfig;

    expect(clampLineChartScope(richLinesConfig)).toBe(richLinesConfig);
  });
});
