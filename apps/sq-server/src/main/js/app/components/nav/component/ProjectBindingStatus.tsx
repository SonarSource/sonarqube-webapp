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

import {
  Badge,
  BadgeSize,
  BadgeVariety,
  IconLink,
  LinkHighlight,
  LinkStandalone,
  Spinner,
  ToggleTip,
  Tooltip,
  TooltipSide,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { noop } from 'lodash';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { useCurrentUser } from '~adapters/helpers/users';
import { getGithubRepositories } from '~sq-server-commons/api/alm-integrations';
import { getProjectSettingsUrl } from '~sq-server-commons/helpers/urls';
import { useProjectBindingQuery } from '~sq-server-commons/queries/devops-integration';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { Component } from '~sq-server-commons/types/types';
import { isLoggedIn } from '~sq-server-commons/types/users';
import { PULL_REQUEST_DECORATION_BINDING_CATEGORY } from '../../../../apps/settings/constants';

interface ProjectNavBindingStatusProps {
  className?: string;
  component: Component;
}

const DOP_LABEL_IDS: Record<AlmKeys, string> = {
  [AlmKeys.Azure]: 'alm.azure',
  [AlmKeys.BitbucketCloud]: 'alm.bitbucketcloud.long',
  [AlmKeys.BitbucketServer]: 'alm.bitbucket.long',
  [AlmKeys.GitHub]: 'alm.github',
  [AlmKeys.GitLab]: 'alm.gitlab',
};

const DOP_LOGOS = {
  [AlmKeys.Azure]: '/images/alm/azure.svg',
  [AlmKeys.BitbucketCloud]: '/images/alm/bitbucket.svg',
  [AlmKeys.BitbucketServer]: '/images/alm/bitbucket.svg',
  [AlmKeys.GitHub]: '/images/alm/github.svg',
  [AlmKeys.GitLab]: '/images/alm/gitlab.svg',
};

export function ProjectBindingStatus({
  className,
  component,
}: Readonly<ProjectNavBindingStatusProps>) {
  const [repositoryUrl, setRepositoryUrl] = useState<string | undefined>();

  const { formatMessage } = useIntl();

  const { currentUser } = useCurrentUser();

  const { data: projectBinding, isLoading: isLoadingProjectBinding } = useProjectBindingQuery(
    component.key,
  );
  const almKey = projectBinding?.alm;

  const imageTitle =
    almKey &&
    formatMessage(
      { id: 'project_navigation.binding_status.bound_to_x' },
      { dop: formatMessage({ id: DOP_LABEL_IDS[almKey] }) },
    );

  const dopLogoComponent = useMemo(
    () =>
      almKey ? (
        <Image
          alt={imageTitle}
          className={classNames('sw-px-1 sw-align-text-top', className)}
          height={16}
          src={DOP_LOGOS[almKey]}
          title={imageTitle}
          width={16}
        />
      ) : null,
    [almKey, imageTitle, className],
  );

  useEffect(() => {
    // Retrieve the URL of the repository bound to this project
    // Only works for GitHub for now because:
    // - search_[DOP]_repos endpoints don't return the repository URL for Azure and Bitbucket
    // - we can filter on search_gitlab_repos with the repository name but
    //   the project binding object only contains the repository id and not the name
    if (almKey === undefined) {
      return;
    }

    if (almKey === AlmKeys.GitHub) {
      const [organization, repository] = projectBinding?.repository?.split('/') ?? [];
      getGithubRepositories({
        almSetting: almKey,
        organization,
        pageSize: 1,
        query: repository,
      })
        .then(({ repositories }) => {
          setRepositoryUrl(repositories[0].url);
        })
        .catch(noop);
    }
  }, [almKey, component, projectBinding]);

  return (
    <Spinner isLoading={isLoadingProjectBinding}>
      {almKey && repositoryUrl ? (
        <LinkStandalone
          className="sw-flex sw-items-center"
          highlight={LinkHighlight.Default}
          to={repositoryUrl}
        >
          {dopLogoComponent}
        </LinkStandalone>
      ) : (
        dopLogoComponent
      )}

      {!almKey && !isLoadingProjectBinding && !component.configuration?.showSettings && (
        <UnboundBadge className={className} isUserLoggedIn={isLoggedIn(currentUser)} />
      )}

      {!almKey &&
        !isLoadingProjectBinding &&
        isLoggedIn(currentUser) &&
        component.configuration?.showSettings && (
          <Tooltip
            content={<FormattedMessage id="project_navigation.binding_status.bind.tooltip" />}
            side={TooltipSide.Right}
          >
            <LinkStandalone
              className={className}
              highlight={LinkHighlight.Default}
              iconLeft={<IconLink />}
              to={getProjectSettingsUrl(component.key, PULL_REQUEST_DECORATION_BINDING_CATEGORY)}
            >
              <FormattedMessage id="project_navigation.binding_status.bind" />
            </LinkStandalone>
          </Tooltip>
        )}
    </Spinner>
  );
}

const UnboundBadge = forwardRef<HTMLButtonElement, { className?: string; isUserLoggedIn: boolean }>(
  ({ className, isUserLoggedIn }, ref) => {
    const { formatMessage } = useIntl();
    return (
      <Badge className={className} ref={ref} size={BadgeSize.Small} variety={BadgeVariety.Neutral}>
        <FormattedMessage id="project_navigation.binding_status.not_bound" />
        {isUserLoggedIn && (
          <ToggleTip
            ariaLabel={formatMessage({ id: 'toggle_tip.aria_label.unbound_project' })}
            description={
              <FormattedMessage id="project_navigation.binding_status.not_bound.tooltip" />
            }
          />
        )}
      </Badge>
    );
  },
);
UnboundBadge.displayName = 'UnboundBadge';
