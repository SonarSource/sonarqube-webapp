/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { LinkHighlight, LinkStandalone, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { queryToSearchString } from '~shared/helpers/query';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';

interface PersonalAccessTokenResetLinkProps {
  className?: string;
  createProjectMode: ProjectCreationModeWithPat;
}

type ProjectCreationModeWithPat =
  | CreateProjectModes.AzureDevOps
  | CreateProjectModes.BitbucketCloud
  | CreateProjectModes.BitbucketServer
  | CreateProjectModes.GitLab;

const RESET_PAT_LINK_LABEL_ID: Record<ProjectCreationModeWithPat, string> = {
  [CreateProjectModes.AzureDevOps]: 'onboarding.create_project.azure.subtitle.reset_pat',
  [CreateProjectModes.BitbucketCloud]:
    'onboarding.create_project.bitbucketcloud.subtitle.reset_pat',
  [CreateProjectModes.BitbucketServer]: 'onboarding.create_project.bitbucket.subtitle.reset_pat',
  [CreateProjectModes.GitLab]: 'onboarding.create_project.gitlab.subtitle.reset_pat',
};

export function PersonalAccessTokenResetLink({
  className,
  createProjectMode,
}: Readonly<PersonalAccessTokenResetLinkProps>) {
  return (
    <div className={className}>
      <Text>
        <LinkStandalone
          highlight={LinkHighlight.Subdued}
          to={{
            pathname: '/projects/create',
            search: queryToSearchString({
              mode: createProjectMode,
              resetPat: true,
            }),
          }}
        >
          <FormattedMessage id={RESET_PAT_LINK_LABEL_ID[createProjectMode]} />
        </LinkStandalone>
      </Text>
    </div>
  );
}
