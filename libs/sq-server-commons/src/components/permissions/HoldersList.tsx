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

import { Table } from '@sonarsource/echoes-react';
import { partition } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { getIntl } from '../../helpers/l10nBundle';
import { isPermissionDefinitionGroup } from '../../helpers/permissions';
import UseQuery from '../../helpers/UseQuery';
import { useIsGitHubProjectQuery, useIsGitLabProjectQuery } from '../../queries/devops-integration';
import { useGithubProvisioningEnabledQuery } from '../../queries/identity-provider/github';
import { PermissionDefinitions, PermissionGroup, PermissionUser } from '../../types/types';
import GroupHolder from './GroupHolder';
import { PermissionHeader } from './PermissionHeader';
import UserHolder from './UserHolder';

interface Props {
  filter?: string;
  groups: PermissionGroup[];
  isComponentPrivate?: boolean;
  isProjectManaged: boolean;
  loading?: boolean;
  onToggleGroup: (group: PermissionGroup, permission: string) => Promise<void>;
  onToggleUser: (user: PermissionUser, permission: string) => Promise<void>;
  permissions: PermissionDefinitions;
  query?: string;
  users: PermissionUser[];
}

interface State {
  initialPermissionsCount: Record<string, number>;
}
export default class HoldersList extends React.PureComponent<
  React.PropsWithChildren<Props>,
  State
> {
  intl = getIntl();
  state: State = { initialPermissionsCount: {} };
  componentDidUpdate(prevProps: Props) {
    if (this.props.filter !== prevProps.filter || this.props.query !== prevProps.query) {
      this.setState({ initialPermissionsCount: {} });
    }
  }

  getKey = (item: PermissionGroup | PermissionUser) =>
    this.isPermissionUser(item) ? item.login : item.name;

  isPermissionUser(item: PermissionGroup | PermissionUser): item is PermissionUser {
    return (item as PermissionUser).login !== undefined;
  }

  handleGroupToggle = (group: PermissionGroup, permission: string) => {
    const key = group.name;
    if (this.state.initialPermissionsCount[key] === undefined) {
      this.setState((state) => ({
        initialPermissionsCount: {
          ...state.initialPermissionsCount,
          [key]: group.permissions.length,
        },
      }));
    }
    return this.props.onToggleGroup(group, permission);
  };

  handleUserToggle = (user: PermissionUser, permission: string) => {
    if (this.state.initialPermissionsCount[user.login] === undefined) {
      this.setState((state) => ({
        initialPermissionsCount: {
          ...state.initialPermissionsCount,
          [user.login]: user.permissions.length,
        },
      }));
    }
    return this.props.onToggleUser(user, permission);
  };

  getItemInitialPermissionsCount = (item: PermissionGroup | PermissionUser) => {
    const key = this.getKey(item);
    return this.state.initialPermissionsCount[key] !== undefined
      ? this.state.initialPermissionsCount[key]
      : item.permissions.length;
  };

  renderItem(item: PermissionUser | PermissionGroup, permissions: PermissionDefinitions) {
    const { isComponentPrivate, isProjectManaged } = this.props;

    return (
      <UseQuery key={this.getKey(item)} query={useIsGitHubProjectQuery}>
        {({ data: isGitHubProject }) => (
          <UseQuery key={this.getKey(item)} query={useIsGitLabProjectQuery}>
            {({ data: isGitLabProject }) => (
              <UseQuery query={useGithubProvisioningEnabledQuery}>
                {({ data: githubProvisioningStatus }) => (
                  <>
                    {this.isPermissionUser(item) ? (
                      <UserHolder
                        isGitHubUser={isGitHubProject && !!githubProvisioningStatus && item.managed}
                        isGitLabUser={isGitLabProject && item.managed}
                        key={`user-${item.login}`}
                        onToggle={this.handleUserToggle}
                        permissions={permissions}
                        removeOnly={
                          (isGitHubProject && !!githubProvisioningStatus && !item.managed) ||
                          (isGitLabProject && isProjectManaged && !item.managed)
                        }
                        user={item}
                      />
                    ) : (
                      <GroupHolder
                        group={item}
                        isComponentPrivate={isComponentPrivate}
                        isGitHubUser={isGitHubProject && !!githubProvisioningStatus && item.managed}
                        isGitLabUser={isGitLabProject && item.managed}
                        key={`group-${item.name}`}
                        onToggle={this.handleGroupToggle}
                        permissions={permissions}
                        removeOnly={
                          (isGitHubProject && !!githubProvisioningStatus && !item.managed) ||
                          (isGitLabProject && isProjectManaged && !item.managed)
                        }
                      />
                    )}
                  </>
                )}
              </UseQuery>
            )}
          </UseQuery>
        )}
      </UseQuery>
    );
  }

  render() {
    const { permissions, users, groups, loading } = this.props;
    const items = [...groups, ...users];
    const [itemWithPermissions, itemWithoutPermissions] = partition(items, (item) =>
      this.getItemInitialPermissionsCount(item),
    );

    return (
      <div>
        <Table
          aria-colcount={permissions.length + 1} // don't count the avatar column
          ariaLabel={this.intl.formatMessage({ id: 'permissions.page' })}
          className="it__permission-list"
          gridTemplate={`max-content 1fr repeat(${permissions.length}, auto)`}
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell aria-hidden />
              <Table.ColumnHeaderCell
                aria-label={this.intl.formatMessage({ id: 'permissions.holder' })}
              />

              {permissions.map((permission) => (
                <PermissionHeader
                  key={
                    isPermissionDefinitionGroup(permission) ? permission.category : permission.key
                  }
                  permission={permission}
                />
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {itemWithPermissions.map((item) => this.renderItem(item, permissions))}
            {itemWithoutPermissions.map((item) => this.renderItem(item, permissions))}
          </Table.Body>
        </Table>
        {items.length === 0 && !loading && (
          <div className="sw-my-8">
            <FormattedMessage id="no_results_search" />
          </div>
        )}
      </div>
    );
  }
}
