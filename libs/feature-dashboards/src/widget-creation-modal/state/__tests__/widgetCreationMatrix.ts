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

import type { IntlShape } from 'react-intl';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import { LineChartGroupBy, type LineChartGroupByValue } from '../../../data/widgets/line-chart';
import {
  DashboardMetricType,
  IssueStatus,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  RichMetricKey,
  type CompleteWidgetConfig,
  type DashboardMetric,
  type MeasureFilters,
  type PieChartFilter,
} from '../../../types/dashboard-widget';
import {
  CodeScope,
  TOP_LIST_UI_LIMIT_OPTIONS,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
  type DashboardWidgetType,
  type MetricOptionValue,
  type WidgetMetricPickerOptions,
} from '../../../types/widget-common';
import {
  buildLineChartTimeRangeSelectData,
  buildPieChartFilterSelectOptions,
  severitiesForImpactFilterOption,
} from '../../components/applyFilterAccordionHelpers';
import { getActualMetricKey } from '../../utils/getActualMetricKey';
import {
  buildLineChartGroupBySelectOptions,
  isLineChartGroupByEligibleForMetric,
  lineChartGroupByConflictsWithMeasureFilter,
} from '../../utils/lineChartGroupByHelpers';
import {
  getMeasureFilterCapabilityForDashboardMetric,
  type MeasureFilterCapability,
} from '../../utils/measureFilterConfig';
import { widgetConfigReducer } from '../reducers/widgetConfigReducer';
import { extractCompleteConfig } from '../selectors/widgetConfigSelectors';
import type {
  WidgetConfigAction,
  WidgetConfigReducerOptions,
  WidgetConfigState,
} from '../widgetConfigTypes';

type MatrixOptions = {
  isRatingBadgeBreakdownEligibleForMetric: (metricKey: MetricKey) => boolean;
  metricPickerOptions: WidgetMetricPickerOptions;
};

const FORMAT_MESSAGE = (({ id }: { id: string }) => id) as IntlShape['formatMessage'];

const PIE_SLICES = [
  ...Object.values(PieChartIssueSlice),
  ...Object.values(PieChartHotspotSlice),
  ...Object.values(PieChartLineSlice),
  ...Object.values(PieChartProjectSlice),
];

const SCOPES = [CodeScope.Overall, CodeScope.New];

function pairs<First, Second>(
  firstValues: readonly First[],
  secondValues: readonly Second[],
): Array<[First, Second]> {
  return firstValues.flatMap((first) =>
    secondValues.map((second): [First, Second] => [first, second]),
  );
}

function triples<First, Second, Third>(
  firstValues: readonly First[],
  secondValues: readonly Second[],
  thirdValues: readonly Third[],
): Array<[First, Second, Third]> {
  return firstValues.flatMap((first) =>
    secondValues.flatMap((second) =>
      thirdValues.map((third): [First, Second, Third] => [first, second, third]),
    ),
  );
}

function reduce(
  actions: WidgetConfigAction[],
  options: WidgetConfigReducerOptions,
): WidgetConfigState {
  return actions.reduce<WidgetConfigState>(
    (state, action) => widgetConfigReducer(state, action, options),
    { configs: {}, selectedType: null },
  );
}

function getMetricValues(groups: WidgetMetricPickerOptions['countMetrics']): MetricOptionValue[] {
  return groups.flatMap(({ items }) => items.map(({ value }) => value));
}

function getMeasureFilters(
  metric: DashboardMetric,
  capability: MeasureFilterCapability,
  requiresSoftwareQualityForSeverity: boolean,
): Array<MeasureFilters | undefined> {
  if (!capability.isDrillable) {
    return [undefined];
  }

  const statuses = capability.supportsStatusFilter
    ? [undefined, ...Object.values(IssueStatus)]
    : [undefined];
  const qualities = capability.supportsSoftwareQualityFilter
    ? [undefined, ...Object.values(SoftwareQuality)]
    : [undefined];
  const severitySelections = [
    undefined,
    ...Object.values(SoftwareImpactSeverity).map(severitiesForImpactFilterOption),
  ];

  return statuses.flatMap((issueStatus) =>
    qualities.flatMap((impactSoftwareQuality) => {
      const canSelectSeverity =
        capability.supportsSeverityFilter &&
        (!requiresSoftwareQualityForSeverity ||
          impactSoftwareQuality !== undefined ||
          metric.type !== DashboardMetricType.Rich);
      const severities = canSelectSeverity ? severitySelections : [undefined];

      return severities.map((impactSeverities) => {
        const filters = {
          ...(issueStatus === undefined ? {} : { issueStatus }),
          ...(impactSoftwareQuality === undefined ? {} : { impactSoftwareQuality }),
          ...(impactSeverities === undefined ? {} : { impactSeverities }),
        };
        return Object.keys(filters).length === 0 ? undefined : filters;
      });
    }),
  );
}

