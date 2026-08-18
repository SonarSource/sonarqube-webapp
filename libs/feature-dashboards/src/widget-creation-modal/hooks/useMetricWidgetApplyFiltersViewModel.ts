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

import { Dispatch, useCallback, useMemo } from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange } from '../../data/widgets/line-chart';
import {
  DashboardMetricType,
  MeasureFilters,
  type DashboardMetric,
} from '../../types/dashboard-widget';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import {
  CodeScope,
  VisualizationType,
  type WidgetMetricPickerOptions,
} from '../../types/widget-common';
import { isIssueCountHistoryDashboardMetric } from '../../utils/issueCountHistoryMetric';
import {
  buildRichMetricIssueStatusSelectOptions,
  impactSeverityFilterValueForSelection,
} from '../components/applyFilterAccordionHelpers';
import type {
  CountConfig,
  LineChartConfig,
  RatingBadgeConfig,
  WidgetConfigAction,
} from '../state/widgetConfigTypes';
import { getActualMetricKey } from '../utils/getActualMetricKey';
import { lineChartGroupByConflictsWithMeasureFilter } from '../utils/lineChartGroupByHelpers';
import {
  getMeasureFilterCapability,
  getMeasureFilterCapabilityForDashboardMetric,
  type MeasureFilterCapability,
} from '../utils/measureFilterConfig';
import {
  SCOPE_HELP_TEXT_NEW_CODE_UNAVAILABLE_ID,
  type LineChartHistorySlice,
  type RichMeasureFiltersSlice,
  type ScopeFilterSlice,
} from './applyFiltersViewModelSlices';
import { useRichMeasureFilterHandlers } from './useRichMeasureFilterHandlers';

export type MetricWidgetVisualization =
  | typeof VisualizationType.LineChart
  | typeof VisualizationType.Count
  | typeof VisualizationType.RatingBadge;

interface UseMetricWidgetApplyFiltersViewModelParams {
  clampPortfolioLineChartHistoryRange?: (range: HistoryRange) => HistoryRange;
  dispatch: Dispatch<WidgetConfigAction>;
  isPortfolioWidgetConfigurator: boolean;
  metricConfig: LineChartConfig | CountConfig | RatingBadgeConfig;
  metricPickerOptions: WidgetMetricPickerOptions;
  visualization: MetricWidgetVisualization;
}

export interface MetricWidgetApplyFiltersViewModel {
  hasMetric: boolean;
  lineChart?: LineChartHistorySlice;
  richMeasureFilters?: RichMeasureFiltersSlice;
  scope: ScopeFilterSlice;
  showScopeFilter: boolean;
}

interface ScopeHelpTextParams {
  formatMessage: IntlShape['formatMessage'];
  isIssueDensityMetricSelected: boolean;
  isLineChart: boolean;
  isLineChartIssueCountScopeLocked: boolean;
  isQualityGateStatus: boolean;
  isScaResolutionMetricSelected: boolean;
  isScopeSelectDisabled: boolean;
  issueResolutionStatistic?: IssueResolutionStatistic;
}

const ISSUE_RESOLUTION_METRIC_MESSAGE_IDS: Record<IssueResolutionStatistic, string> = {
  [IssueResolutionStatistic.MTTR]: 'dashboard.add_widget_modal.define_widget.metric.mttr',
  [IssueResolutionStatistic.RecentMTTR]:
    'dashboard.add_widget_modal.define_widget.metric.recent_mttr',
  [IssueResolutionStatistic.ResolvedIssues]:
    'dashboard.add_widget_modal.define_widget.metric.resolved_issues',
};

function getOverallCodeOnlyMetricNameMessageId(
  isIssueDensityMetricSelected: boolean,
  isScaResolutionMetricSelected: boolean,
  issueResolutionStatistic?: IssueResolutionStatistic,
): string | undefined {
  if (isIssueDensityMetricSelected) {
    return 'dashboard.add_widget_modal.define_widget.metric.issue_density';
  }

  if (isScaResolutionMetricSelected) {
    return 'dashboard.add_widget_modal.define_widget.metric.sca_mttr';
  }

  if (issueResolutionStatistic === undefined) {
    return undefined;
  }

  return ISSUE_RESOLUTION_METRIC_MESSAGE_IDS[issueResolutionStatistic];
}

function getIssueResolutionStatistic(
  metric: DashboardMetric | null,
): IssueResolutionStatistic | undefined {
  return metric?.type === DashboardMetricType.IssueResolution ? metric.statistic : undefined;
}

