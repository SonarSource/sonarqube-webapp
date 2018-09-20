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
import SearchForm from '../../shared/components/SearchForm';
import HoldersList from '../../shared/components/HoldersList';
import { translate } from '../../../../helpers/l10n';
import { Organization, Paging, PermissionGroup, PermissionUser } from '../../../../app/types';
import ListFooter from '../../../../components/controls/ListFooter';

const PERMISSIONS_ORDER = ['admin', 'profileadmin', 'gateadmin', 'scan', 'provisioning'];

interface Props {
  filter: string;
  grantPermissionToGroup: (groupName: string, permission: string) => Promise<void>;
  grantPermissionToUser: (login: string, permission: string) => Promise<void>;
  groups: PermissionGroup[];
  groupsPaging: Paging;
  loadHolders: () => void;
  loading?: boolean;
  onLoadMore: (usersPageIndex: number, groupsPageIndex: number) => void;
  onFilter: (filter: string) => void;
  onSearch: (query: string) => void;
  onSelectPermission: (permission: string) => void;
  organization?: Organization;
  query: string;
  revokePermissionFromGroup: (groupName: string, permission: string) => Promise<void>;
  revokePermissionFromUser: (login: string, permission: string) => Promise<void>;
  selectedPermission?: string;
  users: PermissionUser[];
  usersPaging: Paging;
}

export default class AllHoldersList extends React.PureComponent<Props> {
  handleToggleUser = (user: PermissionUser, permission: string) => {
    const hasPermission = user.permissions.includes(permission);
    if (hasPermission) {
      return this.props.revokePermissionFromUser(user.login, permission);
    } else {
      return this.props.grantPermissionToUser(user.login, permission);
    }
  };

  handleToggleGroup = (group: PermissionGroup, permission: string) => {
    const hasPermission = group.permissions.includes(permission);

    if (hasPermission) {
      return this.props.revokePermissionFromGroup(group.name, permission);
    } else {
      return this.props.grantPermissionToGroup(group.name, permission);
    }
  };

  handleLoadMore = () => {
    this.props.onLoadMore(
      this.props.usersPaging.pageIndex + 1,
      this.props.groupsPaging.pageIndex + 1
    );
  };

  render() {
    const l10nPrefix = this.props.organization ? 'organizations_permissions' : 'global_permissions';
    const permissions = PERMISSIONS_ORDER.map(p => ({
      key: p,
      name: translate(l10nPrefix, p),
      description: translate(l10nPrefix, p, 'desc')
    }));

    const count =
      (this.props.filter !== 'users' ? this.props.groups.length : 0) +
      (this.props.filter !== 'groups' ? this.props.users.length : 0);
    const total =
      (this.props.filter !== 'users' ? this.props.groupsPaging.total : 0) +
      (this.props.filter !== 'groups' ? this.props.usersPaging.total : 0);

    return (
      <>
        <HoldersList
          groups={this.props.groups}
          loading={this.props.loading}
          onSelectPermission={this.props.onSelectPermission}
          onToggleGroup={this.handleToggleGroup}
          onToggleUser={this.handleToggleUser}
          permissions={permissions}
          selectedPermission={this.props.selectedPermission}
          users={this.props.users}>
          <SearchForm
            filter={this.props.filter}
            onFilter={this.props.onFilter}
            onSearch={this.props.onSearch}
            query={this.props.query}
          />
        </HoldersList>
        <ListFooter count={count} loadMore={this.handleLoadMore} total={total} />
      </>
    );
  }
}
