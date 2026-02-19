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

import { Button, IconLink, Spinner, Tooltip, TooltipSide } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { useCurrentUser } from '~adapters/helpers/users';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { isPullRequest } from '~shared/helpers/branch-like';
import { PULL_REQUEST_DECORATION_BINDING_CATEGORY } from '../../constants/settings';
import { useAvailableFeatures } from '../../context/available-features/withAvailableFeatures';
import { getProjectSettingsUrl } from '../../helpers/urls';
import { useProjectBindingQuery } from '../../queries/devops-integration';
import { AlmKeys } from '../../types/alm-settings';
import { Feature } from '../../types/features';
import { Component } from '../../types/types';

interface ComponentNavBindingStatusProps {
  component: Component;
  prLinkAddon?: ReactNode;
}

const DOP_LOGOS = {
  [AlmKeys.Azure]: '/images/alm/azure.svg',
  [AlmKeys.BitbucketCloud]: '/images/alm/bitbucket.svg',
  [AlmKeys.BitbucketServer]: '/images/alm/bitbucket.svg',
  [AlmKeys.GitHub]: '/images/alm/github.svg',
  [AlmKeys.GitLab]: '/images/alm/gitlab.svg',
};

const DOP_LABEL_IDS: Record<AlmKeys, string> = {
  [AlmKeys.Azure]: 'alm.azure',
  [AlmKeys.BitbucketCloud]: 'alm.bitbucketcloud.long',
  [AlmKeys.BitbucketServer]: 'alm.bitbucket.long',
  [AlmKeys.GitHub]: 'alm.github',
  [AlmKeys.GitLab]: 'alm.gitlab',
};

export function ComponentNavBindingStatus(props: Readonly<ComponentNavBindingStatusProps>) {
  const { component, prLinkAddon } = props;
  const { hasFeature } = useAvailableFeatures();
  const { isLoggedIn } = useCurrentUser();
  const { data: currentBranchLike } = useCurrentBranchQuery(component);
  const { data: projectBinding, isLoading: isLoadingProjectBinding } = useProjectBindingQuery(
    component.key,
  );
  const almKey = projectBinding?.alm;

  const hasBranchSupport = hasFeature(Feature.BranchSupport);

  return (
    <div>
      <Spinner isLoading={Boolean(isLoadingProjectBinding)}>
        {!isPullRequest(currentBranchLike) && almKey && (
          <Tooltip
            content={
              <FormattedMessage
                id="project_navigation.binding_status.bound_to_x"
                values={{ dop: <FormattedMessage id={DOP_LABEL_IDS[almKey]} /> }}
              />
            }
            side={TooltipSide.Top}
          >
            <Button
              isDisabled={!projectBinding?.repositoryUrl}
              prefix={<Image alt={almKey} height={16} src={DOP_LOGOS[almKey]} width={16} />}
              to={projectBinding.repositoryUrl}
            >
              {projectBinding?.repositoryUrl ? (
                <FormattedMessage
                  id="project_navigation.binding_status.view_on_x"
                  values={{ dop: <FormattedMessage id={DOP_LABEL_IDS[almKey]} /> }}
                />
              ) : (
                <FormattedMessage
                  id="project_navigation.binding_status.bound_to_x"
                  values={{ dop: <FormattedMessage id={DOP_LABEL_IDS[almKey]} /> }}
                />
              )}
            </Button>
          </Tooltip>
        )}
        {isPullRequest(currentBranchLike) && prLinkAddon}

        {hasBranchSupport &&
          (!projectBinding || !almKey) &&
          !isLoadingProjectBinding &&
          isLoggedIn &&
          component.configuration?.showSettings && (
            <Tooltip
              content={<FormattedMessage id="project_navigation.binding_status.bind.tooltip" />}
              side={TooltipSide.Right}
            >
              <Button
                className="sw-whitespace-nowrap"
                prefix={<IconLink />}
                to={getProjectSettingsUrl(component.key, PULL_REQUEST_DECORATION_BINDING_CATEGORY)}
              >
                <FormattedMessage id="project_navigation.binding_status.bind" />
              </Button>
            </Tooltip>
          )}
      </Spinner>
    </div>
  );
}