function removeConflictingLineChartFilter(
  measureFilters: MeasureFilters | undefined,
  groupBy: LineChartGroupByValue,
): MeasureFilters | undefined {
  const conflict = lineChartGroupByConflictsWithMeasureFilter(groupBy);
  if (!measureFilters || !conflict) {
    return measureFilters;
  }

  const { [conflict]: _, ...remainingFilters } = measureFilters;
  return Object.keys(remainingFilters).length === 0 ? undefined : remainingFilters;
}

function metricAndCapability(
  widgetType: typeof VisualizationType.Count | typeof VisualizationType.LineChart,
  metricKey: MetricOptionValue,
  options: WidgetConfigReducerOptions,
) {
  const state = reduce(
    [
      { type: 'SET_WIDGET_TYPE', widgetType },
      { metricKey, type: 'SET_METRIC_KEY' },
    ],
    options,
  );
  const config = extractCompleteConfig(state);
  if (
    !config ||
    (config.widgetType !== VisualizationType.Count &&
      config.widgetType !== VisualizationType.LineChart)
  ) {
    throw new TypeError(`Could not configure ${widgetType} metric ${metricKey}`);
  }
  return {
    capability: getMeasureFilterCapabilityForDashboardMetric(
      config.metric,
      getActualMetricKey(config.metric),
    ),
    metric: config.metric,
  };
}

function addCompleteConfig(configs: Map<string, CompleteWidgetConfig>, state: WidgetConfigState) {
  const config = extractCompleteConfig(state);
  if (config) {
    configs.set(JSON.stringify(config), config);
  }
}

function addCountConfigs(
  configs: Map<string, CompleteWidgetConfig>,
  options: WidgetConfigReducerOptions,
  pickerOptions: WidgetMetricPickerOptions,
) {
  for (const metricKey of getMetricValues(pickerOptions.countMetrics)) {
    const { capability, metric } = metricAndCapability(VisualizationType.Count, metricKey, options);
    for (const measureFilters of getMeasureFilters(metric, capability, true)) {
      for (const [scope, showTrendIndicator] of pairs(SCOPES, [false, true])) {
        addCompleteConfig(
          configs,
          reduce(
            [
              { type: 'SET_WIDGET_TYPE', widgetType: VisualizationType.Count },
              { metricKey, type: 'SET_METRIC_KEY' },
              { measureFilters, type: 'SET_COUNT_MEASURE_FILTERS' },
              { scope, type: 'SET_SCOPE' },
              { showTrendIndicator, type: 'SET_SHOW_TREND_INDICATOR' },
            ],
            options,
          ),
        );
      }
    }
  }
}

function addLineChartConfigs(
  configs: Map<string, CompleteWidgetConfig>,
  options: WidgetConfigReducerOptions,
  pickerOptions: WidgetMetricPickerOptions,
) {
  const metricGroups = pickerOptions.lineChartMetrics ?? pickerOptions.countMetrics;
  for (const metricKey of getMetricValues(metricGroups)) {
    const { capability, metric } = metricAndCapability(
      VisualizationType.LineChart,
      metricKey,
      options,
    );
    const groupBys = isLineChartGroupByEligibleForMetric(metric)
      ? buildLineChartGroupBySelectOptions(FORMAT_MESSAGE).map(({ value }) => value)
      : [LineChartGroupBy.None];
    for (const groupBy of groupBys) {
      for (const candidateMeasureFilters of getMeasureFilters(metric, capability, true)) {
        const measureFilters = removeConflictingLineChartFilter(candidateMeasureFilters, groupBy);
        for (const [scope, historyRange, showLegend] of triples(
          SCOPES,
          buildLineChartTimeRangeSelectData(FORMAT_MESSAGE).map(({ value }) => value),
          [false, true],
        )) {
          addCompleteConfig(
            configs,
            reduce(
              [
                { type: 'SET_WIDGET_TYPE', widgetType: VisualizationType.LineChart },
                { metricKey, type: 'SET_METRIC_KEY' },
                { groupBy, type: 'SET_LINE_CHART_GROUP_BY' },
                { measureFilters, type: 'SET_LINE_CHART_MEASURE_FILTERS' },
                { scope, type: 'SET_SCOPE' },
                { historyRange, type: 'SET_HISTORY_RANGE' },
                { showLegend, type: 'SET_SHOW_LEGEND_LINECHART' },
              ],
              options,
            ),
          );
        }
      }
    }
  }
}

