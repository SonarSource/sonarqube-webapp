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

import { isAfter, isBefore } from 'date-fns';
import { cloneDeep, isEmpty, isUndefined, omitBy } from 'lodash';
import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import { HttpStatus } from '~shared/types/request';
import { mockIdentityProvider, mockLoggedInUser, mockRestUser } from '../../helpers/testMocks';
import { IdentityProvider } from '../../types/types';
import {
  ChangePasswordResults,
  LoggedInUser,
  NoticeType,
  RestUserDetailed,
} from '../../types/users';
import {
  changePassword,
  deleteUser,
  dismissNotice,
  getCurrentUser,
  getIdentityProviders,
  getUserById,
  getUsers,
  postUser,
  updateUser,
} from '../users';
import GroupMembershipsServiceMock from './GroupMembersipsServiceMock';

// Note: We still mock some API functions for backward compatibility with handlers that use jest.mocked()
// but we do NOT mock getUsers and getCurrentUser since they're intercepted by MSW (Mock Service Worker) handlers
jest.mock('../users', () => ({
  changePassword: jest.fn(),
  deleteUser: jest.fn(),
  dismissNotice: jest.fn(),
  getIdentityProviders: jest.fn(),
  getUserById: jest.fn(),
  postUser: jest.fn(),
  updateUser: jest.fn(),
  // getUsers and getCurrentUser are NOT mocked here - they make real HTTP calls
  // that MSW (Mock Service Worker) intercepts
  getUsers: jest.requireActual('../users').getUsers,
  getCurrentUser: jest.requireActual('../users').getCurrentUser,
}));

const DEFAULT_USERS = [
  mockRestUser({
    managed: true,
    login: 'bob.marley',
    name: 'Bob Marley',
    sonarQubeLastConnectionDate: '2023-06-27T17:08:59+0200',
    sonarLintLastConnectionDate: '2023-06-27T17:08:59+0200',
    id: '1',
  }),
  mockRestUser({
    managed: false,
    login: 'alice.merveille',
    name: 'Alice Merveille',
    sonarQubeLastConnectionDate: '2023-06-27T17:08:59+0200',
    sonarLintLastConnectionDate: '2023-05-27T17:08:59+0200',
    email: 'alice.merveille@wonderland.com',
    id: '2',
  }),
  mockRestUser({
    managed: false,
    local: false,
    login: 'charlie.cox',
    name: 'Charlie Cox',
    sonarQubeLastConnectionDate: '2023-06-25T17:08:59+0200',
    sonarLintLastConnectionDate: '2023-06-20T12:10:59+0200',
    externalProvider: 'test',
    externalLogin: 'ExternalTest',
    id: '3',
  }),
  mockRestUser({
    managed: true,
    local: false,
    externalProvider: 'test2',
    externalLogin: 'UnknownExternalProvider',
    login: 'denis.villeneuve',
    name: 'Denis Villeneuve',
    sonarQubeLastConnectionDate: '2023-06-20T15:08:59+0200',
    sonarLintLastConnectionDate: '2023-05-25T10:08:59+0200',
    id: '4',
  }),
  mockRestUser({
    managed: true,
    login: 'eva.green',
    name: 'Eva Green',
    sonarQubeLastConnectionDate: '2023-05-27T17:08:59+0200',
    id: '5',
  }),
  mockRestUser({
    managed: false,
    login: 'franck.grillo',
    name: 'Franck Grillo',
    id: '6',
  }),
];

const DEFAULT_PASSWORD = 'test';

interface UsersServiceMockData {
  users: RestUserDetailed[];
}

export default class UsersServiceMock extends AbstractServiceMock<UsersServiceMockData> {
  isManaged = true;
  currentUser = mockLoggedInUser();
  password = DEFAULT_PASSWORD;
  groupMembershipsServiceMock?: GroupMembershipsServiceMock = undefined;

