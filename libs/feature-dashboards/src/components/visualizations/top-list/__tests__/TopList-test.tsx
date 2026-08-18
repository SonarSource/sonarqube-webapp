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
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { TrendData } from '../../TrendIndicator';
import { TopList } from '../TopList';

function mockTrendData(overrides: Partial<TrendData> = {}): TrendData {
  return {
    activityUrl: { pathname: '#' },
    change: 2,
    formattedChange: '+2',
    metricDirection: 1,
    past: 10,
    roundedChange: 2,
    ...overrides,
  };
}

const defaultColumnHeaders = {
  metric: 'Issues',
  rankBy: 'Rule',
  trend: 'Trend',
};

function renderTopList(props: Partial<ComponentProps<typeof TopList>> = {}) {
  return renderWithRouter(
    <TopList
      ariaLabel="Top 5 ranked list"
      columnHeaders={defaultColumnHeaders}
      hasFetchError={false}
      isPending={false}
      rows={[]}
      {...props}
    />,
  );
}

describe('TopList', () => {
  it('shows loading spinner while pending', async () => {
    renderTopList({ isPending: true });

    expect(await screen.findByText('dashboard.widget.loading_visualization')).toBeInTheDocument();
  });

  it('shows no data when fetch fails or rows are empty', () => {
    renderTopList({ hasFetchError: true });

    expect(screen.getByText('dashboard.widget.no_data')).toBeInTheDocument();
  });

  it('renders only available rows without padding', () => {
    renderTopList({
      rows: [
        { count: 12, label: 'Rule A', rank: 1, trendData: mockTrendData(), value: 'rule-a' },
        { count: 8, label: 'Rule B', rank: 2, trendData: mockTrendData(), value: 'rule-b' },
      ],
    });

    expect(screen.getByTestId('top-list-table')).toBeInTheDocument();
    expect(screen.getByTestId('top-list-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('top-list-row-2')).toBeInTheDocument();
    expect(screen.queryByTestId('top-list-row-3')).not.toBeInTheDocument();
    expect(screen.getByText('Rule')).toBeInTheDocument();
    expect(screen.getByText('Issues')).toBeInTheDocument();
    expect(screen.getByText('Trend')).toBeInTheDocument();
    expect(screen.getByText('Rule A')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    const topList = screen.getByTestId('top-list');
    const table = screen.getByTestId('top-list-table');
    expect(topList).toHaveClass('sw-overflow-x-hidden');
    expect(topList).toContainElement(table);
  });

  it('hides the Trend column when showTrendColumn is false', () => {
    renderTopList({
      rows: [{ count: 12, label: 'Rule A', rank: 1, value: 'rule-a' }],
      showTrendColumn: false,
    });

    expect(screen.getByText('Rule')).toBeInTheDocument();
    expect(screen.getByText('Issues')).toBeInTheDocument();
    expect(screen.queryByText('Trend')).not.toBeInTheDocument();
  });

  it('links the label and count cells independently when targets are provided', () => {
    renderTopList({
      rows: [
        {
          count: 12,
          countLinkTo: '/issues/rule-a',
          label: 'Rule A',
          linkTo: '/rules/rule-a',
          rank: 1,
          value: 'rule-a',
        },
      ],
    });

    expect(screen.getByRole('link', { name: 'Rule A' })).toHaveAttribute('href', '/rules/rule-a');
    expect(
      screen.getByRole('link', { name: /dashboard\.top_list\.count_link\.aria_label/ }),
    ).toHaveAttribute('href', '/issues/rule-a');
  });

  it('renders the count as plain text when no count target is provided', () => {
    renderTopList({
      rows: [{ count: 12, label: 'Rule A', linkTo: '/rules/rule-a', rank: 1, value: 'rule-a' }],
    });

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '12' })).not.toBeInTheDocument();
  });
});
