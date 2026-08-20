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

import type { TopListWidget } from '../../helpers/dashboard-widget-data';
import type {
  DashboardRuleMetadataByKey,
  DashboardTrendData,
} from '../../types/dashboard-widget-adapter-types';
import {
  type UseTopListIssueCountDataOptions,
  useTopListIssueCountData,
} from './top-list-issue-count-data';
import { useDashboardRuleLabels } from './widget-rule-metadata';

export function useProjectTopListData(
  _widget: unknown,
  _branchEntityId: string,
  _organization: string,
  _options: UseTopListIssueCountDataOptions = {},
): {
  counts: Record<string, number>;
  getRuleTrendData: (ruleKey: string) => DashboardTrendData | null;
  isError: boolean;
  isPending: boolean;
  rulesByKey: DashboardRuleMetadataByKey;
} {
  const { enabled = true } = _options;
  const { counts, getRuleTrendData, isError, isPending, topRuleKeys } = useTopListIssueCountData(
    _widget as TopListWidget,
    _branchEntityId,
    'PROJECT_BRANCH',
    _options,
  );
  const rulesQuery = useDashboardRuleLabels({
    enabled: enabled && Boolean(_branchEntityId),
    entity: { organization: _organization, type: 'PROJECT' },
    ruleKeys: topRuleKeys,
  });

  return {
    counts,
    getRuleTrendData,
    isError: isError || rulesQuery.isError,
    isPending: isPending || rulesQuery.isPending,
    rulesByKey: rulesQuery.rulesByKey,
  };
}
