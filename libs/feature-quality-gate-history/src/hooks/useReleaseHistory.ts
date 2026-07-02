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
  useAlertStatusHistoryQuery,
  useProjectNewCodeDefinitionQuery,
  useVersionAnalysesQuery,
} from '~adapters/queries/quality-gate-history';
import { NewCodeDefinitionType } from '~shared/types/new-code-definition';
import { Release } from '../types';
import { joinReleases } from '../utils';

export interface ReleaseHistoryResult {
  /** Whether the project's main-branch new code definition is "Previous version". */
  isPreviousVersion: boolean;
  isLoading: boolean;
  /** All releases across all time, sorted ascending by date, with their quality gate verdict. */
  releases: Release[];
  isError: boolean;
}

export function useReleaseHistory(project: string): ReleaseHistoryResult {
  const {
    data: ncdData,
    isLoading: isLoadingNcd,
    isError: ncdError,
  } = useProjectNewCodeDefinitionQuery(project);
  const isPreviousVersion = ncdData?.type === NewCodeDefinitionType.PreviousVersion;

  const versionsQuery = useVersionAnalysesQuery({ project }, { enabled: isPreviousVersion });
  const statusHistoryQuery = useAlertStatusHistoryQuery(
    { project },
    { enabled: isPreviousVersion },
  );

  const releases = useMemo(
    () => joinReleases(versionsQuery.data ?? [], statusHistoryQuery.data ?? []),
    [versionsQuery.data, statusHistoryQuery.data],
  );

  return {
    isPreviousVersion,
    isLoading:
      isLoadingNcd ||
      (isPreviousVersion && (versionsQuery.isLoading || statusHistoryQuery.isLoading)),
    releases,
    isError:
      ncdError || (isPreviousVersion && (versionsQuery.isError || statusHistoryQuery.isError)),
  };
}