  handlers = [
    http.get('/api/v2/users-management/users', ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get('q');
      const managedStr = url.searchParams.get('managed');
      const managed = managedStr !== null ? managedStr === 'true' : undefined;
      const pageIndex = Number.parseInt(url.searchParams.get('pageIndex') || '1', 10);
      const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '10', 10);
      const sonarQubeLastConnectionDateFrom =
        url.searchParams.get('sonarQubeLastConnectionDateFrom') ?? undefined;
      const sonarQubeLastConnectionDateTo =
        url.searchParams.get('sonarQubeLastConnectionDateTo') ?? undefined;
      const sonarLintLastConnectionDateFrom =
        url.searchParams.get('sonarLintLastConnectionDateFrom') ?? undefined;
      const sonarLintLastConnectionDateTo =
        url.searchParams.get('sonarLintLastConnectionDateTo') ?? undefined;
      const groupId = url.searchParams.get('groupId') ?? undefined;
      const groupIdExclude = url.searchParams.get('groupId!') ?? undefined;

      const filteredUsers = this.getFilteredRestUsers({
        q: q ?? '',
        managed,
        sonarQubeLastConnectionDateFrom,
        sonarQubeLastConnectionDateTo,
        sonarLintLastConnectionDateFrom,
        sonarLintLastConnectionDateTo,
        groupId,
        'groupId!': groupIdExclude,
      });

      return this.ok({
        page: {
          pageIndex,
          pageSize,
          total: filteredUsers.length,
        },
        users: filteredUsers.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      });
    }),
    http.get('/api/users/current', () => this.ok(this.currentUser)),
  ];

  constructor(groupMembershipsServiceMock?: GroupMembershipsServiceMock) {
    super({ users: cloneDeep(DEFAULT_USERS) });
    this.groupMembershipsServiceMock = groupMembershipsServiceMock;

    // Set up jest mocks for non-HTTP functions
    jest.mocked(getIdentityProviders).mockImplementation(this.handleGetIdentityProviders);
    jest.mocked(getUserById).mockImplementation(this.handleGetUserById);
    jest.mocked(postUser).mockImplementation(this.handlePostUser);
    jest.mocked(updateUser).mockImplementation(this.handleUpdateUser);
    jest.mocked(changePassword).mockImplementation(this.handleChangePassword);
    jest.mocked(deleteUser).mockImplementation(this.handleDeactivateUser);
    jest.mocked(dismissNotice).mockImplementation(this.handleDismissNotification);

    // Note: getUsers and getCurrentUser are NOT mocked here - they make real HTTP calls
    // that are intercepted by MSW handlers
  }

  getFilteredRestUsers = (filterParams: Parameters<typeof getUsers>[0]) => {
    const {
      managed,
      q,
      sonarQubeLastConnectionDateFrom,
      sonarQubeLastConnectionDateTo,
      sonarLintLastConnectionDateFrom,
      sonarLintLastConnectionDateTo,
      groupId,
      'groupId!': groupIdExclude,
    } = filterParams;
    let { users } = this.data;
    if (groupId || groupIdExclude) {
      if (!this.groupMembershipsServiceMock) {
        throw new Error(
          'groupMembershipsServiceMock is not defined. Please provide GroupMembershipsServiceMock to UsersServiceMock constructor',
        );
      }
      const groupMemberships = this.groupMembershipsServiceMock?.memberships.filter(
        (m) => m.groupId === (groupId ?? groupIdExclude),
      );
      const userIds = groupMemberships?.map((m) => m.userId);
      users = users.filter((u) => (groupId ? userIds?.includes(u.id) : !userIds?.includes(u.id)));
    }

    return users.filter((user) => {
      if (this.isManaged && managed !== undefined && user.managed !== managed) {
        return false;
      }

      if (q && !user.login.includes(q) && !user.name?.includes(q) && !user.email?.includes(q)) {
        return false;
      }

      if (
        sonarQubeLastConnectionDateFrom &&
        (user.sonarQubeLastConnectionDate === null ||
          isBefore(
            new Date(user.sonarQubeLastConnectionDate),
            new Date(sonarQubeLastConnectionDateFrom),
          ))
      ) {
        return false;
      }

      if (
        sonarQubeLastConnectionDateTo &&
        user.sonarQubeLastConnectionDate &&
        isAfter(new Date(user.sonarQubeLastConnectionDate), new Date(sonarQubeLastConnectionDateTo))
      ) {
        return false;
      }

      if (
        sonarLintLastConnectionDateFrom &&
        (user.sonarLintLastConnectionDate === null ||
          isBefore(
            new Date(user.sonarLintLastConnectionDate),
            new Date(sonarLintLastConnectionDateFrom),
          ))
      ) {
        return false;
      }

      if (
        sonarLintLastConnectionDateTo &&
        user.sonarLintLastConnectionDate &&
        isAfter(new Date(user.sonarLintLastConnectionDate), new Date(sonarLintLastConnectionDateTo))
      ) {
        return false;
      }

      return true;
    });
  };

  handleGetUsers: typeof getUsers = (data) => {
    const pageIndex = data.pageIndex ?? 1;
    const pageSize = data.pageSize ?? 10;

    const users = this.getFilteredRestUsers(data);

    return this.reply({
      page: {
        pageIndex,
        pageSize,
        total: users.length,
      },
      users: users.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
    });
  };

  handleGetUserById: typeof getUserById = (id) => {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) {
      return Promise.reject(new Error('Not Found'));
    }
    return this.reply(user);
  };

  handlePostUser = (data: {
    email?: string;
    local?: boolean;
    login: string;
    name: string;
    password?: string;
    scmAccounts: string[];
  }) => {
    const { email, local, login, name, scmAccounts } = data;
    if (scmAccounts.some((a) => isEmpty(a.trim()))) {
      return Promise.reject({
        response: {
          status: HttpStatus.BadRequest,
          data: { message: 'Error: Empty SCM' },
        },
      });
    }
    const newUser = mockRestUser({
      email,
      local,
      login,
      name,
      scmAccounts,
    });
    this.data.users.push(newUser);
    return this.reply(newUser);
  };

  handleUpdateUser: typeof updateUser = (id, data) => {
    const { email, name, scmAccounts } = data;
    const user = this.data.users.find((u) => u.id === id);
    if (!user) {
      return Promise.reject('No such user');
    }
    Object.assign(user, {
      ...omitBy({ name, email, scmAccounts }, isUndefined),
    });
    return this.reply(user);
  };

  handleGetIdentityProviders = (): Promise<{
    identityProviders: IdentityProvider[];
  }> => {
    return this.reply({
      identityProviders: [mockIdentityProvider({ key: 'test' })],
    });
  };

  handleChangePassword: typeof changePassword = (data) => {
    if (data.previousPassword !== this.password) {
      return Promise.reject(ChangePasswordResults.OldPasswordIncorrect);
    }
    if (data.password === this.password) {
      return Promise.reject(ChangePasswordResults.NewPasswordSameAsOld);
    }
    this.password = data.password;
    return this.reply(undefined);
  };

  handleDeactivateUser: typeof deleteUser = (data) => {
    const index = this.data.users.findIndex((u) => u.id === data.id);
    const user = this.data.users.splice(index, 1)[0];
    user.active = false;
    return this.reply(undefined);
  };

  handleDismissNotification: typeof dismissNotice = (noticeType: NoticeType) => {
    if (Object.values(NoticeType).includes(noticeType)) {
      return this.reply(undefined);
    }

    return Promise.reject();
  };

  setCurrentUser = (user: LoggedInUser) => {
    this.currentUser = user;
  };

  handleGetCurrentUser: typeof getCurrentUser = () => {
    return this.reply(this.currentUser);
  };

  get users(): RestUserDetailed[] {
    return this.data.users;
  }

  set users(users: RestUserDetailed[]) {
    this.data.users = users;
  }

  reset = () => {
    super.reset();
    this.isManaged = true;
    this.password = DEFAULT_PASSWORD;
    this.currentUser = mockLoggedInUser();
  };

  reply<T>(response: T): Promise<T> {
    return Promise.resolve(cloneDeep(response));
  }
}
