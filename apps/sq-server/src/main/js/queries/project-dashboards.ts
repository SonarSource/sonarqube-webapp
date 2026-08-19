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

import { useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { parseDashboardLayoutFromJsonString } from '~feature-dashboards/helpers/dashboard-layout';
import { DashboardType } from '~feature-dashboards/types/dashboard-list';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  createProjectDashboard,
  deleteProjectDashboard,
  getProjectBuiltInDashboard,
  getProjectDashboard,
  listProjectBuiltInDashboards,
  listProjectCustomDashboards,
  updateProjectDashboard,
  type ProjectBuiltInDashboardListItemResponse,
  type ProjectBuiltInDashboardResponse,
  type ProjectCustomDashboardListItemResponse,
  type ProjectCustomDashboardResponse,
  type UpdateProjectDashboardData,
} from '../api/project-dashboard';
import type { ProjectDashboardData, ProjectDashboardListItem } from '../types/project-dashboards';

function assertProjectResource(resourceType: string, resourceId?: string, projectId?: string) {
  if (resourceType !== 'project' || (projectId !== undefined && resourceId !== projectId)) {
    throw new Error('Dashboard does not belong to the requested project');
  }
}

function selectDashboard(
  response: ProjectCustomDashboardResponse,
  projectId: string,
): ProjectDashboardData {
  assertProjectResource(response.resourceType, response.resourceId, projectId);
  return {
    ...response,
    description: response.description ?? '',
    layout: parseDashboardLayoutFromJsonString(response.layout, { layoutDomain: 'project' }),
    type: DashboardType.Custom,
  };
}

function normalizeListItem(
  item: ProjectCustomDashboardListItemResponse,
  projectId: string,
): ProjectDashboardListItem {
  assertProjectResource(item.resourceType, item.resourceId, projectId);
  return { ...item, description: item.description ?? '', type: DashboardType.Custom };
}

function selectBuiltInDashboard(response: ProjectBuiltInDashboardResponse): ProjectDashboardData {
  assertProjectResource(response.resourceType);
  return {
    description: response.description ?? '',
    id: response.key,
    layout: parseDashboardLayoutFromJsonString(response.layout, { layoutDomain: 'project' }),
    name: response.name,
    type: DashboardType.BuiltIn,
    updatedAt: response.updatedAt,
  };
}

function normalizeBuiltInListItem(
  item: ProjectBuiltInDashboardListItemResponse,
): ProjectDashboardListItem {
  assertProjectResource(item.resourceType);
  return {
    createdAt: 0,
    description: item.description ?? '',
    id: item.key,
    name: item.name,
    type: DashboardType.BuiltIn,
    updatedAt: item.updatedAt,
  };
}

function getProjectDashboardQueryOptions(data: {
  dashboardId: string;
  projectId: string;
}): UseQueryOptions<
  ProjectCustomDashboardResponse,
  Error,
  ProjectDashboardData,
  readonly ['project-dashboards', string, string]
> {
  return {
    queryKey: ['project-dashboards', data.projectId, data.dashboardId] as const,
    queryFn: () => getProjectDashboard(data.dashboardId),
    select: (response) => selectDashboard(response, data.projectId),
    staleTime: StaleTime.LONG,
  };
}

export const useGetProjectDashboardQuery = createQueryHook(
  (data: { dashboardId: string; projectId: string }) => getProjectDashboardQueryOptions(data),
);

export const useGetProjectCustomDashboardsListQuery = createQueryHook(
  (data: { pageIndex?: number; pageSize?: number; projectId: string; q?: string }) => ({
    queryKey: [
      'project-dashboards',
      'list',
      'custom',
      data.projectId,
      data.q,
      data.pageIndex,
      data.pageSize,
    ] as const,
    queryFn: () => listProjectCustomDashboards(data),
    select: (response) => ({
      items: response.dashboards.map((item) => normalizeListItem(item, data.projectId)),
      page: response.page,
    }),
    staleTime: StaleTime.LONG,
  }),
);

export const useGetProjectBuiltInDashboardsListQuery = createQueryHook(
  (data: { pageIndex?: number; pageSize?: number; q?: string }) => ({
    queryKey: [
      'project-dashboards',
      'list',
      'built-in',
      data.q,
      data.pageIndex,
      data.pageSize,
    ] as const,
    queryFn: () => listProjectBuiltInDashboards(data),
    select: (response) => ({
      items: response.dashboards.map(normalizeBuiltInListItem),
      page: response.page,
    }),
    staleTime: StaleTime.LONG,
  }),
);

export const useGetProjectBuiltInDashboardQuery = createQueryHook(
  (data: { dashboardKey: string }) => ({
    queryKey: ['project-dashboards', 'built-in', data.dashboardKey] as const,
    queryFn: () => getProjectBuiltInDashboard(data.dashboardKey),
    select: selectBuiltInDashboard,
    staleTime: StaleTime.NEVER,
  }),
);

export function useCreateProjectDashboardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectDashboard,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['project-dashboards', 'list', 'custom', variables.projectId],
      });
    },
  });
}

export type UpdateProjectDashboardMutationVariables = UpdateProjectDashboardData & {
  projectId: string;
};

export function useUpdateProjectDashboardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: UpdateProjectDashboardMutationVariables) =>
      updateProjectDashboard(variables),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['project-dashboards', variables.projectId, variables.dashboardId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['project-dashboards', 'list', 'custom', variables.projectId],
      });
    },
  });
}

export function useDeleteProjectDashboardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { dashboardId: string; projectId: string }) =>
      deleteProjectDashboard(variables.dashboardId),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({
        queryKey: ['project-dashboards', variables.projectId, variables.dashboardId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['project-dashboards', 'list', 'custom', variables.projectId],
      });
    },
  });
}

export type ProjectDashboardDuplicateSource = ProjectDashboardListItem;

export function getProjectDuplicateSourceDashboardQueryOptions(args: {
  dashboard: ProjectDashboardDuplicateSource;
  projectId: string;
}) {
  return {
    queryKey: [
      'project-dashboards',
      'duplicate-from',
      args.projectId,
      args.dashboard.type,
      args.dashboard.id,
    ] as const,
    queryFn: async () =>
      args.dashboard.type === DashboardType.BuiltIn
        ? selectBuiltInDashboard(await getProjectBuiltInDashboard(args.dashboard.id))
        : selectDashboard(await getProjectDashboard(args.dashboard.id), args.projectId),
    staleTime: StaleTime.SHORT,
  } satisfies UseQueryOptions<ProjectDashboardData>;
}

export function useCreateProjectDashboardDuplicateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      description: string;
      duplicateSource: ProjectDashboardDuplicateSource;
      name: string;
      projectId: string;
    }) => {
      const source = await queryClient.fetchQuery(
        getProjectDuplicateSourceDashboardQueryOptions({
          dashboard: variables.duplicateSource,
          projectId: variables.projectId,
        }),
      );
      return createProjectDashboard({
        description: variables.description,
        layout: source.layout,
        name: variables.name,
        projectId: variables.projectId,
      });
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['project-dashboards', 'list', 'custom', variables.projectId],
      });
    },
  });
}
