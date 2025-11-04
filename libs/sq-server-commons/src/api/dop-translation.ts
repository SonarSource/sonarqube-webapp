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
  BoundProject,
  DopSetting,
  GitHubConfigurationPayload,
  GitHubConfigurationResponse,
  ProjectBinding,
} from '../types/dop-translation';

const DOP_TRANSLATION_PATH = '/api/v2/dop-translation';
const BOUND_PROJECTS_PATH = `${DOP_TRANSLATION_PATH}/bound-projects`;
const DOP_SETTINGS_PATH = `${DOP_TRANSLATION_PATH}/dop-settings`;
const PROJECT_BINDINGS_PATH = `${DOP_TRANSLATION_PATH}/project-bindings`;
const GITHUB_CONFIGURATIONS_PATH = `${DOP_TRANSLATION_PATH}/github-configurations`;

export function createBoundProject(data: BoundProject) {
  return axiosClient.post(BOUND_PROJECTS_PATH, data);
}

export function getDopSettings() {
  return axiosClient.get<{ dopSettings: DopSetting[]; page: Paging }>(DOP_SETTINGS_PATH);
}

export function getProjectBindings(data: {
  dopSettingId?: string;
  pageIndex?: number;
  pageSize?: number;
  repository?: string;
}) {
  return axiosClient.get<{ page: Paging; projectBindings: ProjectBinding[] }>(
    PROJECT_BINDINGS_PATH,
    {
      params: data,
    },
  );
}

export function searchGitHubConfigurations() {
  return axiosClient.get<{
    githubConfigurations: GitHubConfigurationResponse[];
    page: Paging;
  }>(GITHUB_CONFIGURATIONS_PATH);
}

export function fetchGitHubConfiguration(id: string) {
  return axiosClient.get<GitHubConfigurationResponse>(`${GITHUB_CONFIGURATIONS_PATH}/${id}`);
}

export function createGitHubConfiguration(gitHubConfiguration: GitHubConfigurationPayload) {
  return axiosClient.post<GitHubConfigurationResponse, GitHubConfigurationPayload>(
    GITHUB_CONFIGURATIONS_PATH,
    gitHubConfiguration,
  );
}

export function updateGitHubConfiguration(
  id: string,
  gitHubConfiguration: Partial<GitHubConfigurationPayload>,
) {
  return axiosClient.patch<GitHubConfigurationResponse>(
    `${GITHUB_CONFIGURATIONS_PATH}/${id}`,
    gitHubConfiguration,
  );
}

export function deleteGitHubConfiguration(id: string) {
  return axiosClient.delete(`${GITHUB_CONFIGURATIONS_PATH}/${id}`);
}
