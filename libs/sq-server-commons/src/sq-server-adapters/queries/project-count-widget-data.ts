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

import { useComponent } from '../../context/componentContext/withComponentContext';
import { type CodeScopeValue, type MeasureFilters } from '../../helpers/dashboard-widget-data';
import { useIssueCountSearchQuery } from '../../queries/dashboard-issue-count';
import { useCurrentBranchQuery } from './branch';

export function useProjectLegacyIssueCountWidgetQuery(_params: {
  componentKey: string;
  measureFilters: unknown;
  scope: string;
}): { data: number | undefined; isLoading: boolean } {
  const { component } = useComponent();
  const branchQuery = useCurrentBranchQuery(component);
  const query = useIssueCountSearchQuery(
    {
      branchLike: branchQuery.data,
      componentKey: _params.componentKey,
      measureFilters: _params.measureFilters as MeasureFilters | undefined,
      scope: _params.scope as CodeScopeValue,
    },
    { enabled: Boolean(_params.componentKey) && !branchQuery.isPending },
  );

  return {
    data: query.data,
    isLoading: branchQuery.isPending || query.isLoading,
  };
}
