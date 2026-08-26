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

import { queryOptions, useQueries } from '@tanstack/react-query';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  DashboardIssueHistoryDay,
  DashboardIssueHistoryParams,
  DashboardIssueResolutionHistoryParams,
  DashboardMeasureHistoryDay,
  DashboardMeasuresHistoryParams,
  DashboardProjectIssueCountsParams,
  DashboardProjectMeasuresParams,
  DashboardScaResolutionHistoryParams,
  getDashboardIssueCountHistory,
  getDashboardIssueDensityHistory,
  getDashboardIssueResolutionHistory,
  getDashboardMeasuresHistory,
  getDashboardProjectIssueCounts,
  getDashboardProjectMeasures,
  getDashboardScaResolutionHistory,
} from '../api/dashboard-history';

export interface NormalizedDashboardIssueHistoryDay {
  date: string;
  distribution: { key: string; value: number }[];
}

export interface NormalizedDashboardMeasuresHistoryDay {
  date: string;
  measures: { metric: string; type: string; value: string }[];
}

export interface NormalizedDashboardIssueCountHistoryResponse {
  issueCountHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardIssueDensityHistoryResponse {
  issueDensityHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardIssueResolutionHistoryResponse {
  issueResolutionHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardScaResolutionHistoryResponse {
  scaResolutionHistory: NormalizedDashboardIssueHistoryDay[];
}

export interface NormalizedDashboardMeasuresHistoryResponse {
  measuresHistory: NormalizedDashboardMeasuresHistoryDay[];
}

function normalizeIssueHistoryDay(
  day: DashboardIssueHistoryDay,
): NormalizedDashboardIssueHistoryDay | undefined {
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
  history: DashboardIssueHistoryDay[] | undefined,
): NormalizedDashboardIssueHistoryDay[] {
  return (history ?? []).flatMap((day) => {
    const normalized = normalizeIssueHistoryDay(day);
    return normalized === undefined ? [] : [normalized];
  });
}

function normalizeMeasuresHistoryDay(
  day: DashboardMeasureHistoryDay,
): NormalizedDashboardMeasuresHistoryDay | undefined {
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
  history: DashboardMeasureHistoryDay[] | undefined,
): NormalizedDashboardMeasuresHistoryDay[] {
  return (history ?? []).flatMap((day) => {
    const normalized = normalizeMeasuresHistoryDay(day);
    return normalized === undefined ? [] : [normalized];
  });
}

export const useDashboardIssueCountHistoryQuery = createQueryHook(
  (params: DashboardIssueHistoryParams) =>
    queryOptions({
      queryKey: ['dashboard', 'issue-count-history', params],
      queryFn: async (): Promise<NormalizedDashboardIssueCountHistoryResponse> => {
        const response = await getDashboardIssueCountHistory(params);
        return { issueCountHistory: normalizeIssueHistory(response.issueCountHistory ?? []) };
      },
      staleTime: StaleTime.SHORT,
    }),
);

export const useDashboardIssueDensityHistoryQuery = createQueryHook(
  (params: DashboardIssueHistoryParams) =>
    queryOptions({
      queryKey: ['dashboard', 'issue-density-history', params],
      queryFn: async (): Promise<NormalizedDashboardIssueDensityHistoryResponse> => {
        const response = await getDashboardIssueDensityHistory(params);
        return { issueDensityHistory: normalizeIssueHistory(response.issueDensityHistory ?? []) };
      },
      staleTime: StaleTime.SHORT,
    }),
);

export const useDashboardIssueResolutionHistoryQuery = createQueryHook(
  (params: DashboardIssueResolutionHistoryParams) =>
    queryOptions({
      queryKey: ['dashboard', 'issue-resolution-history', params],
      queryFn: async (): Promise<NormalizedDashboardIssueResolutionHistoryResponse> => {
        const response = await getDashboardIssueResolutionHistory(params);
        return {
          issueResolutionHistory: normalizeIssueHistory(response.issueResolutionHistory ?? []),
        };
      },
      staleTime: StaleTime.SHORT,
    }),
);

export const useDashboardScaResolutionHistoryQuery = createQueryHook(
  (params: DashboardScaResolutionHistoryParams) =>
    queryOptions({
      queryKey: ['dashboard', 'sca-resolution-history', params],
      queryFn: async (): Promise<NormalizedDashboardScaResolutionHistoryResponse> => {
        const response = await getDashboardScaResolutionHistory(params);
        return { scaResolutionHistory: normalizeIssueHistory(response.scaResolutionHistory ?? []) };
      },
      staleTime: StaleTime.SHORT,
    }),
);

export const useDashboardMeasuresHistoryQuery = createQueryHook(
  (params: DashboardMeasuresHistoryParams) =>
    queryOptions({
      queryKey: ['dashboard', 'measures-history', params],
      queryFn: async (): Promise<NormalizedDashboardMeasuresHistoryResponse> => {
        const response = await getDashboardMeasuresHistory(params);
        return { measuresHistory: normalizeMeasuresHistory(response.measuresHistory ?? []) };
      },
      staleTime: StaleTime.SHORT,
    }),
);

export const useDashboardProjectIssueCountsQuery = createQueryHook(
  (params: DashboardProjectIssueCountsParams) =>
    queryOptions({
      queryKey: ['dashboard', 'project-issue-counts', params],
      queryFn: () => getDashboardProjectIssueCounts(params),
      staleTime: StaleTime.SHORT,
    }),
);

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
        queryKey: ['dashboard', 'project-measures', projectMeasuresParams],
        queryFn: () => getDashboardProjectMeasures(projectMeasuresParams),
        enabled: options.enabled ?? true,
        staleTime: StaleTime.SHORT,
      });
    }),
  });
}
