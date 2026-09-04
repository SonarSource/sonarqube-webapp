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

import { useIntl } from 'react-intl';
import { getDashboardLocalizedMetricName } from '~adapters/helpers/l10n';
import { useDashboardMeasureQuery } from '~adapters/queries/dashboard-measure';
import { usePortfolioRulesMetadataOrganization } from '~adapters/queries/portfolio-widget-organization-data';
import { useWidgetMetricMetadataQuery } from '~adapters/queries/widget-metric-metadata';
import { useDashboardRuleLabels } from '~adapters/queries/widget-rule-metadata';
import { CHART_CATEGORICAL_COLORS } from '~shared/helpers/charts';
import {
  formatDotValue,
  formatYAxisTick,
} from '../../components/visualizations/line-chart/lineChartPresentation';
import { getDashboardMetricTitle } from '../../components/widget-header/widgetHeaderText';
import {
  dashboardMeasureHistoryMetricKey,
  type DashboardMeasure,
} from '../../data/dashboard-measure';
import {
  parseDashboardMeasureValue,
  sortDashboardHistory,
  type DashboardMeasureHistory,
} from '../../data/dashboard-measure-history';
import { DashboardMetricType, type DashboardMetric } from '../../data/widgets/shared';
import { useMttrFormatters } from '../../hooks/useMttrFormatters';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import type { LineChartSeries } from '../../types/visualization';
import { dashboardHistoryDateRange } from '../../utils/datetime';
import { lineChartMeasureTransformFlags } from '../../utils/lineChartMeasureTransformFlags';
import {
  relabelMultiLineSeriesWithRules,
  rulesFromGroupedLineChartSeries,
} from '../../utils/lineChartSeriesTransforms';
import { LineChartWidgetShell } from './LineChartWidgetShell';

interface Props {
  entityId: string;
  entityType: 'PORTFOLIO' | 'PROJECT_BRANCH';
  measure: DashboardMeasure;
  metric: DashboardMetric;
  months: number;
  organization?: string;
  showLegend?: boolean;
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

function historyToSeries(
  data: DashboardMeasureHistory | undefined,
  measure: DashboardMeasure,
  label: string,
  metric: DashboardMetric,
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
    const keys = [
      ...new Set(sortedHistory.flatMap((day) => day.distribution.map(({ key }) => key))),
    ];
    return keys.map((key, index) => ({
      color: CHART_CATEGORICAL_COLORS[index % CHART_CATEGORICAL_COLORS.length],
      data: sortedHistory.map((day) => ({
        x: new Date(day.date),
        y: day.distribution.find((entry) => entry.key === key)?.value ?? 0,
      })),
      id: key,
      label: key,
    }));
  }

  const points = sortDashboardHistory(data.history).map((day) => ({
    x: new Date(day.date),
    y: day.distribution.reduce((sum, entry) => sum + entry.value, 0),
  }));
  return points.length
    ? [{ color: CHART_CATEGORICAL_COLORS[0], data: points, id: 'total', label }]
    : [];
}

export function DashboardMeasureLineChart({
  entityId,
  entityType,
  measure,
  metric,
  months,
  organization,
  showLegend,
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
    metric,
  });
  const metricMetadata =
    measure.api === 'measures-history' ? metadata.data?.[measure.metricKey] : undefined;
  const series = historyToSeries(query.data, measure, metricName, metric, metricMetadata?.type);
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
  const labelledSeries = isGroupedByRule
    ? relabelMultiLineSeriesWithRules(series, 'rule', ruleLabels.rulesByKey)
    : series;
  const isMttr = dashboardMeasureIsMttr(measure);
  const isMetricRating = dashboardMeasureIsRating(measure, metricMetadata?.type);
  const requestedStartDate =
    months >= 6 ? new Date(dashboardHistoryDateRange(months).startDate) : undefined;

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
      metricName={metricName}
      requestedStartDate={requestedStartDate}
      series={labelledSeries}
      showLegend={showLegend && labelledSeries.length > 1 && !isMetricRating}
    />
  );
}
