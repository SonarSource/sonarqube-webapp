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

import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import type { Measure } from '~shared/types/measures';
import { useComponent } from '../../context/componentContext/withComponentContext';
import { extractStatusConditionsFromProjectStatus } from '../../helpers/quality-gates';
import { useProjectQualityGateStatus } from '../../queries/quality-gates';
import type { BranchLike } from '../../types/branch-like';
import { useCurrentBranchQuery } from './branch';
import { useMeasuresComponentQuery } from './measures';

interface QualityGateStatusCondition {
  actual?: string;
  error?: string;
  level: string;
  metric: string;
  op: string;
  period?: number;
}

export function useProjectRatingBadgeMeasuresQuery(
  params: { component: string; metricKeys: string },
  options?: { enabled?: boolean },
): { data: Measure[] | undefined; isLoading: boolean } {
  const { component } = useComponent();
  const branchQuery = useCurrentBranchQuery(component);
  const enabled = options?.enabled ?? true;
  const measuresQuery = useMeasuresComponentQuery(
    {
      branchLike: branchQuery.data,
      componentKey: params.component,
      metricKeys: params.metricKeys.split(',').filter(Boolean),
    },
    { enabled: enabled && !branchQuery.isPending },
  );

  return {
    data: measuresQuery.data?.component.measures,
    isLoading: enabled && (branchQuery.isPending || measuresQuery.isLoading),
  };
}

export function useProjectQualityGateStatusWidgetQuery(
  projectKey: string,
  branchLike?: unknown,
  options?: { enabled?: boolean },
): {
  data:
    | {
        conditions: QualityGateStatusCondition[];
        ignoredConditions: boolean;
        status: string;
      }
    | undefined;
  isLoading: boolean;
} {
  const { component } = useComponent();
  const currentBranchQuery = useCurrentBranchQuery(component);
  const enabled = options?.enabled ?? true;
  const selectedBranchLike = (branchLike ?? currentBranchQuery.data) as BranchLike | undefined;
  const statusQuery = useProjectQualityGateStatus(
    {
      branchParameters: getBranchLikeQuery(selectedBranchLike),
      projectKey,
    },
    { enabled: enabled && (branchLike !== undefined || !currentBranchQuery.isPending) },
  );

  return {
    data:
      statusQuery.data === undefined
        ? undefined
        : {
            conditions: extractStatusConditionsFromProjectStatus(statusQuery.data),
            ignoredConditions: statusQuery.data.ignoredConditions,
            status: statusQuery.data.status,
          },
    isLoading:
      enabled &&
      ((branchLike === undefined && currentBranchQuery.isPending) || statusQuery.isLoading),
  };
}
