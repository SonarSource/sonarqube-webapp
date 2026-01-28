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

import {
  useIsGitHubProjectQuery,
  useIsGitLabProjectQuery,
} from '~sq-server-commons/queries/devops-integration';
import { useGithubProvisioningEnabledQuery } from '~sq-server-commons/queries/identity-provider/github';
import { Component } from '~sq-server-commons/types/types';

export function useProjectProvisionedStatus(component: Component, isProjectManaged: boolean) {
  const { data: isGitHubProject } = useIsGitHubProjectQuery(component.key);
  const { data: isGitLabProject } = useIsGitLabProjectQuery(component.key);
  const { data: githubProvisioningStatus } = useGithubProvisioningEnabledQuery();
  // to know if we are provisioning with GitLab: managed + GitLab project

  const provisionedByGitHub = isGitHubProject && !!githubProvisioningStatus;
  const provisionedByGitLab = isGitLabProject && isProjectManaged;
  const provisioned = provisionedByGitHub || provisionedByGitLab;
  const canApplyPermissionTemplate =
    component.configuration?.canApplyPermissionTemplate && !provisioned;

  return {
    canApplyPermissionTemplate,
    githubProvisioningStatus,
    isGitHubProject,
    isGitLabProject,
    provisioned,
    provisionedByGitHub,
    provisionedByGitLab,
  };
}
