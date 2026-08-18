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
import {
  DashboardMetric,
  DashboardMetricType,
  MeasureFilters,
  PieChartHotspotSlice,
  PieChartMetric,
  RichMetricKey,
} from '../../../types/dashboard-widget';
import {
  CodeScope,
  VisualizationType,
  type DashboardWidgetType,
} from '../../../types/widget-common';
import { clampCountTrendIndicator } from '../../../utils/countWidgetTrendIndicator';
import { clampLineChartScope } from '../../../utils/lineChartScope';
import { getActualMetricKey } from '../../utils/getActualMetricKey';
import { MeasureFilterCapability } from '../../utils/measureFilterConfig';
import {
  createInitialCountConfig,
  createInitialLineChartConfig,
  createInitialPieChartConfig,
  createInitialRatingBadgeConfig,
  createInitialTopListConfig,
} from '../widgetConfigInitialState';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  WidgetConfig,
  WidgetConfigMap,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';

// ---------------------------------------------------------------------------
// Scope / metric helpers (former widgetConfigReducerHelpers)
// ---------------------------------------------------------------------------

const SCOPE_CLAMPABLE_TYPES = new Set<DashboardWidgetType>([
  VisualizationType.TopList,
  VisualizationType.LineChart,
  VisualizationType.Count,
  VisualizationType.RatingBadge,
]);

function getConfigScope(config: WidgetConfig): CodeScope {
  return 'scope' in config ? config.scope : CodeScope.Overall;
}

function resolveMetricKeyForScopeClamp(
  selectedType: DashboardWidgetType,
  config: WidgetConfig,
): MetricKey | null {
  if (selectedType === VisualizationType.TopList) {
    return MetricKey.violations;
  }
  if (selectedType === VisualizationType.RatingBadge) {
    const { metricKey } = config as RatingBadgeConfig;
    return metricKey;
  }
  const { metric } = config as LineChartConfig | CountConfig;
  if (!metric) {
    return null;
  }
  return getActualMetricKey(metric) ?? null;
}

function clampScopeToOverall(config: WidgetConfig): WidgetConfig {
  return { ...config, scope: CodeScope.Overall };
}

export function clampConfigScopeForReducerOptions(
  selectedType: DashboardWidgetType | null,
  config: WidgetConfig,
  options?: WidgetConfigReducerOptions,
): WidgetConfig {
  const supports = options?.supportsNewCodeScopeForMetric;
  if (!supports || selectedType === null || !SCOPE_CLAMPABLE_TYPES.has(selectedType)) {
    return config;
  }
  if (getConfigScope(config) !== CodeScope.New) {
    return config;
  }

  const metricKey = resolveMetricKeyForScopeClamp(selectedType, config);
  if (!metricKey || supports(metricKey, selectedType)) {
    return config;
  }

  return clampScopeToOverall(config);
}

export function buildDashboardMetricForLineOrCount(
  metricKey: MetricKey,
  capability: MeasureFilterCapability,
  existingMeasureFilters: MeasureFilters | undefined,
  usePortfolioHotspots: boolean,
): DashboardMetric {
  if (capability.isDrillable) {
    return {
      measureFilters: existingMeasureFilters,
      metricKey: RichMetricKey.Issues,
      type: DashboardMetricType.Rich,
    };
  }
  if (usePortfolioHotspots && metricKey === MetricKey.security_hotspots) {
    return {
      measureFilters: existingMeasureFilters,
      metricKey: RichMetricKey.Hotspots,
      type: DashboardMetricType.Rich,
    };
  }
  return {
    metricKey,
    type: DashboardMetricType.Raw,
  };
}

export function mergeMeasureFiltersIntoLineOrCountConfig(
  metricConfig: LineChartConfig | CountConfig,
  measureFilters: MeasureFilters | undefined,
  selectedType: typeof VisualizationType.LineChart | typeof VisualizationType.Count,
  options?: WidgetConfigReducerOptions,
): LineChartConfig | CountConfig {
  if (!metricConfig.complete) {
    return { ...metricConfig, measureFilters };
  }
  if (
    metricConfig.metric.type === DashboardMetricType.Rich ||
    metricConfig.metric.type === DashboardMetricType.IssueResolution ||
    metricConfig.metric.type === DashboardMetricType.IssueDensity ||
    metricConfig.metric.type === DashboardMetricType.ScaResolution
  ) {
    const next = {
      ...metricConfig,
      metric: {
        ...metricConfig.metric,
        measureFilters,
      },
    };
    const clamped = clampConfigScopeForReducerOptions(selectedType, next, options) as
      LineChartConfig | CountConfig;
    if (selectedType === VisualizationType.Count) {
      return clampCountTrendIndicator(clamped as CountConfig);
    }
    return clampLineChartScope(clamped as LineChartConfig);
  }
  return metricConfig;
}

// ---------------------------------------------------------------------------
// State update helpers (former widgetConfigReducerUtils)
// ---------------------------------------------------------------------------

export function getCurrentConfig(state: WidgetConfigState): WidgetConfig | undefined {
  if (state.selectedType === null) {
    return undefined;
  }
  return state.configs[state.selectedType as keyof typeof state.configs];
}

