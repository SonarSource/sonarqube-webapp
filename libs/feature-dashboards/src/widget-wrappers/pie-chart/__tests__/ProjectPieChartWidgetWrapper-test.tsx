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
import { useOrganizationPieChartData } from '~adapters/queries/pie-chart-widget-data';
import {
  projectPieChartUsesSearchData,
  useProjectPieChartSegmentsSearchQuery,
} from '~adapters/queries/project-pie-chart-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import {
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartMetric,
  PieChartWidgetProps,
} from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import { ProjectPieChartWidgetWrapper as ProjectPieChartWidget } from '../ProjectPieChartWidgetWrapper';

jest.mock('../../../components/visualizations/pie-chart/InteractivePieChart', () => ({
  InteractivePieChart: function InteractivePieChart() {
    return <div data-testid="project-pie-chart" />;
  },
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardProjectContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getProjectDashboardPieChartSegmentUrl: () => '#',
}));

jest.mock('~adapters/queries/pie-chart-widget-data', () => ({
  useOrganizationPieChartData: jest.fn(),
}));

jest.mock('~adapters/queries/project-pie-chart-widget-data', () => ({
  projectPieChartUsesSearchData: jest.fn(),
  useProjectPieChartSegmentsSearchQuery: jest.fn(),
}));

jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: function WidgetLoadingSpinner() {
    return <div data-testid="project-pie-chart-loading" />;
  },
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: function WidgetNoData() {
    return <div data-testid="project-pie-chart-no-data" />;
  },
}));

const widgetProps = {
  filter: '',
  metric: PieChartMetric.IssueCount,
  scope: CodeScope.Overall,
  showLegend: false,
  slice: PieChartIssueSlice.ImpactSeverities,
} as const;

const mockBranchId = '00000000-0000-4000-8000-000000000099';

describe('ProjectPieChartWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: 'my-project',
      isLoading: false,
      organization: 'my-org',
      projectEntityId: mockBranchId,
    });
    jest.mocked(projectPieChartUsesSearchData).mockReturnValue(false);
    jest.mocked(useOrganizationPieChartData).mockReturnValue({
      error: undefined,
      isPending: true,
      segments: [],
    });
    jest.mocked(useProjectPieChartSegmentsSearchQuery).mockReturnValue({
      error: undefined,
      isPending: false,
      segments: [],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses organizations issue-count snapshot for supported slices', () => {
    const searchQuerySpy = jest.mocked(useProjectPieChartSegmentsSearchQuery);

    renderWithRouter(<ProjectPieChartWidget {...widgetProps} />);

    expect(searchQuerySpy).not.toHaveBeenCalled();
    expect(useOrganizationPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: { entityId: mockBranchId, entityType: 'PROJECT_BRANCH' },
      }),
    );
  });

  it('uses the search query for hotspot security-category slice', () => {
    jest.mocked(projectPieChartUsesSearchData).mockReturnValue(true);

    const securityCategoryWidget = {
      ...widgetProps,
      metric: PieChartMetric.HotspotCount,
      slice: PieChartHotspotSlice.SecurityCategory,
    } satisfies PieChartWidgetProps;

    renderWithRouter(<ProjectPieChartWidget {...securityCategoryWidget} />);

    expect(useProjectPieChartSegmentsSearchQuery).toHaveBeenCalledWith(
      securityCategoryWidget,
      'my-project',
    );
    expect(useOrganizationPieChartData).not.toHaveBeenCalled();
  });

  it('uses the search query for code-attribute slice', () => {
    jest.mocked(projectPieChartUsesSearchData).mockReturnValue(true);

    const codeAttributeWidget = {
      ...widgetProps,
      slice: PieChartIssueSlice.CleanCodeAttributeCategories,
    } satisfies PieChartWidgetProps;

    renderWithRouter(<ProjectPieChartWidget {...codeAttributeWidget} />);

    expect(useProjectPieChartSegmentsSearchQuery).toHaveBeenCalledWith(
      codeAttributeWidget,
      'my-project',
    );
    expect(useOrganizationPieChartData).not.toHaveBeenCalled();
  });

  it('shows loading while branch context resolves', () => {
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: '',
      isLoading: true,
      organization: '',
      projectEntityId: undefined,
    });

    renderWithRouter(<ProjectPieChartWidget {...widgetProps} />);

    expect(screen.getByTestId('project-pie-chart-loading')).toBeInTheDocument();
  });

  it('shows no data when branch context is missing', () => {
    jest.mocked(useDashboardProjectContext).mockReturnValue({
      componentKey: 'my-project',
      isLoading: false,
      organization: 'my-org',
      projectEntityId: undefined,
    });

    renderWithRouter(<ProjectPieChartWidget {...widgetProps} />);

    expect(screen.getByTestId('project-pie-chart-no-data')).toBeInTheDocument();
  });
});
