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
  issueHistoryFilterParams,
  lineChartDataToSingleSeries,
  lineChartSinceDate,
  organizationsHistoryStartDateWithRetentionBuffer,
  portfolioIssueCountHistoryLatestTotal,
  portfolioIssueHistoryToLineData,
  portfolioIssueHistoryToSparklineSeries,
  portfolioIssueHistoryToTrend,
  type MeasureFilters,
} from '../../helpers/dashboard-widget-data';
import {
  resolveIssueHistoryFiltersForMode,
  resolveIssueSoftwareQuality,
} from '../../helpers/dashboard-widget-mode';
import { useDashboardIssueDensityHistoryQuery } from '../../queries/dashboard-history';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import type {
  DashboardCountTrendData,
  DashboardEntityType,
  DashboardLineChartSeries,
  DashboardWidgetQueryResult,
} from '../../types/dashboard-widget-adapter-types';

export function useOrgIssueDensityCountWidgetData(params: {
  entityId: string;
  entityType: DashboardEntityType;
  measureFilters?: unknown;
}): DashboardWidgetQueryResult<DashboardCountTrendData> {
  const { entityId, entityType, measureFilters } = params;
  const filters = measureFilters as MeasureFilters | undefined;
  const modeQuery = useStandardExperienceModeQuery({ enabled: Boolean(entityId) });
  const isModeResolved = !modeQuery.isPending && modeQuery.error == null;

  const query = useDashboardIssueDensityHistoryQuery(
    {
      entityId,
      entityType,
      startDate: organizationsHistoryStartDateWithRetentionBuffer(),
      ...resolveIssueHistoryFiltersForMode(issueHistoryFilterParams(filters), {
        isStandardMode: modeQuery.data ?? true,
        severities: filters?.impactSeverities,
        softwareQuality: resolveIssueSoftwareQuality(filters?.impactSoftwareQuality),
      }),
    },
    {
      enabled: Boolean(entityId) && isModeResolved,
      refetchOnWindowFocus: false,
      select: (response): DashboardCountTrendData => ({
        latestValue: portfolioIssueCountHistoryLatestTotal(response.issueDensityHistory),
        sparklineSeries: portfolioIssueHistoryToSparklineSeries(response.issueDensityHistory),
        trend: portfolioIssueHistoryToTrend(response.issueDensityHistory),
      }),
    },
  );

  // A mode failure permanently disables the issue query, which then reports
  // isPending forever. Once the mode has definitively errored, stop reporting
  // pending and surface the error instead of spinning indefinitely.
  const modeFailed = modeQuery.error != null;
  return {
    ...query,
    isError: modeFailed || query.isError,
    isPending: !modeFailed && (modeQuery.isPending || query.isPending),
  };
}

export function useOrgIssueDensityLineChartWidgetData(params: {
  entityId: string;
  entityType: DashboardEntityType;
  historyRange: string;
  measureFilters?: unknown;
  metricName: string;
}): DashboardWidgetQueryResult<DashboardLineChartSeries[]> & { isError: boolean } {
  const { entityId, entityType, historyRange, measureFilters, metricName } = params;
  const filters = measureFilters as MeasureFilters | undefined;
  const modeQuery = useStandardExperienceModeQuery({ enabled: Boolean(entityId) });
  const isModeResolved = !modeQuery.isPending && modeQuery.error == null;

  const query = useDashboardIssueDensityHistoryQuery(
    {
      entityId,
      entityType,
      startDate: lineChartSinceDate(historyRange),
      ...resolveIssueHistoryFiltersForMode(issueHistoryFilterParams(filters), {
        isStandardMode: modeQuery.data ?? true,
        severities: filters?.impactSeverities,
        softwareQuality: resolveIssueSoftwareQuality(filters?.impactSoftwareQuality),
      }),
    },
    {
      enabled: Boolean(entityId) && isModeResolved,
      retry: false,
      select: (response): DashboardLineChartSeries[] =>
        lineChartDataToSingleSeries(
          portfolioIssueHistoryToLineData(response.issueDensityHistory, historyRange),
          metricName,
        ),
    },
  );

  const modeFailed = modeQuery.error != null;
  return {
    ...query,
    isError: modeFailed || query.isError,
    isPending: !modeFailed && (modeQuery.isPending || query.isPending),
  };
}