function addRatingBadgeConfigs(
  configs: Map<string, CompleteWidgetConfig>,
  options: WidgetConfigReducerOptions,
  pickerOptions: WidgetMetricPickerOptions,
  isRatingBadgeBreakdownEligibleForMetric: MatrixOptions['isRatingBadgeBreakdownEligibleForMetric'],
) {
  for (const metricKey of getMetricValues(pickerOptions.ratingBadgeMetrics)) {
    const breakdownValues =
      metricKey === MetricKey.alert_status ||
      isRatingBadgeBreakdownEligibleForMetric(metricKey as MetricKey)
        ? [false, true]
        : [false];
    for (const scope of SCOPES) {
      for (const showBreakdown of breakdownValues) {
        addCompleteConfig(
          configs,
          reduce(
            [
              { type: 'SET_WIDGET_TYPE', widgetType: VisualizationType.RatingBadge },
              { metricKey, type: 'SET_METRIC_KEY' },
              { scope, type: 'SET_SCOPE' },
              { showBreakdown, type: 'SET_SHOW_BREAKDOWN' },
            ],
            options,
          ),
        );
      }
    }
  }
}

function addPieConfigs(
  configs: Map<string, CompleteWidgetConfig>,
  options: WidgetConfigReducerOptions,
  pickerOptions: WidgetMetricPickerOptions,
  widgetType: typeof VisualizationType.DonutChart | typeof VisualizationType.PieChart,
) {
  const pieMetrics = pickerOptions.pieChartMetricOptions ?? [];
  for (const { value } of pieMetrics) {
    const metric = value as PieChartMetric;
    for (const slice of PIE_SLICES) {
      const filters: Array<PieChartFilter | ''> =
        metric === PieChartMetric.ProjectCount ||
        (metric === PieChartMetric.IssueCount &&
          slice === PieChartIssueSlice.ImpactSoftwareQualities)
          ? ['']
          : buildPieChartFilterSelectOptions(metric, FORMAT_MESSAGE).map(
              ({ value: filterValue }) => filterValue,
            );
      for (const [scope, filter, showLegend] of triples(SCOPES, filters, [false, true])) {
        addCompleteConfig(
          configs,
          reduce(
            [
              { type: 'SET_WIDGET_TYPE', widgetType },
              { metric, type: 'SET_PIE_METRIC' },
              { slice, type: 'SET_PIE_SLICE' },
              { scope, type: 'SET_PIE_SCOPE' },
              { filter, type: 'SET_PIE_FILTER' },
              { showLegend, type: 'SET_PIE_SHOW_LEGEND' },
            ],
            options,
          ),
        );
      }
    }
  }
}

function addTopListConfigs(
  configs: Map<string, CompleteWidgetConfig>,
  options: WidgetConfigReducerOptions,
) {
  const metric: DashboardMetric = {
    metricKey: RichMetricKey.Issues,
    type: DashboardMetricType.Rich,
  };
  const capability = getMeasureFilterCapabilityForDashboardMetric(metric, undefined);
  for (const measureFilters of getMeasureFilters(metric, capability, false)) {
    for (const scope of SCOPES) {
      for (const limit of TOP_LIST_UI_LIMIT_OPTIONS) {
        addCompleteConfig(
          configs,
          reduce(
            [
              { type: 'SET_WIDGET_TYPE', widgetType: VisualizationType.TopList },
              { metric: TopListMetric.IssueCount, type: 'SET_TOP_LIST_METRIC' },
              { rankBy: TopListRankBy.Rule, type: 'SET_TOP_LIST_RANK_BY' },
              { measureFilters, type: 'SET_TOP_LIST_MEASURE_FILTERS' },
              { scope, type: 'SET_SCOPE' },
              { limit, type: 'SET_TOP_LIST_LIMIT' },
            ],
            options,
          ),
        );
      }
    }
  }
}

/** Enumerates the distinct widget configurations reachable from a product's picker options. */
export function getWidgetCreationMatrix({
  isRatingBadgeBreakdownEligibleForMetric,
  metricPickerOptions,
}: MatrixOptions): CompleteWidgetConfig[] {
  const options: WidgetConfigReducerOptions = {
    isPortfolioWidgetConfigurator: metricPickerOptions.isPortfolioWidgetConfigurator,
    supportsNewCodeScopeForMetric: metricPickerOptions.supportsNewCodeScopeForMetric,
    supportsNewCodeScopeForPieChart: metricPickerOptions.supportsNewCodeScopeForPieChart,
    supportsPieChartSlice: metricPickerOptions.supportsPieChartSlice,
  };
  const configs = new Map<string, CompleteWidgetConfig>();

  addCountConfigs(configs, options, metricPickerOptions);
  addLineChartConfigs(configs, options, metricPickerOptions);
  addRatingBadgeConfigs(
    configs,
    options,
    metricPickerOptions,
    isRatingBadgeBreakdownEligibleForMetric,
  );
  addPieConfigs(configs, options, metricPickerOptions, VisualizationType.PieChart);
  addPieConfigs(configs, options, metricPickerOptions, VisualizationType.DonutChart);
  addTopListConfigs(configs, options);

  return [...configs.values()];
}

export function getWidgetTypeCounts(configs: CompleteWidgetConfig[]) {
  return configs.reduce<Partial<Record<DashboardWidgetType, number>>>((counts, config) => {
    counts[config.widgetType] = (counts[config.widgetType] ?? 0) + 1;
    return counts;
  }, {});
}
