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

import { cloneDeep, uniqueId } from 'lodash';
import { mockEmailConfiguration } from '../../helpers/mocks/system';
import {
  mockClusterSysInfo,
  mockLogs,
  mockPaging,
  mockStandaloneSysInfo,
} from '../../helpers/testMocks';
import { SupportInformation } from '../../types/settings';
import { EmailConfiguration, LogsLevels } from '../../types/system';
import {
  Provider,
  SysInfoCluster,
  SysInfoLogging,
  SysInfoStandalone,
  SysStatus,
} from '../../types/types';
import {
  getEmailConfigurations,
  getSupportInformation,
  getSystemInfo,
  getSystemStatus,
  getSystemUpgrades,
  patchEmailConfiguration,
  postEmailConfiguration,
  setLogLevel,
} from '../system';

jest.mock('../system');

type SystemUpgrades = {
  installedVersionActive: boolean;
  latestLTA: string;
  updateCenterRefresh: string;
  upgrades: [];
};

export default class SystemServiceMock {
  isCluster = false;
  logging: SysInfoLogging = mockLogs();
  systemInfo: SysInfoCluster | SysInfoStandalone = mockStandaloneSysInfo();
  systemUpgrades: SystemUpgrades = {
    upgrades: [],
    latestLTA: '7.9',
    updateCenterRefresh: '2021-09-01',
    installedVersionActive: true,
  };

  emailConfigurations: EmailConfiguration[] = [];

  supportInformation: SupportInformation = {
    statistics: {
      installationDate: new Date('2025-01-01').toISOString(),
    },
  };

  constructor() {
    this.updateSystemInfo();
    jest.mocked(getSystemInfo).mockImplementation(this.handleGetSystemInfo);
    jest.mocked(getSystemStatus).mockImplementation(this.handleGetSystemStatus);
    jest.mocked(setLogLevel).mockImplementation(this.handleSetLogLevel);
    jest.mocked(getSystemUpgrades).mockImplementation(this.handleGetSystemUpgrades);
    jest.mocked(getEmailConfigurations).mockImplementation(this.handleGetEmailConfigurations);
    jest.mocked(postEmailConfiguration).mockImplementation(this.handlePostEmailConfiguration);
    jest.mocked(patchEmailConfiguration).mockImplementation(this.handlePatchEmailConfiguration);
    jest.mocked(getSupportInformation).mockImplementation(this.handleGetSupportInformation);
  }

  handleGetSystemInfo = () => {
    return this.reply(this.systemInfo);
  };

  handleGetSystemUpgrades = () => {
    return this.reply(this.systemUpgrades);
  };

  handleGetSystemStatus = () => {
    return this.reply({
      status: 'UP' as SysStatus,
      version: 'new',
      id: '1',
    });
  };

  setSystemUpgrades(systemUpgrades: Partial<SystemUpgrades>) {
    this.systemUpgrades = {
      ...this.systemUpgrades,
      ...systemUpgrades,
    };
  }

  setProvider(provider: Provider | null) {
    this.systemInfo = mockStandaloneSysInfo({
      ...this.systemInfo,
      System: {
        ...this.systemInfo.System,
        ...(provider ? { 'External Users and Groups Provisioning': provider } : {}),
      },
    });
  }

  handleSetLogLevel = (logsLevel: LogsLevels) => {
    this.logging = mockLogs(logsLevel);
    this.updateSystemInfo();

    return this.reply(undefined);
  };

  updateSystemInfo = () => {
    const logs = {
      'Web Logging': this.logging,
      'Compute Engine Logging': this.logging,
    };

    this.systemInfo = this.isCluster ? mockClusterSysInfo(logs) : mockStandaloneSysInfo(logs);
  };

  setIsCluster = (isCluster = false) => {
    this.isCluster = isCluster;
    this.updateSystemInfo();
  };

  handleGetEmailConfigurations: typeof getEmailConfigurations = () => {
    return this.reply({
      emailConfigurations: this.emailConfigurations,
      page: mockPaging({ total: this.emailConfigurations.length }),
    });
  };

  handlePostEmailConfiguration: typeof postEmailConfiguration = (configuration) => {
    const returnVal = mockEmailConfiguration(configuration.authMethod, {
      ...configuration,
      id: uniqueId('email-configuration-'),
    });

    this.emailConfigurations.push(returnVal);
    return this.reply(returnVal);
  };

  handlePatchEmailConfiguration: typeof patchEmailConfiguration = (id, configuration) => {
    const index = this.emailConfigurations.findIndex((c) => c.id === id);
    this.emailConfigurations[index] = mockEmailConfiguration(configuration.authMethod, {
      ...this.emailConfigurations[index],
      ...configuration,
    });
    return this.reply(this.emailConfigurations[index]);
  };

  handleGetSupportInformation = () => {
    return this.reply(this.supportInformation);
  };

  addEmailConfiguration = (configuration: EmailConfiguration) => {
    this.emailConfigurations.push(configuration);
  };

  reset = () => {
    this.logging = mockLogs();
    this.setIsCluster(false);
    this.updateSystemInfo();
    this.emailConfigurations = [];
  };

  reply<T>(response: T): Promise<T> {
    return Promise.resolve(cloneDeep(response));
  }
}
