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
  useDashboardIssueCountHistoryQuery,
  useDashboardMeasuresHistoryQuery,
} from '../../queries/dashboard-history';
import {
  CodeScope,
  DashboardMetricType,
  LineChartGroupBy,
  RichMetricKey,
  getActualMetricKey,
  getPortfolioDashboardMeasureRequestKey,
  issueHistoryQueryExtras,
  lineChartDataToSingleSeries,
  lineChartSinceDate,
  organizationsHistoryStartDateWithRetentionBuffer,
  portfolioIssueHistoryToLineData,
  portfolioIssueHistoryToMultiLineSeries,
  portfolioMeasuresToLineData,
  type DashboardMetric,
  type MeasureFilters,
} from '../helpers/dashboard-widget-data';
import { unsupportedDashboardWidgetAdapter } from '../helpers/unsupported-dashboard-widget-adapter';
import type {
  DashboardEntityType,
  DashboardLineChartSeries,
} from './dashboard-widget-adapter-types';

export function organizationLineChartRequestKey(
  metric: unknown,
  scope: string,
  actualMetricKey: MetricKey,
): string {
  if (
    actualMetricKey === MetricKey.security_hotspots ||
    actualMetricKey === MetricKey.new_security_hotspots
  ) {
    return unsupportedDashboardWidgetAdapter();
  }
  const dashboardMetric = metric as DashboardMetric;
  return dashboardMetric.type === DashboardMetricType.Raw
    ? getPortfolioDashboardMeasureRequestKey(actualMetricKey, scope === CodeScope.New)
    : actualMetricKey;
}

export function useOrganizationLineChartSeriesData(
  args: Readonly<{
    actualMetricKey: MetricKey | undefined;
    entityId: string;
    entityType: DashboardEntityType;
    groupBy: string;
    historyRange: string;
    measureFilters: unknown;
    measuresHistoryKey: string;
    metric: unknown;
    metricName: string;
    metricType: string | undefined;
    queriesEnabled?: boolean;
  }>,
): {
  isMeasuresHistoryPending: boolean;
  lineChartHasFetchError: boolean;
  series: DashboardLineChartSeries[];
} {
  const {
    actualMetricKey,
    entityId,
    entityType,
    groupBy: groupByValue,
    historyRange: historyRangeValue,
    measureFilters: measureFiltersValue,
    measuresHistoryKey,
    metric: metricValue,
    metricName,
    metricType,
    queriesEnabled = true,
  } = args;
  const metric = metricValue as DashboardMetric;
  const groupBy = groupByValue;
  const historyRange = historyRangeValue;
  const measureFilters = measureFiltersValue as MeasureFilters | undefined;

  const groupedIssueHistory = groupBy !== LineChartGroupBy.None;
  const groupByEligible =
    (metric.type === DashboardMetricType.Rich && metric.metricKey === RichMetricKey.Issues) ||
    (metric.type === DashboardMetricType.Raw && metric.metricKey === MetricKey.violations);
  const resolvedIssueMetricKey = getActualMetricKey(metric);
  const isRawHotspotsMetric =
    metric.type === DashboardMetricType.Raw &&
    (measuresHistoryKey === MetricKey.security_hotspots ||
      measuresHistoryKey === MetricKey.new_security_hotspots);
  const isUnsupported =
    actualMetricKey === MetricKey.security_hotspots ||
    actualMetricKey === MetricKey.new_security_hotspots ||
    isRawHotspotsMetric;
  const richMetricKey = metric.type === DashboardMetricType.Rich ? metric.metricKey : undefined;
  const useGroupedIssueQuery = groupedIssueHistory && groupByEligible;

  const measuresQueryEnabled =
    queriesEnabled &&
    Boolean(actualMetricKey) &&
    metric.type === DashboardMetricType.Raw &&
    !isRawHotspotsMetric &&
    !useGroupedIssueQuery &&
    Boolean(entityId) &&
    !isUnsupported;
  const issueQueryEnabled =
    queriesEnabled &&
    Boolean(resolvedIssueMetricKey) &&
    (metric.type === DashboardMetricType.Rich || isRawHotspotsMetric || useGroupedIssueQuery) &&
    Boolean(entityId) &&
    !isUnsupported;

  const {
    data: measuresSeries,
    isError: isMeasuresError,
    isPending: isMeasuresPending,
  } = useDashboardMeasuresHistoryQuery(
    {
      entityId,
      entityType,
      metricKeys: [measuresHistoryKey],
      startDate: lineChartSinceDate(historyRange),
    },
    {
      enabled: measuresQueryEnabled,
      refetchOnWindowFocus: false,
      retry: false,
      select: (response) =>
        actualMetricKey
          ? lineChartDataToSingleSeries(
              portfolioMeasuresToLineData(
                response.measuresHistory,
                measuresHistoryKey,
                historyRange,
                actualMetricKey,
                metricType,
                measureFilters,
              ),
              metricName,
            )
          : [],
    },
  );

  const issueHistoryParams = {
    entityId,
    entityType,
    startDate: organizationsHistoryStartDateWithRetentionBuffer(),
    ...(isRawHotspotsMetric
      ? { issueTypes: ['SECURITY_HOTSPOT'] }
      : issueHistoryQueryExtras(measureFilters, richMetricKey, resolvedIssueMetricKey)),
    ...(mapLineChartGroupByToSliceBy(groupBy)
      ? { sliceBy: mapLineChartGroupByToSliceBy(groupBy) }
      : {}),
    ...(groupBy === LineChartGroupBy.Status
      ? { statuses: ['OPEN', 'CONFIRMED', 'ACCEPTED', 'FALSE_POSITIVE', 'FIXED'] }
      : {}),
  };

  const {
    data: issueSeries,
    isError: isIssueError,
    isPending: isIssuePending,
  } = useDashboardIssueCountHistoryQuery(issueHistoryParams, {
    enabled: issueQueryEnabled,
    refetchOnWindowFocus: false,
    retry: false,
    select: (response) => {
      if (useGroupedIssueQuery) {
        return portfolioIssueHistoryToMultiLineSeries(
          response.issueCountHistory,
          historyRange,
          groupBy,
        );
      }
      return lineChartDataToSingleSeries(
        portfolioIssueHistoryToLineData(response.issueCountHistory, historyRange),
        metricName,
      );
    },
  });

  const usesIssueQuery =
    metric.type === DashboardMetricType.Rich || isRawHotspotsMetric || useGroupedIssueQuery;

  if (isUnsupported) {
    return unsupportedDashboardWidgetAdapter();
  }

  return {
    isMeasuresHistoryPending: usesIssueQuery ? isIssuePending : isMeasuresPending,
    lineChartHasFetchError: usesIssueQuery ? isIssueError : isMeasuresError,
    series: usesIssueQuery ? (issueSeries ?? []) : (measuresSeries ?? []),
  };
}

function mapLineChartGroupByToSliceBy(groupBy: string): string | undefined {
  switch (groupBy) {
    case LineChartGroupBy.Severity:
      return 'SEVERITY';
    case LineChartGroupBy.SoftwareQuality:
      return 'SOFTWARE_QUALITY';
    case LineChartGroupBy.Status:
      return 'STATUS';
    case LineChartGroupBy.Rule:
      return 'RULE_KEY';
    case LineChartGroupBy.None:
    default:
      return undefined;
  }
}
