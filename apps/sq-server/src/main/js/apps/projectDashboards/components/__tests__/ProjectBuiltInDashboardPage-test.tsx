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
import { DashboardType } from '~feature-dashboards/types/dashboard-list';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { ProjectBuiltInDashboardPage } from '../ProjectBuiltInDashboardPage';

let mockComponent: { key: string } | undefined = { key: 'project-key' };
let mockQuery: {
  data?: { description?: string; key: string; name: string; type: DashboardType };
  isError?: boolean;
  isPending?: boolean;
} = {
  data: undefined,
  isPending: true,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useParams: () => ({ dashboardKey: 'project-health' }),
}));

jest.mock('~sq-server-commons/context/componentContext/withComponentContext', () => ({
  useComponent: () => ({ component: mockComponent }),
}));
jest.mock('../../../../queries/project-dashboards', () => ({
  useGetProjectBuiltInDashboardQuery: () => mockQuery,
}));
jest.mock(
  '~shared/components/NotFound',
  () =>
    function MockNotFound() {
      return <div>not-found</div>;
    },
);
jest.mock('~shared/components/pages/ProjectPageTemplate', () => ({
  ProjectPageTemplate: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-description/DashboardDescriptionAccordion', () => ({
  DashboardDescriptionAccordion: ({ description }: { description: string }) => <p>{description}</p>,
}));
jest.mock('~feature-dashboards/dashboard-layout/Dashboard', () => ({
  Dashboard: ({ dashboard }: { dashboard: unknown }) => <div>{JSON.stringify(dashboard)}</div>,
}));
jest.mock('~feature-dashboards/dashboard-list/DashboardTypeBadge', () => ({
  DashboardTypeBadge: ({ dashboardType }: { dashboardType: DashboardType }) => (
    <span>{dashboardType}</span>
  ),
}));
jest.mock('~shared/components/a11y/A11ySkipTarget', () => () => null);

describe('ProjectBuiltInDashboardPage', () => {
  afterEach(() => {
    mockComponent = { key: 'project-key' };
    mockQuery = { data: undefined, isPending: true };
  });

  it('shows a loading state while the dashboard is being fetched', () => {
    renderWithRouter(<ProjectBuiltInDashboardPage />);

    expect(screen.getByText('project_dashboards.page')).toBeInTheDocument();
  });

  it('shows not found when the component is missing or the query fails', () => {
    mockComponent = undefined;
    mockQuery = { isError: true, isPending: false };

    renderWithRouter(<ProjectBuiltInDashboardPage />);

    expect(screen.getByText('not-found')).toBeInTheDocument();
  });

  it('renders a loaded built-in dashboard and its description', () => {
    mockQuery = {
      data: {
        description: 'Dashboard description',
        key: 'project-health',
        name: 'Project Health',
        type: DashboardType.BuiltIn,
      },
      isPending: false,
    };

    renderWithRouter(<ProjectBuiltInDashboardPage />);

    expect(screen.getByText('Project Health')).toBeInTheDocument();
    expect(screen.getByText('Dashboard description')).toBeInTheDocument();
  });
});
