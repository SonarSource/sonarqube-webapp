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

import type { LineChartGroupByValue } from '../../../data/widgets/line-chart';
import { DashboardMetricType, type MeasureFilters } from '../../../types/dashboard-widget';
import { VisualizationType } from '../../../types/widget-common';
import {
  isLineChartGroupByActive,
  lineChartGroupByConflictsWithMeasureFilter,
} from '../../utils/lineChartGroupByHelpers';
import type {
  LineChartConfig,
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';
import { mergeMeasureFiltersIntoLineOrCountConfig, updateCurrentConfig } from './utils';

function clearMeasureFilterConflictForGroupBy(
  measureFilters: MeasureFilters | undefined,
  groupBy: LineChartGroupByValue,
): MeasureFilters | undefined {
  const conflict = lineChartGroupByConflictsWithMeasureFilter(groupBy);
  if (!conflict || !measureFilters) {
    return measureFilters;
  }
  return {
    ...measureFilters,
    [conflict]: undefined,
  };
}

function lineChartConfigWithGroupBy(
  lineChartConfig: LineChartConfig,
  groupBy: LineChartGroupByValue,
): LineChartConfig {
  const enablingGroupBy =
    !isLineChartGroupByActive(lineChartConfig.groupBy) && isLineChartGroupByActive(groupBy);
  const showLegend = enablingGroupBy ? true : lineChartConfig.showLegend;
  if (!lineChartConfig.complete) {
    return {
      ...lineChartConfig,
      groupBy,
      measureFilters: clearMeasureFilterConflictForGroupBy(lineChartConfig.measureFilters, groupBy),
      showLegend,
    };
  }
  if (lineChartConfig.metric.type !== DashboardMetricType.Rich) {
    return { ...lineChartConfig, groupBy, showLegend };
  }
  return {
    ...lineChartConfig,
    groupBy,
    metric: {
      ...lineChartConfig.metric,
      measureFilters: clearMeasureFilterConflictForGroupBy(
        lineChartConfig.metric.measureFilters,
        groupBy,
      ),
    },
    showLegend,
  };
}

export function handleSetLineChartGroupBy(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_LINE_CHART_GROUP_BY' }>,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.LineChart) {
    return state;
  }
  return updateCurrentConfig(state, (config) =>
    lineChartConfigWithGroupBy(config as LineChartConfig, action.groupBy),
  );
}

export function handleSetHistoryRange(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_HISTORY_RANGE' }>,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.LineChart) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const lineChartConfig = config as LineChartConfig;
    return { ...lineChartConfig, historyRange: action.historyRange };
  });
}

export function handleSetShowLegendLinechart(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_SHOW_LEGEND_LINECHART' }>,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.LineChart) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const lineChartConfig = config as LineChartConfig;
    return { ...lineChartConfig, showLegend: action.showLegend };
  });
}

export function handleSetLineChartMeasureFilters(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_LINE_CHART_MEASURE_FILTERS' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.LineChart) {
    return state;
  }
  return updateCurrentConfig(state, (config) =>
    mergeMeasureFiltersIntoLineOrCountConfig(
      config as LineChartConfig,
      action.measureFilters,
      VisualizationType.LineChart,
      options,
    ),
  );
}
