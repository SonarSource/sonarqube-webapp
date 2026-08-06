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

import { unsupportedDashboardWidgetAdapter } from '../helpers/unsupported-dashboard-widget-adapter';

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
  _portfolioId: string,
  _options?: { enabled?: boolean },
): {
  data: PortfolioMeasures | undefined;
  isLoading: boolean;
  isPending: boolean;
} {
  return unsupportedDashboardWidgetAdapter();
}

export function usePortfolioRatingBadgeComputedMeasuresQuery(
  _params: PortfolioComputedProjectMeasuresParams,
  _options?: { enabled?: boolean },
): {
  data: { projects: PortfolioComputedProject[] } | undefined;
  isPending: boolean;
} {
  return unsupportedDashboardWidgetAdapter();
}
