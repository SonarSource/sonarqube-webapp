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

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import {
  getProjectDashboardRuleUrl,
  getProjectDashboardTopListRowUrl,
} from '~adapters/helpers/dashboard-widget-urls';
import { useProjectTopListData } from '~adapters/queries/project-top-list-widget-data';
import { WidgetLoadingSpinner } from '../../components/common/WidgetLoadingSpinner';
import { WidgetNoData } from '../../components/common/WidgetNoData';
import { formatSegmentLabel } from '../../components/visualizations/pie-chart/pieChartSegmentUtils';
import { TopList } from '../../components/visualizations/top-list/TopList';
import { getTopListColumnHeaders } from '../../components/visualizations/top-list/topListColumnHeaders';
import { buildTopListRows } from '../../components/visualizations/top-list/topListRowUtils';
import { PieChartMetric, type TopListWidgetProps } from '../../types/dashboard-widget';
import { CodeScope, TopListMetric, TopListRankBy } from '../../types/widget-common';
import { topListRankByToIssueFacet } from '../../utils/topList';

/**
 * Renders the project Top List from the organizations issue-count-history API (`PROJECT_BRANCH`):
 * counts, rule labels and trend are all sourced from {@link useProjectTopListData}.
 */
function ProjectTopListWidgetView(
  props: Readonly<{
    branchEntityId: string;
    organization: string;
    projectKey: string;
    widget: Readonly<TopListWidgetProps>;
  }>,
) {
  const { branchEntityId, organization, projectKey, widget } = props;
  const { formatMessage } = useIntl();
  const { limit, metric, rankBy, scope } = widget;
  const facet = topListRankByToIssueFacet(rankBy);
  const fetchTrendHistory = scope !== CodeScope.New;

  const { counts, getRuleTrendData, isError, isPending, rulesByKey } = useProjectTopListData(
    widget,
    branchEntityId,
    organization,
    { fetchTrendHistory },
  );

  // Count cell navigates to the filtered issues page (the previous label behaviour).
  const getCountUrl = useCallback(
    (value: string) =>
      getProjectDashboardTopListRowUrl(projectKey, value, { metric, rankBy, scope }),
    [metric, projectKey, rankBy, scope],
  );

  // Label cell navigates to the rule details page. Only rule rank-by carries rule keys as values.
  const getLabelUrl = useCallback(
    (value: string) =>
      rankBy === TopListRankBy.Rule ? getProjectDashboardRuleUrl(value, organization) : undefined,
    [organization, rankBy],
  );

  const rows = useMemo(
    () =>
      buildTopListRows(
        counts,
        (value) =>
          formatSegmentLabel(value, PieChartMetric.IssueCount, facet, { rules: rulesByKey }),
        projectKey ? getLabelUrl : undefined,
        getRuleTrendData,
        limit,
        projectKey ? getCountUrl : undefined,
      ),
    [counts, facet, getCountUrl, getLabelUrl, getRuleTrendData, limit, projectKey, rulesByKey],
  );

  const ariaLabel = formatMessage({ id: 'dashboard.top_list.aria_label' }, { limit });
  const columnHeaders = getTopListColumnHeaders(rankBy, TopListMetric.IssueCount, formatMessage);

  return (
    <TopList
      ariaLabel={ariaLabel}
      columnHeaders={columnHeaders}
      hasFetchError={isError}
      isPending={isPending}
      rows={rows}
    />
  );
}

export function ProjectTopListWidgetWrapper(props: Readonly<TopListWidgetProps>) {
  const {
    componentKey: projectKey,
    isLoading,
    organization,
    projectEntityId,
  } = useDashboardProjectContext();

  if (isLoading) {
    return <WidgetLoadingSpinner />;
  }

  if (!projectEntityId || !organization) {
    return <WidgetNoData className="sw-my-0 sw-h-full" />;
  }

  return (
    <ProjectTopListWidgetView
      branchEntityId={projectEntityId}
      organization={organization}
      projectKey={projectKey}
      widget={props}
    />
  );
}
