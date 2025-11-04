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

import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { Measure } from '~shared/types/measures';
import { getMeasuresWithPeriodAndMetrics } from '../../api/measures';
import { BranchLike } from '../../types/branch-like';

export const useMeasuresComponentQuery = createQueryHook(
  ({
    componentKey,
    metricKeys,
    branchLike,
  }: {
    branchLike?: BranchLike;
    componentKey: string;
    metricKeys: string[];
  }) => {
    const queryClient = useQueryClient();
    const branchLikeQuery = getBranchLikeQuery(branchLike);

    return queryOptions({
      queryKey: [
        'measures',
        'component',
        componentKey,
        'branchLike',
        { ...branchLikeQuery },
        metricKeys,
      ],
      queryFn: async () => {
        const data = await getMeasuresWithPeriodAndMetrics(
          componentKey,
          metricKeys,
          branchLikeQuery,
        );
        metricKeys.forEach((metricKey) => {
          const measure =
            data.component.measures?.find((measure) => measure.metric === metricKey) ?? null;
          queryClient.setQueryData<Measure | null>(
            ['measures', 'details', componentKey, 'branchLike', { ...branchLikeQuery }, metricKey],
            measure,
          );
        });

        return data;
      },
      staleTime: StaleTime.LONG,
    });
  },
);
