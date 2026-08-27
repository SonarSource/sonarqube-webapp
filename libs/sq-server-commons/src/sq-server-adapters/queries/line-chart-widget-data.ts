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
  CodeScope,
  DashboardMetricType,
  LineChartGroupBy,
  RichMetricKey,
  getActualMetricKey,
  getPortfolioDashboardMeasureRequestKey,
  isKnownUnsupportedDashboardHistoryMetric,
  issueHistoryQueryExtras,
  lineChartDataToSingleSeries,
  lineChartSinceDate,
  organizationsHistoryStartDateWithRetentionBuffer,
  portfolioIssueHistoryToLineData,
  portfolioIssueHistoryToMultiLineSeries,
  portfolioMeasuresToLineData,
  type DashboardMetric,
  type MeasureFilters,
} from '../../helpers/dashboard-widget-data';
import {
  resolveIssueHistoryDistributionKeyForMode,
  resolveIssueHistoryFiltersForMode,
  resolveIssueHistorySliceForMode,
  resolveIssueSoftwareQuality,
  resolvePortfolioDashboardMetricKey,
} from '../../helpers/dashboard-widget-mode';
import { unsupportedDashboardWidgetAdapter } from '../../helpers/unsupported-dashboard-widget-adapter';
import {
  useDashboardIssueCountHistoryQuery,
  useDashboardMeasuresHistoryQuery,
} from '../../queries/dashboard-history';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import type {
  DashboardEntityType,
  DashboardLineChartSeries,
} from '../../types/dashboard-widget-adapter-types';
import { useWidgetMetricMetadataQuery } from './widget-metric-metadata';

export function organizationLineChartRequestKey(
  metric: unknown,
  scope: string,
  actualMetricKey: MetricKey,
): string {
  const dashboardMetric = metric as DashboardMetric;
  if (
    actualMetricKey === MetricKey.security_hotspots ||
    actualMetricKey === MetricKey.new_security_hotspots
  ) {
    return unsupportedDashboardWidgetAdapter();
  }
  return dashboardMetric.type === DashboardMetricType.Raw
    ? getPortfolioDashboardMeasureRequestKey(actualMetricKey, scope === CodeScope.New)
    : actualMetricKey;
}

