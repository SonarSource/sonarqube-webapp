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

jest.mock('~shared/helpers/axios-clients', () => {
  const mockAxiosDelete = jest.fn();
  const mockAxiosGet = jest.fn();
  const mockAxiosPatch = jest.fn();
  const mockAxiosPost = jest.fn();

  return {
    axiosClient: {
      delete: mockAxiosDelete,
      get: mockAxiosGet,
      patch: mockAxiosPatch,
      post: mockAxiosPost,
    },
    mockAxiosDelete,
    mockAxiosGet,
    mockAxiosPatch,
    mockAxiosPost,
  };
});

import {
  createProjectDashboard,
  getProjectBuiltInDashboard,
  getProjectDashboard,
  listProjectBuiltInDashboards,
  listProjectCustomDashboards,
  updateProjectDashboard,
} from '../project-dashboard';

const { mockAxiosGet, mockAxiosPatch, mockAxiosPost } = jest.requireMock<{
  mockAxiosGet: jest.Mock;
  mockAxiosPatch: jest.Mock;
  mockAxiosPost: jest.Mock;
}>('~shared/helpers/axios-clients');

const DASHBOARD_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const PROJECT_ID = 'project-id';

beforeEach(() => jest.clearAllMocks());

describe('project dashboard API', () => {
  it('gets a dashboard by id', async () => {
    mockAxiosGet.mockResolvedValue({});

    await getProjectDashboard(DASHBOARD_ID);

    expect(mockAxiosGet).toHaveBeenCalledWith(`/api/v2/dashboards/${DASHBOARD_ID}`);
  });

  it('creates a dashboard for a project resource', async () => {
    mockAxiosPost.mockResolvedValue({});

    await createProjectDashboard({ name: 'Project dashboard', projectId: PROJECT_ID });

    expect(mockAxiosPost).toHaveBeenCalledWith(
      '/api/v2/dashboards',
      expect.objectContaining({ resourceId: PROJECT_ID, resourceType: 'project' }),
    );
  });

  it('lists project dashboards with the project resource type', async () => {
    mockAxiosGet.mockResolvedValue({ dashboards: [], page: {} });

    await listProjectCustomDashboards({ projectId: PROJECT_ID });

    expect(mockAxiosGet).toHaveBeenCalledWith(
      '/api/v2/dashboards',
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matchers are typed as any.
        params: expect.objectContaining({ resourceId: PROJECT_ID, resourceType: 'project' }),
      }),
    );
  });

  it('updates dashboard metadata', async () => {
    mockAxiosPatch.mockResolvedValue({});

    await updateProjectDashboard({ dashboardId: DASHBOARD_ID, name: 'Renamed' });

    expect(mockAxiosPatch).toHaveBeenCalledWith(
      `/api/v2/dashboards/${DASHBOARD_ID}`,
      expect.objectContaining({ name: 'Renamed', layout: undefined }),
    );
  });

  it('lists project built-in dashboards', async () => {
    mockAxiosGet.mockResolvedValue({ dashboards: [], page: {} });

    await listProjectBuiltInDashboards({});

    expect(mockAxiosGet).toHaveBeenCalledWith('/api/v2/dashboards/built-ins', {
      params: {
        pageIndex: undefined,
        pageSize: undefined,
        q: undefined,
        resourceType: 'project',
      },
    });
  });

  it('gets a project built-in dashboard by key', async () => {
    mockAxiosGet.mockResolvedValue({});

    await getProjectBuiltInDashboard('project-health');

    expect(mockAxiosGet).toHaveBeenCalledWith('/api/v2/dashboards/built-ins/project-health');
  });
});
