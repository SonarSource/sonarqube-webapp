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
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { CodeScope } from '../../../types/widget-common';
import { useProjectLineChartModelOrganizations } from '../projectLineChartOrganizationsModel';
import { ProjectLineChartWidgetWrapper } from '../ProjectLineChartWidgetWrapper';

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: () => ({ organizationReportingEnableNewDashboardWidgets: true }),
}));

jest.mock('../projectLineChartOrganizationsModel', () => ({
  useProjectLineChartModelOrganizations: jest.fn(),
}));

jest.mock('~feature-dashboards/components/visualizations/multi-line-chart/MultiLineChart', () => ({
  MultiLineChart: ({ series }: { series: unknown[] }) => (
    <div data-testid="line-chart">{series.length}</div>
  ),
}));

it('renders the shared chart from the adapter-backed project model', () => {
  jest.mocked(useDashboardProjectContext).mockReturnValue({
    componentKey: 'project-key',
    isLoading: false,
    organization: 'my-org',
    projectEntityId: 'branch-id',
  });
  jest.mocked(useProjectLineChartModelOrganizations).mockReturnValue({
    ariaLabel: 'Bugs',
    formatDotValue: String,
    formatTick: String,
    hasFetchError: false,
    isMetricRating: false,
    isPending: false,
    metricName: 'Bugs',
    padding: [20, 20, 40, 60],
    series: [{ color: '#000', data: [{ x: 1, y: 2 }], id: 'total', label: 'Bugs' }],
    showLegend: false,
    showTooltip: true,
    strokeWidth: 2,
  });

  renderWithRouter(
    <ProjectLineChartWidgetWrapper
      groupBy={LineChartGroupBy.None}
      historyRange={HistoryRange.LastMonth}
      metric={{ metricKey: MetricKey.bugs, type: DashboardMetricType.Raw }}
      scope={CodeScope.Overall}
    />,
  );

  expect(screen.getByTestId('line-chart')).toHaveTextContent('1');
});
