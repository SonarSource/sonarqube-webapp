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
import { useOrgIssueDensityCountWidgetData } from '~adapters/queries/issue-density-widget-data';
import { renderWithContext } from '~shared/helpers/test-utils';
import { CountWidgetProps } from '../../../components/visualizations/CountWidget';
import { DashboardMetricType } from '../../../data/widgets/shared';
import { IssueDensityCountWidgetWrapper as OrgIssueDensityCountWidget } from '../IssueDensityCountWidgetWrapper';

const mockCountWidget = jest.fn((props: CountWidgetProps) => (
  <div data-link-to={props.linkTo} data-testid="count-widget">
    {props.value}
    {props.unitLabel}
  </div>
));

jest.mock('~feature-dashboards/components/visualizations/CountWidget', () => ({
  ...(jest.requireActual('~feature-dashboards/components/visualizations/CountWidget') as object),
  CountWidget: (props: CountWidgetProps) => mockCountWidget(props),
}));

jest.mock('~feature-dashboards/components/common/WidgetLoadingSpinner', () => ({
  WidgetLoadingSpinner: function WidgetLoadingSpinner() {
    return <div data-testid="loading-spinner" />;
  },
}));

jest.mock('~feature-dashboards/components/common/WidgetNoData', () => ({
  WidgetNoData: function WidgetNoData({
    messageKey = 'dashboard.widget.no_data',
  }: Readonly<{ messageKey?: string }>) {
    return <div data-testid="no-data">{messageKey}</div>;
  },
}));

jest.mock('~adapters/queries/issue-density-widget-data', () => ({
  ...(jest.requireActual('~adapters/queries/issue-density-widget-data') as object),
  useOrgIssueDensityCountWidgetData: jest.fn(),
}));

const metric = {
  measureFilters: undefined,
  type: DashboardMetricType.IssueDensity,
} as const;
const noTrend = { current: null, past: null };

function setupWidget(showTrendIndicator = true) {
  return renderWithContext(
    <OrgIssueDensityCountWidget
      entityId="portfolio-1"
      entityType="PORTFOLIO"
      linkTo="breakdown/widget-key"
      metric={metric}
      showTrendIndicator={showTrendIndicator}
    />,
  );
}

beforeEach(() => {
  mockCountWidget.mockClear();
  jest.mocked(useOrgIssueDensityCountWidgetData).mockReturnValue({
    data: {
      latestValue: 4.2,
      sparklineSeries: [3.8, 4, 4.2],
      trend: noTrend,
    },
    isPending: false,
  } as unknown as ReturnType<typeof useOrgIssueDensityCountWidgetData>);
});

describe('IssueDensityCountWidgetWrapper', () => {
  it('shows an error state when issue density loading fails', () => {
    jest.mocked(useOrgIssueDensityCountWidgetData).mockReturnValue({
      data: {
        latestValue: 4.2,
        sparklineSeries: [3.8, 4, 4.2],
        trend: noTrend,
      },
      isError: true,
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueDensityCountWidgetData>);

    setupWidget();

    expect(screen.getByText('dashboard.widget.error')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('shows a loading spinner while issue density is loading', () => {
    jest.mocked(useOrgIssueDensityCountWidgetData).mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof useOrgIssueDensityCountWidgetData>);

    setupWidget();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it.each([null, undefined])('shows no data when the latest density is %p', (latestValue) => {
    jest.mocked(useOrgIssueDensityCountWidgetData).mockReturnValue({
      data: { latestValue, sparklineSeries: [], trend: noTrend },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueDensityCountWidgetData>);

    setupWidget();

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(mockCountWidget).not.toHaveBeenCalled();
  });

  it('renders the density value, unit, navigation, and trend series', () => {
    setupWidget();

    expect(useOrgIssueDensityCountWidgetData).toHaveBeenCalledWith({
      entityId: 'portfolio-1',
      entityType: 'PORTFOLIO',
      measureFilters: undefined,
    });
    expect(mockCountWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        linkTo: 'breakdown/widget-key',
        showTrendIndicator: true,
        sparklineSeries: [3.8, 4, 4.2],
        unitLabel: 'dashboard.widget.count.issue_density.unit',
        value: '4.2',
      }),
    );
  });

  it('computes trend data when both comparison values are available', () => {
    jest.mocked(useOrgIssueDensityCountWidgetData).mockReturnValue({
      data: {
        latestValue: 4.2,
        sparklineSeries: [3.8, 4.2],
        trend: { current: '4.2', past: '3.8' },
      },
      isPending: false,
    } as unknown as ReturnType<typeof useOrgIssueDensityCountWidgetData>);

    setupWidget();

    expect(mockCountWidget.mock.calls.at(-1)?.[0].trendIndicatorData?.trendData).not.toBeNull();
  });

  it('omits the sparkline and trend data when trend display is disabled', () => {
    setupWidget(false);

    expect(mockCountWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        showTrendIndicator: false,
        sparklineSeries: undefined,
        trendIndicatorData: { isPending: false, trendData: null },
      }),
    );
  });
});
