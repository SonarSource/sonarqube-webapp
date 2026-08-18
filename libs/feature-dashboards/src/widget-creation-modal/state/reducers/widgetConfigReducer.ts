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

import type {
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';
import {
  handleSetCountMeasureFilters,
  handleSetShowTrendIndicator,
} from './widgetConfigReducerCount';
import {
  handleSetHistoryRange,
  handleSetLineChartGroupBy,
  handleSetLineChartMeasureFilters,
  handleSetShowLegendLinechart,
} from './widgetConfigReducerLineChart';
import {
  handleSetPieFilter,
  handleSetPieMetric,
  handleSetPieScope,
  handleSetPieShowLegend,
  handleSetPieSlice,
} from './widgetConfigReducerPieChart';
import { handleSetShowBreakdown } from './widgetConfigReducerRatingBadge';
import {
  handleInitialize,
  handleReset,
  handleSetMetricKey,
  handleSetScope,
  handleSetWidgetType,
} from './widgetConfigReducerShared';
import {
  handleSetTopListLimit,
  handleSetTopListMeasureFilters,
  handleSetTopListMetric,
  handleSetTopListRankBy,
} from './widgetConfigReducerTopList';

export function widgetConfigReducer(
  state: WidgetConfigState,
  action: WidgetConfigAction,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  switch (action.type) {
    case 'SET_WIDGET_TYPE':
      return handleSetWidgetType(state, action);
    case 'SET_METRIC_KEY':
      return handleSetMetricKey(state, action, options);
    case 'SET_SCOPE':
      return handleSetScope(state, action, options);
    case 'SET_HISTORY_RANGE':
      return handleSetHistoryRange(state, action);
    case 'SET_LINE_CHART_MEASURE_FILTERS':
      return handleSetLineChartMeasureFilters(state, action, options);
    case 'SET_COUNT_MEASURE_FILTERS':
      return handleSetCountMeasureFilters(state, action, options);
    case 'SET_TOP_LIST_MEASURE_FILTERS':
      return handleSetTopListMeasureFilters(state, action, options);
    case 'SET_TOP_LIST_METRIC':
      return handleSetTopListMetric(state, action, options);
    case 'SET_TOP_LIST_RANK_BY':
      return handleSetTopListRankBy(state, action, options);
    case 'SET_TOP_LIST_LIMIT':
      return handleSetTopListLimit(state, action, options);
    case 'SET_LINE_CHART_GROUP_BY':
      return handleSetLineChartGroupBy(state, action);
    case 'SET_SHOW_LEGEND_LINECHART':
      return handleSetShowLegendLinechart(state, action);
    case 'SET_SHOW_TREND_INDICATOR':
      return handleSetShowTrendIndicator(state, action);
    case 'SET_SHOW_BREAKDOWN':
      return handleSetShowBreakdown(state, action);
    case 'SET_PIE_METRIC':
      return handleSetPieMetric(state, action, options);
    case 'SET_PIE_SLICE':
      return handleSetPieSlice(state, action);
    case 'SET_PIE_SCOPE':
      return handleSetPieScope(state, action, options);
    case 'SET_PIE_FILTER':
      return handleSetPieFilter(state, action);
    case 'SET_PIE_SHOW_LEGEND':
      return handleSetPieShowLegend(state, action);
    case 'RESET':
      return handleReset();
    case 'INITIALIZE':
      return handleInitialize(action, options);
    default:
      return state;
  }
}
