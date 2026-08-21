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

import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { DashboardType } from '~feature-dashboards/types/dashboard-list';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { ComponentQualifier } from '~shared/types/component';
import { ProjectBuiltInDashboardPage } from '../ProjectBuiltInDashboardPage';

let mockComponent:
  | {
      analysisDate?: string;
      isFavorite: boolean;
      key: string;
      name: string;
      qualifier: ComponentQualifier;
      tags: string[];
    }
  | undefined = {
  analysisDate: '2026-08-19',
  isFavorite: false,
  key: 'project-key',
  name: 'Project',
  qualifier: ComponentQualifier.Project,
  tags: ['tag-one'],
};
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
jest.mock('~adapters/helpers/users', () => ({
  useCurrentUser: () => ({ isLoggedIn: true }),
}));
jest.mock('~adapters/queries/branch', () => ({
  useCurrentBranchQuery: () => ({ data: { analysisDate: '2026-08-19', isMain: true } }),
}));
jest.mock('~shared/helpers/branch-like', () => ({
  ...jest.requireActual<typeof import('~shared/helpers/branch-like')>(
    '~shared/helpers/branch-like',
  ),
  isBranch: () => true,
}));
jest.mock('~sq-server-commons/helpers/homepage', () => ({
  getComponentAsHomepage: () => ({ component: 'project-key' }),
}));
jest.mock('~sq-server-commons/queries/measures', () => ({
  useMeasuresAndLeakQuery: () => ({
    data: { component: { measures: [] }, metrics: [] },
  }),
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
  ProjectPageTemplate: ({
    actions,
    callout,
    children,
    metadata,
    title,
  }: {
    actions?: React.ReactNode;
    callout?: React.ReactNode;
    children: React.ReactNode;
    metadata?: React.ReactNode;
    title: string;
  }) => (
    <div>
      {callout}
      <h1>{title}</h1>
      {metadata}
      {actions}
      {children}
    </div>
  ),
}));
jest.mock(
  '../../../overview/branches/ComponentReportActions',
  () =>
    function ComponentReportActions() {
      return <span>downloadable-reports</span>;
    },
);
jest.mock(
  '../../../overview/branches/MetaContentHeader',
  () =>
    function MetaContentHeader() {
      return <span>project-metadata</span>;
    },
);
jest.mock('../../../overview/components/App', () => ({
  App: () => <div>project-empty-overview</div>,
}));
jest.mock(
  '~sq-server-commons/components/controls/Favorite',
  () =>
    function Favorite() {
      return <span>favorite</span>;
    },
);
jest.mock(
  '~sq-server-commons/components/controls/HomePageSelect',
  () =>
    function HomePageSelect() {
      return <span>homepage-select</span>;
    },
);
jest.mock('~sq-server-commons/components/nav/ComponentNavBindingStatus', () => ({
  ComponentNavBindingStatus: () => <span>view-on-github</span>,
}));
jest.mock('~shared/components/tags/Tags', () => ({
  Tags: ({ tags }: { tags: string[] }) => <span>{tags.join(',')}</span>,
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
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    mockComponent = {
      analysisDate: '2026-08-19',
      isFavorite: false,
      key: 'project-key',
      name: 'Project',
      qualifier: ComponentQualifier.Project,
      tags: ['tag-one'],
    };
    mockQuery = { data: undefined, isPending: true };
  });

  it('shows a loading state while the dashboard is being fetched', () => {
    renderWithRouter(<ProjectBuiltInDashboardPage />);

    expect(screen.getByText('overview.page')).toBeInTheDocument();
  });

  it('uses the empty project flow when the project has not been analyzed', () => {
    if (mockComponent) {
      mockComponent.analysisDate = undefined;
    }

    renderWithRouter(<ProjectBuiltInDashboardPage />);

    expect(screen.getByText('project-empty-overview')).toBeInTheDocument();
    expect(screen.queryByText('overview.page')).not.toBeInTheDocument();
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

    expect(screen.getByText('overview.page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project Health' })).toBeInTheDocument();
    expect(screen.getByText('Dashboard description')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'dashboard.view_all_dashboards' })).toHaveAttribute(
      'href',
      '/project/dashboards?id=project-key',
    );
    expect(screen.getByText('project-metadata')).toBeInTheDocument();
    expect(screen.getByText('tag-one')).toBeInTheDocument();
    expect(screen.getByText('downloadable-reports')).toBeInTheDocument();
    expect(screen.getByText('view-on-github')).toBeInTheDocument();
    expect(screen.getByText('favorite')).toBeInTheDocument();
  });

  it('shows a dismissable introduction to the new project overview', async () => {
    mockQuery = {
      data: {
        description: 'Dashboard description',
        key: 'project-health',
        name: 'Project Health',
        type: DashboardType.BuiltIn,
      },
      isPending: false,
    };

    const { user } = renderWithRouter(<ProjectBuiltInDashboardPage />);

    const title = screen.getByText('project_dashboard.overview.banner.title');
    expect(screen.getByText('project_dashboard.overview.banner.description')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'project_dashboard.overview.banner.description_link',
      }),
    ).toHaveAttribute('href', '/dashboard?id=project-key');

    const removal = waitForElementToBeRemoved(title);
    await user.click(screen.getByRole('button', { name: 'message_callout.dismiss' }));
    await removal;
  });
});
