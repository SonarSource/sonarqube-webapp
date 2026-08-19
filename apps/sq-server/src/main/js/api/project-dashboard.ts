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

import { createEmptyDashboard } from '~feature-dashboards/dashboard-layout/logic/constants';
import type { DashboardInstance } from '~feature-dashboards/dashboard-layout/logic/types';
import { stringifyDashboardLayout } from '~feature-dashboards/helpers/dashboard-layout';
import { DashboardType } from '~feature-dashboards/types/dashboard-list';
import type { ProjectDashboardWidgetPropMap } from '~feature-dashboards/types/dashboard-widget';
import { assertApiResourceUuid } from '~shared/helpers/api-resource-validation';
import { axiosClient } from '~shared/helpers/axios-clients';
import { Paging } from '~shared/types/paging';

const RESOURCE_TYPE_PROJECT = 'project' as const;
const DASHBOARDS_API_PATH = '/api/v2/dashboards';

export type ProjectCustomDashboardResponse = {
  createdAt: number;
  createdById: string;
  description: string | null;
  id: string;
  layout: string;
  name: string;
  resourceId: string;
  resourceType: 'project' | 'portfolio';
  updatedAt: number;
  updatedById: string;
};

export type ProjectCustomDashboardListItemResponse = Omit<ProjectCustomDashboardResponse, 'layout'>;

export type ProjectBuiltInDashboardResponse = {
  description: string | null;
  key: string;
  layout: string;
  name: string;
  resourceType: 'project' | 'portfolio';
  updatedAt: number;
};

export type ProjectBuiltInDashboardListItemResponse = Omit<
  ProjectBuiltInDashboardResponse,
  'layout'
>;

export interface CreateProjectDashboardData {
  description?: string;
  layout?: DashboardInstance<ProjectDashboardWidgetPropMap>;
  name: string;
  projectId: string;
}

export interface UpdateProjectDashboardData {
  dashboardId: string;
  description?: string;
  layout?: DashboardInstance<ProjectDashboardWidgetPropMap>;
  name?: string;
}

export function getProjectDashboard(dashboardId: string): Promise<ProjectCustomDashboardResponse> {
  if (!assertApiResourceUuid(dashboardId, 'dashboardId')) {
    return Promise.reject(new Error('Invalid UUID for argument dashboardId'));
  }
  return axiosClient.get(`${DASHBOARDS_API_PATH}/${encodeURIComponent(dashboardId)}`);
}

export function createProjectDashboard(
  data: CreateProjectDashboardData,
): Promise<ProjectCustomDashboardResponse> {
  const layout =
    data.layout ?? createEmptyDashboard<ProjectDashboardWidgetPropMap>(DashboardType.Custom).layout;
  return axiosClient.post(DASHBOARDS_API_PATH, {
    description: data.description ?? '',
    layout: stringifyDashboardLayout(layout),
    name: data.name,
    resourceId: data.projectId,
    resourceType: RESOURCE_TYPE_PROJECT,
  });
}

export function updateProjectDashboard(
  data: UpdateProjectDashboardData,
): Promise<ProjectCustomDashboardResponse> {
  return axiosClient.patch(`${DASHBOARDS_API_PATH}/${encodeURIComponent(data.dashboardId)}`, {
    description: data.description,
    layout: data.layout == null ? undefined : stringifyDashboardLayout(data.layout),
    name: data.name,
  });
}

export function deleteProjectDashboard(dashboardId: string): Promise<void> {
  return axiosClient.delete(`${DASHBOARDS_API_PATH}/${encodeURIComponent(dashboardId)}`);
}

export function listProjectCustomDashboards({
  pageIndex,
  pageSize,
  projectId,
  q,
}: {
  pageIndex?: number;
  pageSize?: number;
  projectId: string;
  q?: string;
}): Promise<{ dashboards: ProjectCustomDashboardListItemResponse[]; page: Paging }> {
  return axiosClient.get(DASHBOARDS_API_PATH, {
    params: {
      pageIndex,
      pageSize,
      q,
      resourceId: projectId,
      resourceType: RESOURCE_TYPE_PROJECT,
    },
  });
}

export function listProjectBuiltInDashboards({
  pageIndex,
  pageSize,
  q,
}: {
  pageIndex?: number;
  pageSize?: number;
  q?: string;
}): Promise<{ dashboards: ProjectBuiltInDashboardListItemResponse[]; page: Paging }> {
  return axiosClient.get(`${DASHBOARDS_API_PATH}/built-ins`, {
    params: {
      pageIndex,
      pageSize,
      q,
      resourceType: RESOURCE_TYPE_PROJECT,
    },
  });
}

export function getProjectBuiltInDashboard(
  dashboardKey: string,
): Promise<ProjectBuiltInDashboardResponse> {
  return axiosClient.get(`${DASHBOARDS_API_PATH}/built-ins/${encodeURIComponent(dashboardKey)}`);
}
