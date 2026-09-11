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

import { AlmInstanceBase, AlmKeys } from './alm-settings';
import { ProvisioningType } from './provisioning';

export interface DopSetting extends AlmInstanceBase {
  appId?: string;
  id: string;
  type: AlmKeys;
}

export interface BoundProject {
  devOpsPlatformSettingId: string;
  inlineAnnotationsEnabled?: boolean;
  monorepo: boolean;
  newCodeDefinitionType?: string;
  newCodeDefinitionValue?: string;
  projectIdentifier?: string;
  projectKey: string;
  projectName: string;
  repositoryIdentifier: string;
  summaryCommentEnabled?: boolean;
}

export interface ProjectBinding {
  dopSetting: string;
  id: string;
  projectId: string;
  projectKey: string;
  repository: string;
  slug: string;
}

interface GitHubConfigurationBase {
  allowUsersToSignUp: boolean;
  allowedOrganizations: string[];
  apiUrl: string;
  applicationId: string;
  enabled: boolean;
  projectVisibility: boolean;
  provisioningType: ProvisioningType;
  synchronizeGroups: boolean;
  userConsentRequiredAfterUpgrade: boolean;
  webUrl: string;
}

export interface GitHubConfigurationPayload extends GitHubConfigurationBase {
  clientId: string;
  clientSecret: string;
  privateKey: string;
}

export interface GitHubConfigurationResponse extends GitHubConfigurationBase {
  errorMessage?: string;
  id: string;
}

export enum PermissionCheckStatus {
  Sufficient = 'SUFFICIENT',
  Insufficient = 'INSUFFICIENT',
  Unknown = 'UNKNOWN',
  CheckFailed = 'CHECK_FAILED',
  UnsupportedTokenType = 'UNSUPPORTED_TOKEN_TYPE',
}

/**
 * Completeness of the GitHub installation scan behind {@link PermissionCheckResource.affectedInstallations}
 * (SONAR-32166). `affectedInstallationCount`/`affectedInstallations` are only authoritative when this is
 * `Complete` — a `Failed` scan must not be read as "no affected installations". For the admin
 * (connection-wide) check, "no installations exist anywhere for this connection" is signaled by
 * {@link PermissionCheckResource.totalInstallationCount} being `0`, not by this enum.
 *
 * `NotRun` is project-scoped only: it means the check was never actually evaluated because
 * the project has no bound repository at all. `status` on that entry can still read `SUFFICIENT`,
 * but that is not a real signal — callers gating Remediation Agent availability on a genuine
 * binding (see {@link useRemediationAgentBindingSupport} and `useCanAssignToAgent`) must treat it
 * the same as "no binding".
 */
export enum InstallationCheckStatus {
  Complete = 'COMPLETE',
  Failed = 'FAILED',
  /**
   * Project checks only: the GitHub App is not installed for *that project's repository*
   * specifically — a project can hit this even while the connection overall has other
   * installations elsewhere. It does not mean the app has no installations anywhere, and the
   * admin all-connections check this widget reads never returns it.
   * @public Part of the backend API contract — keep even though currently unreferenced by name.
   */
  NotInstalled = 'NOT_INSTALLED',
  NotRun = 'NOT_RUN',
}

/**
 * A single permission gap, shared by {@link PermissionCheckResource.appMissingPermissions} (app
 * configuration level) and {@link AffectedInstallation.missingPermissions} (per-installation
 * approval level). `granted` is `null`/absent when the permission wasn't granted at all.
 */
export interface PermissionDeficit {
  granted?: string | null;
  permission: string;
  required: string;
}

/**
 * One GitHub App installation missing one or more remediation permissions. `installationOwner`
 * names the installation's owner, which can be an organization *or* a personal account — UI copy
 * referencing installations must stay installation-neutral (say "installation", not
 * "organization"/"account") rather than assume every entry belongs to an organization.
 */
export interface AffectedInstallation {
  installationId: string;
  installationOwner: string;
  missingPermissions: PermissionDeficit[];
  settingsUrl: string;
}

export interface PermissionCheckResource {
  /** Exact count after a `Complete` installation scan; GitLab/Azure omit this. Never includes a
   * deficit already reported in {@link appMissingPermissions} — the backend only returns
   * actionable installation-approval findings, so the frontend does not need to dedupe. The
   * backend response is exhaustive — the frontend applies its own display limit. */
  affectedInstallationCount?: number;
  /** All affected installations, sorted by installation owner name then installation ID. GitLab/Azure omit this. */
  affectedInstallations?: AffectedInstallation[];
  /** App-configuration-level permission deficits, distinct from per-installation approval
   * deficits in {@link affectedInstallations}. GitLab/Azure omit this. */
  appMissingPermissions?: PermissionDeficit[];
  /** Epoch millis the cached result was produced. Always present on the backend response. */
  checkedAt: number;
  installationCheckStatus?: InstallationCheckStatus;
  key: string;
  status: PermissionCheckStatus;
  /** Total installations found by a `Complete` admin scan, independent of how many are affected —
   * lets the frontend tell "no installations exist anywhere for this connection" (`0`) apart from
   * "every installation approved" (`affectedInstallationCount === 0` and this is `> 0`). GitLab/Azure
   * omit this; an omitted value must not be read as proof of either case. */
  totalInstallationCount?: number;
  type: AlmKeys;
}

export interface PermissionChecksResponse {
  permissionChecks: PermissionCheckResource[];
}
