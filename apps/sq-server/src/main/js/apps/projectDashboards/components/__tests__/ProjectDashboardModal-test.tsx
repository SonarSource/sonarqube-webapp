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
import { renderWithContext } from '~shared/helpers/test-utils';
import { Visibility } from '~shared/types/component';
import { ProjectDashboardModal } from '../ProjectDashboardModal';

let mockProjectVisibility: Visibility | undefined = Visibility.Private;

jest.mock('~sq-server-commons/context/componentContext/withComponentContext', () => ({
  useComponent: () => ({
    component: mockProjectVisibility ? { visibility: mockProjectVisibility } : undefined,
  }),
}));

jest.mock('~feature-dashboards/dashboard-list/DashboardDetailsModal', () => ({
  DashboardDetailsModal: (props: { isOpen: boolean; trailingContent?: ReactNode }) =>
    props.isOpen ? <div data-testid="dashboard-details-modal">{props.trailingContent}</div> : null,
}));

const dashboard = {
  description: 'A test dashboard',
  id: 'dashboard-id',
  layout: { children: [] } as never,
  name: 'Test dashboard',
  type: DashboardType.Custom,
  updatedAt: 0,
};

function renderModal() {
  renderWithContext(
    <ProjectDashboardModal
      dashboard={dashboard}
      isOpen
      isSaving={false}
      mode={DashboardMode.Create}
      onClose={jest.fn()}
      onOpenChange={jest.fn()}
      onSave={jest.fn()}
    />,
  );
}

describe('ProjectDashboardModal', () => {
  beforeEach(() => {
    mockProjectVisibility = Visibility.Private;
  });

  it('shows private project permissions and access information', () => {
    renderModal();

    expect(screen.getByText('dashboard.modal.permission_access.title')).toBeInTheDocument();
    expect(
      screen.getByText('project_dashboard.modal.permission_access.private_project_description'),
    ).toBeInTheDocument();
  });

  it('shows public project permissions and access information', () => {
    mockProjectVisibility = Visibility.Public;

    renderModal();

    expect(screen.getByText('dashboard.modal.permission_access.title')).toBeInTheDocument();
    expect(
      screen.getByText('project_dashboard.modal.permission_access.public_project_description'),
    ).toBeInTheDocument();
  });

  it('hides permissions and access information when project visibility is unavailable', () => {
    mockProjectVisibility = undefined;

    renderModal();

    expect(screen.queryByText('dashboard.modal.permission_access.title')).not.toBeInTheDocument();
  });
});
