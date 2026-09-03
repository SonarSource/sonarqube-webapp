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

import { useQueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { DashboardLayoutValidationError } from '~feature-dashboards/helpers/dashboard-layout-validation-reporting';
import { DashboardType } from '~feature-dashboards/types/dashboard-list';
import { MetricKey } from '~shared/types/metrics';
import {
  createProjectDashboard,
  deleteProjectDashboard,
  getProjectBuiltInDashboard,
  getProjectDashboard,
  listProjectBuiltInDashboards,
  listProjectCustomDashboards,
  updateProjectDashboard,
} from '../../api/project-dashboard';
import type { ProjectDashboardData } from '../../types/project-dashboards';
import {
  getProjectDuplicateSourceDashboardQueryOptions,
  useCreateProjectDashboardDuplicateMutation,
  useCreateProjectDashboardMutation,
  useDeleteProjectDashboardMutation,
  useGetProjectBuiltInDashboardQuery,
  useGetProjectBuiltInDashboardsListQuery,
  useGetProjectCustomDashboardsListQuery,
  useGetProjectDashboardQuery,
  useUpdateProjectDashboardMutation,
} from '../project-dashboards';

jest.mock('../../api/project-dashboard', () => ({
  createProjectDashboard: jest.fn(),
  deleteProjectDashboard: jest.fn(),
  getProjectBuiltInDashboard: jest.fn(),
  getProjectDashboard: jest.fn(),
  listProjectBuiltInDashboards: jest.fn(),
  listProjectCustomDashboards: jest.fn(),
  updateProjectDashboard: jest.fn(),
}));

const PROJECT_ID = 'project-id';
const DASHBOARD_ID = 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee';
const VALID_EMPTY_LAYOUT = JSON.stringify({ children: [{ children: [], type: 'implicit' }] });
const VALID_WIDGET_LAYOUT = JSON.stringify({
  children: [
    {
      children: [
        {
          dimensions: { height: 4, width: 3 },
          key: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          position: { x: 0, y: 0 },
          props: { metric: { metricKey: MetricKey.violations, type: 'raw' }, scope: 'overall' },
          type: 'count',
        },
      ],
      type: 'implicit',
    },
  ],
});

function customDashboard(overrides: Partial<{ id: string; name: string }> = {}) {
  return {
    createdAt: 1,
    createdById: 'user-1',
    description: null,
    id: DASHBOARD_ID,
    layout: VALID_EMPTY_LAYOUT,
    name: 'Project dashboard',
    resourceId: PROJECT_ID,
    resourceType: 'project' as const,
    updatedAt: 2,
    updatedById: 'user-1',
    ...overrides,
  };
}

function builtInDashboard() {
  return {
    description: null,
    key: 'project-health',
    layout: VALID_WIDGET_LAYOUT,
    name: 'Project health',
    resourceType: 'project' as const,
    updatedAt: 3,
  };
}

async function runQueryFn(
  options: ReturnType<typeof getProjectDuplicateSourceDashboardQueryOptions>,
): Promise<ProjectDashboardData> {
  if (typeof options.queryFn !== 'function') {
    throw new TypeError('queryFn is required');
  }
  return options.queryFn();
}

beforeEach(() => jest.clearAllMocks());

describe('project dashboard queries', () => {
  it('parses a custom dashboard layout and normalizes its description', async () => {
    jest.mocked(getProjectDashboard).mockResolvedValue(customDashboard());

    const { result } = renderHook(
      () => useGetProjectDashboardQuery({ dashboardId: DASHBOARD_ID, projectId: PROJECT_ID }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      description: '',
      id: DASHBOARD_ID,
      type: DashboardType.Custom,
    });
    expect(result.current.data?.layout).toEqual(expect.any(Object));
  });

  it('maps a built-in dashboard and rejects an invalid layout', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(getProjectBuiltInDashboard).mockResolvedValue(builtInDashboard());

    const { result } = renderHook(
      () => useGetProjectBuiltInDashboardQuery({ dashboardKey: 'project-health' }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toMatchObject({
      description: '',
      id: 'project-health',
      type: DashboardType.BuiltIn,
    });
    expect(result.current.data?.updatedById).toBeUndefined();
    expect(result.current.data?.layout).toEqual(expect.any(Object));

    jest.mocked(getProjectBuiltInDashboard).mockResolvedValue({
      ...builtInDashboard(),
      layout: '   ',
    });
    const { result: invalidResult } = renderHook(
      () => useGetProjectBuiltInDashboardQuery({ dashboardKey: 'project-health-invalid' }),
      { wrapper: getContextWrapper() },
    );
    await waitFor(() => {
      expect(invalidResult.current.isError).toBe(true);
    });
    expect(invalidResult.current.error).toBeInstanceOf(DashboardLayoutValidationError);
  });

  it('normalizes custom and built-in dashboard list items', async () => {
    jest.mocked(listProjectCustomDashboards).mockResolvedValue({
      dashboards: [customDashboard()],
      page: { pageIndex: 0, pageSize: 10, total: 1 },
    });
    jest.mocked(listProjectBuiltInDashboards).mockResolvedValue({
      dashboards: [builtInDashboard()],
      page: { pageIndex: 0, pageSize: 10, total: 1 },
    });

    const { result: customResult } = renderHook(
      () => useGetProjectCustomDashboardsListQuery({ projectId: PROJECT_ID }),
      { wrapper: getContextWrapper() },
    );
    const { result: builtInResult } = renderHook(
      () => useGetProjectBuiltInDashboardsListQuery({}),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(customResult.current.isSuccess).toBe(true);
    });
    await waitFor(() => {
      expect(builtInResult.current.isSuccess).toBe(true);
    });

    expect(customResult.current.data?.items[0]).toMatchObject({
      description: '',
      type: DashboardType.Custom,
    });
    expect(builtInResult.current.data?.items[0]).toMatchObject({
      createdAt: 0,
      description: '',
      id: 'project-health',
      type: DashboardType.BuiltIn,
    });
  });

  it('updates the project dashboard caches after create, update, and delete', async () => {
    jest.mocked(createProjectDashboard).mockResolvedValue(customDashboard());
    jest.mocked(updateProjectDashboard).mockResolvedValue(customDashboard());
    jest.mocked(deleteProjectDashboard).mockResolvedValue(undefined);

    const { result } = renderHook(
      () => ({
        client: useQueryClient(),
        create: useCreateProjectDashboardMutation(),
        delete: useDeleteProjectDashboardMutation(),
        update: useUpdateProjectDashboardMutation(),
      }),
      { wrapper: getContextWrapper() },
    );
    const invalidate = jest.spyOn(result.current.client, 'invalidateQueries');
    const remove = jest.spyOn(result.current.client, 'removeQueries');

    await result.current.create.mutateAsync({ name: 'New dashboard', projectId: PROJECT_ID });
    await result.current.update.mutateAsync({
      dashboardId: DASHBOARD_ID,
      name: 'Renamed dashboard',
      projectId: PROJECT_ID,
    });
    await result.current.delete.mutateAsync({ dashboardId: DASHBOARD_ID, projectId: PROJECT_ID });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['project-dashboards', 'list', 'custom', PROJECT_ID],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['project-dashboards', PROJECT_ID, DASHBOARD_ID],
    });
    expect(remove).toHaveBeenCalledWith({
      queryKey: ['project-dashboards', PROJECT_ID, DASHBOARD_ID],
    });
  });

  it('loads a duplicate source and creates a copy using its layout', async () => {
    jest.mocked(getProjectDashboard).mockResolvedValue({
      ...customDashboard(),
      layout: VALID_WIDGET_LAYOUT,
    });
    jest.mocked(createProjectDashboard).mockResolvedValue(customDashboard({ id: 'new-id' }));

    const source = await runQueryFn(
      getProjectDuplicateSourceDashboardQueryOptions({
        dashboard: {
          createdAt: 1,
          createdById: 'user-1',
          description: '',
          id: DASHBOARD_ID,
          name: 'Project dashboard',
          type: DashboardType.Custom,
          updatedAt: 2,
          updatedById: 'user-1',
        },
        projectId: PROJECT_ID,
      }),
    );
    expect(source.type).toBe(DashboardType.Custom);

    const { result } = renderHook(
      () => ({
        client: useQueryClient(),
        mutation: useCreateProjectDashboardDuplicateMutation(),
      }),
      { wrapper: getContextWrapper() },
    );
    const invalidate = jest.spyOn(result.current.client, 'invalidateQueries');

    await result.current.mutation.mutateAsync({
      description: 'Copy',
      duplicateSource: {
        createdAt: 1,
        createdById: 'user-1',
        description: '',
        id: DASHBOARD_ID,
        name: 'Project dashboard',
        type: DashboardType.Custom,
        updatedAt: 2,
        updatedById: 'user-1',
      },
      name: 'Copy',
      projectId: PROJECT_ID,
    });

    expect(createProjectDashboard).toHaveBeenCalledWith({
      description: 'Copy',
      layout: source.layout,
      name: 'Copy',
      projectId: PROJECT_ID,
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['project-dashboards', 'list', 'custom', PROJECT_ID],
    });
  });

  it('loads a built-in dashboard as a duplicate source', async () => {
    jest.mocked(getProjectBuiltInDashboard).mockResolvedValue(builtInDashboard());

    const source = await runQueryFn(
      getProjectDuplicateSourceDashboardQueryOptions({
        dashboard: {
          createdAt: 0,
          description: '',
          id: 'project-health',
          name: 'Project health',
          type: DashboardType.BuiltIn,
          updatedAt: 3,
        },
        projectId: PROJECT_ID,
      }),
    );

    expect(getProjectBuiltInDashboard).toHaveBeenCalledWith('project-health');
    expect(source.type).toBe(DashboardType.BuiltIn);
  });

  it('rejects dashboards from a different resource', async () => {
    jest.mocked(getProjectDashboard).mockResolvedValue({
      ...customDashboard(),
      resourceId: 'another-project',
    });

    const { result } = renderHook(
      () => useGetProjectDashboardQuery({ dashboardId: DASHBOARD_ID, projectId: PROJECT_ID }),
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toEqual(
      new Error('Dashboard does not belong to the requested project'),
    );
  });
});
