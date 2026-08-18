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
import { WidgetHeaderTitle } from '../../../dashboard-layout/shared/WidgetHeaderTitle';
import { WidgetInstanceProvider } from '../../../dashboard-layout/shared/WidgetInstanceContext';
import { TrendIndicator } from '../TrendIndicator';

describe('TrendIndicator', () => {
  it('renders loading state', () => {
    renderWithRouter(<TrendIndicator isPending trendData={null} />);
    expect(screen.getByText('Loading trend indicator')).toBeInTheDocument();
  });

  it('renders a no-data badge with comparison text when trend data is missing', () => {
    renderWithRouter(<TrendIndicator isPending={false} trendData={null} />);

    expect(
      screen.getByText('dashboard.widget.trend_indicator.no_historical_data'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('dashboard.widget.trend_indicator.vs_last_30_days'),
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

  it('shows a last-30-days tooltip when compact', async () => {
    const user = userEvent.setup();
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

    await user.hover(screen.getByText(/dashboard\.widget\.trend_indicator\.badge\.relative/));

    const tooltips = await screen.findAllByText(
      'dashboard.widget.trend_indicator.change_last_30_days',
    );
    expect(tooltips.length).toBeGreaterThan(0);
    expect(tooltips[0]).toBeVisible();
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

  it('renders percentage-change message with activity link', () => {
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

    expect(
      screen.getByRole('link', { name: /dashboard\.widget\.trend_indicator\.badge\.relative/ }),
    ).toBeInTheDocument();
  });

  it('includes the widget title in the trend link accessible name when widget context is available', () => {
    renderWithRouter(
      <WidgetInstanceProvider dimensions={{ height: 4, width: 3 }} widgetKey="w1">
        <WidgetHeaderTitle title="Bugs" />
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
        />
      </WidgetInstanceProvider>,
    );

    expect(
      screen.getByRole('link', {
        name: /dashboard\.widget\.trend_indicator\.badge\.relative.*Bugs/,
      }),
    ).toBeInTheDocument();
  });
});
