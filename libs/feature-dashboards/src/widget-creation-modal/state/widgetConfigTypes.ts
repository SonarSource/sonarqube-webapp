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
import { HistoryRange, type LineChartGroupByValue } from '../../data/widgets/line-chart';
import {
  DashboardMetric,
  MeasureFilters,
  PieChartFilter,
  PieChartMetric,
  PieChartSlice,
} from '../../types/dashboard-widget';
import {
  CodeScope,
  MetricOptionValue,
  VisualizationType,
  type DashboardWidgetType,
  type TopListLimitValue,
  type TopListMetricValue,
  type TopListRankByValue,
} from '../../types/widget-common';

// ============================================================================
// Widget Configuration Types (Discriminated Unions)
// ============================================================================

export interface WidgetConfigReducerOptions {
  isPortfolioWidgetConfigurator?: boolean;
  supportsNewCodeScopeForMetric?: (
    metricKey: MetricKey,
    visualizationType: DashboardWidgetType,
  ) => boolean;
}

/**
 * Configuration for LineChart widget.
 * Complete when metric is set.
 */
export type LineChartConfig =
  | {
      complete: false;
      groupBy: LineChartGroupByValue;
      historyRange: HistoryRange;
      measureFilters?: MeasureFilters;
      metric: null;
      scope: CodeScope;
      showLegend?: boolean;
    }
  | {
      complete: true;
      groupBy: LineChartGroupByValue;
      historyRange: HistoryRange;
      metric: DashboardMetric;
      scope: CodeScope;
      showLegend?: boolean;
    };

/**
 * Configuration for Count widget.
 * Complete when metric is set.
 */
export type CountConfig =
  | {
      complete: false;
      measureFilters?: MeasureFilters;
      metric: null;
      scope: CodeScope;
      showTrendIndicator?: boolean;
    }
  | {
      complete: true;
      metric: DashboardMetric;
      scope: CodeScope;
      showTrendIndicator?: boolean;
    };

/**
 * Configuration for Rating Badge widget.
 * Complete when metricKey is set.
 * Note: RatingBadge only has breakdown customization for the Quality Gate Status metric.
 */
export type RatingBadgeConfig =
  | {
      complete: false;
      metricKey: null;
      scope: CodeScope;
      showBreakdown?: boolean;
    }
  | {
      complete: true;
      metricKey: MetricKey;
      scope: CodeScope;
      showBreakdown?: boolean;
    };

/**
 * Configuration for a Top list widget (row limit: 5, 10, or 15).
 * Complete when both metric and rank-by are set (each has a single option today).
 */
export type TopListConfig = {
  complete: boolean;
  limit: TopListLimitValue;
  measureFilters?: MeasureFilters;
  metric: TopListMetricValue | null;
  rankBy: TopListRankByValue | null;
  scope: CodeScope;
};

/**
 * Configuration for a PieChart widget.
 * Complete when both metric and slice are set.
 */
export type PieChartConfig =
  | {
      complete: false;
      filter: PieChartFilter;
      metric: PieChartMetric | null;
      scope: CodeScope;
      showLegend: boolean;
      slice: PieChartSlice | null;
    }
  | {
      complete: true;
      filter: PieChartFilter;
      metric: PieChartMetric;
      scope: CodeScope;
      showLegend: boolean;
      slice: PieChartSlice;
    };

/**
 * Union of all widget configurations.
 * The 'complete' discriminant indicates if the widget is ready to be added.
 */
export type WidgetConfig =
  LineChartConfig | CountConfig | RatingBadgeConfig | PieChartConfig | TopListConfig;

/**
 * Map of all widget configurations, indexed by widget type.
 * This preserves configurations when switching between types.
 * Note: DonutChart and PieChart share the same PieChartConfig.
 */
export interface WidgetConfigMap {
  [VisualizationType.Count]?: CountConfig;
  [VisualizationType.DonutChart]?: PieChartConfig;
  [VisualizationType.LineChart]?: LineChartConfig;
  [VisualizationType.PieChart]?: PieChartConfig;
  [VisualizationType.RatingBadge]?: RatingBadgeConfig;
  [VisualizationType.TopList]?: TopListConfig;
}

/**
 * The full state of the widget configuration form.
 * selectedType: The currently active widget type (null if no selection)
 * configs: Map of all widget configurations, preserving state when switching types
 */
export interface WidgetConfigState {
  configs: WidgetConfigMap;
  selectedType: null | DashboardWidgetType;
}

// ============================================================================
// State Actions
// ============================================================================

export type WidgetConfigAction =
  | { type: 'SET_WIDGET_TYPE'; widgetType: DashboardWidgetType }
  | {
      metricKey: MetricOptionValue | null;
      type: 'SET_METRIC_KEY';
    }
  | { scope: CodeScope; type: 'SET_SCOPE' }
  | { historyRange: HistoryRange; type: 'SET_HISTORY_RANGE' }
  | { measureFilters: MeasureFilters | undefined; type: 'SET_LINE_CHART_MEASURE_FILTERS' }
  | { measureFilters: MeasureFilters | undefined; type: 'SET_COUNT_MEASURE_FILTERS' }
  | { measureFilters: MeasureFilters | undefined; type: 'SET_TOP_LIST_MEASURE_FILTERS' }
  | { metric: TopListMetricValue | null; type: 'SET_TOP_LIST_METRIC' }
  | { rankBy: TopListRankByValue | null; type: 'SET_TOP_LIST_RANK_BY' }
  | { limit: TopListLimitValue; type: 'SET_TOP_LIST_LIMIT' }
  | { groupBy: LineChartGroupByValue; type: 'SET_LINE_CHART_GROUP_BY' }
  | { showLegend: boolean; type: 'SET_SHOW_LEGEND_LINECHART' }
  | { showTrendIndicator: boolean; type: 'SET_SHOW_TREND_INDICATOR' }
  | { showBreakdown: boolean; type: 'SET_SHOW_BREAKDOWN' }
  | { metric: PieChartMetric | null; type: 'SET_PIE_METRIC' }
  | { slice: PieChartSlice | null; type: 'SET_PIE_SLICE' }
  | { scope: CodeScope; type: 'SET_PIE_SCOPE' }
  | { filter: PieChartFilter | ''; type: 'SET_PIE_FILTER' }
  | { showLegend: boolean; type: 'SET_PIE_SHOW_LEGEND' }
  | { type: 'RESET' }
  | { payload: WidgetConfigState; type: 'INITIALIZE' };
