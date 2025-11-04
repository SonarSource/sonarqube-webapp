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

import { throwGlobalError } from '~adapters/helpers/error';
import { withRouter } from '~shared/components/hoc/withRouter';
import { ComponentQualifier } from '~shared/types/component';
import { Router } from '~shared/types/router';
import { getComponentNavigation } from '~sq-server-commons/api/navigation';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { getComponentAdminUrl, getComponentOverviewUrl } from '~sq-server-commons/helpers/urls';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { AppState } from '~sq-server-commons/types/appstate';
import { Permissions } from '~sq-server-commons/types/permissions';
import { LoggedInUser } from '~sq-server-commons/types/users';
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
