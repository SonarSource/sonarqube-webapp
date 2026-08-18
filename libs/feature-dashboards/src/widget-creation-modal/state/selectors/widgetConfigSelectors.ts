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

import { HistoryRange } from '../../../data/widgets/line-chart';
import {
  CompleteWidgetConfig,
  PieChartIssueSlice,
  PieChartMetric,
} from '../../../types/dashboard-widget';
import { PieChartPastry } from '../../../types/visualization';
import { VisualizationType } from '../../../types/widget-common';
import { clampCountTrendIndicator } from '../../../utils/countWidgetTrendIndicator';
import { clampLineChartScope } from '../../../utils/lineChartScope';
import {
  buildDashboardMetricForTopList,
  isTopListRankByValue,
  topListConfigFromDashboardMetric,
} from '../../utils/topListCompleteConfig';
import { getCurrentConfig } from '../reducers/utils';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  TopListConfig,
  WidgetConfigState,
} from '../widgetConfigTypes';

/**
 * Type guard to check if a config is complete and extract the output.
 * This eliminates the need for type assertions.
 */
export function extractCompleteConfig(state: WidgetConfigState): CompleteWidgetConfig | null {
  const currentConfig = getCurrentConfig(state);

  if (!currentConfig?.complete || state.selectedType === null) {
    return null;
  }

  if (state.selectedType === VisualizationType.LineChart) {
    const config = currentConfig as LineChartConfig & { complete: true };
    return {
      widgetType: state.selectedType,
      groupBy: config.groupBy,
      metric: config.metric,
      scope: config.scope,
      historyRange: config.historyRange,
      showLegend: config.showLegend,
    };
  }

  if (state.selectedType === VisualizationType.Count) {
    const config = currentConfig as CountConfig & { complete: true };
    return {
      widgetType: state.selectedType,
      metric: config.metric,
      scope: config.scope,
      showTrendIndicator: config.showTrendIndicator,
    };
  }

  if (state.selectedType === VisualizationType.RatingBadge) {
    const config = currentConfig as RatingBadgeConfig & { complete: true };
    return {
      widgetType: state.selectedType,
      metricKey: config.metricKey,
      scope: config.scope,
      showBreakdown: config.showBreakdown,
    };
  }

  if (state.selectedType === VisualizationType.PieChart) {
    const config = currentConfig as PieChartConfig & { complete: true };
    return {
      widgetType: state.selectedType,
      metric: config.metric,
      slice: config.slice,
      scope: config.scope,
      filter: config.filter,
      showLegend: config.showLegend,
    };
  }

  if (state.selectedType === VisualizationType.DonutChart) {
    const config = currentConfig as PieChartConfig & { complete: true };
    return {
      widgetType: state.selectedType,
      metric: config.metric,
      slice: config.slice,
      scope: config.scope,
      filter: config.filter,
      showLegend: config.showLegend,
      pastry: PieChartPastry.Donut,
    };
  }

  if (state.selectedType === VisualizationType.TopList) {
    const config = currentConfig as TopListConfig & { complete: true };
    if (!config.rankBy) {
      return null;
    }
    return {
      widgetType: state.selectedType,
      limit: config.limit,
      metric: buildDashboardMetricForTopList(config.measureFilters),
      rankBy: config.rankBy,
      scope: config.scope,
    };
  }

  return null;
}

/**
 * Check if the current state represents a valid, complete widget configuration.
 */
export function isConfigComplete(state: WidgetConfigState): boolean {
  const currentConfig = getCurrentConfig(state);
  return currentConfig?.complete === true;
}

type CompletePieLikeWidgetConfig = Extract<
  CompleteWidgetConfig,
  | { widgetType: typeof VisualizationType.PieChart }
  | { widgetType: typeof VisualizationType.DonutChart }
>;

function pieChartConfigFromCompletePieLikeWidget(
  config: CompletePieLikeWidgetConfig,
): PieChartConfig {
  const filter =
    config.metric === PieChartMetric.IssueCount &&
    config.slice === PieChartIssueSlice.ImpactSoftwareQualities
      ? ''
      : config.filter;
  return {
    complete: true,
    filter,
    metric: config.metric,
    scope: config.scope,
    showLegend: config.showLegend,
    slice: config.slice,
  };
}

/**
 * Converts a CompleteWidgetConfig back to a WidgetConfigState.
 * Used when initializing the modal for editing an existing widget.
 */
export function initializeFromConfig(config: CompleteWidgetConfig): WidgetConfigState {
  const selectedType = config.widgetType;

  if (selectedType === VisualizationType.LineChart) {
    const lineChartConfig = clampLineChartScope({
      complete: true,
      groupBy: config.groupBy,
      metric: config.metric,
      scope: config.scope,
      historyRange:
        config.historyRange === HistoryRange.All ? HistoryRange.Last12Months : config.historyRange,
      showLegend: config.showLegend,
    });
    return {
      selectedType,
      configs: { [VisualizationType.LineChart]: lineChartConfig },
    };
  }

  if (selectedType === VisualizationType.Count) {
    const countConfig = clampCountTrendIndicator({
      complete: true,
      metric: config.metric,
      scope: config.scope,
      showTrendIndicator: config.showTrendIndicator,
    });
    return {
      selectedType,
      configs: { [VisualizationType.Count]: countConfig },
    };
  }

  if (selectedType === VisualizationType.RatingBadge) {
    const ratingBadgeConfig: RatingBadgeConfig = {
      complete: true,
      metricKey: config.metricKey,
      scope: config.scope,
      showBreakdown: config.showBreakdown,
    };
    return {
      selectedType,
      configs: { [VisualizationType.RatingBadge]: ratingBadgeConfig },
    };
  }

  if (selectedType === VisualizationType.PieChart) {
    const pieChartConfig = pieChartConfigFromCompletePieLikeWidget(config);
    return {
      selectedType,
      configs: { [VisualizationType.PieChart]: pieChartConfig },
    };
  }

  if (selectedType === VisualizationType.DonutChart) {
    const donutChartConfig = pieChartConfigFromCompletePieLikeWidget(config);
    return {
      selectedType,
      configs: {
        [VisualizationType.DonutChart]: donutChartConfig,
        [VisualizationType.PieChart]: donutChartConfig,
      },
    };
  }

  if (selectedType === VisualizationType.TopList) {
    const rankBy = isTopListRankByValue(config.rankBy) ? config.rankBy : null;
    const topListConfig = topListConfigFromDashboardMetric(
      config.metric,
      rankBy,
      config.scope,
      config.limit,
    );
    return {
      selectedType,
      configs: { [VisualizationType.TopList]: topListConfig },
    };
  }

  // Fallback - should not happen
  return { selectedType: null, configs: {} };
}
