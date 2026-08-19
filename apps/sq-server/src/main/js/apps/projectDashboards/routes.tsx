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

import { Outlet, Route, generatePath } from 'react-router-dom';
import NotFound from '~shared/components/NotFound';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { ComponentQualifier } from '~shared/types/component';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
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

export const ProjectDashboardsListRoute = '/project/dashboards';
export const ProjectCustomDashboardRoute = '/project/dashboards/:dashboardId';
export const ProjectBuiltInDashboardRoute = '/project/dashboards/built-in/:dashboardKey';

function withProjectKey(path: string, projectKey?: string) {
  return projectKey ? `${path}?id=${encodeURIComponent(projectKey)}` : path;
}

export function getProjectDashboardsListRoute(projectKey?: string) {
  return withProjectKey(ProjectDashboardsListRoute, projectKey);
}

export function getProjectCustomDashboardRoute(dashboardId: string, projectKey?: string) {
  return withProjectKey(generatePath(ProjectCustomDashboardRoute, { dashboardId }), projectKey);
}

export function getProjectBuiltInDashboardRoute(dashboardKey: string, projectKey?: string) {
  return withProjectKey(generatePath(ProjectBuiltInDashboardRoute, { dashboardKey }), projectKey);
}

function ProjectDashboardsGuard() {
  const { component } = useComponent();
  return component?.qualifier === ComponentQualifier.Project ? <Outlet /> : <NotFound />;
}

function ProjectCustomDashboardsGuard() {
  const { edition } = useAppState();
  return supportsCustomProjectDashboards(edition) ? <Outlet /> : <NotFound />;
}

export const componentRoutes = () => (
  <Route element={<ProjectDashboardsGuard />}>
    <Route element={<ProjectDashboardsListPage />} path={ProjectDashboardsListRoute} />
    <Route element={<ProjectBuiltInDashboardPage />} path={ProjectBuiltInDashboardRoute} />
    <Route element={<ProjectCustomDashboardsGuard />}>
      <Route element={<ProjectCustomDashboardPage />} path={ProjectCustomDashboardRoute} />
    </Route>
  </Route>
);
