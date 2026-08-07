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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type CompanyProfile,
  type Period,
  getBenchmarks,
  getConfiguration,
  getCostSummary,
  getProjectList,
  getSecurityDetail,
  getTrends,
  setConfiguration,
} from '../api/cost-savings-api';

const STALE_TIME = 10 * 60 * 1000; // 10 minutes, matching backend cache TTL

const costSavingsKeys = {
  all: () => ['cost-savings'] as const,
  benchmarks: () => [...costSavingsKeys.all(), 'benchmarks'] as const,
  configuration: () => [...costSavingsKeys.all(), 'configuration'] as const,
  projects: () => [...costSavingsKeys.all(), 'projects'] as const,
  securityDetail: (projectKeys?: string[]) =>
    [...costSavingsKeys.all(), 'security-detail', projectKeys ?? 'all'] as const,
  summary: (period: Period, projectKeys?: string[]) =>
    [...costSavingsKeys.all(), 'summary', period, projectKeys ?? 'all'] as const,
  trends: (months: number, projectKeys?: string[]) =>
    [...costSavingsKeys.all(), 'trends', months, projectKeys ?? 'all'] as const,
};

export function useCostSummaryQuery(period: Period, projectKeys?: string[]) {
  return useQuery({
    queryFn: () => getCostSummary(period, projectKeys),
    queryKey: costSavingsKeys.summary(period, projectKeys),
    staleTime: STALE_TIME,
  });
}

export function useSecurityDetailQuery(projectKeys?: string[]) {
  return useQuery({
    queryFn: () => getSecurityDetail(projectKeys),
    queryKey: costSavingsKeys.securityDetail(projectKeys),
    staleTime: STALE_TIME,
  });
}

export function useTrendsQuery(months = 12, projectKeys?: string[]) {
  return useQuery({
    queryFn: () => getTrends(months, projectKeys),
    queryKey: costSavingsKeys.trends(months, projectKeys),
    staleTime: STALE_TIME,
  });
}

export function useProjectListQuery() {
  return useQuery({
    queryFn: getProjectList,
    queryKey: costSavingsKeys.projects(),
    staleTime: STALE_TIME,
  });
}

export function useConfigurationQuery() {
  return useQuery({
    queryFn: getConfiguration,
    queryKey: costSavingsKeys.configuration(),
    staleTime: STALE_TIME,
  });
}

export function useBenchmarksQuery() {
  return useQuery({
    queryFn: getBenchmarks,
    queryKey: costSavingsKeys.benchmarks(),
    staleTime: STALE_TIME,
  });
}

export function useConfigurationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: CompanyProfile) => setConfiguration(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: costSavingsKeys.all() });
    },
  });
}