export function updateCurrentConfig(
  state: WidgetConfigState,
  updater: (config: WidgetConfig) => WidgetConfig,
): WidgetConfigState {
  if (state.selectedType === null) {
    return state;
  }

  const currentConfig = state.configs[state.selectedType as keyof typeof state.configs];
  if (!currentConfig) {
    return state;
  }

  const selectedType = state.selectedType as keyof WidgetConfigMap;

  if (
    selectedType === VisualizationType.PieChart ||
    selectedType === VisualizationType.DonutChart
  ) {
    const updatedConfig = updater(currentConfig) as PieChartConfig;
    return {
      ...state,
      configs: {
        ...state.configs,
        [VisualizationType.PieChart]: updatedConfig,
        [VisualizationType.DonutChart]: updatedConfig,
      },
    };
  }

  return {
    ...state,
    configs: {
      ...state.configs,
      [selectedType]: updater(currentConfig),
    },
  };
}

export function createInitialConfigForType(widgetType: DashboardWidgetType): WidgetConfig {
  if (widgetType === VisualizationType.LineChart) {
    return createInitialLineChartConfig();
  }
  if (widgetType === VisualizationType.Count) {
    return createInitialCountConfig();
  }
  if (widgetType === VisualizationType.RatingBadge) {
    return createInitialRatingBadgeConfig();
  }
  if (widgetType === VisualizationType.PieChart || widgetType === VisualizationType.DonutChart) {
    return createInitialPieChartConfig();
  }
  if (widgetType === VisualizationType.TopList) {
    return createInitialTopListConfig();
  }
  return createInitialCountConfig();
}

/** Clears pie/donut hotspot filter when slice-by review status makes the filter redundant. */
export function clearDisabledPieHotspotFiltersInWidgetState(
  state: WidgetConfigState,
): WidgetConfigState {
  const pieKey = VisualizationType.PieChart;
  const donutKey = VisualizationType.DonutChart;
  const pieConfig = state.configs[pieKey];
  const donutConfig = state.configs[donutKey];
  const needsClear = (cfg: PieChartConfig | undefined) =>
    cfg?.metric === PieChartMetric.HotspotCount &&
    cfg.slice === PieChartHotspotSlice.ReviewStatus &&
    cfg.filter !== '';

  if (!needsClear(pieConfig) && !needsClear(donutConfig)) {
    return state;
  }

  const nextConfigs = { ...state.configs };
  for (const key of [pieKey, donutKey] as const) {
    const cfg = nextConfigs[key];
    if (cfg && needsClear(cfg)) {
      nextConfigs[key] = { ...cfg, filter: '' };
    }
  }
  return { ...state, configs: nextConfigs };
}

/**
 * Single source of truth for portfolio pie scope: portfolio pies are always backed by
 * issue-count-history (issue/hotspot) or clamped line-count measures, neither of which can serve a
 * leak-period (New code) view, so "New code" would render Overall data mislabelled as New code.
 * Returns the requested scope unchanged outside the portfolio widget configurator.
 */
export function clampScopeForPortfolioPie(
  scope: CodeScope,
  options?: WidgetConfigReducerOptions,
): CodeScope {
  return options?.isPortfolioWidgetConfigurator === true ? CodeScope.Overall : scope;
}

/** Forces portfolio pie/donut scope back to Overall across the shared pie + donut configs. */
export function clampPortfolioPieScopeInWidgetState(
  state: WidgetConfigState,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  const selected = state.selectedType;
  if (selected !== VisualizationType.PieChart && selected !== VisualizationType.DonutChart) {
    return state;
  }
  const pieConfig = state.configs[VisualizationType.PieChart];
  const donutConfig = state.configs[VisualizationType.DonutChart];
  const base = pieConfig ?? donutConfig;
  if (!base) {
    return state;
  }
  const scope = clampScopeForPortfolioPie(base.scope, options);
  if (scope === base.scope) {
    return state;
  }
  const clamped: PieChartConfig = { ...base, scope };
  const nextConfigs = { ...state.configs };
  if (pieConfig) {
    nextConfigs[VisualizationType.PieChart] = clamped;
  }
  if (donutConfig) {
    nextConfigs[VisualizationType.DonutChart] = clamped;
  }
  return { ...state, configs: nextConfigs };
}

/**
 * Repairs an initialized (loaded for edit) config whose persisted scope is no longer valid for its
 * widget type / metric — e.g. a saved Top List or issue line chart stored with "New code" before
 * the scope guards existed. Without this, the disabled scope select still shows the stale value and
 * Save would persist the mislabelled scope.
 */
export function normalizeInitializedSelectedConfigScope(
  state: WidgetConfigState,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  const { selectedType } = state;
  if (selectedType === null) {
    return state;
  }
  const config = state.configs[selectedType as keyof typeof state.configs];
  if (!config) {
    return state;
  }
  let next = clampConfigScopeForReducerOptions(selectedType, config, options);
  if (selectedType === VisualizationType.LineChart) {
    next = clampLineChartScope(next as LineChartConfig);
  }
  if (next === config) {
    return state;
  }
  return {
    ...state,
    configs: { ...state.configs, [selectedType]: next },
  };
}