function getScopeHelpText({
  formatMessage,
  isIssueDensityMetricSelected,
  isLineChart,
  isLineChartIssueCountScopeLocked,
  isQualityGateStatus,
  isScaResolutionMetricSelected,
  isScopeSelectDisabled,
  issueResolutionStatistic,
}: Readonly<ScopeHelpTextParams>): string | undefined {
  if (isLineChartIssueCountScopeLocked) {
    return formatMessage({
      id: 'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.issue_count_history',
    });
  }

  const metricNameMessageId = getOverallCodeOnlyMetricNameMessageId(
    isIssueDensityMetricSelected,
    isScaResolutionMetricSelected,
    issueResolutionStatistic,
  );

  if (metricNameMessageId) {
    return formatMessage(
      {
        id: isLineChart
          ? 'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.line_chart_metric_overall_code_only'
          : 'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.metric_overall_code_only',
      },
      {
        metric: formatMessage({ id: metricNameMessageId }),
      },
    );
  }
  if (isQualityGateStatus) {
    return formatMessage({
      id: 'dashboard.add_widget_modal.apply_filters_section.select.scope.help_text.quality_gate_status',
    });
  }
  return isScopeSelectDisabled
    ? formatMessage({ id: SCOPE_HELP_TEXT_NEW_CODE_UNAVAILABLE_ID })
    : undefined;
}

