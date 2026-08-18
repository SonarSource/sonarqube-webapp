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
  projectPieChartUsesLegacyIssueData,
  useProjectPieChartSegmentsLegacyQuery,
} from '~adapters/queries/project-pie-chart-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { PieChartIssueSlice, PieChartMetric } from '../../../types/dashboard-widget';
import { CodeScope } from '../../../types/widget-common';
import { ProjectPieChartWidgetWrapper } from '../ProjectPieChartWidgetWrapper';

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
  projectPieChartUsesLegacyIssueData: jest.fn(),
  useProjectPieChartSegmentsLegacyQuery: jest.fn(),
}));

jest.mock('../../../components/visualizations/pie-chart/InteractivePieChart', () => ({
  InteractivePieChart: ({ ariaLabel, segments }: { ariaLabel: string; segments: unknown[] }) => (
    <div aria-label={ariaLabel} data-testid="pie-chart">
      {segments.length}
    </div>
  ),
}));

const widgetProps = {
  filter: '',
  metric: PieChartMetric.IssueCount,
  scope: CodeScope.Overall,
  showLegend: false,
  slice: PieChartIssueSlice.ImpactSeverities,
} as const;

beforeEach(() => {
  jest.mocked(useDashboardProjectContext).mockReturnValue({
    componentKey: 'project-key',
    isLoading: false,
    organization: 'my-org',
    projectEntityId: 'branch-id',
  });
  jest.mocked(projectPieChartUsesLegacyIssueData).mockReturnValue(false);
  jest.mocked(useOrganizationPieChartData).mockReturnValue({
    error: undefined,
    isPending: false,
    segments: [{ color: '#000', count: 2, label: 'High', percentage: '100%', value: 'HIGH' }],
  });
  jest.mocked(useProjectPieChartSegmentsLegacyQuery).mockReturnValue({
    error: undefined,
    isPending: false,
    segments: [],
  });
});

describe('ProjectPieChartWidgetWrapper integration', () => {
  it('renders organization segments', () => {
    renderWithRouter(<ProjectPieChartWidgetWrapper {...widgetProps} />);

    expect(screen.getByTestId('pie-chart')).toHaveTextContent('1');
    // The wrapper feeds the chart a label built from the segment data (not the generic fallback).
    expect(screen.getByTestId('pie-chart')).toHaveAccessibleName(/High/);
    expect(useOrganizationPieChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: { entityId: 'branch-id', entityType: 'PROJECT_BRANCH' },
        organization: 'my-org',
        projectKey: 'project-key',
      }),
    );
  });

  it('uses the legacy adapter when the widget requires it', () => {
    jest.mocked(projectPieChartUsesLegacyIssueData).mockReturnValue(true);
    jest.mocked(useProjectPieChartSegmentsLegacyQuery).mockReturnValue({
      error: undefined,
      isPending: false,
      segments: [{ color: '#000', count: 3, label: 'Legacy', percentage: '100%', value: 'L' }],
    });

    renderWithRouter(<ProjectPieChartWidgetWrapper {...widgetProps} />);

    expect(screen.getByTestId('pie-chart')).toHaveTextContent('1');
    expect(useProjectPieChartSegmentsLegacyQuery).toHaveBeenCalledWith(widgetProps, 'project-key');
  });
});
