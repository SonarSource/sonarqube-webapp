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

import { sortDashboardHistory } from '~shared/helpers/dashboard-history';
import {
  type DashboardMeasure,
  type DashboardMeasureHistory,
  IssueResolutionStatistic,
} from '~shared/types/dashboard-history';
import { useIntl, type IntlShape } from 'react-intl';
import { getDashboardLocalizedMetricName } from '~adapters/helpers/l10n';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { usePortfolioRulesMetadataOrganization } from '~adapters/queries/portfolio-widget-organization-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import { CHART_CATEGORICAL_COLORS } from '~shared/helpers/charts';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import {
  formatDotValue,
  formatYAxisTick,
} from '../../components/visualizations/line-chart/lineChartPresentation';
import {
  aggregateSmallSegments,
  getSegmentColor,
  sortSegments,
  STATUS_ORDER,
} from '../../components/visualizations/pie-chart/pieChartSegmentUtils';
import { getDashboardMetricTitle } from '../../components/widget-header/widgetHeaderText';
import { dashboardMeasureHistoryMetricKey } from '../../data/dashboard-measure';
import { parseDashboardMeasureValue } from '../../data/dashboard-measure-history';
import { DashboardMetricType, type DashboardMetric } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { PieChartIssueSlice, PieChartMetric } from '../../types/dashboard-widget';
import { ORGANIZATION_ISSUE_COUNT_SEVERITIES } from '../../types/organization-issue-count-history';
import type { LineChartSeries } from '../../types/visualization';
import { dashboardHistoryDateRange } from '../../utils/datetime';
import { lineChartMeasureTransformFlags } from '../../utils/lineChartMeasureTransformFlags';
import {
  relabelMultiLineSeriesWithRules,
  rulesFromGroupedLineChartSeries,
} from '../../utils/lineChartSeriesTransforms';
import {
  getIssueFilterSeverityValueMessageId,
  getIssueFilterTypeValueMessageId,
} from '../../widget-creation-modal/utils/issueFilterPresentation';
import { LineChartWidgetShell } from './LineChartWidgetShell';

interface Props {
  entityId: string;
  entityType: 'PORTFOLIO' | 'PROJECT_BRANCH';
  isStandardMode?: boolean;
  measure: DashboardMeasure;
  metric: DashboardMetric;
  months: number;
  organization?: string;
  showLegend?: boolean;
  sortSeveritySeries?: boolean;
}

function dashboardRuleEntity(
  entityType: Props['entityType'],
  organization: string | undefined,
  portfolioOrganization: { isLoading: boolean; organization: string | undefined },
) {
  if (entityType === 'PORTFOLIO') {
    return {
      isResolvingOrganization: portfolioOrganization.isLoading,
      organization: portfolioOrganization.organization,
      type: 'PORTFOLIO' as const,
    };
  }
  return { organization: organization ?? '', type: 'PROJECT' as const };
}

function dashboardLineChartAriaLabel(entityType: Props['entityType']): string {
  return entityType === 'PORTFOLIO'
    ? 'portfolio_dashboard.widget.line_chart.aria_label'
    : 'project_dashboard.widget.line_chart.aria_label';
}

function dashboardMeasureIsRating(
  measure: DashboardMeasure,
  metadataType: string | undefined,
): boolean {
  if (measure.api !== 'measures-history') {
    return false;
  }
  return lineChartMeasureTransformFlags(measure.metricKey, metadataType).isMetricRating;
}

function dashboardMeasureIsMttr(measure: DashboardMeasure): boolean {
  if (measure.api === 'sca-resolution-history') {
    return true;
  }
  return (
    measure.api === 'issue-resolution-history' &&
    measure.statistic !== IssueResolutionStatistic.ResolvedIssues
  );
}

function rankedRuleSeriesKeys(
  sortedHistory: ReadonlyArray<{ distribution: Array<{ key: string; value?: number }> }>,
): string[] {
  const totals = new Map<string, number>();
  for (const day of sortedHistory) {
    for (const entry of day.distribution) {
      if ((entry.value ?? 0) > 0) {
        totals.set(entry.key, (totals.get(entry.key) ?? 0) + (entry.value ?? 0));
      }
    }
  }
  const sortedEntries = [...totals].sort((a, b) => b[1] - a[1]);
  const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0);
  return total > 0 ? aggregateSmallSegments(sortedEntries, total).map(([key]) => key) : [];
}

