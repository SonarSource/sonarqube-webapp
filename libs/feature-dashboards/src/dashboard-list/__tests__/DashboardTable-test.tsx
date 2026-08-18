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
import { DashboardTable } from '../DashboardTable';

jest.mock('~shared/components/intl/DateFromNow', () => ({
  __esModule: true,
  default: ({ date }: { date?: number | string | Date }) => (
    <span data-testid="date-from-now">{date === undefined ? 'no-date' : String(date)}</span>
  ),
}));

describe('DashboardTable', () => {
  function renderTable(
    props: Omit<
      ComponentProps<typeof DashboardTable>,
      'getCreatorContent' | 'getDashboardUrl' | 'gridTemplate'
    > &
      Partial<Pick<ComponentProps<typeof DashboardTable>, 'gridTemplate'>>,
  ) {
    return renderWithRouter(
      <DashboardTable
        getCreatorContent={() => 'Alice'}
        getDashboardUrl={(d) => `/dashboards/${d.id}`}
        gridTemplate="3fr 1fr 1fr 64px"
        {...props}
      />,
      { initialEntries: ['/'] },
    );
  }

  it('shows a loading row when isLoadingDashboards is true', () => {
    renderTable({
      dashboards: [],
      isLoadingDashboards: true,
      isMemberOfOrganization: true,
    });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('dashboard.list.no_results')).not.toBeInTheDocument();
  });

  it('shows empty state when there are no dashboards', () => {
    renderTable({
      dashboards: [],
      isLoadingDashboards: false,
      isMemberOfOrganization: false,
    });

    expect(screen.getByRole('table')).toHaveTextContent('dashboard.list.no_results');
  });

  it('renders dashboard row with name link and creator when member', () => {
    renderTable({
      dashboards: [
        {
          id: 'd1',
          name: 'Quality Overview',
          description: 'Team metrics',
          type: 'custom',
          updatedAt: 1_700_000_000_000,
          createdById: 'u1',
          updatedById: 'u1',
        },
      ],
      isLoadingDashboards: false,
      isMemberOfOrganization: true,
    });

    expect(screen.getByRole('link', { name: 'Quality Overview' })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/dashboards\/d1$/),
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders actions cell when renderActionsCell is provided', () => {
    renderTable({
      dashboards: [
        {
          id: 'd1',
          name: 'With actions',
          description: '',
          type: 'custom',
          updatedAt: 1_700_000_000_000,
        },
      ],
      isLoadingDashboards: false,
      isMemberOfOrganization: true,
      renderActionsCell: () => <span>action-slot</span>,
    });

    expect(screen.getByText('action-slot')).toBeInTheDocument();
  });
});
