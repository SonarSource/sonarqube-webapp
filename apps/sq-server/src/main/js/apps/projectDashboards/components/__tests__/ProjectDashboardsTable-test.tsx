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
import type { ReactNode } from 'react';
import { DashboardMode, DashboardType } from '~feature-dashboards/types/dashboard-list';
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { ProjectDashboardListItem } from '../../../../types/project-dashboards';
import { ProjectDashboardsTable } from '../ProjectDashboardsTable';

const mockNavigate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockDuplicate = jest.fn();
const mockPrefetch = jest.fn().mockResolvedValue(undefined);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../../queries/project-dashboards', () => ({
  getProjectDuplicateSourceDashboardQueryOptions: jest.fn().mockReturnValue({}),
  useCreateProjectDashboardDuplicateMutation: () => ({ isPending: false, mutate: mockDuplicate }),
  useDeleteProjectDashboardMutation: () => ({ isPending: false, mutate: mockDelete }),
  useUpdateProjectDashboardMutation: () => ({ isPending: false, mutate: mockUpdate }),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query'),
  useQueryClient: () => ({ prefetchQuery: mockPrefetch }),
}));

jest.mock('~feature-dashboards/dashboard-list/DashboardTable', () => ({
  DashboardTable: ({
    dashboards,
    getCreatorContent,
    getDashboardUrl,
    renderActionsCell,
    renderDashboardNameSuffix,
  }: {
    dashboards: ProjectDashboardListItem[];
    getCreatorContent: (dashboard: ProjectDashboardListItem) => ReactNode;
    getDashboardUrl: (dashboard: ProjectDashboardListItem) => string;
    renderActionsCell?: (dashboard: ProjectDashboardListItem) => ReactNode;
    renderDashboardNameSuffix?: (dashboard: ProjectDashboardListItem) => ReactNode;
  }) => (
    <div>
      {dashboards.map((dashboard) => (
        <div data-testid={`row-${dashboard.id}`} key={dashboard.id}>
          <a href={getDashboardUrl(dashboard)}>{dashboard.name}</a>
          {renderDashboardNameSuffix?.(dashboard)}
          <span data-testid={`creator-${dashboard.id}`}>{getCreatorContent(dashboard)}</span>
          {renderActionsCell?.(dashboard)}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('~feature-dashboards/dashboard-list/DashboardKebabMenu', () => ({
  DashboardKebabMenu: ({ items, isVisible }: { isVisible?: boolean; items: ReactNode }) =>
    isVisible ? <div data-testid="kebab-menu">{items}</div> : null,
  DashboardKebabMenuItems: ({
    dashboardName,
    onDelete,
    onDuplicate,
    onEditNameDescription,
  }: {
    dashboardName: string;
    onDelete?: (controls: { close: () => void }) => void;
    onDuplicate?: () => void;
    onEditNameDescription?: () => void;
  }) => (
    <div>
      {onEditNameDescription && (
        <button onClick={onEditNameDescription} type="button">
          {`edit-${dashboardName}`}
        </button>
      )}
      {onDuplicate && (
        <button onClick={onDuplicate} type="button">
          {`duplicate-${dashboardName}`}
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => {
            onDelete({ close: jest.fn() });
          }}
          type="button"
        >
          {`delete-${dashboardName}`}
        </button>
      )}
    </div>
  ),
}));

jest.mock('../ProjectDashboardModal', () => ({
  ProjectDashboardModal: ({
    dashboard,
    mode,
    isOpen,
    onSave,
  }: {
    dashboard: { name: string; id: string };
    isOpen: boolean;
    mode: DashboardMode;
    onSave: (dashboard: { description: string; id: string; name: string }) => void;
  }) =>
    isOpen ? (
      <div data-testid={`modal-${mode}`}>
        <span>{dashboard.name}</span>
        <button
          onClick={() => {
            onSave({ description: '', id: dashboard.id, name: `${dashboard.name} copy` });
          }}
          type="button"
        >
          save
        </button>
      </div>
    ) : null,
}));

function dashboard(overrides: Partial<ProjectDashboardListItem> = {}): ProjectDashboardListItem {
  return {
    createdAt: 1,
    createdById: 'user-id',
    description: 'description',
    id: 'dashboard-id',
    name: 'Project dashboard',
    type: DashboardType.Custom,
    updatedAt: 2,
    ...overrides,
  };
}

function setup(dashboards: ProjectDashboardListItem[], canEdit = true) {
  const result = renderWithRouter(
    <ProjectDashboardsTable
      canEdit={canEdit}
      dashboardCreators={{ 'user-id': { avatar: 'avatar', name: 'Alice' } }}
      dashboards={dashboards}
      isLoadingDashboards={false}
      projectId="project-id"
      projectKey="project-key"
    />,
  );
  return result.user;
}

describe('ProjectDashboardsTable', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders dashboard links and creators', () => {
    setup([dashboard()]);

    expect(screen.getByRole('link', { name: 'Project dashboard' })).toHaveAttribute(
      'href',
      '/project/dashboards/dashboard-id?id=project-key',
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('uses the built-in route and allows duplicating built-in dashboards', async () => {
    const user = setup([
      dashboard({
        createdById: undefined,
        id: 'project-health',
        name: 'Health',
        type: DashboardType.BuiltIn,
      }),
    ]);

    expect(screen.getByRole('link', { name: 'Health' })).toHaveAttribute(
      'href',
      '/project/dashboards/built-in/project-health?id=project-key',
    );
    expect(screen.getByText('dashboard.type.built_in')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'duplicate-Health' }));

    expect(mockPrefetch).toHaveBeenCalled();
    expect(screen.getByTestId(`modal-${DashboardMode.Duplicate}`)).toBeInTheDocument();
  });

  it('shows Sonar as the creator of a built-in dashboard', () => {
    setup([
      dashboard({
        createdById: undefined,
        id: 'project-health',
        name: 'Health',
        type: DashboardType.BuiltIn,
      }),
    ]);

    expect(screen.getByText('sonar')).toBeInTheDocument();
  });

  it('opens the edit modal and updates the dashboard', async () => {
    const user = setup([dashboard()]);

    await user.click(screen.getByRole('button', { name: 'edit-Project dashboard' }));
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ dashboardId: 'dashboard-id', projectId: 'project-id' }),
      expect.any(Object),
    );
  });

  it('prefetches and opens the duplicate modal', async () => {
    const user = setup([dashboard()]);

    await user.click(screen.getByRole('button', { name: 'duplicate-Project dashboard' }));

    expect(mockPrefetch).toHaveBeenCalled();
    expect(screen.getByTestId(`modal-${DashboardMode.Duplicate}`)).toBeInTheDocument();
  });

  it('deletes a custom dashboard', async () => {
    const user = setup([dashboard()]);

    await user.click(screen.getByRole('button', { name: 'delete-Project dashboard' }));

    expect(mockDelete).toHaveBeenCalledWith(
      { dashboardId: 'dashboard-id', projectId: 'project-id' },
      expect.any(Object),
    );
  });
});
