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
import { DashboardType } from '../../types/dashboard-list';
import { DashboardCreatorCell } from '../DashboardCreatorCell';

describe('DashboardCreatorCell', () => {
  it('shows the creator name', () => {
    renderWithRouter(
      <DashboardCreatorCell
        dashboard={{ createdById: 'creator-id', type: DashboardType.Custom }}
        dashboardCreators={{ 'creator-id': { avatar: 'avatar', name: 'Alice' } }}
      />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows the removed-user label when the creator is missing', () => {
    renderWithRouter(
      <DashboardCreatorCell
        dashboard={{ createdById: 'removed-id', type: DashboardType.Custom }}
        dashboardCreators={{}}
      />,
    );

    expect(screen.getByText('dashboard.list.removed_user')).toBeInTheDocument();
  });

  it('shows Sonar for a built-in dashboard', () => {
    renderWithRouter(
      <DashboardCreatorCell dashboard={{ type: DashboardType.BuiltIn }} dashboardCreators={{}} />,
    );

    expect(screen.getByText('sonar')).toBeInTheDocument();
  });

  it('shows Sonar for a built-in dashboard even when creator data is present', () => {
    renderWithRouter(
      <DashboardCreatorCell
        dashboard={{ createdById: 'creator-id', type: DashboardType.BuiltIn }}
        dashboardCreators={{ 'creator-id': { avatar: 'avatar', name: 'Alice' } }}
      />,
    );

    expect(screen.getByText('sonar')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('renders nothing when a custom dashboard has no creator', () => {
    const { container } = renderWithRouter(
      <DashboardCreatorCell dashboard={{ type: DashboardType.Custom }} dashboardCreators={{}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
