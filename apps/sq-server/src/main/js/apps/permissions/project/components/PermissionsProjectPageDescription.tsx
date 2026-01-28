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
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { Component } from '~sq-server-commons/types/types';
import GitHubSynchronisationWarning from '../../../../app/components/GitHubSynchronisationWarning';
import { useProjectProvisionedStatus } from './useProjectProvisionedStatus';

interface Props {
  component: Component;
  isProjectManaged: boolean;
}

export function PermissionsProjectPageDescription(props: Readonly<Props>) {
  const { component, isProjectManaged } = props;
  const { qualifier } = component;

  const { provisioned, provisionedByGitHub } = useProjectProvisionedStatus(
    component,
    isProjectManaged,
  );

  let description = <FormattedMessage id="roles.page.description2" />;
  if (isPortfolioLike(qualifier)) {
    description = <FormattedMessage id="roles.page.description_portfolio" />;
  } else if (isApplication(qualifier)) {
    description = <FormattedMessage id="roles.page.description_application" />;
  }
  return (
    <>
      <p>{description}</p>
      {provisioned && (
        <>
          <p>
            {provisionedByGitHub ? (
              <FormattedMessage id="roles.page.description.github" />
            ) : (
              <FormattedMessage id="roles.page.description.gitlab" />
            )}
          </p>
          <div className="sw-mt-2">
            {provisionedByGitHub && <GitHubSynchronisationWarning short />}
          </div>
        </>
      )}
    </>
  );
}