function groupedSeriesLabel(
  key: string,
  sliceBy: NonNullable<Extract<DashboardMeasure, { api: 'issue-count-history' }>['sliceBy']>,
  formatMessage: IntlShape['formatMessage'],
): string {
  switch (sliceBy) {
    case 'STATUS':
      return formatMessage({ id: `issue.status.${key}` });
    case 'SEVERITY':
      return formatMessage({ id: `severity.${key}` });
    case 'SOFTWARE_QUALITY':
      return formatMessage({ id: `software_quality.${key}` });
    case 'RULE_KEY':
    case 'TYPE':
      return key;
  }
}

function orderStatusSeriesKeys(keys: string[], isStatus: boolean): string[] {
  if (!isStatus) {
    return keys;
  }
  // Use the shared status order so API response order and the selected date range do not
  // change the relative positions of statuses in the legend.
  return sortSegments(
    keys.map((key) => [key, 0]),
    PieChartIssueSlice.IssueStatuses,
    PieChartMetric.IssueCount,
  ).map(([key]) => key);
}

function groupedSeriesColor(
  key: string,
  index: number,
  sliceBy: string,
  isStatus: boolean,
): string {
  if (sliceBy === 'RULE_KEY') {
    return getSegmentColor(key, index, PieChartIssueSlice.Rules);
  }
  if (isStatus) {
    // Status lines need distinct colors: the pie chart's sentiment mapping can assign
    // the same color to different statuses, making overlapping lines indistinguishable.
    // Index into the full status list so a status keeps its color even when other
    // statuses have no data in the selected range. Unknown statuses use the series index.
    const statusIndex = STATUS_ORDER.indexOf(key);
    return CHART_CATEGORICAL_COLORS[
      (statusIndex < 0 ? index : statusIndex) % CHART_CATEGORICAL_COLORS.length
    ];
  }
  return CHART_CATEGORICAL_COLORS[index % CHART_CATEGORICAL_COLORS.length];
}

function historyToSeries(
  data: DashboardMeasureHistory | undefined,
  measure: DashboardMeasure,
  label: string,
  metric: DashboardMetric,
  formatMessage: IntlShape['formatMessage'],
  metadataType?: string,
): LineChartSeries[] {
  if (data === undefined) {
    return [];
  }
  if (data.api === 'measures-history' && measure.api === 'measures-history') {
    const measureFilters =
      metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;
    const points = sortDashboardHistory(data.history).flatMap((day) => {
      const requestedMetricKey = dashboardMeasureHistoryMetricKey(measure);
      const value = parseDashboardMeasureValue(
        day.measures.find((entry) => entry.metric === requestedMetricKey)?.value,
        measure.metricKey,
        metadataType,
        measureFilters,
      );
      return value === undefined ? [] : [{ x: new Date(day.date), y: value }];
    });
    return points.length
      ? [{ color: CHART_CATEGORICAL_COLORS[0], data: points, id: 'total', label }]
      : [];
  }
  if (data.api === 'measures-history') {
    return [];
  }

  if (measure.api === 'issue-count-history' && measure.sliceBy !== undefined) {
    const sortedHistory = sortDashboardHistory(data.history);
    const { sliceBy } = measure;
    const isGroupedByRule = sliceBy === 'RULE_KEY';
    const groupedKeys = isGroupedByRule
      ? rankedRuleSeriesKeys(sortedHistory)
      : [...new Set(sortedHistory.flatMap((day) => day.distribution.map(({ key }) => key)))];
    const isStatus = sliceBy === 'STATUS';
    const keys = orderStatusSeriesKeys(groupedKeys, isStatus);
    const explicitKeys = new Set(keys.filter((key) => !key.startsWith('OTHER_')));

    return keys.map((key, index) => ({
      color: groupedSeriesColor(key, index, sliceBy, isStatus),
      data: sortedHistory.map((day) => ({
        x: new Date(day.date),
        y: key.startsWith('OTHER_')
          ? day.distribution
              .filter((entry) => !explicitKeys.has(entry.key))
              .reduce((sum, entry) => sum + (entry.value ?? 0), 0)
          : (day.distribution.find((entry) => entry.key === key)?.value ?? 0),
      })),
      id: key,
      label: groupedSeriesLabel(key, sliceBy, formatMessage),
    }));
  }

  const points = sortDashboardHistory(data.history)
    .map((day) => ({
      x: new Date(day.date),
      y: day.distribution.reduce((sum, entry) => sum + (entry.value ?? Number.NaN), 0),
    }))
    .filter((point) => Number.isFinite(point.y));
  return points.length
    ? [{ color: CHART_CATEGORICAL_COLORS[0], data: points, id: 'total', label }]
    : [];
}

