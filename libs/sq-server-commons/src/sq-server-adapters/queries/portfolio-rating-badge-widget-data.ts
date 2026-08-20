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
import { SOFTWARE_QUALITY_RATING_METRICS_MAP } from '../../helpers/constants';
import {
  adaptServerReleasabilityDistribution,
  organizationsHistoryStartDateWithRetentionBuffer,
  portfolioMeasuresLatestRecord,
} from '../../helpers/dashboard-widget-data';
import {
  useDashboardMeasuresHistoryQuery,
  useDashboardProjectMeasuresQuery,
} from '../../queries/dashboard-history';
import { useStandardExperienceModeQuery } from '../../queries/mode';

interface PortfolioComputedProject {
  measures: ReadonlyArray<{ name: string; value: string }>;
}

interface PortfolioComputedProjectMeasuresParams {
  filterMetric?: string;
  filterMetricValue?: string;
  metrics: string[];
  pageIndex?: number;
  pageSize?: number;
  portfolioId: string;
  sort?: string;
}

function resolvePortfolioMetricKey(metricKey: string, isStandardMode: boolean): string {
  const serverHistoryMetricKey =
    metricKey === MetricKey.releasability_status_distribution
      ? MetricKey.releasability_rating_distribution
      : metricKey;
  const standardMetricKey =
    serverHistoryMetricKey === MetricKey.maintainability_rating
      ? MetricKey.sqale_rating
      : serverHistoryMetricKey;
  return isStandardMode
    ? standardMetricKey
    : (SOFTWARE_QUALITY_RATING_METRICS_MAP[standardMetricKey] ?? standardMetricKey);
}

function resolvePortfolioMetricKeys(metricKeys: string[], isStandardMode: boolean): string[] {
  return metricKeys.map((metricKey) => resolvePortfolioMetricKey(metricKey, isStandardMode));
}

export function usePortfolioRatingBadgeMetricKeysQuery(metricKeys: string[]): {
  error: unknown;
  isPending: boolean;
  metricKeys: string[];
} {
  const modeQuery = useStandardExperienceModeQuery();
  return {
    error: modeQuery.error,
    isPending: modeQuery.isPending,
    metricKeys: resolvePortfolioMetricKeys(metricKeys, modeQuery.data ?? true),
  };
}

export function usePortfolioRatingBadgeMeasuresQuery(
  portfolioId: string,
  options: { enabled?: boolean; metricKeys: string[] },
) {
  const { enabled = true, metricKeys } = options;
  return useDashboardMeasuresHistoryQuery(
    {
      entityId: portfolioId,
      entityType: 'PORTFOLIO',
      metricKeys,
      startDate: organizationsHistoryStartDateWithRetentionBuffer(),
    },
    {
      enabled: enabled && Boolean(portfolioId) && metricKeys.length > 0,
      refetchOnWindowFocus: false,
      select: (response) =>
        adaptServerReleasabilityDistribution(
          portfolioMeasuresLatestRecord(response.measuresHistory),
        ),
    },
  );
}

export function usePortfolioRatingBadgeComputedMeasuresQuery(
  params: PortfolioComputedProjectMeasuresParams,
  options: { enabled?: boolean } = {},
): {
  data: { projects: PortfolioComputedProject[] } | undefined;
  error: unknown;
  isPending: boolean;
} {
  const isFilterSupported =
    params.filterMetric === undefined ||
    (params.metrics.length === 1 && params.filterMetric === params.metrics[0]);
  const enabled = (options.enabled ?? true) && Boolean(params.portfolioId) && isFilterSupported;
  const queries = useDashboardProjectMeasuresQuery(
    {
      entityType: 'PORTFOLIO',
      entityId: params.portfolioId,
      metrics: params.metrics,
      nameContains: undefined,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      metricValue: params.filterMetricValue,
      referenceDate: undefined,
      requireValue: false,
      sort: params.sort === undefined ? undefined : [params.sort],
    },
    { enabled },
  );

  const projectsByBranchId = new Map<string, PortfolioComputedProject>();
  queries.forEach((query) => {
    query.data?.projectMeasures.forEach((projectMeasure) => {
      const project = projectsByBranchId.get(projectMeasure.branchId) ?? { measures: [] };
      project.measures = [
        ...project.measures,
        {
          name: projectMeasure.measure.metric,
          value: projectMeasure.measure.currentValue ?? '',
        },
      ];
      projectsByBranchId.set(projectMeasure.branchId, project);
    });
  });

  return {
    data:
      queries.length > 0 && queries.every((query) => query.data !== undefined)
        ? { projects: [...projectsByBranchId.values()] }
        : undefined,
    error: queries.find((query) => query.error != null)?.error,
    isPending: enabled && queries.some((query) => query.isPending),
  };
}
