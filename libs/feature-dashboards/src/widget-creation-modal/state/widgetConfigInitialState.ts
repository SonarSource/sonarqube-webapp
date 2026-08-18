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

import { DEFAULT_LINE_CHART_GROUP_BY, HistoryRange } from '../../data/widgets/line-chart';
import { CodeScope, DEFAULT_TOP_LIST_LIMIT, VisualizationType } from '../../types/widget-common';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  TopListConfig,
} from './widgetConfigTypes';

export function createInitialLineChartConfig(): LineChartConfig {
  return {
    complete: false,
    groupBy: DEFAULT_LINE_CHART_GROUP_BY,
    historyRange: HistoryRange.Last12Months,
    measureFilters: undefined,
    metric: null,
    scope: CodeScope.Overall,
    showLegend: false,
  };
}

export function createInitialCountConfig(): CountConfig {
  return {
    complete: false,
    measureFilters: undefined,
    metric: null,
    scope: CodeScope.Overall,
    showTrendIndicator: true,
  };
}

export function createInitialRatingBadgeConfig(): RatingBadgeConfig {
  return {
    complete: false,
    metricKey: null,
    scope: CodeScope.Overall,
    showBreakdown: false,
  };
}

// Backward compatibility helper
export function createInitialMetricConfig(): CountConfig {
  return createInitialCountConfig();
}

// Backward compatibility helper
export function createInitialMetricBasedConfig(
  type: typeof VisualizationType.LineChart | typeof VisualizationType.Count,
): LineChartConfig | CountConfig {
  return type === VisualizationType.LineChart
    ? createInitialLineChartConfig()
    : createInitialCountConfig();
}

export function createInitialTopListConfig(): TopListConfig {
  return {
    complete: false,
    limit: DEFAULT_TOP_LIST_LIMIT,
    measureFilters: undefined,
    metric: null,
    rankBy: null,
    scope: CodeScope.Overall,
  };
}

export function createInitialPieChartConfig(): PieChartConfig {
  return {
    complete: false,
    metric: null,
    slice: null,
    scope: CodeScope.Overall,
    filter: '',
    showLegend: true,
  };
}
