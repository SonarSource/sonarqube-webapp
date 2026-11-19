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

import { queryOptions, useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import memoizeOne from 'memoize-one';
import { useMemo } from 'react';
import { getMetricKeyForScope } from '~shared/helpers/metrics';
import { sortDashboardHistory } from '~shared/helpers/dashboard-history';
import { StaleTime } from '~shared/queries/common';
import type {
  DashboardIssueFilters,
  DashboardMeasureHistory,
  DashboardMeasureQueryInput,
  DashboardMeasureQueryOptions,
} from '~shared/types/dashboard-history';
import {
  getDashboardIssueCountHistoryQueryOptions,
  getDashboardIssueDensityHistoryQueryOptions,
  getDashboardIssueResolutionHistoryQueryOptions,
  getDashboardMeasuresHistoryQueryOptions,
  getDashboardScaResolutionHistoryQueryOptions,
} from '../../queries/dashboard-history';
import { dashboardHistoryDateRange } from '../../helpers/dashboard-widget-data';
import {
  resolveIssueHistoryDistributionKeyForMode,
  resolveIssueHistoryFiltersForMode,
  resolveIssueHistorySliceForMode,
  resolvePortfolioDashboardMetricKey,
} from '../../helpers/dashboard-widget-mode';
import { useStandardExperienceModeQuery } from '../../queries/mode';

function issueFilters(measure: DashboardIssueFilters) {
  const { impacts, issueTypes, ruleKeys, severities, statuses } = measure;
  return { impacts, issueTypes, ruleKeys, severities, statuses };
}

function dashboardMeasureQueryOptions(
  input: Readonly<DashboardMeasureQueryInput>,
  isStandardMode: boolean,
  enabled: boolean,
  dateRange: ReturnType<typeof dashboardHistoryDateRange>,
): DashboardMeasureQueryOptions {
  const { entityId, entityType, measure, months } = input;
  const entity = { entityId, entityType, ...dateRange };
  const historyForDuration = <T extends { date: string }>(history: T[]): T[] => {
    const sorted = sortDashboardHistory(history);
    return (months ?? 0) === 0 ? sorted.slice(-1) : sorted;
  };
  const resolvedIssueFilters = (issueMeasure: DashboardIssueFilters) =>
    resolveIssueHistoryFiltersForMode(issueFilters(issueMeasure), { isStandardMode });
  switch (measure.api) {
    case 'measures-history': {
      const canonicalMetricKey = getMetricKeyForScope(measure.metricKey, measure.scope === 'new');
      const requestedMetricKey = resolvePortfolioDashboardMetricKey(
        canonicalMetricKey,
        isStandardMode,
      );
      return getDashboardMeasuresHistoryQueryOptions(
        { ...entity, metricKeys: [requestedMetricKey] },
        {
          enabled,
          select: (data): DashboardMeasureHistory => ({
            api: measure.api,
            history: historyForDuration(
              data.measuresHistory.map((day) => ({
                ...day,
                measures: day.measures.map((entry) => ({
                  ...entry,
                  metric: entry.metric === requestedMetricKey ? canonicalMetricKey : entry.metric,
                })),
              })),
            ),
          }),
        },
      );
    }
    case 'issue-count-history': {
      const canonicalSliceBy = measure.sliceBy;
      return getDashboardIssueCountHistoryQueryOptions(
        {
          ...entity,
          ...resolvedIssueFilters(measure),
          sliceBy: resolveIssueHistorySliceForMode(canonicalSliceBy, isStandardMode),
        },
        {
          enabled,
          select: (data): DashboardMeasureHistory => ({
            api: measure.api,
            history: historyForDuration(
              data.issueCountHistory.map((day) => ({
                ...day,
                distribution: day.distribution.map((entry) => ({
                  ...entry,
                  key: resolveIssueHistoryDistributionKeyForMode(
                    entry.key,
                    canonicalSliceBy,
                    isStandardMode,
                  ),
                })),
              })),
            ),
          }),
        },
      );
    }
    case 'issue-resolution-history':
      return getDashboardIssueResolutionHistoryQueryOptions(
        {
          ...entity,
          ...resolvedIssueFilters(measure),
          statistic: measure.statistic,
        },
        {
          enabled,
          select: (data): DashboardMeasureHistory => ({
            api: measure.api,
            history: historyForDuration(data.issueResolutionHistory),
          }),
        },
      );
    case 'issue-density-history':
      return getDashboardIssueDensityHistoryQueryOptions(
        {
          ...entity,
          ...resolvedIssueFilters(measure),
        },
        {
          enabled,
          select: (data): DashboardMeasureHistory => ({
            api: measure.api,
            history: historyForDuration(data.issueDensityHistory),
          }),
        },
      );
    case 'sca-resolution-history':
      return getDashboardScaResolutionHistoryQueryOptions(
        {
          ...entity,
          severities: measure.severities,
          statistic: measure.statistic,
        },
        {
          enabled,
          select: (data): DashboardMeasureHistory => ({
            api: measure.api,
            history: historyForDuration(data.scaResolutionHistory),
          }),
        },
      );
  }
}

export function useDashboardMeasureQuery(
  input: Readonly<DashboardMeasureQueryInput>,
  enabled = true,
) {
  const getQueryOptions = useMemo(() => memoizeOne(dashboardMeasureQueryOptions, isEqual), []);
  const dateRange = dashboardHistoryDateRange(input.months);
  const modeQuery = useStandardExperienceModeQuery({ enabled });
  const queryEnabled = enabled && !modeQuery.isPending;
  const options: DashboardMeasureQueryOptions = modeQuery.error
    ? queryOptions({
        queryKey: ['dashboard-measure', 'mode-error', input],
        queryFn: () => Promise.reject<DashboardMeasureHistory>(modeQuery.error),
        staleTime: StaleTime.SHORT,
        enabled: queryEnabled,
      })
    : getQueryOptions(input, modeQuery.data ?? false, queryEnabled, dateRange);
  return useQuery(options);
}
