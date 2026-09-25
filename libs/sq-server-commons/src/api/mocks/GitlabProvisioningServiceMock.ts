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

import { cloneDeep, omit, uniqueId } from 'lodash';
import { mockGitlabConfiguration } from '../../helpers/mocks/alm-integrations';
import { mockTask } from '../../helpers/mocks/tasks';
import { mockPaging } from '../../helpers/testMocks';
import {
  DevopsRolesMapping,
  GitlabConfiguration,
  ProvisioningType,
} from '../../types/provisioning';
import { Task, TaskStatuses, TaskTypes } from '../../types/tasks';
import {
  addGitlabRolesMapping,
  createGitLabConfiguration,
  deleteGitLabConfiguration,
  deleteGitlabRolesMapping,
  fetchGitLabConfiguration,
  fetchGitLabConfigurations,
  fetchGitLabConfigurationsSummary,
  fetchGitLabProvisioningStatus,
  fetchGitlabRolesMapping,
  updateGitLabConfiguration,
  updateGitlabRolesMapping,
} from '../gitlab-provisioning';

jest.mock('../gitlab-provisioning');

const defaultGitlabConfiguration: GitlabConfiguration[] = [
  mockGitlabConfiguration({ id: '1', enabled: true, provisioningType: ProvisioningType.jit }),
];

const gitlabMappingMock = (
  id: string,
  permissions: (keyof DevopsRolesMapping['permissions'])[],
  baseRole = false,
) => ({
  id,
  role: id,
  baseRole,
  permissions: {
    user: permissions.includes('user'),
    codeViewer: permissions.includes('codeViewer'),
    issueAdmin: permissions.includes('issueAdmin'),
    securityHotspotAdmin: permissions.includes('securityHotspotAdmin'),
    admin: permissions.includes('admin'),
    scan: permissions.includes('scan'),
  },
});

const defaultMapping: DevopsRolesMapping[] = [
  gitlabMappingMock('guest', ['user', 'codeViewer'], true),
  gitlabMappingMock('reporter', ['user', 'codeViewer'], true),
  gitlabMappingMock(
    'developer',
    ['user', 'codeViewer', 'issueAdmin', 'securityHotspotAdmin', 'scan'],
    true,
  ),
  gitlabMappingMock(
    'maintainer',
    ['user', 'codeViewer', 'issueAdmin', 'securityHotspotAdmin', 'scan'],
    true,
  ),
  gitlabMappingMock(
    'owner',
    ['user', 'codeViewer', 'issueAdmin', 'securityHotspotAdmin', 'admin', 'scan'],
    true,
  ),
];

export default class GitlabProvisioningServiceMock {
  gitlabConfigurations: GitlabConfiguration[];
  gitlabMapping: DevopsRolesMapping[];
  tasks: Task[];

  constructor() {
    this.gitlabConfigurations = cloneDeep(defaultGitlabConfiguration);
    this.gitlabMapping = cloneDeep(defaultMapping);
    this.tasks = [];
    jest.mocked(fetchGitLabConfigurations).mockImplementation(this.handleFetchGitLabConfigurations);
    jest
      .mocked(fetchGitLabConfigurationsSummary)
      .mockImplementation(this.handleFetchGitLabConfigurationsSummary);
    jest.mocked(fetchGitLabConfiguration).mockImplementation(this.handleFetchGitLabConfiguration);
    jest.mocked(createGitLabConfiguration).mockImplementation(this.handleCreateGitLabConfiguration);
    jest.mocked(updateGitLabConfiguration).mockImplementation(this.handleUpdateGitLabConfiguration);
    jest.mocked(deleteGitLabConfiguration).mockImplementation(this.handleDeleteGitLabConfiguration);
    jest.mocked(fetchGitlabRolesMapping).mockImplementation(this.handleFetchGilabRolesMapping);
    jest.mocked(updateGitlabRolesMapping).mockImplementation(this.handleUpdateGitlabRolesMapping);
    jest.mocked(addGitlabRolesMapping).mockImplementation(this.handleAddGitlabRolesMapping);
    jest.mocked(deleteGitlabRolesMapping).mockImplementation(this.handleDeleteGitlabRolesMapping);
    jest
      .mocked(fetchGitLabProvisioningStatus)
      .mockImplementation(this.handleFetchGitLabProvisioningStatus);
  }

  addProvisioningTask = (overrides: Partial<Omit<Task, 'type'>> = {}) => {
    this.tasks.push(
      mockTask({
        id: uniqueId('gitlab-provisioning-task'),
        type: TaskTypes.GitlabProvisioning,
        ...overrides,
      }),
    );
  };

