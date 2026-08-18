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

import { VisualizationType } from '../../../types/widget-common';
import { clampCountTrendIndicator } from '../../../utils/countWidgetTrendIndicator';
import type {
  CountConfig,
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';
import { mergeMeasureFiltersIntoLineOrCountConfig, updateCurrentConfig } from './utils';

export function handleSetShowTrendIndicator(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_SHOW_TREND_INDICATOR' }>,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.Count) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const countConfig = config as CountConfig;
    const next = { ...countConfig, showTrendIndicator: action.showTrendIndicator };
    return clampCountTrendIndicator(next);
  });
}

export function handleSetCountMeasureFilters(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_COUNT_MEASURE_FILTERS' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType !== VisualizationType.Count) {
    return state;
  }
  return updateCurrentConfig(state, (config) =>
    mergeMeasureFiltersIntoLineOrCountConfig(
      config as CountConfig,
      action.measureFilters,
      VisualizationType.Count,
      options,
    ),
  );
}
