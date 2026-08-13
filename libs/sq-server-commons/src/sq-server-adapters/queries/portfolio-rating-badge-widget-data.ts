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

import { useMemo } from 'react';
import {
  useDashboardMeasuresHistoryQuery,
  useDashboardProjectMeasuresQueries,
} from '../../queries/dashboard-history';
import {
  organizationsHistoryStartDateWithRetentionBuffer,
  portfolioMeasuresLatestRecord,
} from '../helpers/dashboard-widget-data';
import { useWidgetMetricMetadataQuery } from './widget-metric-metadata';

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

type PortfolioMeasures = Record<string, string | number | Record<string, number>>;

export function usePortfolioRatingBadgeMeasuresQuery(
  portfolioId: string,
  options: { enabled?: boolean } = {},
): {
  data: PortfolioMeasures | undefined;
  isLoading: boolean;
  isPending: boolean;
} {
  const enabled = options.enabled ?? true;
  const metadataQuery = useWidgetMetricMetadataQuery({ enabled });
  const metricMetadata = metadataQuery.data;
  const metricKeys = useMemo(() => Object.keys(metricMetadata ?? {}), [metricMetadata]);
  const historyQuery = useDashboardMeasuresHistoryQuery(
    {
      entityId: portfolioId,
      entityType: 'PORTFOLIO',
      metricKeys,
      startDate: organizationsHistoryStartDateWithRetentionBuffer(),
    },
    {
      enabled: enabled && Boolean(portfolioId) && metricKeys.length > 0,
      refetchOnWindowFocus: false,
      select: (response) => portfolioMeasuresLatestRecord(response.measuresHistory, metricMetadata),
    },
  );

  const isPending =
    enabled && (metadataQuery.isPending || (metricKeys.length > 0 && historyQuery.isPending));

  return {
    data: historyQuery.data,
    isLoading: isPending,
    isPending,
  };
}

export function usePortfolioRatingBadgeComputedMeasuresQuery(
  params: PortfolioComputedProjectMeasuresParams,
  options: { enabled?: boolean } = {},
): {
  data: { projects: PortfolioComputedProject[] } | undefined;
  isPending: boolean;
} {
  const isFilterSupported =
    params.filterMetric === undefined ||
    (params.metrics.length === 1 && params.filterMetric === params.metrics[0]);
  const enabled = (options.enabled ?? true) && Boolean(params.portfolioId) && isFilterSupported;
  const queries = useDashboardProjectMeasuresQueries(
    {
      entityType: undefined,
      entityId: undefined,
      metrics: params.metrics,
      nameContains: undefined,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      portfolioId: params.portfolioId,
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
    isPending: enabled && queries.some((query) => query.isPending),
  };
}
