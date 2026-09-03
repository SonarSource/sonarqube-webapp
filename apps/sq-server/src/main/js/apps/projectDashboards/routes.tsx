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

import { Outlet, Route, generatePath, useLocation, useParams } from 'react-router-dom';
import NotFound from '~shared/components/NotFound';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { ComponentQualifier } from '~shared/types/component';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import {
  PROJECT_BUILT_IN_DASHBOARD_ROUTE,
  PROJECT_CUSTOM_DASHBOARD_ROUTE,
  PROJECT_DASHBOARDS_LIST_ROUTE,
  PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY,
} from '~sq-server-commons/helpers/project-dashboard-routes';
import { supportsCustomProjectDashboards } from './permissions';

const PROJECT_DASHBOARD_VIEW_QUERY_PARAM = 'view';
const PROJECT_DASHBOARD_VIEW_QUERY_VALUE = 'dashboard';

const ProjectDashboardsListPage = lazyLoadComponent(() =>
  import('./components/ProjectDashboardsListPage').then((m) => ({
    default: m.ProjectDashboardsListPage,
  })),
);
const ProjectCustomDashboardPage = lazyLoadComponent(() =>
  import('./components/ProjectCustomDashboardPage').then((m) => ({
    default: m.ProjectCustomDashboardPage,
  })),
);
const ProjectBuiltInDashboardPage = lazyLoadComponent(() =>
  import('./components/ProjectBuiltInDashboardPage').then((m) => ({
    default: m.ProjectBuiltInDashboardPage,
  })),
);

function withProjectKey(path: string, projectKey?: string, isDashboardView = false) {
  const searchParams = new URLSearchParams();
  if (projectKey) {
    searchParams.set('id', projectKey);
  }
  if (isDashboardView) {
    searchParams.set(PROJECT_DASHBOARD_VIEW_QUERY_PARAM, PROJECT_DASHBOARD_VIEW_QUERY_VALUE);
  }
  const search = searchParams.toString();
  return search ? `${path}?${search}` : path;
}

export function getProjectDashboardsListRoute(projectKey?: string) {
  return withProjectKey(PROJECT_DASHBOARDS_LIST_ROUTE, projectKey);
}

export function getProjectCustomDashboardRoute(dashboardId: string, projectKey?: string) {
  return withProjectKey(generatePath(PROJECT_CUSTOM_DASHBOARD_ROUTE, { dashboardId }), projectKey);
}

export function getProjectBuiltInDashboardRoute(
  dashboardKey: string,
  projectKey?: string,
  { isDashboardView = false }: { isDashboardView?: boolean } = {},
) {
  return withProjectKey(
    generatePath(PROJECT_BUILT_IN_DASHBOARD_ROUTE, { dashboardKey }),
    projectKey,
    isDashboardView,
  );
}

export function isProjectDashboardView(search: string) {
  return (
    new URLSearchParams(search).get(PROJECT_DASHBOARD_VIEW_QUERY_PARAM) ===
    PROJECT_DASHBOARD_VIEW_QUERY_VALUE
  );
}

export function isProjectOverviewRoute(dashboardKey: string | undefined, search: string) {
  return dashboardKey === PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY && !isProjectDashboardView(search);
}

function ProjectDashboardsGuard() {
  const { component } = useComponent();

  return component?.qualifier === ComponentQualifier.Project ? <Outlet /> : <NotFound />;
}

function ProjectDashboardsEditionGuard() {
  const { edition } = useAppState();
  const location = useLocation();
  const { dashboardKey } = useParams();
  const isProjectOverview = isProjectOverviewRoute(dashboardKey, location.search);

  return supportsCustomProjectDashboards(edition) || isProjectOverview ? <Outlet /> : <NotFound />;
}

export const componentRoutes = () => (
  <Route element={<ProjectDashboardsEditionGuard />}>
    <Route element={<ProjectDashboardsGuard />}>
      <Route element={<ProjectBuiltInDashboardPage />} path={PROJECT_BUILT_IN_DASHBOARD_ROUTE} />
      <Route element={<ProjectDashboardsListPage />} path={PROJECT_DASHBOARDS_LIST_ROUTE} />
      <Route element={<ProjectCustomDashboardPage />} path={PROJECT_CUSTOM_DASHBOARD_ROUTE} />
    </Route>
  </Route>
);
