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

import {
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartMetric,
  PieChartProjectSlice,
} from '../../../types/dashboard-widget';
import { CodeScope, VisualizationType } from '../../../types/widget-common';
import type {
  PieChartConfig,
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';
import { clampScopeForPortfolioPie, updateCurrentConfig } from './utils';

export function handleSetPieMetric(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_PIE_METRIC' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (!isPieSelected(state)) {
    return state;
  }
  return updateCurrentConfig(state, (config) =>
    nextPieConfigAfterMetricChange(config as PieChartConfig, action, options),
  );
}

export function handleSetPieSlice(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_PIE_SLICE' }>,
): WidgetConfigState {
  if (!isPieSelected(state)) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const pieConfig = config as PieChartConfig;
    const complete = pieConfig.metric !== null && action.slice !== null;

    let { filter } = pieConfig;
    if (
      (pieConfig.metric === PieChartMetric.HotspotCount &&
        action.slice === PieChartHotspotSlice.ReviewStatus) ||
      action.slice === PieChartIssueSlice.ImpactSoftwareQualities
    ) {
      filter = '';
    }
    return {
      ...pieConfig,
      filter,
      slice: action.slice,
      complete: complete as false,
    };
  });
}

export function handleSetPieScope(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_PIE_SCOPE' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (!isPieSelected(state)) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const pieConfig = config as PieChartConfig;
    return { ...pieConfig, scope: clampScopeForPortfolioPie(action.scope, options) };
  });
}

export function handleSetPieFilter(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_PIE_FILTER' }>,
): WidgetConfigState {
  if (!isPieSelected(state)) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const pieConfig = config as PieChartConfig;
    const filterDisabledForHotspotReviewStatusSlice =
      pieConfig.metric === PieChartMetric.HotspotCount &&
      pieConfig.slice === PieChartHotspotSlice.ReviewStatus;

    return {
      ...pieConfig,
      filter: filterDisabledForHotspotReviewStatusSlice ? '' : action.filter,
    };
  });
}

export function handleSetPieShowLegend(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_PIE_SHOW_LEGEND' }>,
): WidgetConfigState {
  if (!isPieSelected(state)) {
    return state;
  }
  return updateCurrentConfig(state, (config) => {
    const pieConfig = config as PieChartConfig;
    return { ...pieConfig, showLegend: action.showLegend };
  });
}

function isPieSelected(state: WidgetConfigState): boolean {
  return (
    state.selectedType === VisualizationType.PieChart ||
    state.selectedType === VisualizationType.DonutChart
  );
}

function resolvePieSliceForMetric(
  metric: PieChartMetric | null,
  previousSlice: PieChartConfig['slice'],
  sameMetric: boolean,
): PieChartConfig['slice'] {
  if (metric === PieChartMetric.ProjectCount) {
    return PieChartProjectSlice.Status;
  }
  return sameMetric ? previousSlice : null;
}

function nextPieConfigAfterMetricChange(
  pieConfig: PieChartConfig,
  action: Extract<WidgetConfigAction, { type: 'SET_PIE_METRIC' }>,
  options?: WidgetConfigReducerOptions,
): PieChartConfig {
  const sameMetric = action.metric === pieConfig.metric;
  const slice = resolvePieSliceForMetric(action.metric, pieConfig.slice, sameMetric);
  const complete = action.metric !== null && slice !== null;
  const scope = resolvePieScopeForMetricChange(pieConfig, action.metric, options);
  let { filter } = pieConfig;
  if (action.metric !== pieConfig.metric || action.metric === PieChartMetric.HotspotCount) {
    filter = '';
  }
  return {
    ...pieConfig,
    metric: action.metric,
    scope,
    slice,
    filter,
    complete: complete as false,
  };
}

function resolvePieScopeForMetricChange(
  pieConfig: PieChartConfig,
  metric: PieChartMetric | null,
  options?: WidgetConfigReducerOptions,
): CodeScope {
  if (metric === PieChartMetric.LineCount || metric === PieChartMetric.ProjectCount) {
    return CodeScope.Overall;
  }
  return clampScopeForPortfolioPie(pieConfig.scope, options);
}
