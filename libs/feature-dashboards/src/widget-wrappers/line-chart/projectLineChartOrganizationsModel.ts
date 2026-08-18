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

import { useMemo, type ComponentProps } from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import {
  organizationLineChartRequestKey,
  useOrganizationLineChartSeriesData,
} from '~adapters/queries/line-chart-widget-data';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import {
  formatDotValue,
  formatYAxisTick,
} from '../../components/visualizations/line-chart/lineChartPresentation';
import { MultiLineChart } from '../../components/visualizations/multi-line-chart/MultiLineChart';
import { LineChartGroupBy } from '../../data/widgets/line-chart';
import { useLineChartMetricCharacteristics } from '../../hooks/useLineChartMetricCharacteristics';
import { ProjectDashboardWidgetPropMap } from '../../types/dashboard-widget';
import { LineChartSeries } from '../../types/visualization';
import {
  relabelMultiLineSeriesWithRules,
  rulesFromGroupedLineChartSeries,
} from '../../utils/lineChartSeriesTransforms';

export type ProjectDashboardLineChartProps = Readonly<
  Omit<ComponentProps<typeof MultiLineChart>, 'ref'> & { metricName: string }
>;

type Characteristics = ReturnType<typeof useLineChartMetricCharacteristics>;

function buildProjectLineChartModelOutput(
  widgetProps: Readonly<ProjectDashboardWidgetPropMap['lineChart']>,
  characteristics: Characteristics,
  seriesResult: Readonly<{
    hasFetchError: boolean;
    isPending: boolean;
    series: LineChartSeries[];
  }>,
  formatMessage: IntlShape['formatMessage'],
): ProjectDashboardLineChartProps {
  const { showLegend = false } = widgetProps;
  const { actualMetricKey, isMetricRating, metricMetadata } = characteristics;

  const showLegendInFooter = showLegend && !isMetricRating;
  const metricName = actualMetricKey
    ? (metricMetadata?.name ?? formatMessage({ id: `metric.${String(actualMetricKey)}.name` }))
    : '';
  const lineChartAriaLabel = formatMessage(
    { id: 'project_dashboard.widget.line_chart.aria_label' },
    { metric: metricName },
  );

  return {
    ariaLabel: lineChartAriaLabel,
    formatDotValue: (value: number) => formatDotValue(value, isMetricRating),
    formatTick: (tick: number) => formatYAxisTick(tick, isMetricRating),
    hasFetchError: seriesResult.hasFetchError,
    isMetricRating,
    isPending: seriesResult.isPending,
    metricName,
    padding: [20, 20, 40, 60],
    series: seriesResult.series,
    showLegend: showLegendInFooter,
    showTooltip: true,
    strokeWidth: 2,
  };
}

export function useProjectLineChartModelOrganizations(
  component: string,
  organization: string,
  props: Readonly<ProjectDashboardWidgetPropMap['lineChart']>,
): ProjectDashboardLineChartProps {
  const { formatMessage } = useIntl();
  const { groupBy, historyRange, metric, scope } = props;
  const characteristics = useLineChartMetricCharacteristics(metric);
  const { actualMetricKey, measureFilters, metricMetadata } = characteristics;
  const metricType = metricMetadata?.type;
  const metricName = actualMetricKey
    ? (metricMetadata?.name ?? formatMessage({ id: `metric.${String(actualMetricKey)}.name` }))
    : '';

  const measuresHistoryKey = actualMetricKey
    ? organizationLineChartRequestKey(metric, scope, actualMetricKey)
    : '';

  const organizationsSeries = useOrganizationLineChartSeriesData({
    actualMetricKey,
    entityId: component,
    entityType: 'PROJECT_BRANCH',
    groupBy,
    historyRange,
    measureFilters,
    metric,
    metricName,
    metricType,
    measuresHistoryKey,
    queriesEnabled: Boolean(component) && actualMetricKey !== undefined,
  });

  const isGroupedByRule = groupBy === LineChartGroupBy.Rule;
  const ruleKeys = useMemo(
    () => (isGroupedByRule ? rulesFromGroupedLineChartSeries(organizationsSeries.series) : []),
    [isGroupedByRule, organizationsSeries.series],
  );
  const {
    isError: isRuleLabelsError,
    isPending: isRuleLabelsPending,
    rulesByKey,
  } = useDashboardRuleLabels({
    enabled: isGroupedByRule && Boolean(component) && Boolean(organization),
    entity: { organization, type: 'PROJECT' },
    ruleKeys,
  });

  const labelledSeries = useMemo(
    () =>
      isGroupedByRule
        ? relabelMultiLineSeriesWithRules(organizationsSeries.series, groupBy, rulesByKey)
        : organizationsSeries.series,
    [groupBy, isGroupedByRule, organizationsSeries.series, rulesByKey],
  );

  return buildProjectLineChartModelOutput(
    props,
    characteristics,
    {
      hasFetchError: organizationsSeries.lineChartHasFetchError || isRuleLabelsError,
      isPending: organizationsSeries.isMeasuresHistoryPending || isRuleLabelsPending,
      series: labelledSeries,
    },
    formatMessage,
  );
}
