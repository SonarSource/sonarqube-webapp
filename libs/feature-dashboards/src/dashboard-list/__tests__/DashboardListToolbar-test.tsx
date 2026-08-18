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
import { renderWithRouter } from '~shared/helpers/test-utils';
import { DashboardFilter } from '../../types/dashboard-list';
import { DashboardListToolbar } from '../DashboardListToolbar';

describe('DashboardListToolbar', () => {
  it('renders filters, search, and an optional total', async () => {
    const onFilter = jest.fn();
    const onSearch = jest.fn();
    const { user } = renderWithRouter(
      <DashboardListToolbar
        filter={DashboardFilter.All}
        filterOptions={[{ label: 'All dashboards', value: DashboardFilter.All }]}
        onFilter={onFilter}
        onSearch={onSearch}
        placeholderLabel="Search dashboards"
        searchInput=""
        total={3}
        totalLabel="3 dashboards"
      />,
    );

    expect(screen.getByRole('radio', { name: 'All dashboards' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search dashboards' })).toBeInTheDocument();
    expect(screen.getByText('3 dashboards')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Search dashboards' }), 'security');

    expect(onSearch).toHaveBeenCalledWith('s');
  });

  it('does not render a total when it is omitted', () => {
    renderWithRouter(
      <DashboardListToolbar
        filter={DashboardFilter.Custom}
        filterOptions={[]}
        onFilter={jest.fn()}
        onSearch={jest.fn()}
        placeholderLabel="Search dashboards"
        searchInput=""
        totalLabel="unused"
      />,
    );

    expect(screen.queryByText('unused')).not.toBeInTheDocument();
  });
});
