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

import { queryOptions } from '@tanstack/react-query';
import { keyBy } from 'lodash';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { getAllMetrics } from '../../api/metrics';
import type { DashboardWidgetQueryResult } from '../../types/dashboard-widget-adapter-types';

interface PortfolioWidgetMetricMetadata {
  metrics: Array<{ direction: string; key: string; type: string }>;
}

export const useWidgetMetricMetadataQuery = createQueryHook(() =>
  queryOptions({
    queryKey: ['metrics', 'dashboard-widget'],
    queryFn: async () => keyBy(await getAllMetrics(), 'key'),
    staleTime: StaleTime.NEVER,
  }),
);

export function usePortfolioWidgetMetricMetadataQuery(): DashboardWidgetQueryResult<PortfolioWidgetMetricMetadata> {
  const { data: metrics, isPending } = useWidgetMetricMetadataQuery();

  return {
    data:
      metrics === undefined
        ? undefined
        : {
            metrics: Object.values(metrics).map((metric) => ({
              direction: String(metric.direction ?? 0),
              key: metric.key,
              type: metric.type,
            })),
          },
    isPending,
  };
}
