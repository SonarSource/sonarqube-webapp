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
import { Route } from 'react-router-dom';
import { renderWithRoutes } from '~shared/helpers/test-utils';
import { ComponentQualifier } from '~shared/types/component';
import {
  PROJECT_BUILT_IN_DASHBOARD_ROUTE,
  PROJECT_CUSTOM_DASHBOARD_ROUTE,
  PROJECT_DASHBOARDS_LIST_ROUTE,
} from '~sq-server-commons/helpers/project-dashboard-routes';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { EditionKey } from '~sq-server-commons/types/editions';
import {
  componentRoutes,
  getProjectBuiltInDashboardRoute,
  getProjectCustomDashboardRoute,
  getProjectDashboardsListRoute,
  isProjectOverviewRoute,
} from '../routes';

let mockComponentQualifier = ComponentQualifier.Project;
jest.mock('~sq-server-commons/context/componentContext/withComponentContext', () => ({
  useComponent: () => ({ component: { qualifier: mockComponentQualifier } }),
}));

jest.mock('../components/ProjectDashboardsListPage', () => ({
  ProjectDashboardsListPage: () => <div data-testid="project-dashboards-list-page" />,
}));

jest.mock('../components/ProjectCustomDashboardPage', () => ({
  ProjectCustomDashboardPage: () => <div data-testid="project-custom-dashboard-page" />,
}));

jest.mock('../components/ProjectBuiltInDashboardPage', () => ({
  ProjectBuiltInDashboardPage: () => <div data-testid="project-built-in-dashboard-page" />,
}));

function renderProjectRoutes(path: string, edition = EditionKey.enterprise) {
  renderWithRoutes(
    <>
      {componentRoutes()}
      <Route element={<div data-testid="route-not-found" />} path="*" />
    </>,
    { appState: mockAppState({ edition }), initialEntries: [path] },
  );
}

describe('project dashboard routes', () => {
  beforeEach(() => {
    mockComponentQualifier = ComponentQualifier.Project;
  });

  it.each([
    [PROJECT_DASHBOARDS_LIST_ROUTE, 'project-dashboards-list-page'],
    [getProjectCustomDashboardRoute('custom-id'), 'project-custom-dashboard-page'],
    [getProjectBuiltInDashboardRoute('project-health'), 'project-built-in-dashboard-page'],
    [
      getProjectBuiltInDashboardRoute('project-health', undefined, { isDashboardView: true }),
      'project-built-in-dashboard-page',
    ],
  ])('resolves %s to the expected page', async (path, testId) => {
    renderProjectRoutes(path);

    expect(await screen.findByTestId(testId)).toBeInTheDocument();
    expect(screen.queryByTestId('route-not-found')).not.toBeInTheDocument();
  });

  it('exports expected route patterns', () => {
    expect(PROJECT_DASHBOARDS_LIST_ROUTE).toBe('/project/dashboards');
    expect(PROJECT_CUSTOM_DASHBOARD_ROUTE).toBe('/project/dashboards/:dashboardId');
    expect(PROJECT_BUILT_IN_DASHBOARD_ROUTE).toBe('/project/dashboards/built-in/:dashboardKey');
  });

  it('preserves the project key in generated dashboard URLs', () => {
    expect(getProjectDashboardsListRoute('project/key')).toBe(
      '/project/dashboards?id=project%2Fkey',
    );
    expect(getProjectCustomDashboardRoute('custom-id', 'project/key')).toBe(
      '/project/dashboards/custom-id?id=project%2Fkey',
    );
    expect(getProjectBuiltInDashboardRoute('project-health', 'project/key')).toBe(
      '/project/dashboards/built-in/project-health?id=project%2Fkey',
    );
    expect(
      getProjectBuiltInDashboardRoute('project-health', 'project/key', {
        isDashboardView: true,
      }),
    ).toBe('/project/dashboards/built-in/project-health?id=project%2Fkey&view=dashboard');
  });

  it.each([
    ['project-health', '', true],
    ['project-health', '?id=project-key', true],
    ['project-health', '?view=dashboard', false],
    ['reliability', '', false],
    [undefined, '', false],
  ])(
    'identifies whether dashboard %s with search %s is the Project Overview',
    (dashboardKey, search, expected) => {
      expect(isProjectOverviewRoute(dashboardKey, search)).toBe(expected);
    },
  );

  it('rejects project dashboard routes for applications', async () => {
    mockComponentQualifier = ComponentQualifier.Application;

    renderProjectRoutes(PROJECT_DASHBOARDS_LIST_ROUTE);

    expect(await screen.findByRole('heading', { name: 'page_not_found' })).toBeInTheDocument();
    expect(screen.queryByTestId('project-dashboards-list-page')).not.toBeInTheDocument();
  });

  it.each([EditionKey.community, EditionKey.developer])(
    'keeps the project Overview accessible on %s',
    async (edition) => {
      renderProjectRoutes(getProjectBuiltInDashboardRoute('project-health'), edition);
      expect(await screen.findByTestId('project-built-in-dashboard-page')).toBeInTheDocument();
    },
  );

  it.each([
    [
      EditionKey.community,
      getProjectBuiltInDashboardRoute('project-health', undefined, { isDashboardView: true }),
    ],
    [
      EditionKey.developer,
      getProjectBuiltInDashboardRoute('project-health', undefined, { isDashboardView: true }),
    ],
    [EditionKey.community, getProjectBuiltInDashboardRoute('reliability')],
    [EditionKey.developer, getProjectBuiltInDashboardRoute('reliability')],
  ])('rejects built-in Dashboard views on %s', async (edition, path) => {
    renderProjectRoutes(path, edition);

    expect(await screen.findByRole('heading', { name: 'page_not_found' })).toBeInTheDocument();
    expect(screen.queryByTestId('project-built-in-dashboard-page')).not.toBeInTheDocument();
  });

  it.each([
    [
      EditionKey.community,
      getProjectCustomDashboardRoute('custom-id'),
      'project-custom-dashboard-page',
    ],
    [
      EditionKey.developer,
      getProjectCustomDashboardRoute('custom-id'),
      'project-custom-dashboard-page',
    ],
    [EditionKey.community, PROJECT_DASHBOARDS_LIST_ROUTE, 'project-dashboards-list-page'],
    [EditionKey.developer, PROJECT_DASHBOARDS_LIST_ROUTE, 'project-dashboards-list-page'],
  ])('rejects custom dashboard routes on %s', async (edition, path, testId) => {
    renderProjectRoutes(path, edition);

    expect(await screen.findByRole('heading', { name: 'page_not_found' })).toBeInTheDocument();
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
  });
});