  handleFetchGitLabProvisioningStatus = () => {
    const config = this.gitlabConfigurations[0];
    if (config?.enabled !== true || config.provisioningType !== ProvisioningType.auto) {
      return Promise.resolve({ enabled: false });
    }

    const nextSync = this.tasks.find((t: Task) =>
      [TaskStatuses.InProgress, TaskStatuses.Pending].includes(t.status),
    );
    const lastSync = this.tasks.find(
      (t: Task) => ![TaskStatuses.InProgress, TaskStatuses.Pending].includes(t.status),
    );

    return Promise.resolve({
      enabled: true,
      nextSync: nextSync ? { status: nextSync.status } : undefined,
      lastSync: lastSync
        ? {
            status: lastSync.status,
            finishedAt: lastSync.executedAt,
            startedAt: lastSync.startedAt,
            executionTimeMs: lastSync.executionTimeMs,
            summary: lastSync.status === TaskStatuses.Success ? 'Test summary' : undefined,
            errorMessage: lastSync.errorMessage,
            warningMessage: lastSync.warnings?.join() ?? undefined,
          }
        : undefined,
    });
  };

  handleFetchGitLabConfigurations: typeof fetchGitLabConfigurations = () => {
    return Promise.resolve({
      gitlabConfigurations: this.gitlabConfigurations,
      page: mockPaging({ total: this.gitlabConfigurations.length }),
    });
  };

  handleFetchGitLabConfigurationsSummary: typeof fetchGitLabConfigurationsSummary = () => {
    return Promise.resolve({
      gitlabConfigurations: this.gitlabConfigurations,
      page: mockPaging({ total: this.gitlabConfigurations.length }),
    });
  };

  handleFetchGitLabConfiguration: typeof fetchGitLabConfiguration = (id: string) => {
    const configuration = this.gitlabConfigurations.find((c) => c.id === id);
    if (!configuration) {
      return Promise.reject();
    }
    return Promise.resolve(configuration);
  };

  handleCreateGitLabConfiguration: typeof createGitLabConfiguration = (data) => {
    const newConfig = mockGitlabConfiguration({
      ...omit(data, 'applicationId', 'clientSecret'),
      id: '1',
      enabled: true,
    });
    this.gitlabConfigurations = [...this.gitlabConfigurations, newConfig];
    return Promise.resolve(newConfig);
  };

  handleUpdateGitLabConfiguration: typeof updateGitLabConfiguration = (id, data) => {
    const index = this.gitlabConfigurations.findIndex((c) => c.id === id);
    this.gitlabConfigurations[index] = {
      ...this.gitlabConfigurations[index],
      ...data,
    };
    return Promise.resolve(this.gitlabConfigurations[index]);
  };

  handleDeleteGitLabConfiguration: typeof deleteGitLabConfiguration = (id) => {
    this.gitlabConfigurations = this.gitlabConfigurations.filter((c) => c.id !== id);
    return Promise.resolve();
  };

  setGitlabConfigurations = (gitlabConfigurations: GitlabConfiguration[]) => {
    this.gitlabConfigurations = gitlabConfigurations;
  };

  handleFetchGilabRolesMapping: typeof fetchGitlabRolesMapping = () => {
    return Promise.resolve(this.gitlabMapping);
  };

  handleUpdateGitlabRolesMapping: typeof updateGitlabRolesMapping = (id, data) => {
    this.gitlabMapping = this.gitlabMapping.map((mapping) =>
      mapping.id === id ? { ...mapping, ...data } : mapping,
    );

    return Promise.resolve(
      this.gitlabMapping.find((mapping) => mapping.id === id) as DevopsRolesMapping,
    );
  };

  handleAddGitlabRolesMapping: typeof addGitlabRolesMapping = (data) => {
    const newRole = { ...data, id: data.role };
    this.gitlabMapping = [...this.gitlabMapping, newRole];

    return Promise.resolve(newRole);
  };

  handleDeleteGitlabRolesMapping: typeof deleteGitlabRolesMapping = (id) => {
    this.gitlabMapping = this.gitlabMapping.filter((el) => el.id !== id);
    return Promise.resolve();
  };

  addGitLabCustomRole = (id: string, permissions: (keyof DevopsRolesMapping['permissions'])[]) => {
    this.gitlabMapping = [...this.gitlabMapping, gitlabMappingMock(id, permissions)];
  };

  setGitlabProvisioningEnabled = (enabled: boolean) => {
    if (this.gitlabConfigurations.length > 0) {
      this.gitlabConfigurations[0] = {
        ...this.gitlabConfigurations[0],
        enabled,
        provisioningType: enabled ? ProvisioningType.auto : ProvisioningType.jit,
      };
    }
  };

  reset = () => {
    this.gitlabConfigurations = cloneDeep(defaultGitlabConfiguration);
    this.gitlabMapping = cloneDeep(defaultMapping);
    this.tasks = [];
  };
}