function orderSeveritySeries(
  series: LineChartSeries[],
  enabled: boolean,
  measure: DashboardMeasure,
): LineChartSeries[] {
  if (!enabled || measure.api !== 'issue-count-history' || measure.sliceBy !== 'SEVERITY') {
    return series;
  }
  const severityOrder: readonly string[] = ORGANIZATION_ISSUE_COUNT_SEVERITIES;
  const rank = (id: string) => {
    const index = severityOrder.indexOf(id);
    return index === -1 ? severityOrder.length : index;
  };
  return [...series].sort((a, b) => rank(a.id) - rank(b.id));
}

export function DashboardMeasureLineChart({
  entityId,
  entityType,
  isStandardMode = false,
  measure,
  metric,
  months,
  organization,
  showLegend,
  sortSeveritySeries = false,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { formatMttrDotValue, formatMttrTick } = useMttrFormatters();
  const metadata = useWidgetMetricMetadataQuery();
  const query = useDashboardMeasureQuery(
    { entityId, entityType, measure, months },
    Boolean(entityId),
  );
  const metricName = getDashboardMetricTitle({
    formatMessage,
    getLocalizedMetricName: getDashboardLocalizedMetricName,
    hasHistoryRange: true,
    isStandardMode,
    metric,
  });
  const metricMetadata =
    measure.api === 'measures-history' ? metadata.data?.[measure.metricKey] : undefined;
  const series = historyToSeries(
    query.data,
    measure,
    metricName,
    metric,
    formatMessage,
    metricMetadata?.type,
  );
  const isGroupedByRule = measure.api === 'issue-count-history' && measure.sliceBy === 'RULE_KEY';
  const ruleKeys = isGroupedByRule ? rulesFromGroupedLineChartSeries(series) : [];
  const portfolioOrganization = usePortfolioRulesMetadataOrganization(entityId, {
    enabled: entityType === 'PORTFOLIO' && isGroupedByRule,
  });
  const ruleLabels = useDashboardRuleLabels({
    enabled: isGroupedByRule && Boolean(entityId),
    entity: dashboardRuleEntity(entityType, organization, portfolioOrganization),
    ruleKeys,
  });
  const ruleRelabelledSeries = isGroupedByRule
    ? relabelMultiLineSeriesWithRules(series, 'rule', ruleLabels.rulesByKey, formatMessage)
    : series;
  const isGroupedBySeverity =
    measure.api === 'issue-count-history' && measure.sliceBy === 'SEVERITY';
  const isGroupedBySoftwareQuality =
    measure.api === 'issue-count-history' && measure.sliceBy === 'SOFTWARE_QUALITY';
  const displaySeries =
    isStandardMode && (isGroupedBySeverity || isGroupedBySoftwareQuality)
      ? ruleRelabelledSeries.map((lineSeries) => ({
          ...lineSeries,
          label: formatMessage({
            id: isGroupedBySeverity
              ? getIssueFilterSeverityValueMessageId(lineSeries.id as SoftwareImpactSeverity, true)
              : getIssueFilterTypeValueMessageId(lineSeries.id as SoftwareQuality, true),
          }),
        }))
      : ruleRelabelledSeries;
  const isMttr = dashboardMeasureIsMttr(measure);
  const isMetricRating = dashboardMeasureIsRating(measure, metricMetadata?.type);
  const requestedStartDate = new Date(dashboardHistoryDateRange(months).startDate);

  const chartProps = {
    ariaLabel: formatMessage(
      { id: dashboardLineChartAriaLabel(entityType) },
      { metric: metricName },
    ),
    formatDotValue: isMttr
      ? formatMttrDotValue
      : (value: number) => formatDotValue(value, isMetricRating),
    formatTick: isMttr ? formatMttrTick : (value: number) => formatYAxisTick(value, isMetricRating),
    hasFetchError:
      query.isError ||
      (measure.api === 'measures-history' && metadata.isError) ||
      ruleLabels.isError,
    isMetricRating,
    isPending:
      query.isPending ||
      (measure.api === 'measures-history' && metadata.isPending) ||
      ruleLabels.isPending,
    padding: [20, 20, 40, 60] as [number, number, number, number],
    showTooltip: true,
    strokeWidth: 2,
  };

  return (
    <LineChartWidgetShell
      {...chartProps}
      requestedStartDate={requestedStartDate}
      series={orderSeveritySeries(displaySeries, sortSeveritySeries, measure)}
      showLegend={showLegend && displaySeries.length > 1 && !isMetricRating}
    />
  );
}
