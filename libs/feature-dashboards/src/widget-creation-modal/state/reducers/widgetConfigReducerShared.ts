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
import { LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType, type MeasureFilters } from '../../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import {
  CodeScope,
  ISSUE_DENSITY_METRIC_OPTION_VALUE,
  type IssueDensityMetricOptionValue,
  MetricOptionValue,
  SCA_MTTR_METRIC_OPTION_VALUE,
  type ScaMttrMetricOptionValue,
  VisualizationType,
} from '../../../types/widget-common';
import { clampCountTrendIndicator } from '../../../utils/countWidgetTrendIndicator';
import { clampLineChartScope } from '../../../utils/lineChartScope';
import { isLineChartGroupByEligibleForMetric } from '../../utils/lineChartGroupByHelpers';
import { getMeasureFilterCapability } from '../../utils/measureFilterConfig';
import type {
  CountConfig,
  LineChartConfig,
  PieChartConfig,
  RatingBadgeConfig,
  TopListConfig,
  WidgetConfig,
  WidgetConfigAction,
  WidgetConfigMap,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';
import {
  buildDashboardMetricForLineOrCount,
  clampConfigScopeForReducerOptions,
  clampPortfolioPieScopeInWidgetState,
  clearDisabledPieHotspotFiltersInWidgetState,
  createInitialConfigForType,
  normalizeInitializedSelectedConfigScope,
  updateCurrentConfig,
} from './utils';
import { topListConfigAfterScopeChange } from './widgetConfigReducerTopList';

export function handleSetWidgetType(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_WIDGET_TYPE' }>,
): WidgetConfigState {
  if (isPieOrDonutSwitchWithinFamily(state, action)) {
    return switchPieDonutWithinFamily(state, action);
  }

  const existingConfig = state.configs[action.widgetType];
  if (existingConfig) {
    return { ...state, selectedType: action.widgetType };
  }

  const sharedFromSibling = trySharePieDonutConfig(state, action);
  if (sharedFromSibling) {
    return sharedFromSibling;
  }

  const newConfig = createInitialConfigForType(action.widgetType);
  return {
    ...state,
    selectedType: action.widgetType,
    configs: {
      ...state.configs,
      [action.widgetType]: newConfig,
    },
  };
}

export function handleReset(): WidgetConfigState {
  return { selectedType: null, configs: {} };
}

export function handleInitialize(
  action: Extract<WidgetConfigAction, { type: 'INITIALIZE' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  const normalized = normalizeInitializedSelectedConfigScope(action.payload, options);
  return clearDisabledPieHotspotFiltersInWidgetState(
    clampPortfolioPieScopeInWidgetState(normalized, options),
  );
}

export function handleSetScope(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_SCOPE' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (state.selectedType === VisualizationType.LineChart) {
    return updateCurrentConfig(state, (config) => {
      const lineChartConfig = config as LineChartConfig;
      const next = lineChartConfigAfterScopeChange(lineChartConfig, action.scope);
      return clampConfigScopeForReducerOptions(state.selectedType, next, options);
    });
  }
  if (state.selectedType === VisualizationType.Count) {
    return updateCurrentConfig(state, (config) => {
      const countConfig = config as CountConfig;
      const next = countConfigAfterScopeChange(countConfig, action.scope);
      return clampConfigScopeForReducerOptions(state.selectedType, next, options);
    });
  }
  if (state.selectedType === VisualizationType.RatingBadge) {
    return updateCurrentConfig(state, (config) => {
      const ratingBadgeConfig = config as RatingBadgeConfig;
      const next = { ...ratingBadgeConfig, scope: action.scope };
      return clampConfigScopeForReducerOptions(state.selectedType, next, options);
    });
  }
  if (state.selectedType === VisualizationType.TopList) {
    return updateCurrentConfig(state, (config) => {
      const topListConfig = config as TopListConfig;
      const next = topListConfigAfterScopeChange(topListConfig, action.scope);
      return clampConfigScopeForReducerOptions(state.selectedType, next, options);
    });
  }
  return state;
}

export function handleSetMetricKey(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_METRIC_KEY' }>,
  options?: WidgetConfigReducerOptions,
): WidgetConfigState {
  if (!isMetricKeyApplicableType(state.selectedType)) {
    return state;
  }
  const { selectedType } = state;
  const { metricKey } = action;
  return updateCurrentConfig(state, (config) =>
    applyMetricKeyChange(config, selectedType, metricKey, options),
  );
}

function isIssueResolutionStatistic(
  value: MetricOptionValue | null,
): value is IssueResolutionStatistic {
  return Object.values(IssueResolutionStatistic).includes(value as IssueResolutionStatistic);
}

function isIssueDensityMetricValue(
  value: MetricOptionValue | null,
): value is IssueDensityMetricOptionValue {
  return value === ISSUE_DENSITY_METRIC_OPTION_VALUE;
}

function isScaMttrMetricValue(value: MetricOptionValue | null): value is ScaMttrMetricOptionValue {
  return value === SCA_MTTR_METRIC_OPTION_VALUE;
}

function isPieOrDonutSwitchWithinFamily(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_WIDGET_TYPE' }>,
): boolean {
  const toPieOrDonut =
    action.widgetType === VisualizationType.DonutChart ||
    action.widgetType === VisualizationType.PieChart;
  const fromPieOrDonut =
    state.selectedType === VisualizationType.DonutChart ||
    state.selectedType === VisualizationType.PieChart;
  return toPieOrDonut && fromPieOrDonut && state.selectedType !== null;
}

function switchPieDonutWithinFamily(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_WIDGET_TYPE' }>,
): WidgetConfigState {
  const sharedConfig = state.configs[state.selectedType as keyof WidgetConfigMap] as PieChartConfig;
  return {
    ...state,
    selectedType: action.widgetType,
    configs: {
      ...state.configs,
      [VisualizationType.PieChart]: sharedConfig,
      [VisualizationType.DonutChart]: sharedConfig,
    },
  };
}

function trySharePieDonutConfig(
  state: WidgetConfigState,
  action: Extract<WidgetConfigAction, { type: 'SET_WIDGET_TYPE' }>,
): WidgetConfigState | null {
  if (action.widgetType === VisualizationType.DonutChart) {
    const pieConfig = state.configs[VisualizationType.PieChart];
    if (pieConfig) {
      return {
        ...state,
        selectedType: action.widgetType,
        configs: {
          ...state.configs,
          [VisualizationType.DonutChart]: pieConfig,
          [VisualizationType.PieChart]: pieConfig,
        },
      };
    }
  } else if (action.widgetType === VisualizationType.PieChart) {
    const donutConfig = state.configs[VisualizationType.DonutChart];
    if (donutConfig) {
      return {
        ...state,
        selectedType: action.widgetType,
        configs: {
          ...state.configs,
          [VisualizationType.PieChart]: donutConfig,
          [VisualizationType.DonutChart]: donutConfig,
        },
      };
    }
  }
  return null;
}

function lineChartConfigAfterScopeChange(
  lineChartConfig: LineChartConfig,
  scope: CodeScope,
): LineChartConfig {
  return clampLineChartScope({ ...lineChartConfig, scope });
}

function countConfigAfterScopeChange(countConfig: CountConfig, scope: CodeScope): CountConfig {
  return clampCountTrendIndicator({ ...countConfig, scope });
}

type MetricKeyApplicableVisualizationType =
  | typeof VisualizationType.LineChart
  | typeof VisualizationType.Count
  | typeof VisualizationType.RatingBadge;

function isMetricKeyApplicableType(
  selectedType: WidgetConfigState['selectedType'],
): selectedType is MetricKeyApplicableVisualizationType {
  return (
    selectedType === VisualizationType.LineChart ||
    selectedType === VisualizationType.Count ||
    selectedType === VisualizationType.RatingBadge
  );
}

function applyMetricKeyChange(
  config: WidgetConfig,
  selectedType: MetricKeyApplicableVisualizationType,
  metricKey: MetricOptionValue | null,
  options?: WidgetConfigReducerOptions,
): WidgetConfig {
  if (metricKey === null) {
    return clearMetricKey(config, selectedType);
  }
  if (selectedType === VisualizationType.LineChart || selectedType === VisualizationType.Count) {
    if (isIssueResolutionStatistic(metricKey)) {
      return setIssueResolutionMetric(config, selectedType, metricKey);
    }
    if (isIssueDensityMetricValue(metricKey)) {
      return setIssueDensityMetric(config, selectedType);
    }
    if (isScaMttrMetricValue(metricKey)) {
      return setScaResolutionMetric(config, selectedType);
    }
    return setLineOrCountMetric(config, selectedType, metricKey, options);
  }
  if (
    isIssueResolutionStatistic(metricKey) ||
    isIssueDensityMetricValue(metricKey) ||
    isScaMttrMetricValue(metricKey)
  ) {
    return config;
  }
  return setRatingBadgeMetric(config, selectedType, metricKey, options);
}

function clearMetricKey(
  config: WidgetConfig,
  selectedType: MetricKeyApplicableVisualizationType,
): WidgetConfig {
  if (selectedType === VisualizationType.RatingBadge) {
    return { ...config, metricKey: null, complete: false };
  }
  return { ...config, metric: null, complete: false };
}

function setLineOrCountMetric(
  config: WidgetConfig,
  selectedType: typeof VisualizationType.LineChart | typeof VisualizationType.Count,
  metricKey: MetricKey,
  options?: WidgetConfigReducerOptions,
): LineChartConfig | CountConfig {
  const capability = getMeasureFilterCapability(metricKey);
  const metricConfig = config as LineChartConfig | CountConfig;
  const existingMeasureFilters = getMeasureFiltersFromIncompleteConfig(metricConfig);
  const usePortfolioHotspots = options?.isPortfolioWidgetConfigurator === true;
  const metric = buildDashboardMetricForLineOrCount(
    metricKey,
    capability,
    existingMeasureFilters,
    usePortfolioHotspots,
  );
  const nextConfig = clampConfigScopeForReducerOptions(
    selectedType,
    {
      ...config,
      metric,
      complete: true,
    },
    options,
  ) as LineChartConfig | CountConfig;

  if (selectedType !== VisualizationType.LineChart) {
    return clampCountTrendIndicator(nextConfig as CountConfig);
  }

  const lineChartConfig = clampLineChartScope(nextConfig as LineChartConfig);
  const preservedGroupBy = lineChartConfig.groupBy;
  const groupBy = isLineChartGroupByEligibleForMetric(metric)
    ? preservedGroupBy
    : LineChartGroupBy.None;

  if (groupBy === preservedGroupBy) {
    return lineChartConfig;
  }

  return { ...lineChartConfig, groupBy: LineChartGroupBy.None };
}

function setIssueResolutionMetric(
  config: WidgetConfig,
  selectedType: typeof VisualizationType.LineChart | typeof VisualizationType.Count,
  statistic: IssueResolutionStatistic,
): LineChartConfig | CountConfig {
  const metricConfig = config as LineChartConfig | CountConfig;
  const existingMeasureFilters =
    metricConfig.complete && metricConfig.metric?.type === DashboardMetricType.IssueResolution
      ? metricConfig.metric.measureFilters
      : undefined;
  const metric = {
    measureFilters: existingMeasureFilters,
    statistic,
    type: DashboardMetricType.IssueResolution,
  };
  const base = { ...config, metric, complete: true, scope: CodeScope.Overall };
  if (selectedType === VisualizationType.LineChart) {
    return { ...base, groupBy: LineChartGroupBy.None } as LineChartConfig;
  }
  return clampCountTrendIndicator(base as CountConfig);
}

function setIssueDensityMetric(
  config: WidgetConfig,
  selectedType: typeof VisualizationType.LineChart | typeof VisualizationType.Count,
): LineChartConfig | CountConfig {
  const metricConfig = config as LineChartConfig | CountConfig;
  const existingMeasureFilters =
    metricConfig.complete && metricConfig.metric?.type === DashboardMetricType.IssueDensity
      ? metricConfig.metric.measureFilters
      : undefined;
  const metric = {
    measureFilters: existingMeasureFilters,
    type: DashboardMetricType.IssueDensity,
  };
  const base = { ...config, metric, complete: true, scope: CodeScope.Overall };
  if (selectedType === VisualizationType.LineChart) {
    return { ...base, groupBy: LineChartGroupBy.None } as LineChartConfig;
  }
  return clampCountTrendIndicator(base as CountConfig);
}

function setScaResolutionMetric(
  config: WidgetConfig,
  selectedType: typeof VisualizationType.LineChart | typeof VisualizationType.Count,
): LineChartConfig | CountConfig {
  const metricConfig = config as LineChartConfig | CountConfig;
  const existingMeasureFilters =
    metricConfig.complete && metricConfig.metric?.type === DashboardMetricType.ScaResolution
      ? metricConfig.metric.measureFilters
      : undefined;
  const metric = {
    measureFilters: existingMeasureFilters,
    type: DashboardMetricType.ScaResolution,
  };
  const base = { ...config, metric, complete: true, scope: CodeScope.Overall };
  if (selectedType === VisualizationType.LineChart) {
    return { ...base, groupBy: LineChartGroupBy.None } as LineChartConfig;
  }
  return clampCountTrendIndicator(base as CountConfig);
}

function getMeasureFiltersFromIncompleteConfig(
  metricConfig: LineChartConfig | CountConfig,
): MeasureFilters | undefined {
  if (metricConfig.complete) {
    return undefined;
  }
  return metricConfig.measureFilters;
}

function setRatingBadgeMetric(
  config: WidgetConfig,
  selectedType: typeof VisualizationType.RatingBadge,
  metricKey: MetricKey,
  options?: WidgetConfigReducerOptions,
): RatingBadgeConfig {
  const currentScope = 'scope' in config ? config.scope : CodeScope.Overall;
  const scope = metricKey === MetricKey.alert_status ? CodeScope.Overall : currentScope;
  const updatedConfig: RatingBadgeConfig = {
    ...config,
    metricKey,
    scope,
    complete: true,
  };
  return clampConfigScopeForReducerOptions(
    selectedType,
    updatedConfig,
    options,
  ) as RatingBadgeConfig;
}
