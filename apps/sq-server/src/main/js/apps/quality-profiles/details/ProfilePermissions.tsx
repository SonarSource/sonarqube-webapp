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

import { Button, Spinner, Text } from '@sonarsource/echoes-react';
import { sortBy, uniqBy } from 'lodash';
import * as React from 'react';
import { CellComponent, SubTitle, Table, TableRow } from '~design-system';
import {
  SearchUsersGroupsParameters,
  searchGroups,
  searchUsers,
} from '~sq-server-commons/api/quality-profiles';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import { UserSelected } from '~sq-server-commons/types/types';
import ProfilePermissionsForm from './ProfilePermissionsForm';
import ProfilePermissionsGroup from './ProfilePermissionsGroup';
import ProfilePermissionsUser from './ProfilePermissionsUser';

export interface Group {
  name: string;
}

interface Props {
  profile: Pick<Profile, 'key' | 'language' | 'name'>;
}

interface State {
  addUserForm: boolean;
  groups?: Group[];
  loading: boolean;
  users?: UserSelected[];
}

export default class ProfilePermissions extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { addUserForm: false, loading: true };

  componentDidMount() {
    this.mounted = true;
    this.fetchUsersAndGroups();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.profile.key !== this.props.profile.key) {
      this.fetchUsersAndGroups();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchUsersAndGroups() {
    this.setState({ loading: true });
    const { profile } = this.props;
    const parameters: SearchUsersGroupsParameters = {
      language: profile.language,
      qualityProfile: profile.name,
      selected: 'selected',
    };
    Promise.all([searchUsers(parameters), searchGroups(parameters)]).then(
      ([usersResponse, groupsResponse]) => {
        if (this.mounted) {
          this.setState({
            groups: groupsResponse.groups,
            loading: false,
            users: usersResponse.users,
          });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      },
    );
  }

  handleAddUserButtonClick = () => {
    this.setState({ addUserForm: true });
  };

  handleAddUserFormClose = () => {
    if (this.mounted) {
      this.setState({ addUserForm: false });
    }
  };

  handleUserAdd = (addedUser: UserSelected) => {
    if (this.mounted) {
      this.setState((state: State) => ({
        addUserForm: false,
        users: state.users && uniqBy([...state.users, addedUser], (user) => user.login),
      }));
    }
  };

  handleUserDelete = (removedUser: UserSelected) => {
    if (this.mounted) {
      this.setState((state: State) => ({
        users: state.users?.filter((user) => user !== removedUser),
      }));
    }
  };

  handleGroupAdd = (addedGroup: Group) => {
    if (this.mounted) {
      this.setState((state: State) => ({
        addUserForm: false,
        groups: state.groups && uniqBy([...state.groups, addedGroup], (group) => group.name),
      }));
    }
  };

  handleGroupDelete = (removedGroup: Group) => {
    if (this.mounted) {
      this.setState((state: State) => ({
        groups: state.groups?.filter((group) => group !== removedGroup),
      }));
    }
  };

  render() {
    const { loading } = this.state;

    return (
      <section aria-label={translate('permissions.page')}>
        <div className="sw-mb-6">
          <SubTitle className="sw-mb-0">{translate('permissions.page')}</SubTitle>
          <Text as="p" className="sw-mt-6" isSubtle>
            {translate('quality_profiles.default_permissions')}
          </Text>
        </div>

        <Spinner isLoading={loading}>
          <Table columnCount={2} columnWidths={['100%', '0%']}>
            {this.state.users &&
              sortBy(this.state.users, 'name').map((user) => (
                <TableRow key={user.login}>
                  <CellComponent>
                    <ProfilePermissionsUser
                      key={user.login}
                      onDelete={this.handleUserDelete}
                      profile={this.props.profile}
                      user={user}
                    />
                  </CellComponent>
                </TableRow>
              ))}
            {this.state.groups &&
              sortBy(this.state.groups, 'name').map((group) => (
                <TableRow key={group.name}>
                  <CellComponent>
                    <ProfilePermissionsGroup
                      group={group}
                      key={group.name}
                      onDelete={this.handleGroupDelete}
                      profile={this.props.profile}
                    />
                  </CellComponent>
                </TableRow>
              ))}
          </Table>
          <div className="sw-mt-6">
            <Button onClick={this.handleAddUserButtonClick}>
              {translate('quality_profiles.grant_permissions_to_more_users')}
            </Button>
          </div>
        </Spinner>

        {this.state.addUserForm && (
          <ProfilePermissionsForm
            onClose={this.handleAddUserFormClose}
            onGroupAdd={this.handleGroupAdd}
            onUserAdd={this.handleUserAdd}
            profile={this.props.profile}
          />
        )}
      </section>
    );
  }
}
