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
import { DashboardMode, DashboardType } from '~feature-dashboards/types/dashboard-list';
import { renderWithRouter } from '~shared/helpers/test-utils';
import type { ProjectDashboardData } from '../../../../types/project-dashboards';
import { ProjectBuiltInDashboardActions } from '../ProjectBuiltInDashboardActions';

const mockCreate = jest.fn();
const mockDuplicate = jest.fn();
const mockDownloadDashboardSchema = jest.fn();
const mockNavigate = jest.fn();
let mockProjectId: string | undefined = 'project-id';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../../queries/project-dashboards', () => ({
  useCreateProjectDashboardDuplicateMutation: () => ({
    isPending: false,
    mutate: mockDuplicate,
  }),
  useCreateProjectDashboardMutation: () => ({ isPending: false, mutate: mockCreate }),
}));

jest.mock('~sq-server-commons/sq-server-adapters/helpers/useProjectId', () => ({
  useProjectId: () => mockProjectId,
}));

jest.mock('~feature-dashboards/helpers/downloadDashboardSchema', () => ({
  downloadDashboardSchema: (dashboard: ProjectDashboardData) =>
    mockDownloadDashboardSchema(dashboard),
}));

jest.mock('../ProjectDashboardModal', () => ({
  ProjectDashboardModal: ({
    dashboard,
    mode,
    onSave,
  }: {
    dashboard: ProjectDashboardData;
    mode: DashboardMode;
    onSave: (dashboard: ProjectDashboardData) => void;
  }) => (
    <div>
      <span>{`modal-${mode}`}</span>
      <button
        onClick={() => {
          onSave({ ...dashboard, name: `${mode} dashboard` });
        }}
        type="button"
      >
        save-modal
      </button>
    </div>
  ),
}));

const dashboard: ProjectDashboardData = {
  description: 'Built-in dashboard',
  id: 'project-health',
  layout: { children: [{ children: [], type: 'implicit' }] },
  name: 'Project Health',
  type: DashboardType.BuiltIn,
  updatedAt: 1,
};

function setup(canCreateCustomDashboard = true, canDownloadSchema = true) {
  return renderWithRouter(
    <ProjectBuiltInDashboardActions
      canCreateCustomDashboard={canCreateCustomDashboard}
      canDownloadSchema={canDownloadSchema}
      dashboard={dashboard}
      projectKey="project-key"
    />,
  );
}

describe('ProjectBuiltInDashboardActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectId = 'project-id';
  });

  it('creates a custom dashboard and navigates to it', async () => {
    const { user } = setup();

    expect(
      screen.getByRole('button', { name: 'dashboard.create_custom_dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'dashboard.view_all_dashboards' })).toHaveAttribute(
      'href',
      '/project/dashboards?id=project-key',
    );
    expect(screen.getByRole('button', { name: 'more_actions' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'dashboard.create_custom_dashboard' }));
    expect(screen.getByText(`modal-${DashboardMode.Create}`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'save-modal' }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: `${DashboardMode.Create} dashboard`,
        projectId: 'project-id',
      }),
      expect.any(Object),
    );
    expect(mockDuplicate).not.toHaveBeenCalled();

    act(() => {
      mockCreate.mock.calls[0][1].onSuccess({ id: 'created-id', name: 'Created dashboard' });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/project/dashboards/created-id?id=project-key');
  });

  it('duplicates and downloads a built-in dashboard from the menu', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    const menuItems = await screen.findAllByRole('menuitem');
    expect(menuItems.map((item) => item.textContent)).toEqual([
      'dashboard.edit_dashboard_title',
      'dashboard.list.actions.duplicate',
      'dashboard.download_schema',
      'dashboard.list.actions.delete',
    ]);
    expect(menuItems[0]).toHaveAttribute('aria-disabled', 'true');
    expect(menuItems[3]).toHaveAttribute('aria-disabled', 'true');

    await user.click(screen.getByRole('menuitem', { name: 'dashboard.list.actions.duplicate' }));
    expect(screen.getByText(`modal-${DashboardMode.Duplicate}`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'save-modal' }));
    expect(mockDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        duplicateSource: dashboard,
        name: `${DashboardMode.Duplicate} dashboard`,
        projectId: 'project-id',
      }),
      expect.any(Object),
    );
    expect(mockCreate).not.toHaveBeenCalled();

    act(() => {
      mockDuplicate.mock.calls[0][1].onSuccess({
        id: 'duplicated-id',
        name: 'Duplicated dashboard',
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/project/dashboards/duplicated-id?id=project-key');

    await user.click(screen.getByRole('button', { name: 'more_actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'dashboard.download_schema' }));
    expect(mockDownloadDashboardSchema).toHaveBeenCalledWith(dashboard);
  });

  it('only shows the view-all action without authoring permissions', () => {
    setup(false, false);

    expect(screen.getByRole('link', { name: 'dashboard.view_all_dashboards' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'dashboard.create_custom_dashboard' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'more_actions' })).not.toBeInTheDocument();
  });

  it('does not allow creating a custom dashboard until the project UUID is available', () => {
    mockProjectId = undefined;

    setup(true, false);

    expect(
      screen.queryByRole('button', { name: 'dashboard.create_custom_dashboard' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'more_actions' })).not.toBeInTheDocument();
  });
});
