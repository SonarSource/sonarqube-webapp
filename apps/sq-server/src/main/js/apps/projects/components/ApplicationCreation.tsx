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

import { getComponentNavigation } from '~sq-server-shared/api/navigation';
import withAppStateContext from '~sq-server-shared/context/app-state/withAppStateContext';
import withCurrentUserContext from '~sq-server-shared/context/current-user/withCurrentUserContext';
import { getComponentAdminUrl, getComponentOverviewUrl } from '~sq-server-shared/helpers/urls';
import { hasGlobalPermission } from '~sq-server-shared/helpers/users';
import { withRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { throwGlobalError } from '~sq-server-shared/sonar-aligned/helpers/error';
import { ComponentQualifier } from '~sq-server-shared/sonar-aligned/types/component';
import { Router } from '~sq-server-shared/sonar-aligned/types/router';
import { AppState } from '~sq-server-shared/types/appstate';
import { Permissions } from '~sq-server-shared/types/permissions';
import { LoggedInUser } from '~sq-server-shared/types/users';
import CreateApplicationForm from '../../../app/components/extensions/CreateApplicationForm';

export interface ApplicationCreationProps {
  appState: AppState;
  currentUser: LoggedInUser;
  router: Router;
}

export function ApplicationCreation(props: ApplicationCreationProps) {
  const { appState, currentUser, router } = props;

  const canCreateApplication =
    appState.qualifiers.includes(ComponentQualifier.Application) &&
    hasGlobalPermission(currentUser, Permissions.ApplicationCreation);

  if (!canCreateApplication) {
    return null;
  }

  const handleComponentCreate = ({
    key,
    qualifier,
  }: {
    key: string;
    qualifier: ComponentQualifier;
  }) => {
    return getComponentNavigation({ component: key })
      .then(({ configuration }) => {
        if (configuration?.showSettings) {
          router.push(getComponentAdminUrl(key, qualifier));
        } else {
          router.push(getComponentOverviewUrl(key, qualifier));
        }
      })
      .catch(throwGlobalError);
  };

  return <CreateApplicationForm onCreate={handleComponentCreate} />;
}

export default withCurrentUserContext(withRouter(withAppStateContext(ApplicationCreation)));
