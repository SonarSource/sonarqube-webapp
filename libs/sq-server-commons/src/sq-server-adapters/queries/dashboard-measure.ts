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

import { useQuery } from '@tanstack/react-query';
import { getMetricKeyForScope } from '~shared/helpers/metrics';
import { StaleTime } from '~shared/queries/common';
import { MetricKey } from '~shared/types/metrics';
import {
  getDashboardIssueCountHistoryData,
  getDashboardIssueDensityHistoryData,
  getDashboardIssueResolutionHistoryData,
  getDashboardMeasuresHistoryData,
  getDashboardScaResolutionHistoryData,
} from '../../api/dashboard-history';
import { dashboardHistoryDateRange } from '../../helpers/dashboard-widget-data';
import {
  resolveIssueHistoryDistributionKeyForMode,
  resolveIssueHistoryFiltersForMode,
  resolveIssueHistorySliceForMode,
  resolvePortfolioDashboardMetricKey,
} from '../../helpers/dashboard-widget-mode';
import { useStandardExperienceModeQuery } from '../../queries/mode';

interface DashboardIssueFilters {
  impacts?: string[];
  issueTypes?: string[];
  ruleKeys?: string[];
  severities?: string[];
  statuses?: string[];
}

type DashboardMeasure =
  | {
      api: 'measures-history';
      metricKey: MetricKey;
      scope: 'new' | 'overall';
    }
  | (DashboardIssueFilters & {
      api: 'issue-count-history';
      metricKey: MetricKey;
      sliceBy?: string;
    })
  | (DashboardIssueFilters & {
      api: 'issue-resolution-history';
      statistic: 'MTTR' | 'RECENT_MTTR' | 'RESOLVED_ISSUES';
    })
  | (DashboardIssueFilters & { api: 'issue-density-history' })
  | {
      api: 'sca-resolution-history';
      severities?: string[];
      statistic: 'SCA_MTTR';
    };

interface DashboardMeasureQueryInput {
  entityId: string;
  entityType: 'PORTFOLIO' | 'PROJECT_BRANCH';
  measure: DashboardMeasure;
  months?: number;
}

function issueFilters(measure: DashboardIssueFilters) {
  const { impacts, issueTypes, ruleKeys, severities, statuses } = measure;
  return { impacts, issueTypes, ruleKeys, severities, statuses };
}

function sortHistory<T extends { date: string }>(history: T[]): T[] {
  return [...history].sort((left, right) => Date.parse(left.date) - Date.parse(right.date));
}

function dashboardMeasureQueryDefinitionForMode(
  input: Readonly<DashboardMeasureQueryInput>,
  isStandardMode: boolean,
) {
  const { entityId, entityType, measure, months } = input;
  const normalizedMonths = months ?? 0;
  const isSnapshot = normalizedMonths === 0;
  const dateRange = dashboardHistoryDateRange(months);
  const historyForDuration = <T extends { date: string }>(history: T[]): T[] => {
    const sortedHistory = sortHistory(history);
    return isSnapshot ? sortedHistory.slice(-1) : sortedHistory;
  };
  const resolvedIssueFilters = (issueMeasure: DashboardIssueFilters) =>
    resolveIssueHistoryFiltersForMode(issueFilters(issueMeasure), {
      isStandardMode,
    });

  return {
    queryKey: ['dashboard-measure', entityType, entityId, measure, normalizedMonths],
    queryFn: async () => {
      switch (measure.api) {
        case 'measures-history': {
          const canonicalMetricKey = getMetricKeyForScope(
            measure.metricKey,
            measure.scope === 'new',
          );
          const requestedMetricKey = resolvePortfolioDashboardMetricKey(
            canonicalMetricKey,
            isStandardMode,
          );
          return {
            api: measure.api,
            history: historyForDuration(
              (
                await getDashboardMeasuresHistoryData({
                  entityId,
                  entityType,
                  ...dateRange,
                  metricKeys: [requestedMetricKey],
                })
              ).map((day) => ({
                ...day,
                measures: day.measures.map((entry) => ({
                  ...entry,
                  metric: entry.metric === requestedMetricKey ? canonicalMetricKey : entry.metric,
                })),
              })),
            ),
          };
        }
        case 'issue-count-history': {
          const canonicalSliceBy = measure.sliceBy;
          return {
            api: measure.api,
            history: historyForDuration(
              (
                await getDashboardIssueCountHistoryData({
                  entityId,
                  entityType,
                  ...dateRange,
                  ...resolvedIssueFilters(measure),
                  sliceBy: resolveIssueHistorySliceForMode(canonicalSliceBy, isStandardMode),
                })
              ).map((day) => ({
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
          };
        }
        case 'issue-resolution-history':
          return {
            api: measure.api,
            history: historyForDuration(
              await getDashboardIssueResolutionHistoryData({
                entityId,
                entityType,
                ...dateRange,
                statistic: measure.statistic,
                ...resolvedIssueFilters(measure),
              }),
            ),
          };
        case 'issue-density-history':
          return {
            api: measure.api,
            history: historyForDuration(
              await getDashboardIssueDensityHistoryData({
                entityId,
                entityType,
                ...dateRange,
                ...resolvedIssueFilters(measure),
              }),
            ),
          };
        case 'sca-resolution-history':
          return {
            api: measure.api,
            history: historyForDuration(
              await getDashboardScaResolutionHistoryData({
                entityId,
                entityType,
                ...dateRange,
                severities: measure.severities,
                statistic: measure.statistic,
              }),
            ),
          };
      }
    },
  };
}

function dashboardMeasureQueryOptions(
  input: Readonly<DashboardMeasureQueryInput>,
  isStandardMode = false,
) {
  return {
    ...dashboardMeasureQueryDefinitionForMode(input, isStandardMode),
    staleTime: StaleTime.SHORT,
  };
}

export function useDashboardMeasureQuery(
  input: Readonly<DashboardMeasureQueryInput>,
  enabled = true,
) {
  const modeQuery = useStandardExperienceModeQuery({ enabled });
  const isStandardMode = modeQuery.data ?? false;
  const options = dashboardMeasureQueryOptions(input, isStandardMode);
  return useQuery({
    ...options,
    queryKey: [...options.queryKey, isStandardMode],
    queryFn: async () => {
      if (modeQuery.error) {
        throw modeQuery.error;
      }
      return options.queryFn();
    },
    enabled: enabled && !modeQuery.isPending,
  });
}
