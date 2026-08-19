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

import { act, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { EditionKey } from '~sq-server-commons/types/editions';
import { ProjectDashboardsListPage } from '../ProjectDashboardsListPage';

const mockCreate: jest.MockedFunction<
  (
    variables: { description: string; name: string; projectId: string },
    options: { onSuccess: (dashboard: { id: string; name: string }) => void },
  ) => void
> = jest.fn();
const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

jest.mock('~adapters/helpers/useProjectId', () => ({ useProjectId: () => 'project-id' }));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/useProjectId', () => ({
  useProjectId: () => 'project-id',
}));
jest.mock('~sq-server-commons/context/componentContext/withComponentContext', () => ({
  useComponent: () => ({ component: { key: 'project-key' } }),
}));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/users', () => ({
  useCurrentUser: () => ({ isLoggedIn: true }),
}));
jest.mock('~sq-server-commons/queries/users', () => ({
  useUsersByIdsQuery: () => ({ data: { 'user-id': { avatar: 'avatar', name: 'Alice' } } }),
}));

jest.mock('../../../../queries/project-dashboards', () => ({
  useCreateProjectDashboardMutation: () => ({ isPending: false, mutate: mockCreate }),
  useGetProjectBuiltInDashboardsListQuery: () => ({
    data: {
      items: [
        {
          createdAt: 0,
          description: '',
          id: 'project-health',
          name: 'Project Health',
          type: 'built_in',
          updatedAt: 1,
        },
      ],
      page: { total: 1 },
    },
    isPending: false,
  }),
  useGetProjectCustomDashboardsListQuery: () => ({
    data: {
      items: [
        {
          createdAt: 1,
          createdById: 'user-id',
          description: 'description',
          id: 'custom-id',
          name: 'Custom dashboard',
          type: 'custom',
          updatedAt: 2,
        },
      ],
      page: { total: 1 },
    },
    isPending: false,
  }),
}));

jest.mock('~feature-dashboards/dashboard-list/DashboardListToolbar', () => ({
  DashboardListToolbar: ({
    filterOptions,
    onFilter,
    onSearch,
    total,
  }: {
    filterOptions: { label: string; value: string }[];
    onFilter: (value: string) => void;
    onSearch: (value: string) => void;
    total?: number;
  }) => (
    <div>
      <span data-testid="total">{total}</span>
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            onFilter(option.value);
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
      <button
        onClick={() => {
          onSearch('security');
        }}
        type="button"
      >
        search
      </button>
    </div>
  ),
}));

jest.mock('../ProjectDashboardsTable', () => ({
  ProjectDashboardsTable: ({
    canEdit,
    dashboards,
  }: {
    canEdit: boolean;
    dashboards: { name: string }[];
  }) => (
    <div data-can-edit={canEdit} data-testid="dashboard-table">
      {dashboards.map((dashboard) => dashboard.name).join(',')}
    </div>
  ),
}));

jest.mock('../ProjectDashboardModal', () => ({
  ProjectDashboardModal: ({
    isOpen,
    mode,
    onSave,
  }: {
    isOpen: boolean;
    mode: string;
    onSave: (dashboard: { description: string; name: string }) => void;
  }) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button
          onClick={() => {
            onSave({ description: 'description', name: 'New dashboard' });
          }}
          type="button"
        >
          save-dashboard
        </button>
        <span>{mode}</span>
      </div>
    ) : null,
}));
jest.mock('~shared/components/pages/ProjectPageTemplate', () => ({
  ProjectPageTemplate: ({
    actions,
    children,
    title,
  }: {
    actions?: ReactNode;
    children: ReactNode;
    title: ReactNode;
  }) => (
    <div>
      {title}
      {actions}
      {children}
    </div>
  ),
}));

function renderProjectDashboardsListPage(edition = EditionKey.developer) {
  return renderWithRouter(<ProjectDashboardsListPage />, {
    appState: mockAppState({ edition }),
  });
}

describe('ProjectDashboardsListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders built-in and custom dashboards with the all filter', () => {
    renderProjectDashboardsListPage();

    expect(screen.getByTestId('dashboard-table')).toHaveTextContent(
      'Project Health,Custom dashboard',
    );
    expect(screen.getByTestId('total')).toHaveTextContent('2');
  });

  it('changes the filter and resets the page', async () => {
    const { user } = renderProjectDashboardsListPage();

    await user.click(screen.getByRole('button', { name: 'dashboard.type.custom' }));

    expect(mockSetSearchParams).not.toHaveBeenCalled();
    expect(screen.getByTestId('dashboard-table')).toBeInTheDocument();
  });

  it('creates a dashboard and navigates to it after success', async () => {
    const { user } = renderProjectDashboardsListPage();

    await user.click(screen.getByRole('button', { name: 'project_dashboards.create_dashboard' }));
    await user.click(screen.getByRole('button', { name: 'save-dashboard' }));

    expect(mockCreate).toHaveBeenCalledWith(
      { description: 'description', name: 'New dashboard', projectId: 'project-id' },
      expect.any(Object),
    );

    act(() => {
      mockCreate.mock.calls[0][1].onSuccess({ id: 'new-id', name: 'New dashboard' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/project/dashboards/new-id?id=project-key');
  });

  it('only exposes built-in dashboards in Community Build', () => {
    renderProjectDashboardsListPage(EditionKey.community);

    expect(screen.getByTestId('dashboard-table')).toHaveTextContent('Project Health');
    expect(screen.getByTestId('dashboard-table')).not.toHaveTextContent('Custom dashboard');
    expect(screen.getByTestId('dashboard-table')).toHaveAttribute('data-can-edit', 'false');
    expect(
      screen.queryByRole('button', { name: 'project_dashboards.create_dashboard' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'dashboard.type.custom' })).not.toBeInTheDocument();
  });
});
