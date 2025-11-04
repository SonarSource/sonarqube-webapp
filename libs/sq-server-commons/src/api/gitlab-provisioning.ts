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

import { axiosClient } from '~shared/helpers/axios-clients';
import { Paging } from '~shared/types/paging';
import {
  DevopsRolesMapping,
  GitLabConfigurationCreateBody,
  GitLabConfigurationUpdateBody,
  GitlabConfiguration,
  ProvisioningType,
} from '../types/provisioning';

const GITLAB_CONFIGURATIONS = '/api/v2/dop-translation/gitlab-configurations';
const GITLAB_PERMISSION_MAPPINGS = '/api/v2/dop-translation/gitlab-permission-mappings';

export function fetchGitLabConfigurations() {
  return axiosClient.get<{
    gitlabConfigurations: GitlabConfiguration[];
    page: Paging;
  }>(GITLAB_CONFIGURATIONS);
}

export function fetchGitLabConfiguration(id: string): Promise<GitlabConfiguration> {
  return axiosClient.get<GitlabConfiguration>(`${GITLAB_CONFIGURATIONS}/${id}`);
}

export function createGitLabConfiguration(
  data: GitLabConfigurationCreateBody,
): Promise<GitlabConfiguration> {
  return axiosClient.post(GITLAB_CONFIGURATIONS, {
    ...data,
    provisioningType: ProvisioningType.jit,
    allowedGroups: [],
    allowUsersToSignUp: false,
    enabled: true,
  });
}

export function updateGitLabConfiguration(
  id: string,
  data: Partial<GitLabConfigurationUpdateBody>,
) {
  return axiosClient.patch<GitlabConfiguration>(`${GITLAB_CONFIGURATIONS}/${id}`, data);
}

export function deleteGitLabConfiguration(id: string): Promise<void> {
  return axiosClient.delete(`${GITLAB_CONFIGURATIONS}/${id}`);
}

export function syncNowGitLabProvisioning(): Promise<void> {
  return axiosClient.post('/api/v2/dop-translation/gitlab-synchronization-runs');
}

export function fetchGitlabRolesMapping() {
  return axiosClient
    .get<{
      permissionMappings: DevopsRolesMapping[];
    }>(GITLAB_PERMISSION_MAPPINGS)
    .then((data) => data.permissionMappings);
}

export function updateGitlabRolesMapping(
  role: string,
  data: Partial<Pick<DevopsRolesMapping, 'permissions'>>,
) {
  return axiosClient.patch<DevopsRolesMapping>(
    `${GITLAB_PERMISSION_MAPPINGS}/${encodeURIComponent(role)}`,
    data,
  );
}

export function addGitlabRolesMapping(data: Omit<DevopsRolesMapping, 'id'>) {
  return axiosClient.post<DevopsRolesMapping>(GITLAB_PERMISSION_MAPPINGS, data);
}

export function deleteGitlabRolesMapping(role: string) {
  return axiosClient.delete(`${GITLAB_PERMISSION_MAPPINGS}/${encodeURIComponent(role)}`);
}
