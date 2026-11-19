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

import type {
  OrganizationsIssueCountHistoryDay,
  OrganizationsMeasuresHistoryDay,
  IssueCountHistoryResponse,
  MeasuresHistoryResponse,
} from '~shared/types/dashboard-history';
import { queryOptions, useQueries } from '@tanstack/react-query';
import { createQueryHook, createQueryOptions, StaleTime } from '~shared/queries/common';
import {
  getIssueCountHistory,
  getIssueDensityHistory,
  getIssueResolutionHistory,
  getMeasuresHistory,
  getProjectIssueCounts,
  getProjectMeasures,
  type IssueCountHistory,
  type MeasureHistoryItem,
} from '~sq-server-openapi-community';
import { getDashboardScaResolutionHistory } from '../api/dashboard-history';
import type {
  DashboardIssueHistoryParams,
  DashboardIssueResolutionHistoryParams,
  DashboardMeasuresHistoryParams,
  DashboardProjectIssueCountsParams,
  DashboardProjectMeasuresParams,
  DashboardScaResolutionHistoryParams,
} from '../types/dashboard-history';

function normalizeIssueHistoryDay(
  day: IssueCountHistory,
): OrganizationsIssueCountHistoryDay | undefined {
  if (!day.date) {
    return undefined;
  }

  return {
    date: day.date,
    distribution: (day.distribution ?? []).flatMap((entry) =>
      entry.key != null && entry.value != null ? [{ key: entry.key, value: entry.value }] : [],
    ),
  };
}

function normalizeIssueHistory(
  history: IssueCountHistory[] | undefined,
): OrganizationsIssueCountHistoryDay[] {
  return (history ?? []).flatMap((day) => {
    const normalized = normalizeIssueHistoryDay(day);
    return normalized === undefined ? [] : [normalized];
  });
}

function normalizeMeasuresHistoryDay(
  day: MeasureHistoryItem,
): OrganizationsMeasuresHistoryDay | undefined {
  if (!day.date) {
    return undefined;
  }

  return {
    date: day.date,
    measures: (day.measures ?? []).flatMap((measure) =>
      measure.metric != null && measure.value != null
        ? [{ metric: measure.metric, type: measure.type ?? '', value: measure.value }]
        : [],
    ),
  };
}

function normalizeMeasuresHistory(
  history: MeasureHistoryItem[] | undefined,
): OrganizationsMeasuresHistoryDay[] {
  return (history ?? []).flatMap((day) => {
    const normalized = normalizeMeasuresHistoryDay(day);
    return normalized === undefined ? [] : [normalized];
  });
}

export const getDashboardIssueCountHistoryQueryOptions = createQueryOptions(
  (params: DashboardIssueHistoryParams) => {
    return queryOptions({
      queryKey: ['dashboard', 'issue-count-history', params],
      queryFn: async (): Promise<IssueCountHistoryResponse> => ({
        issueCountHistory: normalizeIssueHistory(
          (
            await getIssueCountHistory({
              query: params as Parameters<typeof getIssueCountHistory>[0]['query'],
            })
          ).data.issueCountHistory,
        ),
      }),
      staleTime: StaleTime.SHORT,
    });
  },
);

export const getDashboardMeasuresHistoryQueryOptions = createQueryOptions(
  (params: DashboardMeasuresHistoryParams) => {
    return queryOptions({
      queryKey: ['dashboard', 'measures-history', params],
      queryFn: async (): Promise<MeasuresHistoryResponse> => ({
        measuresHistory: normalizeMeasuresHistory(
          (
            await getMeasuresHistory({
              query: params,
            })
          ).data.measuresHistory,
        ),
      }),
      staleTime: StaleTime.SHORT,
    });
  },
);

export const getDashboardIssueDensityHistoryQueryOptions = createQueryOptions(
  (params: DashboardIssueHistoryParams) => {
    return queryOptions({
      queryKey: ['dashboard', 'issue-density-history', params],
      queryFn: async () => ({
        issueDensityHistory: normalizeIssueHistory(
          (
            await getIssueDensityHistory({
              query: params as Parameters<typeof getIssueDensityHistory>[0]['query'],
            })
          ).data.issueDensityHistory,
        ),
      }),
      staleTime: StaleTime.SHORT,
    });
  },
);

export const getDashboardIssueResolutionHistoryQueryOptions = createQueryOptions(
  (params: DashboardIssueResolutionHistoryParams) => {
    return queryOptions({
      queryKey: ['dashboard', 'issue-resolution-history', params],
      queryFn: async () => ({
        issueResolutionHistory: normalizeIssueHistory(
          (
            await getIssueResolutionHistory({
              query: params as Parameters<typeof getIssueResolutionHistory>[0]['query'],
            })
          ).data.issueResolutionHistory,
        ),
      }),
      staleTime: StaleTime.SHORT,
    });
  },
);

export const getDashboardScaResolutionHistoryQueryOptions = createQueryOptions(
  (params: DashboardScaResolutionHistoryParams) => {
    return queryOptions({
      queryKey: ['dashboard', 'sca-resolution-history', params],
      queryFn: async () => ({
        scaResolutionHistory: normalizeIssueHistory(
          (await getDashboardScaResolutionHistory(params)).scaResolutionHistory,
        ),
      }),
      staleTime: StaleTime.SHORT,
    });
  },
);

export const useDashboardProjectIssueCountsQuery = createQueryHook(
  (params: DashboardProjectIssueCountsParams) =>
    queryOptions({
      queryKey: ['dashboard', 'project-issue-counts', params],
      queryFn: () =>
        getProjectIssueCounts({
          query: params as NonNullable<Parameters<typeof getProjectIssueCounts>[0]>['query'],
        }).then(({ data }) => data),
      staleTime: StaleTime.SHORT,
    }),
);

function dashboardProjectMeasureQueryOptions(params: DashboardProjectMeasuresParams) {
  return queryOptions({
    queryKey: ['dashboard', 'project-measures', params],
    queryFn: () =>
      getProjectMeasures({
        query: params,
      }).then(({ data }) => data),
    staleTime: StaleTime.SHORT,
  });
}

export const useDashboardProjectMeasureQuery = createQueryHook(dashboardProjectMeasureQueryOptions);

export function useDashboardProjectMeasuresQuery(
  params: Omit<DashboardProjectMeasuresParams, 'metricKey'> & { metrics: string[] },
  options: { enabled?: boolean } = {},
) {
  const { metrics, ...sharedParams } = params;
  return useQueries({
    queries: metrics.map((metricKey) => {
      const projectMeasuresParams: DashboardProjectMeasuresParams = {
        ...sharedParams,
        metricKey,
      };
      return queryOptions({
        ...dashboardProjectMeasureQueryOptions(projectMeasuresParams),
        enabled: options.enabled ?? true,
        staleTime: StaleTime.SHORT,
      });
    }),
  });
}
