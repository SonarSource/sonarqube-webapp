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

import { useCallback, useMemo } from 'react';
import { MetricKey } from '~shared/types/metrics';
import {
  DashboardMetricType,
  type MeasureFilters,
  RichMetricKey,
  type TopListWidget,
  computeTrendData,
  getActualMetricKey,
  issueCountHistoryRuleToTrend,
  issueCountHistoryToPieCounts,
  issueHistoryQueryExtras,
  issueHistoryTrendStartDate,
  organizationsHistoryStartDateWithRetentionBuffer,
  resolveRichCountTrendMetricMetadata,
} from '../../helpers/dashboard-widget-data';
import {
  resolveIssueHistoryFiltersForMode,
  resolveIssueSoftwareQuality,
} from '../../helpers/dashboard-widget-mode';
import { unsupportedDashboardWidgetAdapter } from '../../helpers/unsupported-dashboard-widget-adapter';
import { useDashboardIssueCountHistoryQuery } from '../../queries/dashboard-history';
import { useStandardExperienceModeQuery } from '../../queries/mode';

export type UseTopListIssueCountDataOptions = {
  enabled?: boolean;
  fetchTrendHistory?: boolean;
};

function topRuleKeysByCount(counts: Record<string, number> | undefined, limit: number): string[] {
  if (counts === undefined) {
    return [];
  }
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, limit)
    .map(([ruleKey]) => ruleKey);
}

export function useTopListIssueCountData(
  widget: TopListWidget,
  entityId: string,
  entityType: 'PORTFOLIO' | 'PROJECT_BRANCH',
  options: UseTopListIssueCountDataOptions = {},
): {
  counts: Record<string, number>;
  getRuleTrendData: (ruleKey: string) => ReturnType<typeof computeTrendData>;
  isError: boolean;
  isPending: boolean;
  topRuleKeys: string[];
} {
  const { enabled = true, fetchTrendHistory = true } = options;
  const { metric } = widget;
  const measureFilters =
    metric.type === DashboardMetricType.Rich ? metric.measureFilters : undefined;
  const richMetricKey =
    metric.type === DashboardMetricType.Rich ? metric.metricKey : RichMetricKey.Issues;
  const isUnsupported = richMetricKey === RichMetricKey.Hotspots;
  const resolvedIssueMetricKey = getActualMetricKey(metric) ?? MetricKey.violations;
  const modeQuery = useStandardExperienceModeQuery({
    enabled: enabled && Boolean(entityId) && !isUnsupported,
  });
  const isModeResolved = !modeQuery.isPending && modeQuery.error == null;
  const issueCountParams = useMemo(
    () => ({
      entityId,
      entityType,
      sliceBy: 'RULE_KEY',
      startDate: organizationsHistoryStartDateWithRetentionBuffer(),
      ...resolveIssueHistoryFiltersForMode(
        issueHistoryQueryExtras(measureFilters, richMetricKey, resolvedIssueMetricKey),
        {
          isStandardMode: modeQuery.data ?? true,
          severities: measureFilters?.impactSeverities,
          softwareQuality: resolveIssueSoftwareQuality(
            measureFilters?.impactSoftwareQuality,
            resolvedIssueMetricKey,
          ),
        },
      ),
    }),
    [entityId, entityType, measureFilters, modeQuery.data, resolvedIssueMetricKey, richMetricKey],
  );
  const queryEnabled = enabled && Boolean(entityId) && !isUnsupported && isModeResolved;
  const countsQuery = useDashboardIssueCountHistoryQuery(issueCountParams, {
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
    select: (response) => issueCountHistoryToPieCounts(response.issueCountHistory),
  });
  const { data: counts } = countsQuery;
  const topRuleKeys = useMemo(
    () => topRuleKeysByCount(counts, widget.limit),
    [counts, widget.limit],
  );
  const trendHistoryParams = useMemo(
    () => ({
      ...issueCountParams,
      ruleKeys: topRuleKeys,
      startDate: issueHistoryTrendStartDate(),
    }),
    [issueCountParams, topRuleKeys],
  );
  const trendQuery = useDashboardIssueCountHistoryQuery(trendHistoryParams, {
    enabled: queryEnabled && fetchTrendHistory && topRuleKeys.length > 0,
    refetchOnWindowFocus: false,
    select: (response) => response.issueCountHistory,
  });
  const metricMetadata = useMemo(
    () => resolveRichCountTrendMetricMetadata(resolvedIssueMetricKey),
    [resolvedIssueMetricKey],
  );
  const getRuleTrendData = useCallback(
    (ruleKey: string) => {
      if (!fetchTrendHistory) {
        return null;
      }
      const historicalValues = issueCountHistoryRuleToTrend(trendQuery.data, ruleKey);
      if (!historicalValues.current || !historicalValues.past) {
        return null;
      }
      return computeTrendData({
        activityUrl: { pathname: '#' },
        currentValue: historicalValues.current,
        measureFilters: measureFilters as MeasureFilters | undefined,
        metric: metricMetadata,
        pastValue: historicalValues.past,
      });
    },
    [fetchTrendHistory, measureFilters, metricMetadata, trendQuery.data],
  );
  const isTrendPending = fetchTrendHistory && topRuleKeys.length > 0 && trendQuery.isPending;

  if (isUnsupported) {
    return unsupportedDashboardWidgetAdapter();
  }

  return {
    counts: counts ?? {},
    getRuleTrendData,
    isError: modeQuery.error != null || countsQuery.isError,
    isPending: modeQuery.isPending || countsQuery.isPending || isTrendPending,
    topRuleKeys,
  };
}
