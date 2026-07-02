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
import { isMainBranch } from '~shared/helpers/branch-like';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import { QGStatus } from '~shared/types/common';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { NewCodeDefinition, NewCodeDefinitionType } from '~shared/types/new-code-definition';
import { AlertStatusHistoryItem, ReleaseAnalysis } from '~shared/types/quality-gate-history';
import { getAllTimeProjectActivity } from '../../api/projectActivity';
import { parseDate } from '../../helpers/dates';
import { useAllMeasuresHistoryQuery } from '../../queries/measures';
import { useBranchesNewCodeDefinitionQuery } from '../../queries/newCodeDefinition';
import { NewCodeDefinitionType as ServerNewCodeDefinitionType } from '../../types/new-code-definition';
import { useProjectBranchesQuery } from './branch';

// Only the version-based definitions map to a shared type; REFERENCE_BRANCH / INHERITED
// intentionally have no entry, so they resolve to `null` (i.e. not a "previous version").
const SERVER_TO_SHARED_TYPE_MAP: Partial<
  Record<ServerNewCodeDefinitionType, NewCodeDefinitionType>
> = {
  [ServerNewCodeDefinitionType.PreviousVersion]: NewCodeDefinitionType.PreviousVersion,
  [ServerNewCodeDefinitionType.NumberOfDays]: NewCodeDefinitionType.NumberOfDays,
  [ServerNewCodeDefinitionType.SpecificAnalysis]: NewCodeDefinitionType.SpecificVersion,
};

/**
 * Fetches all the versions released on the project's main branch (VERSION events).
 */
export const useVersionAnalysesQuery = createQueryHook(({ project }: { project: string }) =>
  queryOptions({
    queryKey: ['quality-gate-history', 'versions', project] as const,
    staleTime: StaleTime.LONG,
    queryFn: () =>
      getAllTimeProjectActivity({ project, category: 'VERSION', p: 1 }).then(({ analyses }) =>
        analyses.map<ReleaseAnalysis>((analysis) => ({
          analysisKey: analysis.key,
          date: parseDate(analysis.date),
          version: analysis.projectVersion,
        })),
      ),
  }),
);

/**
 * Fetches the project's main-branch quality gate status history (`alert_status`),
 * reusing the shared measures-history query and transforming it via `select`.
 */
export function useAlertStatusHistoryQuery(
  { project }: { project: string },
  options?: { enabled?: boolean },
) {
  return useAllMeasuresHistoryQuery(
    { component: project, metrics: MetricKey.alert_status },
    {
      ...options,
      select: (data): AlertStatusHistoryItem[] =>
        (data.measures[0]?.history ?? []).map((item) => ({
          date: parseDate(item.date),
          status: item.value as QGStatus | undefined,
        })),
    },
  );
}

/**
 * Fetches the project-level (main-branch) new code definition, normalized to the shared type.
 * Returns `null` when the definition cannot be mapped to a shared type (unknown / unsupported type).
 */
export const useProjectNewCodeDefinitionQuery = (project: string) => {
  // `new_code_periods/list` is browse-readable (unlike `/show`, which is admin-only), but it is
  // keyed by branch, so we resolve the main branch to pick its entry.
  const branchesQuery = useProjectBranchesQuery({
    key: project,
    qualifier: ComponentQualifier.Project,
  });
  const mainBranch = branchesQuery.data?.find(isMainBranch);

  const ncdQuery = useBranchesNewCodeDefinitionQuery(project, {
    select: (data): NewCodeDefinition | null => {
      const mainBranchDefinition = data.newCodePeriods.find(
        (ncdBranch) => ncdBranch.branchKey === mainBranch?.name,
      );
      const type =
        mainBranchDefinition?.type === undefined
          ? undefined
          : SERVER_TO_SHARED_TYPE_MAP[mainBranchDefinition.type];

      if (!type) {
        return null;
      }

      return { type, value: mainBranchDefinition?.value ?? '', isValid: true };
    },
  });

  // Compose both dependent queries so loading/error reflect the branch resolution too — otherwise
  // a fast NCD response would transiently render as "no main branch" before branches resolve.
  return {
    ...ncdQuery,
    isLoading: ncdQuery.isLoading || branchesQuery.isLoading,
    isError: ncdQuery.isError || branchesQuery.isError,
  };
};
