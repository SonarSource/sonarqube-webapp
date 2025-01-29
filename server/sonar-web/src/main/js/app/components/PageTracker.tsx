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

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import withAppStateContext from '~sq-server-shared/context/app-state/withAppStateContext';
import { installScript } from '~sq-server-shared/helpers/extensions';
import { getWebAnalyticsPageHandlerFromCache } from '~sq-server-shared/helpers/extensionsHandler';
import { getInstance } from '~sq-server-shared/helpers/system';
import { withRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { Location } from '~sq-server-shared/sonar-aligned/types/router';
import { AppState } from '~sq-server-shared/types/appstate';

interface Props {
  appState: AppState;
  location: Location;
}

interface State {
  lastLocation?: string;
}

export class PageTracker extends React.Component<React.PropsWithChildren<Props>, State> {
  state: State = {};

  componentDidMount() {
    const { appState } = this.props;

    if (appState.webAnalyticsJsPath && !getWebAnalyticsPageHandlerFromCache()) {
      installScript(appState.webAnalyticsJsPath, 'head');
    }
  }

  trackPage = () => {
    const { location } = this.props;
    const { lastLocation } = this.state;
    const locationChanged = location.pathname !== lastLocation;
    const webAnalyticsPageChange = getWebAnalyticsPageHandlerFromCache();

    if (webAnalyticsPageChange && locationChanged) {
      this.setState({ lastLocation: location.pathname });
      setTimeout(() => webAnalyticsPageChange(location.pathname), 500);
    }
  };

  render() {
    const { appState } = this.props;

    return (
      <Helmet
        defaultTitle={getInstance()}
        defer={false}
        onChangeClientState={appState.webAnalyticsJsPath ? this.trackPage : undefined}>
        {this.props.children}
      </Helmet>
    );
  }
}

export default withRouter(withAppStateContext(PageTracker));
