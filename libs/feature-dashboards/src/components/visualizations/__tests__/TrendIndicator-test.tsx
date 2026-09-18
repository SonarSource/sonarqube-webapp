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
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { TrendIndicator } from '../TrendIndicator';

describe('TrendIndicator', () => {
  it('renders loading state', () => {
    renderWithRouter(<TrendIndicator isPending trendData={null} />);
    expect(screen.getByText('Loading trend indicator')).toBeInTheDocument();
  });

  it('renders an unavailable badge with a historical-data toggletip', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TrendIndicator isPending={false} trendData={null} />);

    expect(
      screen.getByRole('button', {
        name: 'dashboard.widget.trend_indicator.badge.unavailable',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('dashboard.widget.trend_indicator.badge.unavailable'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('dashboard.widget.trend_indicator.vs_last_30_days'),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'dashboard.widget.trend_indicator.badge.unavailable',
      }),
    );

    expect(
      await screen.findByText(/dashboard\.widget\.trend_indicator\.no_historical_data/),
    ).toBeInTheDocument();
  });

  it('explains when some history exists but is not mature enough', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TrendIndicator
        historyStartDate={new Date('2026-09-01T00:00:00Z')}
        isPending={false}
        trendData={null}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'dashboard.widget.trend_indicator.badge.unavailable',
      }),
    );

    expect(
      await screen.findByText(/dashboard\.widget\.trend_indicator\.insufficient_history/),
    ).toBeInTheDocument();
  });

  it('explains the 60-day requirement for resolution trends', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TrendIndicator
        historyStartDate={new Date('2026-09-01T00:00:00Z')}
        isPending={false}
        requiredHistoryDays={60}
        trendData={null}
        trendType="rolling-average"
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'dashboard.widget.trend_indicator.badge.unavailable',
      }),
    );
    expect(
      await screen.findByText(
        /dashboard\.widget\.trend_indicator\.description\.rolling_average\.insufficient_history/,
      ),
    ).toBeInTheDocument();
  });

  it('explains when the current resolved-issues period is incomplete', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TrendIndicator
        historyStartDate={new Date('2026-09-01T00:00:00Z')}
        isCurrentPeriodIncomplete
        isPending={false}
        requiredHistoryDays={60}
        trendData={null}
        trendType="resolved-issues"
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'dashboard.widget.trend_indicator.badge.unavailable',
      }),
    );

    expect(
      await screen.findByText(
        /dashboard\.widget\.trend_indicator\.description\.resolved_issues\.current_period_incomplete/,
      ),
    ).toBeInTheDocument();
  });

  it('uses metric-specific copy in the trend toggletip', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TrendIndicator
        isPending={false}
        trendData={{
          activityUrl: { pathname: '#' },
          change: 5,
          formattedChange: '5%',
          metricDirection: 1,
          past: 100,
          roundedChange: 5,
        }}
        trendType="rolling-average"
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /dashboard\.widget\.trend_indicator\.badge\.relative/,
      }),
    );

    expect(
      await screen.findByText('dashboard.widget.trend_indicator.description.rolling_average'),
    ).toBeInTheDocument();
  });

  it('renders no-change message without link when history is neutral', () => {
    renderWithRouter(
      <TrendIndicator
        isPending={false}
        trendData={{
          activityUrl: { pathname: '#' },
          change: 0,
          formattedChange: '0%',
          metricDirection: 0,
          past: 10,
          roundedChange: 0,
        }}
      />,
    );

    expect(
      screen.getByText('dashboard.widget.trend_indicator.badge.no_change'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders 0% instead of no-change when zeroPercentWhenNoChange is set', () => {
    renderWithRouter(
      <TrendIndicator
        compact
        isPending={false}
        trendData={{
          activityUrl: { pathname: '#' },
          change: 0,
          formattedChange: '0%',
          metricDirection: -1,
          past: 42,
          roundedChange: 0,
        }}
        zeroPercentWhenNoChange
      />,
    );

    expect(
      screen.getByText(/dashboard\.widget\.trend_indicator\.badge\.relative/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('dashboard.widget.trend_indicator.badge.no_change'),
    ).not.toBeInTheDocument();
  });

  it('does not render comparison text for compact indicators', () => {
    renderWithRouter(
      <TrendIndicator
        compact
        isPending={false}
        trendData={{
          activityUrl: { pathname: '#' },
          change: 5,
          formattedChange: '12.5%',
          metricDirection: -1,
          past: 40,
          roundedChange: 5,
        }}
        zeroPercentWhenNoChange
      />,
    );

    expect(
      screen.queryByText('dashboard.widget.trend_indicator.vs_last_30_days'),
    ).not.toBeInTheDocument();
  });

  it('renders absolute-change message for zero baseline', () => {
    renderWithRouter(
      <TrendIndicator
        isPending={false}
        trendData={{
          activityUrl: { pathname: '#' },
          change: -5,
          formattedChange: '5',
          metricDirection: 1,
          past: 0,
          roundedChange: -5,
        }}
      />,
    );

    expect(
      screen.getByText(/dashboard\.widget\.trend_indicator\.badge\.absolute/),
    ).toBeInTheDocument();
  });

  it('offers the activity link from the trend popover', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TrendIndicator
        isPending={false}
        trendData={{
          activityUrl: { pathname: '/activity' },
          change: 20,
          formattedChange: '20.0%',
          metricDirection: 1,
          past: 100,
          roundedChange: 20,
        }}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /dashboard\.widget\.trend_indicator\.badge\.relative/,
      }),
    );

    expect(
      await screen.findByRole('link', {
        name: 'dashboard.widget.trend_indicator.view_activity',
      }),
    ).toBeInTheDocument();
  });
});
