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
import forSingleOrganization from '../../organizations/forSingleOrganization';
import { getLanguages, getOrganizationByKey } from '../../../store/rootReducer';
import { onFail } from '../../../store/rootActions';
import { Languages } from '../../../store/languages/reducer';

interface StateProps {
  languages: Languages;
  organization: { name: string; key: string } | undefined;
}

interface DispatchProps {
  onRequestFail: (reasong: any) => void;
}

const mapStateToProps = (state: any, ownProps: any) => ({
  languages: getLanguages(state),
  organization: ownProps.params.organizationKey
    ? getOrganizationByKey(state, ownProps.params.organizationKey)
    : undefined
});

const mapDispatchToProps = (dispatch: any) => ({
  onRequestFail: (error: any) => onFail(dispatch)(error)
});

export default forSingleOrganization(
  connect<StateProps, DispatchProps>(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
