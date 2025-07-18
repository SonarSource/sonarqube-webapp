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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Image } from '~adapters/components/common/Image';
import { FlagMessage, Title } from '~design-system';
import { isApplication, isPortfolioLike, isProject } from '~shared/helpers/component';
import { isDefined } from '~shared/helpers/types';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import {
  useIsGitHubProjectQuery,
  useIsGitLabProjectQuery,
} from '~sq-server-commons/queries/devops-integration';
import { useGithubProvisioningEnabledQuery } from '~sq-server-commons/queries/identity-provider/github';
import { Component } from '~sq-server-commons/types/types';
import GitHubSynchronisationWarning from '../../../../app/components/GitHubSynchronisationWarning';
import ApplyTemplate from './ApplyTemplate';

interface Props {
  component: Component;
  isProjectManaged: boolean;
  loadHolders: () => void;
}

export default function PageHeader(props: Readonly<Props>) {
  const { component, loadHolders, isProjectManaged } = props;
  const { configuration, key, qualifier, visibility } = component;
  const [applyTemplateModal, setApplyTemplateModal] = React.useState(false);
  const { data: isGitHubProject } = useIsGitHubProjectQuery(key);
  const { data: isGitLabProject } = useIsGitLabProjectQuery(key);
  const { data: githubProvisioningStatus } = useGithubProvisioningEnabledQuery();
  // to know if we are provisioning with GitLab: managed + GitLab project

  const provisionedByGitHub = isGitHubProject && !!githubProvisioningStatus;
  const provisionedByGitLab = isGitLabProject && isProjectManaged;
  const provisioned = provisionedByGitHub || provisionedByGitLab;
  const canApplyPermissionTemplate = configuration?.canApplyPermissionTemplate && !provisioned;

  const handleApplyTemplate = () => {
    setApplyTemplateModal(true);
  };

  const handleApplyTemplateClose = () => {
    setApplyTemplateModal(false);
  };

  let description = translate('roles.page.description2');
  if (isPortfolioLike(qualifier)) {
    description = translate('roles.page.description_portfolio');
  } else if (isApplication(qualifier)) {
    description = translate('roles.page.description_application');
  }

  const visibilityDescription =
    isProject(qualifier) && visibility
      ? translate('visibility', visibility, 'description', qualifier)
      : undefined;

  return (
    <header className="sw-mb-2 sw-flex sw-items-center sw-justify-between">
      <div>
        <Title>
          {translate('permissions.page')}
          {provisioned && (
            <Image
              alt={provisionedByGitHub ? 'github' : 'gitlab'}
              aria-label={translateWithParameters(
                'project_permission.managed',
                provisionedByGitHub ? translate('alm.github') : translate('alm.gitlab'),
              )}
              className="sw-mx-2 sw-align-baseline"
              height={16}
              src={`/images/alm/${provisionedByGitHub ? 'github' : 'gitlab'}.svg`}
            />
          )}
        </Title>

        <div>
          <p>{description}</p>
          {isDefined(visibilityDescription) && <p>{visibilityDescription}</p>}
          {provisioned && (
            <>
              <p>
                {provisionedByGitHub
                  ? translate('roles.page.description.github')
                  : translate('roles.page.description.gitlab')}
              </p>
              <div className="sw-mt-2">
                {provisionedByGitHub && <GitHubSynchronisationWarning short />}
              </div>
            </>
          )}
          {githubProvisioningStatus && !isGitHubProject && isProject(component.qualifier) && (
            <FlagMessage className="sw-mt-2" variant="warning">
              {translate('project_permission.local_project_with_github_provisioning')}
            </FlagMessage>
          )}
        </div>
      </div>
      {canApplyPermissionTemplate && (
        <div>
          <Button
            className="js-apply-template"
            onClick={handleApplyTemplate}
            variety={ButtonVariety.Primary}
          >
            {translate('projects_role.apply_template')}
          </Button>

          {applyTemplateModal && (
            <ApplyTemplate
              onApply={loadHolders}
              onClose={handleApplyTemplateClose}
              project={component}
            />
          )}
        </div>
      )}
    </header>
  );
}
