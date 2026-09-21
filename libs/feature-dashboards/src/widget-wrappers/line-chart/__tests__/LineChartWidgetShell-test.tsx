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
import { renderWithContext } from '~shared/helpers/test-utils';
import { LineChartWidgetShell } from '../LineChartWidgetShell';

jest.mock('~feature-dashboards/components/visualizations/multi-line-chart/MultiLineChart', () => ({
  MultiLineChart: () => <div data-testid="multi-line-chart" />,
}));

const defaultProps = {
  ariaLabel: 'Bugs',
  formatDotValue: (value: number) => String(value),
  formatTick: (value: number) => String(value),
  hasFetchError: false,
  isMetricRating: false,
  isPending: false,
  requestedStartDate: new Date('2025-10-31T00:00:00.000Z'),
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
});

afterEach(() => {
  jest.useRealTimers();
});

it('combines the single-datapoint and limited-history messages into one banner below the chart', () => {
  renderWithContext(<LineChartWidgetShell {...defaultProps} />);

  expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
  expect(
    screen.getByText(
      'dashboard.line_chart.single_data · dashboard.line_chart.limited_history_warning.Apr 15, 2026',
    ),
  ).toBeInTheDocument();
});

it('shows only the limited-history message when every series has more than one point', () => {
  const series = [
    {
      ...defaultProps.series[0],
      data: [
        { x: new Date('2026-04-15T00:00:00.000Z'), y: 7 },
        { x: new Date('2026-04-20T00:00:00.000Z'), y: 9 },
      ],
    },
  ];

  renderWithContext(<LineChartWidgetShell {...defaultProps} series={series} />);

  expect(
    screen.getByText('dashboard.line_chart.limited_history_warning.Apr 15, 2026'),
  ).toBeInTheDocument();
});

it('shows only the single-datapoint message when history is not limited', () => {
  renderWithContext(<LineChartWidgetShell {...defaultProps} requestedStartDate={undefined} />);

  expect(screen.getByText('dashboard.line_chart.single_data')).toBeInTheDocument();
});

const singleDatapointMessage = /dashboard\.line_chart\.single_data/;

it('hides both messages for complete, pending, or failed data', () => {
  const completeSeries = [
    {
      ...defaultProps.series[0],
      data: [
        { x: new Date('2025-10-31T00:00:00.000Z'), y: 7 },
        { x: new Date('2026-04-15T00:00:00.000Z'), y: 9 },
      ],
    },
  ];
  const { rerender } = renderWithContext(
    <LineChartWidgetShell {...defaultProps} series={completeSeries} />,
  );

  expect(screen.getByTestId('multi-line-chart')).toBeInTheDocument();
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();
  expect(screen.queryByText(singleDatapointMessage)).not.toBeInTheDocument();

  rerender(<LineChartWidgetShell {...defaultProps} isPending />);
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();
  expect(screen.queryByText(singleDatapointMessage)).not.toBeInTheDocument();

  rerender(<LineChartWidgetShell {...defaultProps} hasFetchError />);
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();
  expect(screen.queryByText(singleDatapointMessage)).not.toBeInTheDocument();
});

it('does not report limited history when one series has complete history', () => {
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

  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();

  rerender(
    <LineChartWidgetShell {...defaultProps} requestedStartDate={undefined} series={series} />,
  );
  expect(screen.queryByText(limitedHistoryMessage)).not.toBeInTheDocument();
});
