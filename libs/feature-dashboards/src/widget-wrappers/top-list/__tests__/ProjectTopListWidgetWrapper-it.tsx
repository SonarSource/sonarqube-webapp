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

import { screen } from '@testing-library/react';
import { useDashboardProjectContext } from '~adapters/context/dashboardContext';
import { useProjectTopListData } from '~adapters/queries/project-top-list-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { TopListProps } from '../../../types/visualization';
import { CodeScope, TopListLimit, TopListRankBy } from '../../../types/widget-common';
import { buildDashboardMetricForTopList } from '../../../widget-creation-modal/utils/topListCompleteConfig';
import { ProjectTopListWidgetWrapper } from '../ProjectTopListWidgetWrapper';

const mockTopList = jest.fn((props: TopListProps) => (
  <div data-testid="top-list">{props.rows.length}</div>
));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardRuleUrl: () => '#rule',
  getProjectDashboardTopListRowUrl: () => '#issues',
}));

jest.mock('~adapters/queries/project-top-list-widget-data', () => ({
  useProjectTopListData: jest.fn(),
}));

jest.mock('~feature-dashboards/components/visualizations/top-list/TopList', () => ({
  TopList: (props: TopListProps) => mockTopList(props),
}));

it('renders rows returned by the project top-list adapter', () => {
  jest.mocked(useDashboardProjectContext).mockReturnValue({
    componentKey: 'project-key',
    isLoading: false,
    organization: 'my-org',
    projectEntityId: 'branch-id',
  });
  jest.mocked(useProjectTopListData).mockReturnValue({
    counts: { 'java:S1': 3 },
    getRuleTrendData: () => null,
    isError: false,
    isPending: false,
    rulesByKey: { 'java:S1': { langName: 'Java', name: 'Rule one' } },
  });
  const widget = {
    limit: TopListLimit.Five,
    metric: buildDashboardMetricForTopList(undefined),
    rankBy: TopListRankBy.Rule,
    scope: CodeScope.Overall,
  };

  renderWithRouter(<ProjectTopListWidgetWrapper {...widget} />);

  expect(screen.getByTestId('top-list')).toHaveTextContent('1');
  expect(useProjectTopListData).toHaveBeenCalledWith(widget, 'branch-id', 'my-org', {
    fetchTrendHistory: true,
  });
});
