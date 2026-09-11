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

import { AlmKeys } from '../../types/alm-settings';
import {
  AffectedInstallation,
  GitHubConfigurationResponse,
  PermissionCheckResource,
  PermissionCheckStatus,
  PermissionDeficit,
} from '../../types/dop-translation';
import { ProvisioningType } from '../../types/provisioning';

export function mockGitHubConfiguration(
  overrides: Partial<GitHubConfigurationResponse> = {},
): GitHubConfigurationResponse {
  return {
    allowUsersToSignUp: true,
    allowedOrganizations: [],
    apiUrl: 'apiUrl',
    applicationId: 'app123',
    enabled: true,
    id: '123',
    projectVisibility: true,
    provisioningType: ProvisioningType.jit,
    synchronizeGroups: true,
    userConsentRequiredAfterUpgrade: false,
    webUrl: 'webUrl',
    ...overrides,
  };
}

export function mockPermissionCheckResource(
  overrides: Partial<PermissionCheckResource> = {},
): PermissionCheckResource {
  return {
    checkedAt: 1_700_000_000_000,
    key: 'github-config',
    status: PermissionCheckStatus.Sufficient,
    type: AlmKeys.GitHub,
    ...overrides,
  };
}

export function mockPermissionDeficit(
  overrides: Partial<PermissionDeficit> = {},
): PermissionDeficit {
  return {
    granted: 'read',
    permission: 'contents',
    required: 'write',
    ...overrides,
  };
}

export function mockAffectedInstallation(
  overrides: Partial<AffectedInstallation> = {},
): AffectedInstallation {
  return {
    installationId: '1',
    installationOwner: 'acme-corp',
    missingPermissions: [mockPermissionDeficit()],
    settingsUrl: 'https://github.com/organizations/acme-corp/settings/installations/1',
    ...overrides,
  };
}
