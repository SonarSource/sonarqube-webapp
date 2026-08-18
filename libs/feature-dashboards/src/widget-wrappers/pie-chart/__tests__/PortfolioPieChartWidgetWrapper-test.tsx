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
import type { ComponentProps } from 'react';
import { useDashboardPortfolioContext } from '~adapters/context/dashboardContext';
import { useOrganizationPieChartData } from '~adapters/queries/pie-chart-widget-data';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { InteractivePieChart } from '../../../components/visualizations/pie-chart/InteractivePieChart';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import {
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartWidgetProps,
} from '../../../types/dashboard-widget';
import { PieChartSegment } from '../../../types/visualization';
import { CodeScope } from '../../../types/widget-common';
import { PortfolioPieChartWidgetWrapper } from '../PortfolioPieChartWidgetWrapper';

const mockNavigate = jest.fn();
const mockInteractivePieChart = jest.fn((props: ComponentProps<typeof InteractivePieChart>) => (
  <button
    onClick={() => {
      props.onSegmentClick(props.segments[0]);
    }}
    type="button"
  >
    select segment
  </button>
));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('~adapters/context/dashboardContext', () => ({
  useDashboardPortfolioContext: jest.fn(),
}));

jest.mock('~adapters/helpers/dashboard-widget-urls', () => ({
  getPortfolioDashboardWidgetDrilldownUrl: (widgetKey: string, segment: string) =>
    `/breakdown/${widgetKey}?segment=${segment}`,
}));

jest.mock('~adapters/queries/pie-chart-widget-data', () => ({
  useOrganizationPieChartData: jest.fn(),
}));

jest.mock('../../../components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: () => <div>loading</div>,
}));

jest.mock('../../../components/common/WidgetNoData', () => ({
  WidgetNoData: () => <div>no data</div>,
}));

jest.mock('../../../components/visualizations/pie-chart/InteractivePieChart', () => ({
  InteractivePieChart: (props: ComponentProps<typeof InteractivePieChart>) =>
    mockInteractivePieChart(props),
}));

const segment: PieChartSegment = {
  color: '#000000',
  count: 3,
  label: 'High',
  percentage: '100%',
  value: 'HIGH',
};

const widget: PieChartWidgetProps = {
  filter: '',
  metric: PieChartMetric.IssueCount,
  scope: CodeScope.Overall,
  showLegend: true,
  slice: PieChartIssueSlice.ImpactSeverities,
};

function setup(props: PieChartWidgetProps = widget) {
  return renderWithRouter(
    <WidgetInstanceProvider
      dimensions={{ height: 6, width: 6 }}
      widgetKey="223e4567-e89b-42d3-a456-426614174000"
    >
      <PortfolioPieChartWidgetWrapper {...props} />
    </WidgetInstanceProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useDashboardPortfolioContext).mockReturnValue({
    getPortfolioMetric: jest.fn(),
    portfolioId: 'portfolio-1',
  });
  jest.mocked(useOrganizationPieChartData).mockReturnValue({
    error: undefined,
    isPending: false,
    segments: [segment],
  });
});

describe('PortfolioPieChartWidgetWrapper', () => {
  it('binds the portfolio adapter and navigates to a segment drilldown', async () => {
    const { user } = setup();

    expect(useOrganizationPieChartData).toHaveBeenCalledWith({
      enabled: true,
      entity: { entityId: 'portfolio-1', entityType: 'PORTFOLIO' },
      widget,
    });
    expect(mockInteractivePieChart).toHaveBeenCalledWith(
      expect.objectContaining({ segments: [segment], showLegend: true }),
    );

    await user.click(screen.getByRole('button', { name: 'select segment' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/breakdown/223e4567-e89b-42d3-a456-426614174000?segment=HIGH',
    );
  });

  it.each([
    {
      name: 'line-count segments',
      props: { ...widget, metric: PieChartMetric.LineCount, slice: PieChartLineSlice.Language },
      value: 'java',
    },
    { name: 'aggregated segments', props: widget, value: 'OTHER_0' },
  ])('does not navigate for $name', async ({ props, value }) => {
    jest.mocked(useOrganizationPieChartData).mockReturnValue({
      error: undefined,
      isPending: false,
      segments: [{ ...segment, value }],
    });
    const { user } = setup(props);

    await user.click(screen.getByRole('button', { name: 'select segment' }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders loading and empty states from the adapter', () => {
    jest.mocked(useOrganizationPieChartData).mockReturnValue({
      error: undefined,
      isPending: true,
      segments: [],
    });
    const { rerender } = setup();
    expect(screen.getByText('loading')).toBeInTheDocument();

    jest.mocked(useOrganizationPieChartData).mockReturnValue({
      error: undefined,
      isPending: false,
      segments: [],
    });
    rerender(
      <WidgetInstanceProvider
        dimensions={{ height: 6, width: 6 }}
        widgetKey="223e4567-e89b-42d3-a456-426614174000"
      >
        <PortfolioPieChartWidgetWrapper {...widget} />
      </WidgetInstanceProvider>,
    );

    expect(screen.getByText('no data')).toBeInTheDocument();
  });
});
