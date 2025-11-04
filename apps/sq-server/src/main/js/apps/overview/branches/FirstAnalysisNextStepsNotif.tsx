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

import { FormattedMessage } from 'react-intl';
import { Link } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import { DismissableBanner } from '~sq-server-commons/components/ui/DismissableBanner';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useProjectBindingQuery } from '~sq-server-commons/queries/devops-integration';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Component } from '~sq-server-commons/types/types';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';
import { PULL_REQUEST_DECORATION_BINDING_CATEGORY } from '../../settings/constants';

export interface FirstAnalysisNextStepsNotifProps {
  component: Component;
  currentUser: CurrentUser;
  detectedCIOnLastAnalysis?: boolean;
}

export function FirstAnalysisNextStepsNotif(props: FirstAnalysisNextStepsNotifProps) {
  const { hasFeature } = useAvailableFeatures();

  const { component, currentUser, detectedCIOnLastAnalysis } = props;

  const { data: projectBinding, isLoading } = useProjectBindingQuery(component.key);

  if (!isLoggedIn(currentUser) || component.qualifier !== ComponentQualifier.Project || isLoading) {
    return null;
  }

  const branchesEnabled = hasFeature(Feature.BranchSupport);

  const showConfigurePullRequestDecoNotif = branchesEnabled && projectBinding == null;

  const showConfigureCINotif =
    detectedCIOnLastAnalysis !== undefined ? !detectedCIOnLastAnalysis : false;

  if (!showConfigureCINotif && !showConfigurePullRequestDecoNotif) {
    return null;
  }

  const showOnlyConfigureCI = showConfigureCINotif && !showConfigurePullRequestDecoNotif;
  const showOnlyConfigurePR = showConfigurePullRequestDecoNotif && !showConfigureCINotif;
  const showBoth = showConfigureCINotif && showConfigurePullRequestDecoNotif;
  const isProjectAdmin = component.configuration?.showSettings;

  const tutorialsLink = (
    <Link
      to={{
        pathname: '/tutorials',
        search: queryToSearchString({ id: component.key }),
      }}
    >
      {translate('overview.project.next_steps.links.set_up_ci')}
    </Link>
  );

  const projectSettingsLink = (
    <Link
      to={{
        pathname: '/project/settings',
        search: queryToSearchString({
          id: component.key,
          category: PULL_REQUEST_DECORATION_BINDING_CATEGORY,
        }),
      }}
    >
      {translate('overview.project.next_steps.links.project_settings')}
    </Link>
  );

  return (
    <DismissableBanner alertKey={`config_ci_pr_deco.${component.key}`} variety="info">
      <div>
        {showOnlyConfigureCI && (
          <FormattedMessage
            id="overview.project.next_steps.set_up_ci"
            values={{
              link: tutorialsLink,
            }}
          />
        )}

        {showOnlyConfigurePR &&
          (isProjectAdmin ? (
            <FormattedMessage
              id="overview.project.next_steps.set_up_pr_deco.admin"
              values={{
                link_project_settings: projectSettingsLink,
              }}
            />
          ) : (
            translate('overview.project.next_steps.set_up_pr_deco')
          ))}

        {showBoth &&
          (isProjectAdmin ? (
            <FormattedMessage
              id="overview.project.next_steps.set_up_pr_deco_and_ci.admin"
              values={{
                link_ci: tutorialsLink,
                link_project_settings: projectSettingsLink,
              }}
            />
          ) : (
            <FormattedMessage
              id="overview.project.next_steps.set_up_pr_deco_and_ci"
              values={{ link_ci: tutorialsLink }}
            />
          ))}
      </div>
    </DismissableBanner>
  );
}

export default withCurrentUserContext(FirstAnalysisNextStepsNotif);
