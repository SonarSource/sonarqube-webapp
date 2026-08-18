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

import { CodeScope, VisualizationType } from '../../../types/widget-common';
import { withTopListComplete } from '../../utils/topListCompleteConfig';
import type {
  TopListConfig,
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';
import { clampConfigScopeForReducerOptions, updateCurrentConfig } from './utils';

export function topListConfigAfterScopeChange(
  topListConfig: TopListConfig,
  scope: CodeScope,
): TopListConfig {
  return withTopListComplete({ ...topListConfig, scope });
}

export function handleSetTopListMetric(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_TOP_LIST_METRIC' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.TopList) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const next = withTopListComplete({
      ...(config as TopListConfig),
      metric: action.metric,
    });
    return clampConfigScopeForReducerOptions(state.selectedType, next, options);
  });
}

export function handleSetTopListRankBy(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_TOP_LIST_RANK_BY' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.TopList) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const next = withTopListComplete({
      ...(config as TopListConfig),
      rankBy: action.rankBy,
    });
    return clampConfigScopeForReducerOptions(state.selectedType, next, options);
  });
}

export function handleSetTopListMeasureFilters(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_TOP_LIST_MEASURE_FILTERS' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.TopList) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const next = withTopListComplete({
      ...(config as TopListConfig),
      measureFilters: action.measureFilters,
    });
    return clampConfigScopeForReducerOptions(state.selectedType, next, options);
  });
}

export function handleSetTopListLimit(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_TOP_LIST_LIMIT' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.TopList) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const next = withTopListComplete({
      ...(config as TopListConfig),
      limit: action.limit,
    });
    return clampConfigScopeForReducerOptions(state.selectedType, next, options);
  });
}
