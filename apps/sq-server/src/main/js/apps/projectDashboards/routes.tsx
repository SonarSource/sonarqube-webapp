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

import { Navigate, Outlet, Route, generatePath, useLocation, useParams } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import { PROJECT_SUMMARY_BASE_URL } from '~adapters/helpers/urls';
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

function withProjectKey(path: string, projectKey?: string) {
  return projectKey ? `${path}?id=${encodeURIComponent(projectKey)}` : path;
}

export function getProjectDashboardsListRoute(projectKey?: string) {
  return withProjectKey(PROJECT_DASHBOARDS_LIST_ROUTE, projectKey);
}

export function getProjectCustomDashboardRoute(dashboardId: string, projectKey?: string) {
  return withProjectKey(generatePath(PROJECT_CUSTOM_DASHBOARD_ROUTE, { dashboardId }), projectKey);
}

export function getProjectBuiltInDashboardRoute(dashboardKey: string, projectKey?: string) {
  return withProjectKey(
    generatePath(PROJECT_BUILT_IN_DASHBOARD_ROUTE, { dashboardKey }),
    projectKey,
  );
}

function ProjectDashboardsGuard() {
  const { organizationReportingEnableDashboards } = useFlags();
  const { component } = useComponent();
  const location = useLocation();
  const { dashboardKey } = useParams();

  if (!organizationReportingEnableDashboards) {
    return component?.qualifier === ComponentQualifier.Project &&
      dashboardKey === PROJECT_HEALTH_DASHBOARD_DEFAULT_KEY ? (
      <Navigate replace to={{ pathname: PROJECT_SUMMARY_BASE_URL, search: location.search }} />
    ) : (
      <NotFound />
    );
  }

  return component?.qualifier === ComponentQualifier.Project ? <Outlet /> : <NotFound />;
}

function ProjectDashboardsEditionGuard() {
  const { edition } = useAppState();
  return supportsCustomProjectDashboards(edition) ? <Outlet /> : <NotFound />;
}

export const componentRoutes = () => (
  <Route element={<ProjectDashboardsGuard />}>
    <Route element={<ProjectBuiltInDashboardPage />} path={PROJECT_BUILT_IN_DASHBOARD_ROUTE} />
    <Route element={<ProjectDashboardsEditionGuard />}>
      <Route element={<ProjectDashboardsListPage />} path={PROJECT_DASHBOARDS_LIST_ROUTE} />
      <Route element={<ProjectCustomDashboardPage />} path={PROJECT_CUSTOM_DASHBOARD_ROUTE} />
    </Route>
  </Route>
);
