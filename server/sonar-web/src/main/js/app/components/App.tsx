/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import GlobalLoading from './GlobalLoading';
import { CurrentUser } from '../types';
import { fetchCurrentUser } from '../../store/users/actions';
import { fetchLanguages, fetchAppState } from '../../store/rootActions';
import { fetchMyOrganizations } from '../../apps/account/organizations/actions';
import { getInstance } from '../../helpers/system';

interface Props {
  children: JSX.Element;
  fetchAppState: () => Promise<any>;
  fetchCurrentUser: () => Promise<CurrentUser>;
  fetchLanguages: () => Promise<void>;
  fetchMyOrganizations: () => Promise<void>;
}

interface State {
  branchesEnabled: boolean;
  canAdmin: boolean;
  loading: boolean;
  organizationsEnabled: boolean;
}

class App extends React.PureComponent<Props, State> {
  mounted = false;

  static childContextTypes = {
    branchesEnabled: PropTypes.bool.isRequired,
    canAdmin: PropTypes.bool.isRequired,
    organizationsEnabled: PropTypes.bool
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      branchesEnabled: false,
      canAdmin: false,
      loading: true,
      organizationsEnabled: false
    };
  }

  getChildContext() {
    return {
      branchesEnabled: this.state.branchesEnabled,
      canAdmin: this.state.canAdmin,
      organizationsEnabled: this.state.organizationsEnabled
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.props.fetchCurrentUser().then(
      currentUser => {
        Promise.all([this.fetchAppState(), this.props.fetchLanguages()]).then(
          ([appState]) => {
            if (this.mounted) {
              if (appState.organizationsEnabled && currentUser.isLoggedIn) {
                this.props.fetchMyOrganizations();
              }
              this.setState({ loading: false });
            }
          },
          () => {}
        );
      },
      () => {}
    );
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchAppState = () => {
    return this.props.fetchAppState().then(appState => {
      if (this.mounted) {
        this.setState({
          branchesEnabled: appState.branchesEnabled,
          canAdmin: appState.canAdmin,
          organizationsEnabled: appState.organizationsEnabled
        });
      }
      return appState;
    });
  };

  render() {
    if (this.state.loading) {
      return <GlobalLoading />;
    }
    return (
      <>
        <Helmet defaultTitle={getInstance()} />
        {this.props.children}
      </>
    );
  }
}

export default connect(null, {
  fetchAppState,
  fetchCurrentUser,
  fetchLanguages,
  fetchMyOrganizations
})(App as any);
