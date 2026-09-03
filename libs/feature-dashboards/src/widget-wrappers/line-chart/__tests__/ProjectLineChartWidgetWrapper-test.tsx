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
import { useFlags } from '~adapters/helpers/feature-flags';
import { useOrgIssueDensityLineChartWidgetData } from '~adapters/queries/issue-density-widget-data';
import { useOrgIssueResolutionLineChartWidgetData } from '~adapters/queries/issue-resolution-widget-data';
import { useOrgScaResolutionLineChartWidgetData } from '~adapters/queries/sca-resolution-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { MetricKey } from '~shared/types/metrics';
import { HistoryRange, LineChartGroupBy } from '../../../data/widgets/line-chart';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import { CodeScope } from '../../../types/widget-common';
import { useProjectLineChartModelOrganizations } from '../projectLineChartOrganizationsModel';
import { ProjectLineChartWidgetWrapper } from '../ProjectLineChartWidgetWrapper';

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: jest.fn(),
}));

jest.mock('~adapters/queries/issue-density-widget-data', () => ({
  useOrgIssueDensityLineChartWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/issue-resolution-widget-data', () => ({
  useOrgIssueResolutionLineChartWidgetData: jest.fn(),
}));

jest.mock('~adapters/queries/sca-resolution-widget-data', () => ({
  useOrgScaResolutionLineChartWidgetData: jest.fn(),
}));

jest.mock('../projectLineChartOrganizationsModel', () => ({
  useProjectLineChartModelOrganizations: jest.fn(),
}));

jest.mock('~feature-dashboards/components/visualizations/multi-line-chart/MultiLineChart', () => ({
  MultiLineChart: ({ series }: { series: unknown[] }) => (
    <div data-testid="multi-line-chart">{series.length}</div>
  ),
}));

jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: () => <div data-testid="loading" />,
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: () => <div data-testid="no-data" />,
}));

const defaultProps = {
  groupBy: LineChartGroupBy.None,
  historyRange: HistoryRange.LastMonth,
  metric: { metricKey: MetricKey.bugs, type: DashboardMetricType.Raw } as const,
  scope: CodeScope.Overall,
};
beforeEach(() => {
  jest.mocked(useFlags).mockReturnValue({
    organizationReportingEnableNewDashboardWidgets: true,
  } as unknown as ReturnType<typeof useFlags>);
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
    series: [],
    showLegend: false,
    showTooltip: true,
    strokeWidth: 2,
  });
  const queryResult = { data: [], isError: false, isPending: false } as unknown as ReturnType<
    typeof useOrgIssueResolutionLineChartWidgetData
  >;
  jest.mocked(useOrgIssueResolutionLineChartWidgetData).mockReturnValue(queryResult);
  jest.mocked(useOrgIssueDensityLineChartWidgetData).mockReturnValue(queryResult);
  jest.mocked(useOrgScaResolutionLineChartWidgetData).mockReturnValue(queryResult);
});

describe('ProjectLineChartWidgetWrapper', () => {
  it('renders loading and no-data states from project context', () => {
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: '',
      isLoading: true,
      organization: '',
      projectEntityId: undefined,
    });
    const { rerender } = renderWithRouter(<ProjectLineChartWidgetWrapper {...defaultProps} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: '',
      isLoading: false,
      organization: '',
      projectEntityId: undefined,
    });
    rerender(<ProjectLineChartWidgetWrapper {...defaultProps} />);
    expect(screen.getByTestId('no-data')).toBeInTheDocument();
  });

  it('binds standard metrics to the project line-chart model', () => {
    renderWithRouter(<ProjectLineChartWidgetWrapper {...defaultProps} />);

    expect(useProjectLineChartModelOrganizations).toHaveBeenCalledWith(
      'branch-id',
      'my-org',
      defaultProps,
    );
    expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
  });

  it('binds issue-resolution metrics to their adapter', () => {
    const metric = {
      statistic: IssueResolutionStatistic.MTTR,
      type: DashboardMetricType.IssueResolution,
    } as const;

    renderWithRouter(
      <ProjectLineChartWidgetWrapper {...defaultProps} metric={metric} showLegend />,
    );

    expect(useOrgIssueResolutionLineChartWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 'branch-id',
        entityType: 'PROJECT_BRANCH',
        historyRange: HistoryRange.LastMonth,
        statistic: IssueResolutionStatistic.MTTR,
      }),
    );
  });

  it('binds issue-density and SCA metrics to their adapters', () => {
    const { rerender } = renderWithRouter(
      <ProjectLineChartWidgetWrapper
        {...defaultProps}
        metric={{ type: DashboardMetricType.IssueDensity }}
      />,
    );
    expect(useOrgIssueDensityLineChartWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'branch-id', entityType: 'PROJECT_BRANCH' }),
    );

    rerender(
      <ProjectLineChartWidgetWrapper
        {...defaultProps}
        metric={{ type: DashboardMetricType.ScaResolution }}
      />,
    );
    expect(useOrgScaResolutionLineChartWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'branch-id', entityType: 'PROJECT_BRANCH' }),
    );
  });
});
