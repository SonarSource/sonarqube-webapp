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
import { connect } from 'react-redux';
import App from './App';
import {
  getAppState,
  getGlobalSettingValue,
  getMarketplaceCurrentEdition,
  getMarketplacePendingPlugins
} from '../../store/rootReducer';
import { fetchPendingPlugins } from '../../store/marketplace/actions';
import { RawQuery } from '../../helpers/query';
import { PluginPendingResult } from '../../api/plugins';

interface OwnProps {
  location: { pathname: string; query: RawQuery };
}

interface StateToProps {
  currentEdition?: string;
  pendingPlugins: PluginPendingResult;
  standaloneMode: boolean;
  updateCenterActive: boolean;
}

interface DispatchToProps {
  fetchPendingPlugins: () => void;
}

const mapStateToProps = (state: any) => {
  return {
    currentEdition: getMarketplaceCurrentEdition(state),
    pendingPlugins: getMarketplacePendingPlugins(state),
    standaloneMode: getAppState(state).standalone,
    updateCenterActive:
      (getGlobalSettingValue(state, 'sonar.updatecenter.activate') || {}).value === 'true'
  };
};

const mapDispatchToProps = { fetchPendingPlugins };

export default connect<StateToProps, DispatchToProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(App);
