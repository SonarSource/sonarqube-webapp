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

import { sortBy } from 'lodash';
import * as React from 'react';
import {
  addGroup,
  addUser,
  removeGroup,
  removeUser,
  searchGroups,
  searchUsers,
} from '~sq-server-commons/api/quality-gates';
import { Group, SearchPermissionsParameters, isUser } from '~sq-server-commons/types/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';
import { UserBase } from '~sq-server-commons/types/users';
import QualityGatePermissionsRenderer from './QualityGatePermissionsRenderer';

interface Props {
  qualityGate: QualityGate;
}

interface State {
  groups: Group[];
  loading: boolean;
  permissionToDelete?: UserBase | Group;
  submitting: boolean;
  users: UserBase[];
}

export default class QualityGatePermissions extends React.Component<Props, State> {
  mounted = false;
  state: State = {
    groups: [],
    submitting: false,
    loading: true,
    users: [],
  };

  componentDidMount() {
    this.mounted = true;

    this.fetchPermissions();
  }

  componentDidUpdate(newProps: Props) {
    if (this.props.qualityGate.name !== newProps.qualityGate.name) {
      this.fetchPermissions();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchPermissions = async () => {
    const { qualityGate } = this.props;
    this.setState({ loading: true });

    const params: SearchPermissionsParameters = {
      gateName: qualityGate.name,
      selected: 'selected',
    };
    const [{ users }, { groups }] = await Promise.all([
      searchUsers(params).catch(() => ({ users: [] })),
      searchGroups(params).catch(() => ({ groups: [] })),
    ]);

    if (this.mounted) {
      this.setState({ groups, loading: false, users });
    }
  };

  handleSubmitAddPermission = async (item: UserBase | Group) => {
    const { qualityGate } = this.props;
    this.setState({ submitting: true });

    let error = false;
    try {
      if (isUser(item)) {
        await addUser({ gateName: qualityGate.name, login: item.login });
      } else {
        await addGroup({ gateName: qualityGate.name, groupName: item.name });
      }
    } catch {
      error = true;
    }

    if (this.mounted && !error) {
      if (isUser(item)) {
        this.setState(({ users }) => ({
          users: sortBy(users.concat(item), (u) => u.name),
        }));
      } else {
        this.setState(({ groups }) => ({
          groups: sortBy(groups.concat(item), (g) => g.name),
        }));
      }
    }

    if (this.mounted) {
      this.setState({
        submitting: false,
      });
    }
  };

  handleConfirmDeletePermission = async (item: UserBase | Group) => {
    const { qualityGate } = this.props;

    let error = false;
    try {
      if (isUser(item)) {
        await removeUser({ gateName: qualityGate.name, login: item.login });
      } else {
        await removeGroup({ gateName: qualityGate.name, groupName: item.name });
      }
    } catch {
      error = true;
    }

    if (this.mounted && !error) {
      if (isUser(item)) {
        this.setState(({ users }) => ({
          users: users.filter((u) => u.login !== item.login),
        }));
      } else {
        this.setState(({ groups }) => ({
          groups: groups.filter((g) => g.name !== item.name),
        }));
      }
    }
  };

  render() {
    const { qualityGate } = this.props;
    const { groups, submitting, loading, users } = this.state;
    return (
      <QualityGatePermissionsRenderer
        groups={groups}
        loading={loading}
        onConfirmDeletePermission={this.handleConfirmDeletePermission}
        onSubmitAddPermission={this.handleSubmitAddPermission}
        qualityGate={qualityGate}
        submitting={submitting}
        users={users}
      />
    );
  }
}