export function useMetricWidgetApplyFiltersViewModel({
  clampPortfolioLineChartHistoryRange,
  dispatch,
  isPortfolioWidgetConfigurator,
  metricConfig,
  metricPickerOptions,
  visualization,
}: Readonly<UseMetricWidgetApplyFiltersViewModelParams>): MetricWidgetApplyFiltersViewModel {
  const { formatMessage } = useIntl();

  const isLineChart = visualization === VisualizationType.LineChart;
  const isCountWidget = visualization === VisualizationType.Count;
  const isRatingBadge = visualization === VisualizationType.RatingBadge;
  const isPortfolioLineChart = isLineChart && isPortfolioWidgetConfigurator;

  const { metricKey, hasMetric } = useMemo(() => {
    if (isLineChart || isCountWidget) {
      const config = metricConfig as LineChartConfig | CountConfig;
      const key = config.metric ? getActualMetricKey(config.metric) : null;
      return { hasMetric: config.metric !== null, metricKey: key };
    }
    if (isRatingBadge) {
      const config = metricConfig as RatingBadgeConfig;
      return { hasMetric: config.metricKey !== null, metricKey: config.metricKey };
    }
    return { hasMetric: false, metricKey: null };
  }, [isCountWidget, isLineChart, isRatingBadge, metricConfig]);

  const isQualityGateStatus = metricKey === MetricKey.alert_status;

  const lineOrCountMetric =
    isLineChart || isCountWidget ? (metricConfig as LineChartConfig | CountConfig).metric : null;

  const issueResolutionStatistic = getIssueResolutionStatistic(lineOrCountMetric);
  const isIssueResolutionMetricSelected = issueResolutionStatistic !== undefined;

  const isIssueDensityMetricSelected = lineOrCountMetric?.type === DashboardMetricType.IssueDensity;
  const isScaResolutionMetricSelected =
    lineOrCountMetric?.type === DashboardMetricType.ScaResolution;

  const filterCapability = useMemo((): MeasureFilterCapability | null => {
    const lineOrCountDashboardMetric =
      isLineChart || isCountWidget
        ? (metricConfig as LineChartConfig | CountConfig).metric
        : undefined;

    if (lineOrCountDashboardMetric) {
      return getMeasureFilterCapabilityForDashboardMetric(
        lineOrCountDashboardMetric,
        metricKey ?? undefined,
      );
    }
    if (metricKey != null) {
      return getMeasureFilterCapability(metricKey);
    }
    return null;
  }, [isCountWidget, isLineChart, metricConfig, metricKey]);

  const supportsRichMeasureFilters = Boolean(
    filterCapability &&
    (filterCapability.supportsSeverityFilter || filterCapability.supportsSoftwareQualityFilter),
  );

  const { scope } = metricConfig;

  const measureFilters = useMemo((): MeasureFilters | undefined => {
    if (!isLineChart && !isCountWidget) {
      return undefined;
    }
    const { metric } = metricConfig as LineChartConfig | CountConfig;
    if (
      metric?.type === DashboardMetricType.Rich ||
      metric?.type === DashboardMetricType.IssueResolution ||
      metric?.type === DashboardMetricType.IssueDensity ||
      metric?.type === DashboardMetricType.ScaResolution
    ) {
      return metric.measureFilters;
    }
    return undefined;
  }, [isCountWidget, isLineChart, metricConfig]);

  const updateMeasureFilters = useCallback(
    (newMeasureFilters: MeasureFilters) => {
      if (isLineChart) {
        dispatch({
          measureFilters: newMeasureFilters,
          type: 'SET_LINE_CHART_MEASURE_FILTERS',
        });
      } else if (isCountWidget) {
        dispatch({
          measureFilters: newMeasureFilters,
          type: 'SET_COUNT_MEASURE_FILTERS',
        });
      }
    },
    [dispatch, isCountWidget, isLineChart],
  );

  const metricSupportsNewCodeScope =
    !metricPickerOptions.supportsNewCodeScopeForMetric ||
    !metricKey ||
    metricPickerOptions.supportsNewCodeScopeForMetric(metricKey, visualization);

  const isLineChartIssueCountScopeLocked =
    isLineChart && isIssueCountHistoryDashboardMetric(lineOrCountMetric);

  const isScopeSelectDisabled =
    isLineChartIssueCountScopeLocked ||
    isIssueResolutionMetricSelected ||
    isIssueDensityMetricSelected ||
    isScaResolutionMetricSelected ||
    !metricSupportsNewCodeScope;

  const issueStatusSelectOptions = useMemo(
    () => buildRichMetricIssueStatusSelectOptions(formatMessage),
    [formatMessage],
  );

  const scopeHelpText = getScopeHelpText({
    formatMessage,
    isIssueDensityMetricSelected,
    isLineChart,
    isLineChartIssueCountScopeLocked,
    isQualityGateStatus,
    isScaResolutionMetricSelected,
    isScopeSelectDisabled,
    issueResolutionStatistic,
  });

  const rawLineChartHistoryRange = isLineChart
    ? (metricConfig as LineChartConfig).historyRange
    : HistoryRange.All;
  const lineChartHistoryRangeValue =
    isPortfolioLineChart && clampPortfolioLineChartHistoryRange
      ? clampPortfolioLineChartHistoryRange(rawLineChartHistoryRange)
      : rawLineChartHistoryRange;

  const severityFilterValue = impactSeverityFilterValueForSelection(
    measureFilters?.impactSeverities,
  );

  const setScope = useCallback(
    (nextScope: CodeScope) => {
      dispatch({ scope: nextScope, type: 'SET_SCOPE' });
    },
    [dispatch],
  );

  const setHistoryRange = useCallback(
    (historyRange: HistoryRange) => {
      dispatch({ historyRange, type: 'SET_HISTORY_RANGE' });
    },
    [dispatch],
  );

  const { setIssueStatusFilter, setSeverityFilter, setSoftwareQualityFilter } =
    useRichMeasureFilterHandlers(
      measureFilters,
      updateMeasureFilters,
      isIssueResolutionMetricSelected ||
        isIssueDensityMetricSelected ||
        isScaResolutionMetricSelected,
    );

  const scopeSlice: ScopeFilterSlice = {
    isQualityGateStatus,
    isScopeSelectDisabled,
    scope,
    scopeHelpText,
    setScope,
  };

  const lineChartSlice: LineChartHistorySlice | undefined = isLineChart
    ? {
        isPortfolio: isPortfolioLineChart,
        setValue: setHistoryRange,
        value: lineChartHistoryRangeValue,
      }
    : undefined;

  const lineChartGroupBy =
    isLineChart && metricConfig ? (metricConfig as LineChartConfig).groupBy : undefined;
  const groupByFilterConflict =
    lineChartGroupBy === undefined
      ? null
      : lineChartGroupByConflictsWithMeasureFilter(lineChartGroupBy);

  const richMeasureFiltersSlice: RichMeasureFiltersSlice | undefined =
    supportsRichMeasureFilters && filterCapability
      ? {
          filterCapability,
          isIssueStatusFilterDisabled: groupByFilterConflict === 'issueStatus',
          isSoftwareQualityFilterDisabled: groupByFilterConflict === 'impactSoftwareQuality',
          issueStatusSelectOptions,
          issueStatusValue: measureFilters?.issueStatus ?? '',
          setIssueStatusFilter,
          setSeverityFilter,
          setSoftwareQualityFilter,
          severityFilterValue,
          showSeverityFilter:
            groupByFilterConflict !== 'impactSeverities' &&
            Boolean(
              filterCapability.supportsSeverityFilter &&
              (isIssueResolutionMetricSelected ||
                isIssueDensityMetricSelected ||
                isScaResolutionMetricSelected ||
                measureFilters?.impactSoftwareQuality),
            ),
          softwareQualityFilterDisabledHelp: undefined,
          softwareQualityValue: measureFilters?.impactSoftwareQuality ?? '',
          statusFilterHelpText: undefined,
        }
      : undefined;

  return {
    hasMetric,
    lineChart: lineChartSlice,
    richMeasureFilters: richMeasureFiltersSlice,
    scope: scopeSlice,
    showScopeFilter: true,
  };
}
