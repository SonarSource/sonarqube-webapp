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

import { withRouter } from '~shared/components/hoc/withRouter';
import { Location } from '~shared/types/router';
import AdminContext from '~sq-server-commons/context/AdminContext';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { AppState } from '~sq-server-commons/types/appstate';
import { EditionKey } from '~sq-server-commons/types/editions';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';
import App from './App';

export interface MarketplaceAppContainerProps {
  appState: AppState;
  location: Location;
}

function MarketplaceAppContainer(props: MarketplaceAppContainerProps) {
  const { appState, location } = props;

  const propsToPass = {
    location,
    updateCenterActive: appState.settings[GlobalSettingKeys.UpdatecenterActivated] === 'true',
    currentEdition: appState.edition as EditionKey,
    standaloneMode: appState.standalone,
  };

  return (
    <AdminContext.Consumer>
      {({ fetchPendingPlugins, pendingPlugins }) => (
        <App
          fetchPendingPlugins={fetchPendingPlugins}
          pendingPlugins={pendingPlugins}
          {...propsToPass}
        />
      )}
    </AdminContext.Consumer>
  );
}

export default withRouter(withAppStateContext(MarketplaceAppContainer));
