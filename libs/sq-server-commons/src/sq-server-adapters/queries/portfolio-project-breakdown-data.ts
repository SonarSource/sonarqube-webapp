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
  PortfolioProjectIssueCountsParams,
  PortfolioProjectMeasuresParams,
} from '~shared/types/portfolio-project-breakdown';
import type {
  DashboardProjectIssueCountsParams,
  DashboardProjectMeasuresParams,
} from '../../api/dashboard-history';
import { resolveIssueHistoryFiltersForMode } from '../../helpers/dashboard-widget-mode';
import {
  useDashboardProjectIssueCountsQuery,
  useDashboardProjectMeasureQuery,
} from '../../queries/dashboard-history';
import { useStandardExperienceModeQuery } from '../../queries/mode';

export function usePortfolioProjectIssueCountsQuery(
  params: PortfolioProjectIssueCountsParams,
  options: { enabled?: boolean } = {},
) {
  const { portfolioId, sort, ...filters } = params;
  const modeQuery = useStandardExperienceModeQuery({ enabled: options.enabled !== false });
  const isModeResolved = !modeQuery.isPending && modeQuery.error == null;
  const serverParams: DashboardProjectIssueCountsParams = {
    ...resolveIssueHistoryFiltersForMode(filters, {
      isStandardMode: modeQuery.data ?? true,
    }),
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    sort: sort?.split(','),
  };

  const query = useDashboardProjectIssueCountsQuery(serverParams, {
    ...options,
    enabled: options.enabled !== false && isModeResolved,
  });

  return {
    ...query,
    error: modeQuery.error ?? query.error,
    isError: modeQuery.error != null || query.isError,
    isPending: modeQuery.isPending || (isModeResolved && query.isPending),
  };
}

export function usePortfolioProjectMeasuresQuery(
  params: PortfolioProjectMeasuresParams,
  options: { enabled?: boolean } = {},
) {
  const { portfolioId, sort, ...filters } = params;
  const serverParams: DashboardProjectMeasuresParams = {
    ...filters,
    entityId: portfolioId,
    entityType: 'PORTFOLIO',
    sort: sort?.split(','),
  };

  return useDashboardProjectMeasureQuery(serverParams, options);
}
