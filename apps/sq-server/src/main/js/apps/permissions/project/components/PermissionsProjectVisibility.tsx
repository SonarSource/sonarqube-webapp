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

import VisibilitySelector from '~sq-server-commons/components/common/VisibilitySelector';
import {
  useIsGitHubProjectQuery,
  useIsGitLabProjectQuery,
} from '~sq-server-commons/queries/devops-integration';
import { useGithubProvisioningEnabledQuery } from '~sq-server-commons/queries/identity-provider/github';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  component: Component;
  handleVisibilityChange: (visibility: string) => void;
  isLoading: boolean;
  isProjectManaged: boolean;
}

export default function PermissionsProjectVisibility(props: Readonly<Props>) {
  const { component, handleVisibilityChange, isLoading, isProjectManaged } = props;
  const canTurnToPrivate = component.configuration?.canUpdateProjectVisibilityToPrivate;

  const { data: isGitHubProject } = useIsGitHubProjectQuery(component.key);
  const { data: isGitLabProject } = useIsGitLabProjectQuery(component.key);
  const { data: gitHubProvisioningStatus, isFetching: isFetchingGitHubProvisioningStatus } =
    useGithubProvisioningEnabledQuery();
  const isFetching = isFetchingGitHubProvisioningStatus;
  const isDisabled =
    (isGitHubProject && !!gitHubProvisioningStatus) || (isGitLabProject && isProjectManaged);

  return (
    <VisibilitySelector
      canTurnToPrivate={canTurnToPrivate}
      className="sw-flex sw-my-4"
      disabled={isDisabled}
      loading={isLoading || isFetching}
      onChange={handleVisibilityChange}
      visibility={component.visibility}
    />
  );
}
