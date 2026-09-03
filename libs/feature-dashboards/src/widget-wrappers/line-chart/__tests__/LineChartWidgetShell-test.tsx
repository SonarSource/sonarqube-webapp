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
import { useFlags } from '~adapters/helpers/feature-flags';
import { renderWithContext } from '~shared/helpers/test-utils';
import { HistoryRange } from '../../../data/widgets/line-chart';
import { LineChartWidgetShell } from '../LineChartWidgetShell';

jest.mock('~adapters/helpers/feature-flags', () => ({
  useFlags: jest.fn(),
}));

jest.mock('~feature-dashboards/components/visualizations/multi-line-chart/MultiLineChart', () => ({
  MultiLineChart: () => <div data-testid="multi-line-chart" />,
}));

jest.mock('~feature-dashboards/components/visualizations/line-chart/LineChart', () => ({
  LineChart: () => <div data-testid="legacy-line-chart" />,
}));

const defaultProps = {
  ariaLabel: 'Bugs',
  formatDotValue: (value: number) => String(value),
  formatTick: (value: number) => String(value),
  hasFetchError: false,
  historyRange: HistoryRange.Last6Months,
  isMetricRating: false,
  isPending: false,
  metricName: 'Bugs',
  series: [
    {
      color: '#000',
      data: [{ x: new Date('2026-04-15T00:00:00.000Z'), y: 7 }],
      id: 'total',
      label: 'Bugs',
    },
  ],
};

const limitedHistoryMessage = /dashboard\.line_chart\.limited_history_warning/;

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
  jest.mocked(useFlags).mockReturnValue({
    organizationReportingEnableNewDashboardWidgets: true,
  } as unknown as ReturnType<typeof useFlags>);
});

afterEach(() => {
  jest.useRealTimers();
});

it('renders Queena’s dynamic limited-history message below the active chart', () => {
  renderWithContext(<LineChartWidgetShell {...defaultProps} />);

  expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
  expect(
    screen.getByText('dashboard.line_chart.limited_history_warning.Apr 15, 2026'),
  ).toBeInTheDocument();
});

it('supports the legacy renderer and hides the message for complete, pending, or failed data', () => {
  jest.mocked(useFlags).mockReturnValue({
    organizationReportingEnableNewDashboardWidgets: false,
  } as unknown as ReturnType<typeof useFlags>);
  const completeSeries = [
    {
      ...defaultProps.series[0],
      data: [{ x: new Date('2025-10-31T00:00:00.000Z'), y: 7 }],
    },
  ];
  const { rerender } = renderWithContext(
    <LineChartWidgetShell {...defaultProps} series={completeSeries} />,
  );

  expect(screen.getByTestId('legacy-line-chart')).toBeInTheDocument();
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();

  rerender(<LineChartWidgetShell {...defaultProps} isPending />);
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();

  rerender(<LineChartWidgetShell {...defaultProps} hasFetchError />);
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();
});

it('does not report short-range gaps and only considers the series rendered by the legacy chart', () => {
  jest.mocked(useFlags).mockReturnValue({
    organizationReportingEnableNewDashboardWidgets: false,
  } as unknown as ReturnType<typeof useFlags>);
  const series = [
    defaultProps.series[0],
    {
      ...defaultProps.series[0],
      data: [{ x: new Date('2025-10-31T00:00:00.000Z'), y: 4 }],
      id: 'hidden',
    },
  ];
  const { rerender } = renderWithContext(
    <LineChartWidgetShell {...defaultProps} series={series} />,
  );

  expect(
    screen.getByText('dashboard.line_chart.limited_history_warning.Apr 15, 2026'),
  ).toBeInTheDocument();

  rerender(
    <LineChartWidgetShell
      {...defaultProps}
      historyRange={HistoryRange.LastMonth}
      series={series}
    />,
  );
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();
});
