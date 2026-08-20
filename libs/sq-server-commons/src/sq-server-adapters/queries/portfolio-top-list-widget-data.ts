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
import { usePortfolioRulesMetadataOrganization } from './portfolio-widget-organization-data';
import {
  type UseTopListIssueCountDataOptions,
  useTopListIssueCountData,
} from './top-list-issue-count-data';
import { useDashboardRuleLabels } from './widget-rule-metadata';

export function usePortfolioTopListData(
  _widget: unknown,
  _portfolioId: string,
  _options: UseTopListIssueCountDataOptions = {},
): {
  counts: Record<string, number>;
  getRuleTrendData: (ruleKey: string) => DashboardTrendData | null;
  isError: boolean;
  isPending: boolean;
  rulesByKey: DashboardRuleMetadataByKey;
  rulesOrganization: string | undefined;
} {
  const widget = _widget as TopListWidget;
  const { counts, getRuleTrendData, isError, isPending, topRuleKeys } = useTopListIssueCountData(
    widget,
    _portfolioId,
    'PORTFOLIO',
    _options,
  );
  const { isLoading: isResolvingOrganization, organization } =
    usePortfolioRulesMetadataOrganization(_portfolioId, {
      enabled: topRuleKeys.length > 0,
    });
  const rulesQuery = useDashboardRuleLabels({
    entity: { isResolvingOrganization, organization, type: 'PORTFOLIO' },
    ruleKeys: topRuleKeys,
  });

  return {
    counts,
    getRuleTrendData,
    isError: isError || rulesQuery.isError,
    isPending: isPending || rulesQuery.isPending,
    rulesByKey: rulesQuery.rulesByKey,
    rulesOrganization: rulesQuery.organization,
  };
}
