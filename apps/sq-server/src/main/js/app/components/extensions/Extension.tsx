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

import { withTheme } from '@emotion/react';
import { toast } from '@sonarsource/echoes-react';
import { QueryClient } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { Theme } from '~design-system';
import { withRouter } from '~shared/components/hoc/withRouter';
import { Extension as TypeExtension } from '~shared/types/common';
import { Location, Router } from '~shared/types/router';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { getExtensionStart } from '~sq-server-commons/helpers/extensions';
import { getCurrentL10nBundle } from '~sq-server-commons/helpers/l10nBundle';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { withQueryClient } from '~sq-server-commons/queries/withQueryClientHoc';
import { AppState } from '~sq-server-commons/types/appstate';
import { ExtensionStartMethod } from '~sq-server-commons/types/extension';
import { Feature } from '~sq-server-commons/types/features';
import { CurrentUser, HomePage } from '~sq-server-commons/types/users';

export interface ExtensionProps extends WrappedComponentProps {
  appState: AppState;
  availableFeatures?: Feature[];
  currentUser: CurrentUser;
  extension: TypeExtension;
  location: Location;
  options?: Record<string, unknown>;
  queryClient: QueryClient;
  router: Router;
  theme: Theme;
  updateCurrentUserHomepage: (homepage: HomePage) => void;
}

interface State {
  extensionElement?: React.ReactElement<unknown>;
}

class Extension extends React.PureComponent<ExtensionProps, State> {
  container?: HTMLElement | null;
  state: State = {};
  stop?: Function;

  componentDidMount() {
    this.startExtension();
  }

  componentDidUpdate(prevProps: ExtensionProps) {
    if (prevProps.extension.key !== this.props.extension.key) {
      this.stopExtension();
      this.startExtension();
    } else if (!isEqual(prevProps.location, this.props.location)) {
      this.startExtension();
    }
  }

  componentWillUnmount() {
    this.stopExtension();
  }

  handleStart = (start: ExtensionStartMethod) => {
    const { theme, queryClient } = this.props;

    const result = start({
      appState: this.props.appState,
      availableFeatures: this.props.availableFeatures,
      baseUrl: getBaseUrl(),
      currentUser: this.props.currentUser,
      el: this.container,
      intl: this.props.intl,
      l10nBundle: getCurrentL10nBundle(),
      location: this.props.location,
      queryClient,
      router: this.props.router,
      theme,
      // See SONAR-16207 and core-extension-enterprise-server/src/main/js/portfolios/components/Header.tsx
      // for more information on why we're passing this as a prop to an extension.
      updateCurrentUserHomepage: this.props.updateCurrentUserHomepage,
      ...this.props.options,
    });

    if (result) {
      if (React.isValidElement(result)) {
        this.setState({ extensionElement: result });
      } else if (typeof result === 'function') {
        this.stop = result;
      }
    }
  };

  handleFailure = () => {
    toast.error({
      description: <FormattedMessage id="page_extension_failed" />,
      duration: 'short',
    });
  };

  startExtension() {
    getExtensionStart(this.props.extension.key).then(this.handleStart, this.handleFailure);
  }

  stopExtension() {
    if (this.stop) {
      this.stop();
      this.stop = undefined;
    } else {
      this.setState({ extensionElement: undefined });
    }
  }

  render() {
    return (
      <div>
        <Helmet title={this.props.extension.name} />

        {this.state.extensionElement ? (
          this.state.extensionElement
        ) : (
          <div ref={(container) => (this.container = container)} />
        )}
      </div>
    );
  }
}

function ExtensionWithAvailableFeaturesHoC(props: Readonly<ExtensionProps>) {
  const availableFeatures = React.useContext(AvailableFeaturesContext);
  return <Extension {...props} availableFeatures={availableFeatures} />;
}

export default injectIntl(
  withRouter(
    withTheme(
      withAppStateContext(
        withCurrentUserContext(withQueryClient(ExtensionWithAvailableFeaturesHoC)),
      ),
    ),
  ),
);
