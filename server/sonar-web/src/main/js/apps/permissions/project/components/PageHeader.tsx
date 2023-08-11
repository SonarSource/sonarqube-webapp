/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import * as React from 'react';
import GitHubSynchronisationWarning from '../../../../app/components/GitHubSynchronisationWarning';
import { Button } from '../../../../components/controls/buttons';
import { Alert } from '../../../../components/ui/Alert';
import DeferredSpinner from '../../../../components/ui/DeferredSpinner';
import { translate } from '../../../../helpers/l10n';
import { getBaseUrl } from '../../../../helpers/system';
import { useGithubProvisioningEnabledQuery } from '../../../../queries/identity-provider';
import { isApplication, isPortfolioLike, isProject } from '../../../../types/component';
import { Component } from '../../../../types/types';
import ApplyTemplate from './ApplyTemplate';

interface Props {
  component: Component;
  isGitHubProject: boolean;
  loadHolders: () => void;
  loading: boolean;
}

export default function PageHeader(props: Props) {
  const [applyTemplateModal, setApplyTemplateModal] = React.useState(false);
  const { data: githubProvisioningStatus } = useGithubProvisioningEnabledQuery();

  const { component, isGitHubProject, loading } = props;
  const { configuration } = component;
  const provisionedByGitHub = isGitHubProject && !!githubProvisioningStatus;
  const canApplyPermissionTemplate =
    configuration?.canApplyPermissionTemplate && !provisionedByGitHub;

  const handleApplyTemplate = () => {
    setApplyTemplateModal(true);
  };

  const handleApplyTemplateClose = () => {
    setApplyTemplateModal(false);
  };

  let description = translate('roles.page.description2');
  if (isPortfolioLike(component.qualifier)) {
    description = translate('roles.page.description_portfolio');
  } else if (isApplication(component.qualifier)) {
    description = translate('roles.page.description_application');
  }

  const visibilityDescription =
    isProject(component.qualifier) && component.visibility
      ? translate('visibility', component.visibility, 'description', component.qualifier)
      : undefined;

  return (
    <header className="page-header">
      <h1 className="page-title">
        {translate('permissions.page')}
        {provisionedByGitHub && (
          <img
            alt="github"
            className="spacer-left spacer-right"
            aria-label={translate('project_permission.github_managed')}
            height={16}
            src={`${getBaseUrl()}/images/alm/github.svg`}
          />
        )}
      </h1>

      <DeferredSpinner className="spacer-left" loading={loading} />

      {canApplyPermissionTemplate && (
        <div className="page-actions">
          <Button className="js-apply-template" onClick={handleApplyTemplate}>
            {translate('projects_role.apply_template')}
          </Button>

          {applyTemplateModal && (
            <ApplyTemplate
              onApply={props.loadHolders}
              onClose={handleApplyTemplateClose}
              project={component}
            />
          )}
        </div>
      )}

      <div className="page-description">
        <p>{description}</p>
        {visibilityDescription && <p>{visibilityDescription}</p>}
        {provisionedByGitHub && (
          <>
            <p>{translate('roles.page.description.github')}</p>
            <div className="sw-mt-2">
              <GitHubSynchronisationWarning short />
            </div>
          </>
        )}
        {githubProvisioningStatus && !isGitHubProject && (
          <Alert variant="warning" className="sw-mt-2">
            {translate('project_permission.local_project_with_github_provisioning')}
          </Alert>
        )}
      </div>
    </header>
  );
}
