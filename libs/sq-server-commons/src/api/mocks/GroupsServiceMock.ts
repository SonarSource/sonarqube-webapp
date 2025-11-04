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

import { cloneDeep } from 'lodash';
import { Paging } from '~shared/types/paging';
import { mockGroup, mockIdentityProvider } from '../../helpers/testMocks';
import { Group, IdentityProvider, Provider } from '../../types/types';
import { createGroup, deleteGroup, getUsersGroups, updateGroup } from '../user_groups';
import GroupMembershipsServiceMock from './GroupMembersipsServiceMock';

jest.mock('../user_groups');

export default class GroupsServiceMock {
  provider: Provider | undefined;
  groups: Group[];
  groupMemberships;
  readOnlyGroups = [
    mockGroup({ name: 'managed-group', managed: true, id: '1' }),
    mockGroup({ name: 'local-group', managed: false, id: '2' }),
  ];

  constructor(groupMembershipsServiceMock?: GroupMembershipsServiceMock) {
    this.groups = cloneDeep(this.readOnlyGroups);
    this.groupMemberships = groupMembershipsServiceMock;

    jest.mocked(getUsersGroups).mockImplementation((p) => this.handleSearchUsersGroups(p));
    jest.mocked(createGroup).mockImplementation((g) => this.handleCreateGroup(g));
    jest.mocked(deleteGroup).mockImplementation((id) => this.handleDeleteGroup(id));
    jest.mocked(updateGroup).mockImplementation((id, data) => this.handleUpdateGroup(id, data));
  }

  reset() {
    this.groups = cloneDeep(this.readOnlyGroups);
  }

  handleCreateGroup = (group: { description?: string; name: string }): Promise<Group> => {
    const newGroup = mockGroup(group);
    this.groups.push(newGroup);
    return this.reply(newGroup);
  };

  handleDeleteGroup: typeof deleteGroup = (id: string) => {
    if (!this.groups.some((g) => g.id === id)) {
      return Promise.reject();
    }

    const groupToDelete = this.groups.find((g) => g.id === id);
    if (groupToDelete?.managed) {
      return Promise.reject();
    }

    this.groups = this.groups.filter((g) => g.id !== id);
    return this.reply(undefined);
  };

  handleUpdateGroup: typeof updateGroup = (id, data): Promise<Record<string, never>> => {
    const group = this.groups.find((g) => g.id === id);
    if (group === undefined) {
      return Promise.reject();
    }

    if (data.description !== undefined) {
      group.description = data.description;
    }

    if (data.name !== undefined) {
      group.name = data.name;
    }

    return this.reply({});
  };

  handleSearchUsersGroups = (
    params: Parameters<typeof getUsersGroups>[0],
  ): Promise<{ groups: Group[]; page: Paging }> => {
    const pageIndex = params.pageIndex ?? 1;
    const pageSize = params.pageSize ?? 50;

    const groups = this.getFilteredGroups(params);

    return this.reply({
      page: {
        pageIndex,
        pageSize,
        total: groups.length,
      },
      groups: groups.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
    });
  };

  handleGetIdentityProviders = (): Promise<{
    identityProviders: IdentityProvider[];
  }> => {
    return this.reply({ identityProviders: [mockIdentityProvider()] });
  };

  getFilteredGroups = (filterParams: Parameters<typeof getUsersGroups>[0]) => {
    const { q, userId, managed, 'userId!': userIdExclude } = filterParams;
    let { groups } = this;

    if (userId || userIdExclude) {
      if (!this.groupMemberships) {
        throw new Error(
          'groupMembershipsServiceMock is not defined. Please provide groupMembershipsServiceMock to GroupsServiceMock constructor',
        );
      }
      const groupMemberships = this.groupMemberships?.memberships.filter(
        (m) => m.userId === (userId ?? userIdExclude),
      );
      const groupIds = groupMemberships?.map((m) => m.groupId);
      groups = groups.filter((g) =>
        userId ? groupIds?.includes(g.id) : !groupIds?.includes(g.id),
      );
    }

    return groups.filter((group) => {
      if (managed !== undefined && group.managed !== managed) {
        return false;
      }
      if (q && !group.name.includes(q)) {
        return false;
      }
      return true;
    });
  };

  reply<T>(response: T): Promise<T> {
    return Promise.resolve(cloneDeep(response));
  }
}