function resolveLineChartResult(
  args: Readonly<{
    isIssueError: boolean;
    isIssuePending: boolean;
    isKnownMeasureMetric: boolean;
    isMeasuresError: boolean;
    isMeasuresPending: boolean;
    isModeError: boolean;
    isModePending: boolean;
    issueSeries: DashboardLineChartSeries[] | undefined;
    measureMetadataError: boolean;
    measureMetadataPending: boolean;
    measuresSeries: DashboardLineChartSeries[] | undefined;
    queriesEnabled: boolean;
    usesIssueQuery: boolean;
  }>,
): {
  isMeasuresHistoryPending: boolean;
  lineChartHasFetchError: boolean;
  series: DashboardLineChartSeries[];
} {
  const modeFailed = args.queriesEnabled && args.isModeError;
  const underlyingQueryPending = args.usesIssueQuery
    ? args.isIssuePending
    : args.measureMetadataPending || (args.isKnownMeasureMetric && args.isMeasuresPending);
  return {
    // A mode failure permanently disables the measures/issue query, which then
    // reports isPending forever. Once the mode has definitively errored, stop
    // reporting pending so the error state can be surfaced instead.
    isMeasuresHistoryPending:
      !modeFailed && ((args.queriesEnabled && args.isModePending) || underlyingQueryPending),
    lineChartHasFetchError:
      modeFailed ||
      (args.usesIssueQuery ? args.isIssueError : args.measureMetadataError || args.isMeasuresError),
    series: args.usesIssueQuery ? (args.issueSeries ?? []) : (args.measuresSeries ?? []),
  };
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
  const isUnsupported =
    actualMetricKey === MetricKey.security_hotspots ||
    actualMetricKey === MetricKey.new_security_hotspots ||
    measuresHistoryKey === MetricKey.security_hotspots ||
    measuresHistoryKey === MetricKey.new_security_hotspots ||
    (metric.type === DashboardMetricType.Rich && metric.metricKey === RichMetricKey.Hotspots);
  const richMetricKey = metric.type === DashboardMetricType.Rich ? metric.metricKey : undefined;
  const useGroupedIssueQuery = groupedIssueHistory && groupByEligible;
  const usesIssueQuery = metric.type === DashboardMetricType.Rich || useGroupedIssueQuery;
  const modeQuery = useStandardExperienceModeQuery({
    enabled: queriesEnabled && !isUnsupported,
  });
  const isModeResolved = !modeQuery.isPending && modeQuery.error == null;
  const isStandardMode = modeQuery.data ?? true;
  const resolvedMeasuresHistoryKey = resolvePortfolioDashboardMetricKey(
    measuresHistoryKey,
    isStandardMode,
  );
  const metricMetadataQuery = useWidgetMetricMetadataQuery({
    enabled: queriesEnabled && metric.type === DashboardMetricType.Raw,
  });
  const isKnownMeasureMetric =
    metricMetadataQuery.data?.[resolvedMeasuresHistoryKey] !== undefined &&
    !isKnownUnsupportedDashboardHistoryMetric(resolvedMeasuresHistoryKey);

  const { issueQueryEnabled, measuresQueryEnabled } = getLineChartQueryEnablement({
    actualMetricKey,
    entityId,
    isKnownMeasureMetric,
    isUnsupported,
    metric,
    queriesEnabled: queriesEnabled && isModeResolved,
    resolvedIssueMetricKey,
    useGroupedIssueQuery,
  });

  const {
    data: measuresSeries,
    isError: isMeasuresError,
    isPending: isMeasuresPending,
  } = useDashboardMeasuresHistoryQuery(
    {
      entityId,
      entityType,
      metricKeys: [resolvedMeasuresHistoryKey],
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
                resolvedMeasuresHistoryKey,
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

  const issueHistoryFilters = resolveIssueHistoryFiltersForMode(
    issueHistoryQueryExtras(measureFilters, richMetricKey, resolvedIssueMetricKey),
    {
      isStandardMode,
      severities: measureFilters?.impactSeverities,
      softwareQuality: resolveIssueSoftwareQuality(
        measureFilters?.impactSoftwareQuality,
        resolvedIssueMetricKey,
      ),
    },
  );
  const canonicalSliceBy = mapLineChartGroupByToSliceBy(groupBy);
  const issueHistoryParams = {
    entityId,
    entityType,
    startDate: organizationsHistoryStartDateWithRetentionBuffer(),
    ...issueHistoryFilters,
    ...(canonicalSliceBy
      ? { sliceBy: resolveIssueHistorySliceForMode(canonicalSliceBy, isStandardMode) }
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
      const issueCountHistory = response.issueCountHistory.map((day) => ({
        ...day,
        distribution: day.distribution.map((entry) => ({
          ...entry,
          key: resolveIssueHistoryDistributionKeyForMode(
            entry.key,
            canonicalSliceBy,
            isStandardMode,
          ),
        })),
      }));
      if (useGroupedIssueQuery) {
        return portfolioIssueHistoryToMultiLineSeries(issueCountHistory, historyRange, groupBy);
      }
      return lineChartDataToSingleSeries(
        portfolioIssueHistoryToLineData(issueCountHistory, historyRange),
        metricName,
      );
    },
  });

  if (isUnsupported) {
    return unsupportedDashboardWidgetAdapter();
  }

  return resolveLineChartResult({
    isIssueError,
    isIssuePending,
    isKnownMeasureMetric,
    isMeasuresError,
    isMeasuresPending,
    isModeError: modeQuery.error != null,
    isModePending: modeQuery.isPending,
    issueSeries,
    measureMetadataError: metricMetadataQuery.isError,
    measureMetadataPending: metricMetadataQuery.isPending,
    measuresSeries,
    queriesEnabled,
    usesIssueQuery,
  });
}

function getLineChartQueryEnablement(
  args: Readonly<{
    actualMetricKey: MetricKey | undefined;
    entityId: string;
    isKnownMeasureMetric: boolean;
    isUnsupported: boolean;
    metric: DashboardMetric;
    queriesEnabled: boolean;
    resolvedIssueMetricKey: MetricKey | undefined;
    useGroupedIssueQuery: boolean;
  }>,
) {
  const {
    actualMetricKey,
    entityId,
    isKnownMeasureMetric,
    isUnsupported,
    metric,
    queriesEnabled,
    resolvedIssueMetricKey,
    useGroupedIssueQuery,
  } = args;

  return {
    issueQueryEnabled:
      queriesEnabled &&
      Boolean(resolvedIssueMetricKey) &&
      (metric.type === DashboardMetricType.Rich || useGroupedIssueQuery) &&
      Boolean(entityId) &&
      !isUnsupported,
    measuresQueryEnabled:
      queriesEnabled &&
      Boolean(actualMetricKey) &&
      metric.type === DashboardMetricType.Raw &&
      !useGroupedIssueQuery &&
      Boolean(entityId) &&
      !isUnsupported &&
      isKnownMeasureMetric,
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
